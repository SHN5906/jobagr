/**
 * In-memory user store — stub replacing a real DB for Phase 1.
 * All data is lost on process restart.
 */
import { v4 as uuidv4 } from 'uuid';
import type { User, PublicUser } from '../types/index';

const store = new Map<string, User>(); // keyed by id
const byEmail = new Map<string, string>(); // email -> id

export const userStore = {
  findByEmail(email: string): User | undefined {
    const id = byEmail.get(email.toLowerCase());
    return id ? store.get(id) : undefined;
  },

  findById(id: string): User | undefined {
    return store.get(id);
  },

  emailExists(email: string): boolean {
    return byEmail.has(email.toLowerCase());
  },

  create(data: { email: string; username: string; password_hash: string }): User {
    const user: User = {
      id:            uuidv4(),
      email:         data.email.toLowerCase(),
      username:      data.username,
      role:          'user',
      is_active:     true,
      created_at:    new Date().toISOString(),
      password_hash: data.password_hash,
    };
    store.set(user.id, user);
    byEmail.set(user.email, user.id);
    return user;
  },

  toPublic(user: User): PublicUser {
    const { password_hash: _, ...pub } = user;
    return pub;
  },
};
