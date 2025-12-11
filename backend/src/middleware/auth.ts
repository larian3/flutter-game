import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  userId?: number;
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ error: 'Token não fornecido' });
    }

    const parts = authHeader.split(' ');

    if (parts.length !== 2) {
      return res.status(401).json({ error: 'Erro no token' });
    }

    const [scheme, token] = parts;

    if (!/^Bearer$/i.test(scheme)) {
      return res.status(401).json({ error: 'Token mal formatado' });
    }

    jwt.verify(token, process.env.JWT_SECRET || 'secret', (err, decoded: any) => {
      if (err) {
        return res.status(401).json({ error: 'Token inválido' });
      }

      req.userId = decoded.id;
      return next();
    });
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido' });
  }
};

