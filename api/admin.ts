import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Prisma } from '@prisma/client';
import { prisma } from '../src/lib/prisma.js';
import { sendError, sendJson, handleOptions } from './_shared/cors.js';
import { requireAuth } from './auth.js';

function slugify(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleOptions(req, res)) return;
  const auth = requireAuth(req, res);
  if (!auth) return;

  const action = (req.query.action as string) || '';

  try {
    // ─── Users ────────────────────────────────────────────────────────────
    if (action === 'users') {
      if (req.method === 'GET') {
        const { search } = req.query;
        const where = search ? { OR: [{ firstName: { contains: String(search), mode: 'insensitive' as const } }, { lastName: { contains: String(search), mode: 'insensitive' as const } }, { email: { contains: String(search), mode: 'insensitive' as const } }] } : {};
        const users = await prisma.user.findMany({ where, select: { id: true, firstName: true, lastName: true, email: true, avatar: true, phone: true, country: true, city: true, role: true, createdAt: true, updatedAt: true }, orderBy: { createdAt: 'desc' } });
        return sendJson(res, users);
      }
      if (req.method === 'PUT') {
        const { id, role } = req.body || {};
        if (!id || !role || !['ADMIN', 'USER'].includes(role)) return sendError(res, 400, 'ID y rol válido son requeridos');
        const user = await prisma.user.update({ where: { id }, data: { role }, select: { id: true, firstName: true, lastName: true, email: true, role: true } });
        await prisma.eventLog.create({ data: { type: 'USER', action: 'UPDATE_ROLE', resource: 'users', description: `Rol cambiado a ${role}`, userId: auth.userId, payload: { targetUserId: id, role } } });
        return sendJson(res, user);
      }
      return sendError(res, 405, 'Método no permitido');
    }

    // ─── Plans ────────────────────────────────────────────────────────────
    if (action === 'plans') {
      if (req.method === 'GET') {
        const plans = await prisma.plan.findMany({ orderBy: { sortOrder: 'asc' } });
        return sendJson(res, plans.map((p) => ({ ...p, price: Number(p.price) })));
      }
      if (req.method === 'PUT') {
        const { id, name, description, tagline, price, currency, billingInterval, stripePriceId, benefits, icon, color, sortOrder, active } = req.body || {};
        if (!id) return sendError(res, 400, 'ID es requerido');
        const plan = await prisma.plan.update({
          where: { id: String(id) },
          data: {
            ...(name !== undefined && { name: String(name) }),
            ...(description !== undefined && { description: description ? String(description) : null }),
            ...(tagline !== undefined && { tagline: tagline ? String(tagline) : null }),
            ...(price !== undefined && { price: Number(price) }),
            ...(currency !== undefined && { currency: String(currency) }),
            ...(billingInterval !== undefined && { billingInterval: String(billingInterval) }),
            ...(stripePriceId !== undefined && { stripePriceId: stripePriceId ? String(stripePriceId) : null }),
            ...(benefits !== undefined && { benefits: benefits as Prisma.InputJsonValue }),
            ...(icon !== undefined && { icon: icon ? String(icon) : null }),
            ...(color !== undefined && { color: color ? String(color) : null }),
            ...(sortOrder !== undefined && { sortOrder: Number(sortOrder) }),
            ...(active !== undefined && { active: Boolean(active) }),
          },
        });
        await prisma.eventLog.create({ data: { type: 'PLAN', action: 'UPDATE', resource: 'plans', description: `Plan actualizado: ${plan.name}`, userId: auth.userId, payload: { id } } });
        return sendJson(res, { ...plan, price: Number(plan.price) });
      }
      return sendError(res, 405, 'Método no permitido');
    }

    // ─── News ────────────────────────────────────────────────────────────
    if (action === 'news') {
      if (req.method === 'GET') {
        const news = await prisma.news.findMany({ include: { author: { select: { firstName: true, lastName: true } } }, orderBy: { createdAt: 'desc' } });
        return sendJson(res, news);
      }
      if (req.method === 'POST') {
        const { title, content, image, published } = req.body || {};
        if (!title || !content) return sendError(res, 400, 'Título y contenido son requeridos');
        const news = await prisma.news.create({ data: { title: String(title), slug: slugify(String(title)), content: String(content), image: image ? String(image) : null, published: Boolean(published), authorId: auth.userId } });
        await prisma.eventLog.create({ data: { type: 'CONTENT', action: 'CREATE', resource: 'news', description: `Noticia creada: ${title}`, userId: auth.userId, payload: { newsId: news.id } } });
        return sendJson(res, news, 201);
      }
      if (req.method === 'PUT') {
        const { id, title, content, image, published } = req.body || {};
        if (!id) return sendError(res, 400, 'ID es requerido');
        const news = await prisma.news.update({ where: { id: String(id) }, data: { ...(title !== undefined && { title: String(title), slug: slugify(String(title)) }), ...(content !== undefined && { content: String(content) }), ...(image !== undefined && { image: image ? String(image) : null }), ...(published !== undefined && { published: Boolean(published) }) } });
        await prisma.eventLog.create({ data: { type: 'CONTENT', action: 'UPDATE', resource: 'news', description: 'Noticia actualizada', userId: auth.userId, payload: { id } } });
        return sendJson(res, news);
      }
      if (req.method === 'DELETE') {
        const { id } = req.query;
        if (!id) return sendError(res, 400, 'ID es requerido');
        await prisma.news.delete({ where: { id: String(id) } });
        await prisma.eventLog.create({ data: { type: 'CONTENT', action: 'DELETE', resource: 'news', description: 'Noticia eliminada', userId: auth.userId, payload: { id: String(id) } } });
        return sendJson(res, { success: true });
      }
      return sendError(res, 405, 'Método no permitido');
    }

    // ─── Events (admin GET) ──────────────────────────────────────────────
    if (action === 'events') {
      if (req.method !== 'GET') return sendError(res, 405, 'Método no permitido');
      const logs = await prisma.eventLog.findMany({ include: { user: { select: { firstName: true, lastName: true } } }, orderBy: { createdAt: 'desc' }, take: 50 });
      return sendJson(res, logs);
    }

    // ─── Gallery (admin CRUD) ────────────────────────────────────────────
    if (action === 'gallery') {
      if (req.method === 'GET') {
        const gallery = await prisma.gallery.findMany({ orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }] });
        return sendJson(res, gallery);
      }
      if (req.method === 'POST') {
        const { title, description, imageUrl, thumbnail, displayOrder, featured, status } = req.body || {};
        if (!title || !imageUrl) return sendError(res, 400, 'Título e imageUrl son requeridos');
        const item = await prisma.gallery.create({
          data: {
            title: String(title),
            description: description ? String(description) : null,
            imageUrl: String(imageUrl),
            thumbnail: thumbnail ? String(thumbnail) : null,
            displayOrder: displayOrder ? Number(displayOrder) : 0,
            featured: Boolean(featured),
            status: String(status || 'active'),
          },
        });
        await prisma.eventLog.create({ data: { type: 'GALLERY', action: 'CREATE', resource: 'gallery', description: `Galería: ${title}`, userId: auth.userId, payload: { galleryId: item.id } } });
        return sendJson(res, item, 201);
      }
      if (req.method === 'PUT') {
        const { id, title, description, imageUrl, thumbnail, displayOrder, featured, status } = req.body || {};
        if (!id) return sendError(res, 400, 'ID es requerido');
        const item = await prisma.gallery.update({
          where: { id: String(id) },
          data: {
            ...(title !== undefined && { title: String(title) }),
            ...(description !== undefined && { description: description ? String(description) : null }),
            ...(imageUrl !== undefined && { imageUrl: String(imageUrl) }),
            ...(thumbnail !== undefined && { thumbnail: thumbnail ? String(thumbnail) : null }),
            ...(displayOrder !== undefined && { displayOrder: Number(displayOrder) }),
            ...(featured !== undefined && { featured: Boolean(featured) }),
            ...(status !== undefined && { status: String(status) }),
          },
        });
        await prisma.eventLog.create({ data: { type: 'GALLERY', action: 'UPDATE', resource: 'gallery', description: 'Galería actualizada', userId: auth.userId, payload: { id } } });
        return sendJson(res, item);
      }
      if (req.method === 'DELETE') {
        const { id } = req.query;
        if (!id) return sendError(res, 400, 'ID es requerido');
        await prisma.gallery.delete({ where: { id: String(id) } });
        await prisma.eventLog.create({ data: { type: 'GALLERY', action: 'DELETE', resource: 'gallery', description: 'Galería eliminada', userId: auth.userId, payload: { id: String(id) } } });
        return sendJson(res, { success: true });
      }
      return sendError(res, 405, 'Método no permitido');
    }

    return sendError(res, 400, 'Acción no válida');
  } catch (error) {
    console.error('Admin API error:', error);
    return sendError(res, 500, 'Error interno del servidor');
  }
}
