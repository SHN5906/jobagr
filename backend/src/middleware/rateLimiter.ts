import rateLimit from 'express-rate-limit';

const json_handler = (_req: any, res: any) => {
  res.status(429).json({
    error: 'Too many requests',
    detail: 'Rate limit exceeded. Please wait before retrying.',
  });
};

/**
 * Strict limiter for auth endpoints — brute-force mitigation.
 * 10 attempts per 15-minute window per IP.
 */
export const authLimiter = rateLimit({
  windowMs:         15 * 60 * 1000,
  max:              10,
  standardHeaders:  true,
  legacyHeaders:    false,
  handler:          json_handler,
});

/**
 * General API limiter.
 */
export const apiLimiter = rateLimit({
  windowMs:         60 * 1000,
  max:              60,
  standardHeaders:  true,
  legacyHeaders:    false,
  handler:          json_handler,
});
