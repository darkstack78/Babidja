import { BadRequestException, HttpException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';

interface FakeOtpRow {
  id: string;
  phone: string;
  codeHash: string;
  expiresAt: Date;
  used: boolean;
  attempts: number;
  blockedUntil: Date | null;
  createdAt: Date;
}

describe('AuthService — OTP', () => {
  let authService: AuthService;
  let otpRows: FakeOtpRow[];
  let redisStore: Map<string, string>;
  let nextId = 0;

  const fakePrisma = {
    get oTPVerification() {
      return {
        create: async ({ data }: any) => {
          const row: FakeOtpRow = {
            id: `otp-${++nextId}`,
            phone: data.phone,
            codeHash: data.codeHash,
            expiresAt: data.expiresAt,
            used: false,
            attempts: 0,
            blockedUntil: null,
            createdAt: new Date(),
          };
          otpRows.push(row);
          return row;
        },
        findFirst: async ({ where }: any) => {
          return (
            otpRows
              .filter((r) => r.phone === where.phone && r.used === where.used)
              .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0] ?? null
          );
        },
        update: async ({ where, data }: any) => {
          const row = otpRows.find((r) => r.id === where.id)!;
          Object.assign(row, data);
          return row;
        },
      };
    },
    tenantEmployee: {
      findFirst: async () => null,
    },
  };

  const fakeUsersService = {
    findByPhone: jest.fn().mockResolvedValue(null),
    findByEmail: jest.fn().mockResolvedValue(null),
    findByGoogleId: jest.fn().mockResolvedValue(null),
    create: jest.fn().mockImplementation(async (data: any) => ({
      id: 'user-1',
      phone: data.phone,
      email: data.email ?? null,
      googleId: data.googleId ?? null,
      passwordHash: data.passwordHash ?? null,
      refreshTokenHash: null,
      isEmailVerified: data.isEmailVerified ?? false,
      firstName: data.firstName ?? '',
      lastName: data.lastName ?? '',
      avatarUrl: null,
      walletBalance: 0,
      referralCode: 'ABCD1234',
      referredById: null,
      fcmToken: null,
      role: UserRole.CUSTOMER,
      isActive: true,
      createdAt: new Date(),
    })),
    update: jest.fn(),
    setRefreshTokenHash: jest.fn().mockResolvedValue(undefined),
  };

  const fakeNotifications = {
    sendOtpSms: jest.fn().mockResolvedValue(undefined),
  };

  const fakeReferralService = {
    registerReferral: jest.fn().mockResolvedValue(undefined),
    creditReward: jest.fn().mockResolvedValue(undefined),
  };

  const fakeConfig = {
    get: (key: string) => {
      const values: Record<string, string> = {
        'jwt.secret': 'test-secret',
        'jwt.expiresIn': '15m',
        'jwt.refreshSecret': 'test-refresh-secret',
        'jwt.refreshExpiresIn': '30d',
      };
      return values[key];
    },
  } as unknown as ConfigService;

  const fakeJwt = new JwtService({ secret: 'test-secret' });

  beforeEach(() => {
    otpRows = [];
    redisStore = new Map();
    nextId = 0;
    jest.clearAllMocks();
    fakeUsersService.findByPhone.mockResolvedValue(null);
    fakeUsersService.findByEmail.mockResolvedValue(null);
    fakeUsersService.findByGoogleId.mockResolvedValue(null);

    const fakeRedis = {
      get: async (key: string) => redisStore.get(key) ?? null,
      incr: async (key: string) => {
        const current = parseInt(redisStore.get(key) ?? '0', 10) + 1;
        redisStore.set(key, String(current));
        return current;
      },
      expire: async () => 1,
      set: async (key: string, value: string) => {
        redisStore.set(key, value);
        return 'OK';
      },
      del: async (key: string) => {
        redisStore.delete(key);
        return 1;
      },
    };

    authService = new AuthService(
      fakePrisma as any,
      fakeUsersService as any,
      fakeNotifications as any,
      fakeReferralService as any,
      fakeJwt,
      fakeConfig,
      fakeRedis as any,
    );
  });

  it('envoie un code à 6 chiffres et le stocke hashé (jamais en clair)', async () => {
    await authService.sendOtp('+2250700000000');

    expect(fakeNotifications.sendOtpSms).toHaveBeenCalledTimes(1);
    const [, plainCode] = fakeNotifications.sendOtpSms.mock.calls[0];
    expect(plainCode).toMatch(/^\d{6}$/);

    expect(otpRows).toHaveLength(1);
    expect(otpRows[0].codeHash).not.toEqual(plainCode);
  });

  it('bloque l\'envoi au-delà de 3 demandes par heure pour un même numéro', async () => {
    const phone = '+2250700000001';
    await authService.sendOtp(phone);
    await authService.sendOtp(phone);
    await authService.sendOtp(phone);

    await expect(authService.sendOtp(phone)).rejects.toThrow(HttpException);
  });

  it('vérifie un code correct, crée le user et retourne des tokens', async () => {
    const phone = '+2250700000002';
    await authService.sendOtp(phone);
    const [, plainCode] = fakeNotifications.sendOtpSms.mock.calls[0];

    const result = await authService.verifyOtp(phone, plainCode);

    expect(result.tokens.accessToken).toBeDefined();
    expect(result.tokens.refreshToken).toBeDefined();
    expect(fakeUsersService.create).toHaveBeenCalledWith(
      expect.objectContaining({ phone, role: UserRole.CUSTOMER }),
    );
    expect(otpRows[0].used).toBe(true);
  });

  it('rejette un code invalide et incrémente les tentatives', async () => {
    const phone = '+2250700000003';
    await authService.sendOtp(phone);

    await expect(authService.verifyOtp(phone, '000000')).rejects.toThrow(BadRequestException);
    expect(otpRows[0].attempts).toBe(1);
  });

  it('bloque la vérification 15 min après 3 tentatives échouées', async () => {
    const phone = '+2250700000004';
    await authService.sendOtp(phone);

    await expect(authService.verifyOtp(phone, '000000')).rejects.toThrow(BadRequestException);
    await expect(authService.verifyOtp(phone, '000000')).rejects.toThrow(BadRequestException);
    await expect(authService.verifyOtp(phone, '000000')).rejects.toThrow(BadRequestException);

    expect(otpRows[0].blockedUntil).not.toBeNull();
    await expect(authService.verifyOtp(phone, '000000')).rejects.toThrow(HttpException);
  });

  it('rejette la vérification si le code est expiré', async () => {
    const phone = '+2250700000005';
    await authService.sendOtp(phone);
    otpRows[0].expiresAt = new Date(Date.now() - 1000);
    const [, plainCode] = fakeNotifications.sendOtpSms.mock.calls[0];

    await expect(authService.verifyOtp(phone, plainCode)).rejects.toThrow(BadRequestException);
  });
});

