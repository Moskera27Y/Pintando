import type { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { prisma } from '../src/lib/prisma.js';
import { sendError, sendJson, handleOptions } from './_shared/cors.js';

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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleOptions(req, res)) return;

  const action = (req.query.action as string) || '';

  try {
    // POST /api/auth?action=login
    if (action === 'login' && req.method === 'POST') {
      const { email, password } = req.body || {};
      if (!email || !password) return sendError(res, 400, 'Email y contraseña son requeridos');
      if (!process.env.JWT_SECRET) return sendError(res, 500, 'Error de configuración del servidor');

      const normalizedEmail = String(email).trim().toLowerCase();
      const user = await prisma.user.findFirst({
        where: { email: { equals: normalizedEmail, mode: 'insensitive' } },
      });
      if (!user) return sendError(res, 401, 'Usuario no encontrado');

      const valid = await bcrypt.compare(String(password), user.passwordHash);
      if (!valid) return sendError(res, 401, 'Contraseña incorrecta');
      if (user.role !== 'ADMIN') return sendError(res, 403, 'Acceso denegado. Se requiere rol de administrador.');

      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      await prisma.eventLog.create({
        data: {
          type: 'AUTH', action: 'LOGIN', resource: 'auth',
          description: 'Inicio de sesión admin',
          ipAddress: (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || null,
          payload: { email: user.email }, userId: user.id,
        },
      }).catch(() => {});

      return sendJson(res, {
        token,
        user: { id: user.id, firstName: user.firstName, lastName: user.lastName, email: user.email, role: user.role, avatar: user.avatar },
      });
    }

    // GET /api/auth?action=me
    if (action === 'me' && req.method === 'GET') {
      const decoded = verifyToken(req);
      if (!decoded) return sendError(res, 401, 'No autorizado');
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, firstName: true, lastName: true, email: true, role: true, avatar: true },
      });
      if (!user) return sendError(res, 404, 'Usuario no encontrado');
      return sendJson(res, user);
    }

    // POST /api/auth?action=logout
    if (action === 'logout' && req.method === 'POST') {
      return sendJson(res, { success: true });
    }

    return sendError(res, 405, 'Método no permitido');
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('Auth API error:', msg);
    if (msg.includes('ECONNREFUSED') || msg.includes('PrismaClientInitializationError')) {
      return sendError(res, 500, 'Error de conexión con la base de datos');
    }
    return sendError(res, 500, 'Error interno del servidor');
  }
}
