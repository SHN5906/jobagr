import type { Request, Response, NextFunction } from 'express';

/**
 * Must be used AFTER requireAuth — assumes req.user is already populated.
 * Enforces server-side that only ADMIN role can reach the route.
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  if (req.user?.role !== 'ADMIN') {
    res.status(403).json({ error: 'Forbidden', detail: 'Admin access required.' });
    return;
  }
  next();
}
