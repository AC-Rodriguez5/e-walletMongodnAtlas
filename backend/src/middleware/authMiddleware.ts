import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../services/authService.js';

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    const rawAuth = req.headers.authorization;
    // Masked logging for debugging (do not print full token)
    try {
      if (rawAuth) {
        const parts = rawAuth.split(' ');
        const scheme = parts[0] || 'Bearer';
        const t = parts[1] || '';
        console.log(`🔐 Incoming auth header: present=true scheme=${scheme} tokenPreview=${t.slice(0,8)}... len=${t.length}`);
      } else {
        console.log('🔐 Incoming auth header: present=false');
      }
    } catch (e) {
      console.log('🔐 Incoming auth header: debug failed');
    }

    const token = rawAuth?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    (req as any).user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
}
