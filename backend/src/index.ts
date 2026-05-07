import express from 'express';
import helmet from 'helmet';
import cors from 'cors';

import { config } from './config/env';
import { prisma } from './services/prisma';
import { apiLimiter } from './middleware/rateLimiter';
import authRouter from './routes/auth';
import jobsRouter from './routes/jobs';
import adminRouter from './routes/admin';
import chatRouter from './routes/chat';

const app = express();

// ─── Security headers ─────────────────────────────────────────────────────────
app.use(helmet());

// ─── CORS ─────────────────────────────────────────────────────────────────────
app.use(cors({
  origin: config.corsOrigins,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false,
}));

// ─── Body parsing — limit size to mitigate payload-based DoS ─────────────────
app.use(express.json({ limit: '16kb' }));

// ─── Global rate limiter ──────────────────────────────────────────────────────
app.use('/api', apiLimiter);

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/v1/auth',  authRouter);
app.use('/api/v1/jobs',  jobsRouter);
app.use('/api/v1/admin', adminRouter);
app.use('/api/v1/chat',  chatRouter);

// ─── Health check (unauthenticated) ──────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', env: config.nodeEnv });
});

// ─── 404 handler ─────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// ─── Global error handler ─────────────────────────────────────────────────────
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const detail = config.nodeEnv === 'development' ? err.message : 'Internal server error.';
  console.error('[error]', err);
  res.status(500).json({ error: 'Internal server error', detail });
});

// ─── Start ────────────────────────────────────────────────────────────────────
const server = app.listen(config.port, () => {
  console.log(`[jobryx] Server running on http://localhost:${config.port} (${config.nodeEnv})`);
});

// Fermeture propre du pool Prisma à l'arrêt du process
process.on('SIGTERM', async () => {
  server.close();
  await prisma.$disconnect();
});
process.on('SIGINT', async () => {
  server.close();
  await prisma.$disconnect();
});
