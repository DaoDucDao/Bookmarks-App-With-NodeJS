import type { Request, Response, NextFunction } from 'express';
import { HttpError } from '../lib/errors.js';

export const requireAuth = (req: Request, _res: Response, next: NextFunction) => {
   if (!req.session.userId) throw new HttpError(401, 'not logged in');
   next();
};
