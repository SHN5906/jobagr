// Role aligns with Prisma enum values
export type Role = 'USER' | 'ADMIN';

export interface TokenPayload {
  sub:   string;
  email: string;
  role:  Role;
}

// Augment Express Request with authenticated user
declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}
