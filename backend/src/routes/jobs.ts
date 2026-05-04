import { Router } from 'express';
import { query } from 'express-validator';
import { ContractType } from '@prisma/client';
import { requireAuth } from '../middleware/auth';
import { handleValidation } from '../middleware/validate';
import { prisma } from '../services/prisma';

const router = Router();

router.use(requireAuth);

const VALID_CONTRACTS = Object.values(ContractType);

// ─── GET /api/v1/jobs ─────────────────────────────────────────────────────────

router.get(
  '/',
  [
    query('contract')
      .optional()
      .isIn(VALID_CONTRACTS)
      .withMessage(`contract must be one of: ${VALID_CONTRACTS.join(', ')}`),
    query('q')
      .optional()
      .isString()
      .isLength({ max: 100 })
      .withMessage('Search query too long.'),
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('page must be a positive integer.'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 50 })
      .withMessage('limit must be between 1 and 50.'),
  ],
  handleValidation,
  async (req: import('express').Request, res: import('express').Response) => {
    const raw_contract = req.query['contract'];
    const contract = typeof raw_contract === 'string' ? raw_contract as ContractType : undefined;
    const raw_q = req.query['q'];
    const q = typeof raw_q === 'string' ? raw_q : undefined;
    const page  = parseInt(String(req.query['page']  ?? '1'), 10);
    const limit = parseInt(String(req.query['limit'] ?? '20'), 10);

    const where = {
      is_active: true,
      ...(contract ? { contract } : {}),
      ...(q ? {
        OR: [
          { title:   { contains: q, mode: 'insensitive' as const } },
          { company: { contains: q, mode: 'insensitive' as const } },
        ],
      } : {}),
    };

    const [jobs, total] = await Promise.all([
      prisma.offer.findMany({
        where,
        orderBy: { score: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.offer.count({ where }),
    ]);

    res.status(200).json({ jobs, total, page, limit });
  }
);

// ─── GET /api/v1/jobs/:id ─────────────────────────────────────────────────────

router.get('/:id', async (req: import('express').Request, res: import('express').Response) => {
  const raw_id = req.params['id'];
  const id = typeof raw_id === 'string' ? raw_id : '';

  const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!UUID_RE.test(id)) {
    res.status(400).json({ error: 'Bad request', detail: 'Invalid offer id.' });
    return;
  }

  const job = await prisma.offer.findFirst({ where: { id, is_active: true } });
  if (!job) {
    res.status(404).json({ error: 'Not found', detail: 'Offer not found.' });
    return;
  }

  res.status(200).json({ job });
});

export default router;
