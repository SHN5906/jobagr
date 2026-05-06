/**
 * Admin routes — requires ADMIN role.
 * All routes are protected by requireAuth + requireAdmin.
 *
 * User management  : GET/PATCH/DELETE /api/v1/admin/users
 * Offer moderation : GET/POST/PATCH/DELETE /api/v1/admin/offers
 */
import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { requireAuth } from '../middleware/auth';
import { requireAdmin } from '../middleware/requireAdmin';
import { handleValidation } from '../middleware/validate';
import { prisma } from '../services/prisma';

const router = Router();

// Every admin route requires auth AND admin role
router.use(requireAuth, requireAdmin);

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const VALID_CONTRACTS = ['CDI', 'STAGE', 'ALTERNANCE', 'FREELANCE'];

// ═══════════════════════════════════════════════════════════════
//  USER MANAGEMENT
// ═══════════════════════════════════════════════════════════════

// GET /api/v1/admin/users — list all users (paginated)
router.get('/users', async (_req, res) => {
  const users = await prisma.user.findMany({
    select: { id: true, email: true, username: true, role: true, is_active: true, created_at: true },
    orderBy: { created_at: 'desc' },
  });
  res.status(200).json({ users, total: users.length });
});

// PATCH /api/v1/admin/users/:id — update role or active status
router.patch(
  '/users/:id',
  [
    param('id').matches(UUID_RE).withMessage('Invalid user id.'),
    body('role').optional().isIn(['USER', 'ADMIN']).withMessage('role must be USER or ADMIN.'),
    body('is_active').optional().isBoolean().withMessage('is_active must be a boolean.'),
  ],
  handleValidation,
  async (req: import('express').Request, res: import('express').Response) => {
    const id = req.params['id'] as string;

    // Prevent admin from demoting themselves
    if (id === req.user!.sub && req.body.role === 'USER') {
      res.status(400).json({ error: 'Bad request', detail: 'You cannot demote yourself.' });
      return;
    }

    const user = await prisma.user.update({
      where: { id },
      data: {
        ...(req.body.role      !== undefined ? { role:      req.body.role }      : {}),
        ...(req.body.is_active !== undefined ? { is_active: req.body.is_active } : {}),
      },
      select: { id: true, email: true, username: true, role: true, is_active: true, created_at: true },
    }).catch(() => null);

    if (!user) {
      res.status(404).json({ error: 'Not found', detail: 'User not found.' });
      return;
    }

    res.status(200).json({ user });
  }
);

// DELETE /api/v1/admin/users/:id — hard delete
router.delete(
  '/users/:id',
  [param('id').matches(UUID_RE).withMessage('Invalid user id.')],
  handleValidation,
  async (req: import('express').Request, res: import('express').Response) => {
    const id = req.params['id'] as string;

    if (id === req.user!.sub) {
      res.status(400).json({ error: 'Bad request', detail: 'You cannot delete your own account.' });
      return;
    }

    await prisma.user.delete({ where: { id } }).catch(() => null);
    res.status(204).send();
  }
);

// ═══════════════════════════════════════════════════════════════
//  OFFER MODERATION
// ═══════════════════════════════════════════════════════════════

// GET /api/v1/admin/offers — all offers including inactive
router.get(
  '/offers',
  [
    query('active').optional().isBoolean().withMessage('active must be a boolean.'),
  ],
  handleValidation,
  async (req: import('express').Request, res: import('express').Response) => {
    const raw_active = req.query['active'];
    const filter_active =
      raw_active === 'true'  ? true  :
      raw_active === 'false' ? false :
      undefined;

    const offers = await prisma.offer.findMany({
      where: filter_active !== undefined ? { is_active: filter_active } : {},
      orderBy: { created_at: 'desc' },
    });
    res.status(200).json({ offers, total: offers.length });
  }
);

// POST /api/v1/admin/offers — create a new offer
router.post(
  '/offers',
  [
    body('title').isLength({ min: 2, max: 120 }).withMessage('title must be 2–120 chars.'),
    body('company').isLength({ min: 1, max: 100 }).withMessage('company required.'),
    body('location').isLength({ min: 1, max: 100 }).withMessage('location required.'),
    body('work_mode').isLength({ min: 1, max: 50 }).withMessage('work_mode required.'),
    body('contract').isIn(VALID_CONTRACTS).withMessage(`contract must be one of: ${VALID_CONTRACTS.join(', ')}`),
    body('salary').optional().isString().isLength({ max: 50 }),
    body('tags').isArray().withMessage('tags must be an array.'),
    body('tags.*').isString().isLength({ max: 50 }),
    body('score').isInt({ min: 0, max: 100 }).withMessage('score must be 0–100.'),
    body('source').optional().isString().isLength({ max: 100 }),
    body('posted_at').isISO8601().withMessage('posted_at must be an ISO 8601 date.'),
  ],
  handleValidation,
  async (req: import('express').Request, res: import('express').Response) => {
    const offer = await prisma.offer.create({
      data: {
        title:     req.body.title,
        company:   req.body.company,
        location:  req.body.location,
        work_mode: req.body.work_mode,
        contract:  req.body.contract,
        salary:    req.body.salary ?? null,
        tags:      req.body.tags,
        score:     req.body.score,
        source:    req.body.source ?? null,
        posted_at: new Date(req.body.posted_at),
      },
    });
    res.status(201).json({ offer });
  }
);

// PATCH /api/v1/admin/offers/:id — moderate (activate/deactivate) or update
router.patch(
  '/offers/:id',
  [
    param('id').matches(UUID_RE).withMessage('Invalid offer id.'),
    body('is_active').optional().isBoolean(),
    body('score').optional().isInt({ min: 0, max: 100 }),
    body('title').optional().isLength({ min: 2, max: 120 }),
  ],
  handleValidation,
  async (req: import('express').Request, res: import('express').Response) => {
    const id = req.params['id'] as string;
    const { is_active, score, title } = req.body;

    const offer = await prisma.offer.update({
      where: { id },
      data: {
        ...(is_active !== undefined ? { is_active } : {}),
        ...(score     !== undefined ? { score }     : {}),
        ...(title     !== undefined ? { title }     : {}),
      },
    }).catch(() => null);

    if (!offer) {
      res.status(404).json({ error: 'Not found', detail: 'Offer not found.' });
      return;
    }

    res.status(200).json({ offer });
  }
);

// DELETE /api/v1/admin/offers/:id — hard delete
router.delete(
  '/offers/:id',
  [param('id').matches(UUID_RE).withMessage('Invalid offer id.')],
  handleValidation,
  async (req: import('express').Request, res: import('express').Response) => {
    const id = req.params['id'] as string;
    await prisma.offer.delete({ where: { id } }).catch(() => null);
    res.status(204).send();
  }
);

export default router;
