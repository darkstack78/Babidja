import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { User, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { createHash, randomBytes, randomInt, timingSafeEqual } from 'crypto';
import type Redis from 'ioredis';
import { REDIS_CLIENT } from '../redis/redis.module';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { sanitizeUser, SafeUser } from '../users/sanitize-user';
import { NotificationsService } from '../notifications/notifications.service';
import { ReferralService } from '../referral/referral.service';
import { RegisterEmailDto } from './dto/register-email.dto';

const BCRYPT_SALT_ROUNDS = 12;
const OTP_TTL_SECONDS = 5 * 60;
const OTP_SEND_MAX_PER_HOUR = 3;
const OTP_VERIFY_MAX_ATTEMPTS = 3;
const OTP_BLOCK_MINUTES = 15;
const LOGIN_MAX_ATTEMPTS = 5;
const LOGIN_BLOCK_MINUTES = 15;
const EMAIL_VERIFICATION_TTL_MS = 24 * 60 * 60 * 1000;
const JWT_ALGORITHM = 'HS256' as const;
// Code éphémère OAuth : durée de vie courte (60s), usage unique.
const OAUTH_CODE_TTL_SECONDS = 60;

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
    private readonly notifications: NotificationsService,
    private readonly referralService: ReferralService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
  ) {}

  // ---------------------------------------------------------------------
  // 4.1 Flux OTP (téléphone)
  // ---------------------------------------------------------------------

  async sendOtp(phone: string): Promise<{ success: true }> {
    const sendCountKey = `otp:send-count:${phone}`;
    const sendCount = await this.redis.incr(sendCountKey);
    if (sendCount === 1) {
      await this.redis.expire(sendCountKey, 60 * 60);
    }
    if (sendCount > OTP_SEND_MAX_PER_HOUR) {
      throw new HttpException(
        "Trop de demandes de code pour ce numéro. Réessayez dans une heure.",
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    const code = randomInt(0, 1_000_000).toString().padStart(6, '0');
    const codeHash = await bcrypt.hash(code, BCRYPT_SALT_ROUNDS);
    const expiresAt = new Date(Date.now() + OTP_TTL_SECONDS * 1000);

    const otp = await this.prisma.oTPVerification.create({
      data: { phone, codeHash, expiresAt },
    });

    await this.redis.set(`otp:${phone}`, otp.id, 'EX', OTP_TTL_SECONDS);

    // Le code n'est jamais loggé en clair ici : sms.service applique un fallback
    // dev distinct (voir notifications/sms.service.ts) qui, lui, logge explicitement
    // en environnement de développement uniquement.
    await this.notifications.sendOtpSms(phone, code);

    return { success: true };
  }

  async verifyOtp(phone: string, code: string): Promise<{ tokens: AuthTokens; user: SafeUser }> {
    const otp = await this.prisma.oTPVerification.findFirst({
      where: { phone, used: false },
      orderBy: { createdAt: 'desc' },
    });

    if (!otp) {
      throw new BadRequestException('Aucun code actif pour ce numéro, demandez-en un nouveau.');
    }
    if (otp.blockedUntil && otp.blockedUntil > new Date()) {
      throw new HttpException(
        'Trop de tentatives échouées. Réessayez dans quelques minutes.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
    if (otp.expiresAt < new Date()) {
      throw new BadRequestException('Code expiré, demandez-en un nouveau.');
    }

    const isValid = await bcrypt.compare(code, otp.codeHash);
    if (!isValid) {
      const attempts = otp.attempts + 1;
      const blocked = attempts >= OTP_VERIFY_MAX_ATTEMPTS;
      await this.prisma.oTPVerification.update({
        where: { id: otp.id },
        data: {
          attempts,
          blockedUntil: blocked
            ? new Date(Date.now() + OTP_BLOCK_MINUTES * 60 * 1000)
            : otp.blockedUntil,
        },
      });
      throw new BadRequestException('Code invalide.');
    }

    await this.prisma.oTPVerification.update({ where: { id: otp.id }, data: { used: true } });
    await this.redis.del(`otp:${phone}`);

    let user = await this.usersService.findByPhone(phone);
    if (!user) {
      user = await this.usersService.create({ phone, role: UserRole.CUSTOMER });
    }

    const tokens = await this.issueTokens(user);
    return { tokens, user: sanitizeUser(user) };
  }

  // ---------------------------------------------------------------------
  // Inscription / connexion par email
  // ---------------------------------------------------------------------

  async registerEmail(dto: RegisterEmailDto): Promise<{ tokens: AuthTokens; user: SafeUser }> {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new BadRequestException('Un compte existe déjà avec cet email.');
    }
    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_SALT_ROUNDS);
    const user = await this.usersService.create({
      email: dto.email,
      passwordHash,
      firstName: dto.firstName,
      lastName: dto.lastName,
      role: UserRole.CUSTOMER,
    });

    await this.referralService.registerReferral(dto.referralCode, user.id);
    await this.sendVerificationEmail(user);

    const tokens = await this.issueTokens(user);
    return { tokens, user: sanitizeUser(user) };
  }

  private async sendVerificationEmail(user: User): Promise<void> {
    if (!user.email) return;
    const token = randomBytes(32).toString('hex');
    await this.prisma.emailVerification.create({
      data: {
        userId: user.id,
        tokenHash: this.hashToken(token),
        expiresAt: new Date(Date.now() + EMAIL_VERIFICATION_TTL_MS),
      },
    });
    await this.notifications.sendVerificationEmail(user.email, token);
  }

  async verifyEmail(token: string): Promise<{ success: true }> {
    const record = await this.prisma.emailVerification.findUnique({
      where: { tokenHash: this.hashToken(token) },
    });
    if (!record || record.used || record.expiresAt < new Date()) {
      throw new BadRequestException('Lien de vérification invalide ou expiré.');
    }

    await this.prisma.$transaction([
      this.prisma.emailVerification.update({ where: { id: record.id }, data: { used: true } }),
      this.prisma.user.update({ where: { id: record.userId }, data: { isEmailVerified: true } }),
    ]);

    return { success: true };
  }

  // ⚠ Sécurité critique : throttle IP (10/h, section 9) protège contre un
  // attaquant unique, mais pas contre du credential stuffing distribué sur
  // plusieurs IP ciblant UN compte précis. Ce compteur par email complète l'IP.
  async validateEmailLogin(email: string, password: string): Promise<User | null> {
    const blockKey = `login:fail:${email}`;
    const attempts = parseInt((await this.redis.get(blockKey)) ?? '0', 10);
    if (attempts >= LOGIN_MAX_ATTEMPTS) {
      throw new HttpException(
        'Trop de tentatives échouées pour ce compte. Réessayez dans quelques minutes.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    const user = await this.usersService.findByEmail(email);
    const isValid = user?.passwordHash ? await bcrypt.compare(password, user.passwordHash) : false;

    if (!isValid) {
      const next = await this.redis.incr(blockKey);
      if (next === 1) {
        await this.redis.expire(blockKey, LOGIN_BLOCK_MINUTES * 60);
      }
      return null;
    }

    await this.redis.del(blockKey);
    return user;
  }

  // ---------------------------------------------------------------------
  // 4.2 Google OAuth
  // ---------------------------------------------------------------------

  async validateGoogleUser(profile: {
    googleId: string;
    email?: string;
    emailVerified?: boolean;
    firstName?: string;
    lastName?: string;
    avatarUrl?: string;
  }): Promise<User> {
    let user = await this.usersService.findByGoogleId(profile.googleId);
    if (user) return user;

    const trustedEmail = profile.emailVerified !== false ? profile.email : undefined;

    if (trustedEmail) {
      user = await this.usersService.findByEmail(trustedEmail);
      if (user) {
        if (!user.isEmailVerified) {
          // ⚠ Correctif sécurité critique : un compte enregistré par mot de passe
          // avec cet email n'a jamais prouvé qu'il en était propriétaire. Google
          // vient de le prouver — on "réclame" le compte pour son vrai
          // propriétaire et on invalide l'ancien mot de passe, qui aurait pu être
          // utilisé par un attaquant ayant enregistré ce compte frauduleusement
          // avec l'email de la victime (voir audit sécurité).
          return this.usersService.update(user.id, {
            googleId: profile.googleId,
            isEmailVerified: true,
            passwordHash: null,
            refreshTokenHash: null,
          });
        }
        return this.usersService.update(user.id, { googleId: profile.googleId });
      }
    }

    return this.usersService.create({
      googleId: profile.googleId,
      email: profile.email,
      isEmailVerified: !!trustedEmail,
      firstName: profile.firstName ?? '',
      lastName: profile.lastName ?? '',
      avatarUrl: profile.avatarUrl,
      role: UserRole.CUSTOMER,
    });
  }

  // ---------------------------------------------------------------------
  // 4.3 JWT et refresh token
  // ---------------------------------------------------------------------

  async issueTokens(user: User): Promise<AuthTokens> {
    const payload = { sub: user.id, role: user.role, tenantId: await this.currentTenantId(user.id) };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.config.get<string>('jwt.secret'),
      expiresIn: this.config.get<string>('jwt.expiresIn'),
      algorithm: JWT_ALGORITHM,
    });
    const refreshToken = await this.jwtService.signAsync(
      { sub: user.id },
      {
        secret: this.config.get<string>('jwt.refreshSecret'),
        expiresIn: this.config.get<string>('jwt.refreshExpiresIn'),
        algorithm: JWT_ALGORITHM,
      },
    );

    // bcrypt tronque son entrée à 72 octets : deux JWT du même utilisateur
    // partagent un préfixe (header + "sub") qui dépasse largement cette limite,
    // ce qui ferait matcher à tort un refresh token pourtant rotaté. On utilise
    // donc un simple digest SHA-256 (le token est déjà à haute entropie, pas
    // besoin d'un hash lent type bcrypt comme pour un mot de passe/OTP).
    await this.usersService.setRefreshTokenHash(user.id, this.hashToken(refreshToken));

    return { accessToken, refreshToken };
  }

  async refresh(refreshToken: string): Promise<AuthTokens> {
    let payload: { sub: string };
    try {
      payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.config.get<string>('jwt.refreshSecret'),
        algorithms: [JWT_ALGORITHM],
      });
    } catch {
      throw new UnauthorizedException('Refresh token invalide ou expiré.');
    }

    const user = await this.usersService.findById(payload.sub);
    if (!user?.refreshTokenHash) {
      throw new UnauthorizedException('Session invalide, reconnectez-vous.');
    }

    const provided = Buffer.from(this.hashToken(refreshToken));
    const stored = Buffer.from(user.refreshTokenHash);
    const matches = provided.length === stored.length && timingSafeEqual(provided, stored);
    if (!matches) {
      // SEC-06 : Refresh Token Reuse Detection — un token invalide mais appartenant à un
      // utilisateur connu peut signifier une réutilisation après rotation (vol potentiel).
      // On révoque TOUTES les sessions pour forcer une reconnexion explicite.
      await this.usersService.setRefreshTokenHash(user.id, null);
      throw new UnauthorizedException(
        'Session compromise détectée. Veuillez vous reconnecter.',
      );
    }

    return this.issueTokens(user); // rotation : un nouveau refresh token invalide l'ancien
  }

  // Digest à usage générique pour les secrets à haute entropie (refresh token,
  // token de vérification d'email) — voir la note dans issueTokens().
  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  async logout(userId: string): Promise<{ success: true }> {
    await this.usersService.setRefreshTokenHash(userId, null);
    return { success: true };
  }

  // -----------------------------------------------------------------------
  // CRIT-01 : Code éphémère OAuth (anti-token-in-URL)
  // -----------------------------------------------------------------------

  /**
   * Génère un code aléatoire éphémère stocké en Redis (TTL 60s), usage unique.
   * Ce code est passé en query param au lieu des vrais tokens JWT — il n'a aucune
   * valeur cryptographique en lui-même (pas un JWT), et expire rapidement.
   */
  async issueOAuthCode(user: User): Promise<string> {
    const tokens = await this.issueTokens(user);
    const code = randomBytes(24).toString('hex');
    await this.redis.set(
      `oauth:code:${code}`,
      JSON.stringify(tokens),
      'EX',
      OAUTH_CODE_TTL_SECONDS,
    );
    return code;
  }

  /**
   * Échange un code éphémère OAuth contre les tokens JWT réels (usage unique).
   * Le code est supprimé immédiatement après lecture (GETDEL).
   */
  async exchangeOAuthCode(code: string): Promise<AuthTokens> {
    const raw = await this.redis.getdel(`oauth:code:${code}`);
    if (!raw) {
      throw new UnauthorizedException('Code OAuth invalide ou expiré.');
    }
    return JSON.parse(raw) as AuthTokens;
  }

  // ---------------------------------------------------------------------

  private async currentTenantId(userId: string): Promise<string | undefined> {
    const employee = await this.prisma.tenantEmployee.findFirst({
      where: { userId, isActive: true },
      select: { tenantId: true },
    });
    return employee?.tenantId;
  }
}
