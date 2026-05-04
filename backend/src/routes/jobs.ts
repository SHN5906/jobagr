/**
 * Jobs routes — stubbed with static JSON for Phase 1.
 * All endpoints require authentication.
 */
import { Router } from 'express';
import { query } from 'express-validator';
import { requireAuth } from '../middleware/auth';
import { handleValidation } from '../middleware/validate';

const router = Router();

// All jobs routes require a valid JWT
router.use(requireAuth);

const STUB_JOBS = [
  {
    id: '1',
    title: 'Backend Python',
    company: 'Datalys',
    location: 'Paris',
    work_mode: 'Hybride',
    contract: 'CDI',
    salary: '50–65k €',
    tags: ['Python', 'FastAPI', 'PostgreSQL'],
    score: 94,
    posted_at: '2026-04-28T10:00:00Z',
  },
  {
    id: '2',
    title: 'Ingénieur DevOps',
    company: 'OvhCloud',
    location: 'Lyon',
    work_mode: 'Sur site',
    contract: 'CDI',
    salary: '55–70k €',
    tags: ['Docker', 'Kubernetes', 'Terraform'],
    score: 89,
    posted_at: '2026-04-27T09:00:00Z',
  },
  {
    id: '3',
    title: 'Stage Data Engineer',
    company: 'Dataiku',
    location: 'Remote',
    work_mode: 'Full remote',
    contract: 'Stage',
    salary: '1 400 €',
    tags: ['Spark', 'dbt', 'Airflow'],
    score: 86,
    posted_at: '2026-04-26T14:00:00Z',
  },
  {
    id: '4',
    title: 'Frontend React Senior',
    company: 'Doctolib',
    location: 'Levallois',
    work_mode: 'Hybride',
    contract: 'CDI',
    salary: '60–80k €',
    tags: ['React', 'TypeScript', 'Tailwind'],
    score: 82,
    posted_at: '2026-04-25T11:00:00Z',
  },
  {
    id: '5',
    title: 'Alternance ML Engineer',
    company: 'Mistral AI',
    location: 'Paris',
    work_mode: 'Hybride',
    contract: 'Alternance',
    salary: null,
    tags: ['PyTorch', 'CUDA', 'Python'],
    score: 78,
    posted_at: '2026-04-24T08:00:00Z',
  },
];

// ─── GET /api/v1/jobs ─────────────────────────────────────────────────────────

router.get(
  '/',
  [
    query('contract')
      .optional()
      .isIn(['CDI', 'Stage', 'Alternance', 'Freelance'])
      .withMessage('Invalid contract type.'),
    query('q')
      .optional()
      .isString()
      .isLength({ max: 100 })
      .withMessage('Search query too long.'),
  ],
  handleValidation,
  (req: import('express').Request, res: import('express').Response) => {
    let jobs = [...STUB_JOBS];

    const raw_contract = req.query['contract'];
    const contract = typeof raw_contract === 'string' ? raw_contract : undefined;
    const raw_q = req.query['q'];
    const q = (typeof raw_q === 'string' ? raw_q : undefined)?.toLowerCase();

    if (contract) {
      jobs = jobs.filter(j => j.contract === contract);
    }

    if (q) {
      jobs = jobs.filter(j =>
        j.title.toLowerCase().includes(q) ||
        j.company.toLowerCase().includes(q) ||
        j.tags.some(t => t.toLowerCase().includes(q))
      );
    }

    res.status(200).json({ jobs, total: jobs.length });
  }
);

// ─── GET /api/v1/jobs/:id ─────────────────────────────────────────────────────

router.get('/:id', (req: import('express').Request, res: import('express').Response) => {
  // Validate id is numeric to prevent path-traversal-style inputs
  const raw_id = req.params['id'];
  const id = typeof raw_id === 'string' ? raw_id : '';
  if (!id || !/^\d+$/.test(id)) {
    res.status(400).json({ error: 'Bad request', detail: 'Invalid job id.' });
    return;
  }

  const job = STUB_JOBS.find(j => j.id === id);
  if (!job) {
    res.status(404).json({ error: 'Not found', detail: 'Job not found.' });
    return;
  }

  res.status(200).json({ job });
});

export default router;
