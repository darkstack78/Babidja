import { User } from '@prisma/client';

export type SafeUser = Omit<User, 'passwordHash' | 'refreshTokenHash'>;

export function sanitizeUser(user: User): SafeUser {
  const { passwordHash: _passwordHash, refreshTokenHash: _refreshTokenHash, ...safe } = user;
  return safe;
}
