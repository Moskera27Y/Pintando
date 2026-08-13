import { type Media } from '@prisma/client';
import { prisma } from '../../src/lib/prisma.js';
import { deleteBlob } from './blobService.js';

export const VALID_CATEGORIES = [
  'home', 'hero', 'about', 'programs', 'gallery', 'memberships',
  'donations', 'partners', 'events', 'footer', 'logos',
  'backgrounds', 'videos', 'documents', 'promotional-video',
  'homepage-carousel', 'donation-guide', 'donation-guide-hero', 'miscellaneous', 'other',
];

export const VALID_STATUSES = ['active', 'inactive'];

export const ACCEPTED_MIME = [
  'image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'image/gif',
  'video/mp4', 'video/quicktime', 'video/webm',
  'application/pdf',
];

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100 MB

export type ListFilters = {
  category?: string;
  status?: string;
  search?: string;
};

export type CreateMediaInput = {
  title: string;
  description?: string | null;
  blobUrl: string;
  thumbnailUrl?: string | null;
  fileName: string;
  mimeType?: string | null;
  fileSize?: number | null;
  width?: number | null;
  height?: number | null;
  duration?: number | null;
  category?: string;
  status?: string;
  displayOrder?: number;
  tags?: string[];
  featured?: boolean;
  uploadedBy: string;
};

export type UpdateMediaInput = Partial<Omit<CreateMediaInput, 'uploadedBy'>>;

export function validateCategory(category: string | undefined): string {
  if (!category) return 'other';
  if (!VALID_CATEGORIES.includes(category)) {
    throw new ValidationError(`Categoría inválida: ${category}`);
  }
  return category;
}

export function validateStatus(status: string | undefined): string {
  if (!status) return 'active';
  if (!VALID_STATUSES.includes(status)) {
    throw new ValidationError(`Estado inválido: ${status}`);
  }
  return status;
}

export function validateMimeType(mimeType: string | undefined | null): void {
  if (!mimeType) return;
  if (!ACCEPTED_MIME.includes(mimeType)) {
    throw new ValidationError(`Tipo de archivo no soportado: ${mimeType}`);
  }
}

export function validateFileSize(fileSize: number | undefined | null): void {
  if (fileSize == null) return;
  if (fileSize > MAX_FILE_SIZE) {
    throw new ValidationError(`Archivo demasiado grande (máximo ${MAX_FILE_SIZE / (1024 * 1024)} MB)`);
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export const mediaService = {
  async list(filters: ListFilters = {}): Promise<Media[]> {
    const where: Record<string, unknown> = {};
    if (filters.category && filters.category !== 'all') where.category = filters.category;
    if (filters.status && filters.status !== 'all') where.status = filters.status;
    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
        { tags: { has: filters.search } },
      ];
    }
    return prisma.media.findMany({
      where,
      orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }],
    });
  },

  async listPublic(category?: string): Promise<Media[]> {
    const where: Record<string, unknown> = { status: 'active' };
    if (category && category !== 'all') where.category = category;
    return prisma.media.findMany({
      where,
      orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }],
    });
  },

  async getById(id: string): Promise<Media | null> {
    return prisma.media.findUnique({ where: { id } });
  },

  async create(input: CreateMediaInput): Promise<Media> {
    if (!input.title || !input.blobUrl || !input.fileName) {
      throw new ValidationError('Título, blobUrl y fileName son requeridos');
    }
    validateMimeType(input.mimeType);
    validateFileSize(input.fileSize);

    const media = await prisma.media.create({
      data: {
        title: input.title,
        description: input.description ?? null,
        blobUrl: input.blobUrl,
        thumbnailUrl: input.thumbnailUrl ?? null,
        fileName: input.fileName,
        mimeType: input.mimeType ?? null,
        fileSize: input.fileSize ?? null,
        width: input.width ?? null,
        height: input.height ?? null,
        duration: input.duration ?? null,
        category: validateCategory(input.category),
        status: validateStatus(input.status),
        displayOrder: input.displayOrder ?? 0,
        tags: Array.isArray(input.tags) ? input.tags.map(String) : [],
        featured: Boolean(input.featured),
        uploadedBy: input.uploadedBy,
      },
    });

    await prisma.eventLog.create({
      data: {
        type: 'MEDIA', action: 'CREATE', resource: 'media',
        description: `Media subido: ${input.title}`, userId: input.uploadedBy,
        payload: { mediaId: media.id },
      },
    }).catch(() => {});

    return media;
  },

  async update(id: string, input: UpdateMediaInput): Promise<Media> {
    if (input.mimeType !== undefined) validateMimeType(input.mimeType);
    if (input.fileSize !== undefined) validateFileSize(input.fileSize);

    if (input.blobUrl !== undefined) {
      const existing = await prisma.media.findUnique({ where: { id } });
      if (existing && existing.blobUrl && existing.blobUrl !== input.blobUrl) {
        await deleteBlob(existing.blobUrl).catch(() => {});
      }
    }

    const data: Record<string, unknown> = {};
    if (input.title !== undefined) data.title = String(input.title);
    if (input.description !== undefined) data.description = input.description ? String(input.description) : null;
    if (input.blobUrl !== undefined) data.blobUrl = String(input.blobUrl);
    if (input.thumbnailUrl !== undefined) data.thumbnailUrl = input.thumbnailUrl ? String(input.thumbnailUrl) : null;
    if (input.fileName !== undefined) data.fileName = String(input.fileName);
    if (input.mimeType !== undefined) data.mimeType = input.mimeType ? String(input.mimeType) : null;
    if (input.fileSize !== undefined) data.fileSize = input.fileSize ? Number(input.fileSize) : null;
    if (input.width !== undefined) data.width = input.width ? Number(input.width) : null;
    if (input.height !== undefined) data.height = input.height ? Number(input.height) : null;
    if (input.duration !== undefined) data.duration = input.duration ? Number(input.duration) : null;
    if (input.category !== undefined) data.category = validateCategory(String(input.category));
    if (input.status !== undefined) data.status = validateStatus(String(input.status));
    if (input.displayOrder !== undefined) data.displayOrder = Number(input.displayOrder);
    if (input.tags !== undefined) data.tags = Array.isArray(input.tags) ? input.tags.map(String) : [];
    if (input.featured !== undefined) data.featured = Boolean(input.featured);

    const media = await prisma.media.update({ where: { id }, data });

    await prisma.eventLog.create({
      data: {
        type: 'MEDIA', action: 'UPDATE', resource: 'media',
        description: `Media actualizado: ${media.title}`,
        payload: { id },
      },
    }).catch(() => {});

    return media;
  },

  async remove(id: string, userId?: string): Promise<void> {
    const existing = await prisma.media.findUnique({ where: { id } });
    if (existing && existing.blobUrl) {
      await deleteBlob(existing.blobUrl).catch(() => {});
    }
    await prisma.media.delete({ where: { id } });

    await prisma.eventLog.create({
      data: {
        type: 'MEDIA', action: 'DELETE', resource: 'media',
        description: 'Media eliminado', userId: userId ?? null,
        payload: { id },
      },
    }).catch(() => {});
  },
};
