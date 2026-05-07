import rateLimit from 'express-rate-limit';
import type { RequestHandler } from 'express';

const isDev = process.env['NODE_ENV'] === 'development';

const noopLimiter: RequestHandler = (_req, _res, next) => next();

const json_handler = (_req: any, res: any) => {
  res.status(429).json({
    error: 'Too many requests',
    detail: 'Rate limit exceeded. Please wait before retrying.',
  });
};

// In development, bypass rate limits so testing isn't blocked.
export const authLimiter: RequestHandler = isDev
  ? noopLimiter
  : rateLimit({
      windowMs:        15 * 60 * 1000,
      max:             10,
      standardHeaders: true,
      legacyHeaders:   false,
      handler:         json_handler,
    });

export const apiLimiter: RequestHandler = isDev
  ? noopLimiter
  : rateLimit({
      windowMs:        60 * 1000,
      max:             60,
      standardHeaders: true,
      legacyHeaders:   false,
      handler:         json_handler,
    });
