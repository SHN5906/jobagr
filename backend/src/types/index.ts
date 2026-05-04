export type Role = 'user' | 'admin';

export interface User {
  id:         string;
  email:      string;
  username:   string;
  role:       Role;
  is_active:  boolean;
  created_at: string;
  password_hash: string;
}

export type PublicUser = Omit<User, 'password_hash'>;

export interface TokenPayload {
  sub:   string;  // user id
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
