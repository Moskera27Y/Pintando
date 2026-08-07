import type { VercelRequest, VercelResponse } from '@vercel/node';
import { put, del } from '@vercel/blob';
import { sendError, sendJson, handleOptions } from './_shared/cors.js';
import { requireAuth } from './auth.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleOptions(req, res)) return;

  const auth = requireAuth(req, res);
  if (!auth) return;

  try {
    // POST /api/upload — upload file to Vercel Blob
    if (req.method === 'POST') {
      const contentType = req.headers['content-type'] || '';
      const category = (req.query.category as string) || 'miscellaneous';
      const fileName = (req.query.fileName as string) || `file-${Date.now()}`;

      if (!contentType) return sendError(res, 400, 'Content-Type es requerido');

      const blob = await put(`media/${category}/${Date.now()}-${fileName}`, req.body, {
        access: 'public',
        contentType,
        addRandomSuffix: true,
      });

      return sendJson(res, {
        url: blob.url,
        downloadUrl: blob.downloadUrl,
        pathname: blob.pathname,
        contentType: blob.contentType,
        contentDisposition: blob.contentDisposition,
      });
    }

    // DELETE /api/upload?url=... — delete file from Vercel Blob
    if (req.method === 'DELETE') {
      const url = req.query.url as string;
      if (!url) return sendError(res, 400, 'URL es requerida');
      await del(url);
      return sendJson(res, { success: true });
    }

    return sendError(res, 405, 'Método no permitido');
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('Upload API error:', msg);
    return sendError(res, 500, 'Error al procesar el archivo');
  }
}
