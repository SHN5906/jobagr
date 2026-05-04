import type { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';

/**
 * Runs after express-validator chains. Returns 400 with structured errors
 * if any validator failed — stops injection-tainted input from reaching handlers.
 */
export function handleValidation(req: Request, res: Response, next: NextFunction): void {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      error: 'Validation failed',
      detail: errors.array().map(e => ({ field: (e as any).path, message: e.msg })),
    });
    return;
  }
  next();
}
