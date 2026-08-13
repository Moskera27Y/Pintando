import type { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';
import { prisma } from '../../src/lib/prisma.js';
import { sendError, sendJson, handleOptions } from './cors.js';

const JWT_SECRET = process.env.JWT_SECRET || 'pintando-suenos-secret-key-change-in-production';

export function verifyToken(req: VercelRequest): { userId: string; role: string } | null {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return null;
  const token = auth.slice(7);
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; role: string };
    return decoded;
  } catch {
    return null;
  }
}

export function requireAuth(req: VercelRequest, res: VercelResponse): { userId: string; role: string } | null {
  const decoded = verifyToken(req);
  if (!decoded) {
    sendError(res, 401, 'No autorizado');
    return null;
  }
  if (decoded.role !== 'ADMIN') {
    sendError(res, 403, 'Acceso denegado');
    return null;
  }
  return decoded;
}
