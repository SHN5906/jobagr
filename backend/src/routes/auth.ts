import { Router } from 'express';
import { body } from 'express-validator';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import { config } from '../config/env';
import { prisma } from '../services/prisma';
import { requireAuth } from '../middleware/auth';
import { handleValidation } from '../middleware/validate';
import { authLimiter } from '../middleware/rateLimiter';
import type { TokenPayload } from '../types/index';

const router = Router();

// ─── Validation chains ───────────────────────────────────────────────────────

const PASSWORD_RULES = body('password')
  .isLength({ min: 8 }).withMessage('Password must be at least 8 characters.')
  .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter.')
  .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter.')
  .matches(/[0-9]/).withMessage('Password must contain at least one digit.')
  .matches(/[^A-Za-z0-9]/).withMessage('Password must contain at least one special character.');

const registerValidators = [
  body('email')
    .isEmail().withMessage('Invalid email address.')
    .normalizeEmail()
    .isLength({ max: 254 }).withMessage('Email too long.'),
  body('username')
    .isLength({ min: 2, max: 32 }).withMessage('Username must be 2–32 characters.')
    .matches(/^[A-Za-z0-9_-]+$/).withMessage('Username may only contain letters, digits, _ and -.'),
  PASSWORD_RULES,
];

const loginValidators = [
  body('email').isEmail().withMessage('Invalid email.').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required.'),
];

// ─── POST /api/v1/auth/register ──────────────────────────────────────────────

router.post(
  '/register',
  authLimiter,
  registerValidators,
  handleValidation,
  async (req: import('express').Request, res: import('express').Response) => {
    const { email, username, password } = req.body as {
      email: string; username: string; password: string;
    };

    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
      select: { email: true, username: true },
    });

    if (existing?.email === email) {
      res.status(409).json({ error: 'Conflict', detail: 'An account with this email already exists.' });
      return;
    }
    if (existing?.username === username) {
      res.status(409).json({ error: 'Conflict', detail: 'This username is already taken.' });
      return;
    }

    const password_hash = await bcrypt.hash(password, config.bcryptRounds);

    const user = await prisma.user.create({
      data: { email, username, password_hash },
      select: { id: true, email: true, username: true, role: true, is_active: true, created_at: true },
    });

    res.status(201).json({ message: 'Account created.', user });
  }
);

// ─── POST /api/v1/auth/login ─────────────────────────────────────────────────

router.post(
  '/login',
  authLimiter,
  loginValidators,
  handleValidation,
  async (req: import('express').Request, res: import('express').Response) => {
    const { email, password } = req.body as { email: string; password: string };

    const user = await prisma.user.findUnique({ where: { email } });

    // Always run bcrypt.compare — prevent timing attacks when user not found
    const dummy_hash = '$2b$12$invalidhashfortimingprotection000000000000000000000000';
    const match = await bcrypt.compare(password, user?.password_hash ?? dummy_hash);

    if (!user || !match || !user.is_active) {
      res.status(401).json({ error: 'Unauthorized', detail: 'Invalid credentials.' });
      return;
    }

    const payload: TokenPayload = { sub: user.id, email: user.email, role: user.role };
    const access_token = jwt.sign(payload, config.jwtSecret, {
      expiresIn: config.jwtExpiresIn as any,
      algorithm: 'HS256',
    });

    res.status(200).json({ access_token, token_type: 'Bearer' });
  }
);

// ─── GET /api/v1/auth/me ─────────────────────────────────────────────────────

router.get('/me', requireAuth, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.sub },
    select: { id: true, email: true, username: true, role: true, is_active: true, created_at: true },
  });

  if (!user) {
    res.status(404).json({ error: 'Not found', detail: 'User no longer exists.' });
    return;
  }

  res.status(200).json({ user });
});

export default router;
