export type UserRole = 'CUSTOMER' | 'TENANT_ADMIN' | 'TENANT_EMPLOYEE' | 'SUPER_ADMIN';

export interface User {
  id: string;
  phone: string | null;
  email: string | null;
  googleId: string | null;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  address?: string | null;
  walletBalance: number;
  referralCode: string;
  referredById: string | null;
  fcmToken: string | null;
  role: UserRole;
  isActive: boolean;
  isEmailVerified: boolean;
  createdAt: string;
  tenantId?: string;
}
