import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  mediaService,
  validateCategory,
  validateMimeType,
  ValidationError,
  ACCEPTED_MIME,
} from './_shared/mediaService.js';
import { uploadBlob, deleteBlob } from './_shared/blobService.js';
import { sendError, sendJson, handleOptions } from './_shared/cors.js';
import { requireAuth } from './_shared/auth.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleOptions(req, res)) return;

  const action = (req.query.action as string) || '';

  try {
    // ─── Public: GET /api/media?action=public ──────────────────────────────
    if (action === 'public' && req.method === 'GET') {
      const { category } = req.query;
      const items = await mediaService.listPublic(category ? String(category) : undefined);
      return sendJson(res, items);
    }

    // ─── All other actions require admin auth ──────────────────────────────
    const auth = requireAuth(req, res);
    if (!auth) return;

    // ─── Upload to Vercel Blob: POST /api/media?action=upload ──────────────
    if (action === 'upload' && req.method === 'POST') {
      const contentType = req.headers['content-type'] || '';
      const category = (req.query.category as string) || 'other';
      const fileName = (req.query.fileName as string) || `file-${Date.now()}`;

      try {
        validateCategory(category);
      } catch (e) {
        return sendError(res, 400, e instanceof Error ? e.message : 'Categoría inválida');
      }
      if (!contentType || !ACCEPTED_MIME.includes(contentType)) {
        return sendError(res, 400, `Tipo de archivo no soportado: ${contentType}`);
      }

      const chunks: Buffer[] = [];
      for await (const chunk of req) {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      }
      const body = Buffer.concat(chunks);

      console.log('[media upload] body exists:', body.length > 0);
      console.log('[media upload] body size:', body.length);
      console.log('[media upload] content-type:', contentType);
      console.log('[media upload] fileName:', fileName);
      console.log('[media upload] category:', category);

      if (!body || body.length === 0) {
        return sendError(res, 400, 'Empty upload body');
      }

      const blob = await uploadBlob(
        `media/${category}/${Date.now()}-${fileName}`,
        body,
        contentType,
      );

      return sendJson(res, blob);
    }

    // ─── Delete from Vercel Blob: DELETE /api/media?action=blob&url=... ─────
    if (action === 'blob' && req.method === 'DELETE') {
      const url = req.query.url as string;
      if (!url) return sendError(res, 400, 'URL es requerida');
      await deleteBlob(url);
      return sendJson(res, { success: true });
    }

    // ─── CRUD: /api/media (no action param) ────────────────────────────────
    if (!action) {
      // GET — list (with filters) or get by id
      if (req.method === 'GET') {
        const id = req.query.id as string | undefined;
        if (id) {
          const item = await mediaService.getById(String(id));
          if (!item) return sendError(res, 404, 'Media no encontrado');
          return sendJson(res, item);
        }
        const { category, status, search } = req.query;
        const items = await mediaService.list({
          category: category ? String(category) : undefined,
          status: status ? String(status) : undefined,
          search: search ? String(search) : undefined,
        });
        return sendJson(res, items);
      }

      // POST — create media record (after upload)
      if (req.method === 'POST') {
        const body = req.body || {};
        try {
          const media = await mediaService.create({
            title: body.title,
            description: body.description,
            blobUrl: body.blobUrl,
            thumbnailUrl: body.thumbnailUrl,
            fileName: body.fileName,
            mimeType: body.mimeType,
            fileSize: body.fileSize,
            width: body.width,
            height: body.height,
            duration: body.duration,
            category: body.category,
            status: body.status,
            displayOrder: body.displayOrder,
            tags: body.tags,
            featured: body.featured,
            uploadedBy: auth.userId,
          });
          return sendJson(res, media, 201);
        } catch (e) {
          if (e instanceof ValidationError) return sendError(res, 400, e.message);
          throw e;
        }
      }

      // PUT — full update (including replacing blob URL)
      if (req.method === 'PUT') {
        const id = (req.query.id as string) || (req.body as { id?: string })?.id;
        if (!id) return sendError(res, 400, 'ID es requerido');

        const body = req.body || {};
        try {
          const media = await mediaService.update(String(id), {
            title: body.title,
            description: body.description,
            blobUrl: body.blobUrl,
            thumbnailUrl: body.thumbnailUrl,
            fileName: body.fileName,
            mimeType: body.mimeType,
            fileSize: body.fileSize,
            width: body.width,
            height: body.height,
            duration: body.duration,
            category: body.category,
            status: body.status,
            displayOrder: body.displayOrder,
            tags: body.tags,
            featured: body.featured,
          });
          return sendJson(res, media);
        } catch (e) {
          if (e instanceof ValidationError) return sendError(res, 400, e.message);
          throw e;
        }
      }

      // PATCH — partial update (status, category, displayOrder, featured)
      if (req.method === 'PATCH') {
        const id = (req.query.id as string) || (req.body as { id?: string })?.id;
        if (!id) return sendError(res, 400, 'ID es requerido');

        const body = req.body || {};
        try {
          const media = await mediaService.update(String(id), {
            category: body.category,
            status: body.status,
            displayOrder: body.displayOrder,
            featured: body.featured,
          });
          return sendJson(res, media);
        } catch (e) {
          if (e instanceof ValidationError) return sendError(res, 400, e.message);
          throw e;
        }
      }

      // DELETE — delete record + blob from Vercel Blob
      if (req.method === 'DELETE') {
        const id = req.query.id as string;
        if (!id) return sendError(res, 400, 'ID es requerido');
        await mediaService.remove(String(id), auth.userId);
        return sendJson(res, { success: true });
      }

      return sendError(res, 405, 'Método no permitido');
    }

    return sendError(res, 400, 'Acción no válida');
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('Media API error:', msg);
    if (msg.includes('ECONNREFUSED') || msg.includes('PrismaClientInitializationError')) {
      return sendError(res, 500, 'Error de conexión con la base de datos');
    }
    return sendError(res, 500, 'Error interno del servidor');
  }
}
