export type AuthRole = 'admin' | 'sales_rep';

export interface AuthJwtPayload {
  sub: string;
  type: AuthRole;
  role?: AuthRole;
  iat?: number;
  exp?: number;
}

export interface AuthenticatedUser {
  id: string;
  type: AuthRole;
  name: string;
  email?: string | null;
  phone?: string | null;
  role?: AuthRole | null;
  username?: string | null;
}