describe('AuthService — anti brute-force login-email', () => {
  let authService: AuthService;
  let redisStore: Map<string, string>;
  const correctPasswordHash = bcrypt.hashSync('bon-mot-de-passe', 4);

  const fakeUsersService = {
    findByPhone: jest.fn(),
    findByEmail: jest.fn(),
    findByGoogleId: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    setRefreshTokenHash: jest.fn().mockResolvedValue(undefined),
  };

  const fakeConfig = {
    get: () => 'test-secret',
  } as unknown as ConfigService;

  beforeEach(() => {
    redisStore = new Map();
    jest.clearAllMocks();
    fakeUsersService.findByEmail.mockResolvedValue({
      id: 'user-victim',
      passwordHash: correctPasswordHash,
    });

    const fakeRedis = {
      get: async (key: string) => redisStore.get(key) ?? null,
      incr: async (key: string) => {
        const current = parseInt(redisStore.get(key) ?? '0', 10) + 1;
        redisStore.set(key, String(current));
        return current;
      },
      expire: async () => 1,
      del: async (key: string) => {
        redisStore.delete(key);
        return 1;
      },
    };

    authService = new AuthService(
      {} as any,
      fakeUsersService as any,
      {} as any,
      {} as any,
      new JwtService({ secret: 'test-secret' }),
      fakeConfig,
      fakeRedis as any,
    );
  });

  it('bloque (429) après 5 tentatives échouées sur le même compte, même avec le bon mot de passe', async () => {
    const email = 'victime@test.com';
    for (let i = 0; i < 5; i++) {
      await expect(authService.validateEmailLogin(email, 'mauvais-mdp')).resolves.toBeNull();
    }
    await expect(authService.validateEmailLogin(email, 'mauvais-mdp')).rejects.toThrow(HttpException);
    await expect(authService.validateEmailLogin(email, 'bon-mot-de-passe')).rejects.toThrow(
      HttpException,
    );
  });

  it('réinitialise le compteur après une connexion réussie', async () => {
    const email = 'user@test.com';
    await authService.validateEmailLogin(email, 'mauvais-mdp');
    await authService.validateEmailLogin(email, 'mauvais-mdp');

    const success = await authService.validateEmailLogin(email, 'bon-mot-de-passe');
    expect(success).not.toBeNull();

    // Le compteur est repassé à zéro : un nouvel échec isolé ne déclenche pas de blocage.
    await expect(authService.validateEmailLogin(email, 'mauvais-mdp')).resolves.toBeNull();
  });
});

