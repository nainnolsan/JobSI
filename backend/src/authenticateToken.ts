// Reusable JWT authentication middleware for protected routes
import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export function authenticateJWT(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1];

  // Debug logs to help trace why handlers may not run
  console.log(`\n--- authenticateJWT called for ${req.method} ${req.originalUrl} ---`);
  console.log('Authorization header:', authHeader ?? '<none>');

  if (!token) {
    console.log('authenticateJWT: No token provided — rejecting request');
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    // attach user and continue
    // @ts-ignore - augmenting req with user field
    req.user = decoded;
    console.log('authenticateJWT: token verified');
    next();
  } catch (err) {
    console.log('authenticateJWT: token invalid —', (err as any)?.message ?? err);
    return res.status(401).json({ error: 'Token inválido' });
  }
}
