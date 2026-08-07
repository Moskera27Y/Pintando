import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../src/lib/prisma.js';
import { sendError, sendJson, handleOptions } from './_shared/cors.js';
import { requireAuth } from './auth.js';
import type { ContactStatus } from '@prisma/client';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleOptions(req, res)) return;

  const action = (req.query.action as string) || '';

  try {
    // ─── Contacts (public POST, admin GET/PUT) ───────────────────────────
    if (action === 'contacts') {
      if (req.method === 'POST') {
        const { name, email, subject, message } = req.body || {};
        if (!name || !email || !message) return sendError(res, 400, 'Nombre, email y mensaje son requeridos');
        const contact = await prisma.contact.create({ data: { name: String(name), email: String(email), subject: subject ? String(subject) : null, message: String(message), status: 'NEW' } });
        return sendJson(res, contact, 201);
      }
      const auth = requireAuth(req, res);
      if (!auth) return;
      if (req.method === 'GET') {
        const contacts = await prisma.contact.findMany({ orderBy: { createdAt: 'desc' } });
        return sendJson(res, contacts);
      }
      if (req.method === 'PUT') {
        const { id, status } = req.body || {};
        if (!id || !status || !['NEW', 'READ', 'REPLIED', 'ARCHIVED'].includes(status)) return sendError(res, 400, 'ID y estado válido son requeridos');
        const contact = await prisma.contact.update({ where: { id: String(id) }, data: { status: String(status) as ContactStatus } });
        await prisma.eventLog.create({ data: { type: 'CONTACT', action: 'UPDATE', resource: 'contacts', description: `Mensaje marcado como ${status}`, userId: auth.userId, payload: { id, status } } });
        return sendJson(res, contact);
      }
      return sendError(res, 405, 'Método no permitido');
    }

    // ─── Newsletter (public POST subscribe, admin GET/PUT) ───────────────
    if (action === 'newsletter') {
      if (req.method === 'POST') {
        const { email, name } = req.body || {};
        if (!email) return sendError(res, 400, 'Email es requerido');
        const existing = await prisma.newsletter.findUnique({ where: { email: String(email).toLowerCase() } });
        if (existing) {
          if (!existing.active) {
            const updated = await prisma.newsletter.update({ where: { id: existing.id }, data: { active: true, name: name ? String(name) : existing.name } });
            return sendJson(res, updated);
          }
          return sendJson(res, existing);
        }
        const sub = await prisma.newsletter.create({ data: { email: String(email).toLowerCase(), name: name ? String(name) : null, active: true } });
        return sendJson(res, sub, 201);
      }
      const auth = requireAuth(req, res);
      if (!auth) return;
      if (req.method === 'GET') {
        const subs = await prisma.newsletter.findMany({ orderBy: { createdAt: 'desc' } });
        return sendJson(res, subs);
      }
      if (req.method === 'PUT') {
        const { id, active } = req.body || {};
        if (!id || active === undefined) return sendError(res, 400, 'ID y estado active son requeridos');
        const sub = await prisma.newsletter.update({ where: { id: String(id) }, data: { active: Boolean(active) } });
        return sendJson(res, sub);
      }
      return sendError(res, 405, 'Método no permitido');
    }

    // ─── Donaciones (public POST) ────────────────────────────────────────
    if (action === 'donaciones') {
      if (req.method !== 'POST') return sendError(res, 405, 'Método no permitido');
      const { amount, currency, donorName, donorEmail, message, paypalOrderId } = req.body || {};
      if (!amount || amount <= 0) return sendError(res, 400, 'Monto de donación inválido');
      const donation = await prisma.donation.create({
        data: { amount: Number(amount), currency: currency || 'USD', status: 'PENDING', donorName: donorName ? String(donorName) : null, donorEmail: donorEmail ? String(donorEmail) : null, message: message ? String(message) : null, paypalOrderId: paypalOrderId ? String(paypalOrderId) : null },
      });
      return sendJson(res, { ...donation, amount: Number(donation.amount) }, 201);
    }

    // ─── Donations (admin GET) ────────────────────────────────────────────
    if (action === 'donations') {
      const auth = requireAuth(req, res);
      if (!auth) return;
      if (req.method !== 'GET') return sendError(res, 405, 'Método no permitido');
      const { status, userId, from, to } = req.query;
      const where: Record<string, unknown> = {};
      if (status) where.status = String(status);
      if (userId) where.userId = String(userId);
      if (from || to) { where.createdAt = {}; if (from) (where.createdAt as Record<string, unknown>).gte = new Date(String(from)); if (to) (where.createdAt as Record<string, unknown>).lte = new Date(String(to)); }
      const donations = await prisma.donation.findMany({ where, orderBy: { createdAt: 'desc' } });
      return sendJson(res, donations.map((d) => ({ ...d, amount: Number(d.amount) })));
    }

    // ─── Subscriptions (admin GET) ────────────────────────────────────────
    if (action === 'subscriptions') {
      const auth = requireAuth(req, res);
      if (!auth) return;
      if (req.method !== 'GET') return sendError(res, 405, 'Método no permitido');
      const subs = await prisma.subscription.findMany({ include: { user: { select: { id: true, firstName: true, lastName: true, email: true } }, plan: true }, orderBy: { createdAt: 'desc' } });
      return sendJson(res, subs.map((s) => ({ ...s, plan: s.plan ? { ...s.plan, price: Number(s.plan.price) } : null })));
    }

    return sendError(res, 400, 'Acción no válida');
  } catch (error) {
    console.error('Forms API error:', error);
    return sendError(res, 500, 'Error interno del servidor');
  }
}