describe('AuthService — validateGoogleUser (réclamation de compte)', () => {
  let authService: AuthService;

  const fakeUsersService = {
    findByPhone: jest.fn(),
    findByEmail: jest.fn(),
    findByGoogleId: jest.fn().mockResolvedValue(null),
    create: jest.fn(),
    update: jest.fn(),
    setRefreshTokenHash: jest.fn(),
  };

  const fakeConfig = { get: () => 'test-secret' } as unknown as ConfigService;

  beforeEach(() => {
    jest.clearAllMocks();
    fakeUsersService.findByGoogleId.mockResolvedValue(null);
    authService = new AuthService(
      {} as any,
      fakeUsersService as any,
      {} as any,
      {} as any,
      new JwtService({ secret: 'test-secret' }),
      fakeConfig,
      {} as any,
    );
  });

  it("⚠ correctif critique : efface passwordHash/refreshTokenHash d'un compte non vérifié lors de la liaison Google", async () => {
    const unverifiedAccount = {
      id: 'user-victim',
      email: 'victime@gmail.com',
      isEmailVerified: false,
      passwordHash: 'hash-cree-par-attaquant',
      refreshTokenHash: 'refresh-hash-attaquant',
    };
    fakeUsersService.findByEmail.mockResolvedValue(unverifiedAccount);
    fakeUsersService.update.mockImplementation(async (_id: string, data: any) => ({
      ...unverifiedAccount,
      ...data,
    }));

    const result = await authService.validateGoogleUser({
      googleId: 'google-123',
      email: 'victime@gmail.com',
      emailVerified: true,
      firstName: 'Vraie',
      lastName: 'Victime',
    });

    expect(fakeUsersService.update).toHaveBeenCalledWith(
      'user-victim',
      expect.objectContaining({
        googleId: 'google-123',
        isEmailVerified: true,
        passwordHash: null,
        refreshTokenHash: null,
      }),
    );
    expect(result.passwordHash).toBeNull();
  });

  it('lie simplement Google à un compte déjà vérifié (mot de passe conservé)', async () => {
    const verifiedAccount = {
      id: 'user-legit',
      email: 'user@test.com',
      isEmailVerified: true,
      passwordHash: 'hash-legitime',
    };
    fakeUsersService.findByEmail.mockResolvedValue(verifiedAccount);
    fakeUsersService.update.mockImplementation(async (_id: string, data: any) => ({
      ...verifiedAccount,
      ...data,
    }));

    await authService.validateGoogleUser({
      googleId: 'google-456',
      email: 'user@test.com',
      emailVerified: true,
    });

    expect(fakeUsersService.update).toHaveBeenCalledWith('user-legit', { googleId: 'google-456' });
  });

  it("n'utilise pas un email que Google n'affirme pas vérifié pour lier un compte existant", async () => {
    fakeUsersService.create.mockResolvedValue({ id: 'user-new', isEmailVerified: false });

    await authService.validateGoogleUser({
      googleId: 'google-789',
      email: 'test@test.com',
      emailVerified: false,
    });

    expect(fakeUsersService.findByEmail).not.toHaveBeenCalled();
    expect(fakeUsersService.create).toHaveBeenCalledWith(
      expect.objectContaining({ isEmailVerified: false }),
    );
  });
});
