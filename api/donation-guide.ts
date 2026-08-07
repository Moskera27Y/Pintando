import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Prisma } from '@prisma/client';
import { prisma } from '../src/lib/prisma.js';
import { sendError, sendJson, handleOptions } from './_shared/cors.js';
import { requireAuth } from './_shared/auth.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleOptions(req, res)) return;

  const action = (req.query.action as string) || '';

  try {
    // ─── Public: GET categories + hero ────────────────────────────────────
    if (action === 'public' && req.method === 'GET') {
      const [categories, hero] = await Promise.all([
        prisma.donationGuideCategory.findMany({
          where: { status: 'active' },
          orderBy: { sortOrder: 'asc' },
        }),
        prisma.donationGuideHero.findFirst(),
      ]);
      return sendJson(res, { categories, hero });
    }

    // ─── All other actions require admin auth ─────────────────────────────
    const auth = requireAuth(req, res);
    if (!auth) return;

    // ─── Categories CRUD ──────────────────────────────────────────────────
    if (action === 'categories') {
      if (req.method === 'GET') {
        const categories = await prisma.donationGuideCategory.findMany({
          orderBy: { sortOrder: 'asc' },
        });
        return sendJson(res, categories);
      }

      if (req.method === 'POST') {
        const { title, description, icon, color, imageUrl, items, sortOrder, status, contactEmail, emailSubject } = req.body || {};
        if (!title) return sendError(res, 400, 'Título es requerido');
        const category = await prisma.donationGuideCategory.create({
          data: {
            title: String(title),
            description: description ? String(description) : null,
            icon: icon ? String(icon) : 'Heart',
            color: color ? String(color) : 'blue',
            imageUrl: imageUrl ? String(imageUrl) : null,
            items: (items as Prisma.InputJsonValue) || [],
            sortOrder: sortOrder ? Number(sortOrder) : 0,
            status: status ? String(status) : 'active',
            contactEmail: contactEmail ? String(contactEmail) : 'donations@pintandosuenos.org',
            emailSubject: emailSubject ? String(emailSubject) : 'Donation Inquiry',
          },
        });
        await prisma.eventLog.create({
          data: {
            type: 'CONTENT',
            action: 'CREATE',
            resource: 'donation_guide_categories',
            description: `Categoría de guía creada: ${title}`,
            userId: auth.userId,
            payload: { id: category.id },
          },
        });
        return sendJson(res, category, 201);
      }

      if (req.method === 'PUT') {
        const { id, title, description, icon, color, imageUrl, items, sortOrder, status, contactEmail, emailSubject } = req.body || {};
        if (!id) return sendError(res, 400, 'ID es requerido');
        const category = await prisma.donationGuideCategory.update({
          where: { id: String(id) },
          data: {
            ...(title !== undefined && { title: String(title) }),
            ...(description !== undefined && { description: description ? String(description) : null }),
            ...(icon !== undefined && { icon: String(icon) }),
            ...(color !== undefined && { color: String(color) }),
            ...(imageUrl !== undefined && { imageUrl: imageUrl ? String(imageUrl) : null }),
            ...(items !== undefined && { items: items as Prisma.InputJsonValue }),
            ...(sortOrder !== undefined && { sortOrder: Number(sortOrder) }),
            ...(status !== undefined && { status: String(status) }),
            ...(contactEmail !== undefined && { contactEmail: String(contactEmail) }),
            ...(emailSubject !== undefined && { emailSubject: String(emailSubject) }),
          },
        });
        await prisma.eventLog.create({
          data: {
            type: 'CONTENT',
            action: 'UPDATE',
            resource: 'donation_guide_categories',
            description: 'Categoría de guía actualizada',
            userId: auth.userId,
            payload: { id },
          },
        });
        return sendJson(res, category);
      }

      if (req.method === 'DELETE') {
        const { id } = req.query;
        if (!id) return sendError(res, 400, 'ID es requerido');
        await prisma.donationGuideCategory.delete({ where: { id: String(id) } });
        await prisma.eventLog.create({
          data: {
            type: 'CONTENT',
            action: 'DELETE',
            resource: 'donation_guide_categories',
            description: 'Categoría de guía eliminada',
            userId: auth.userId,
            payload: { id: String(id) },
          },
        });
        return sendJson(res, { success: true });
      }

      return sendError(res, 405, 'Método no permitido');
    }

    // ─── Hero (single row) ────────────────────────────────────────────────
    if (action === 'hero') {
      if (req.method === 'GET') {
        const hero = await prisma.donationGuideHero.findFirst();
        return sendJson(res, hero);
      }

      if (req.method === 'PUT') {
        const { title, subtitle, imageUrl, buttonText, buttonHref, pdfUrl, introduction } = req.body || {};
        const existing = await prisma.donationGuideHero.findFirst();

        if (existing) {
          const updated = await prisma.donationGuideHero.update({
            where: { id: existing.id },
            data: {
              ...(title !== undefined && { title: String(title) }),
              ...(subtitle !== undefined && { subtitle: subtitle ? String(subtitle) : null }),
              ...(imageUrl !== undefined && { imageUrl: imageUrl ? String(imageUrl) : null }),
              ...(buttonText !== undefined && { buttonText: String(buttonText) }),
              ...(buttonHref !== undefined && { buttonHref: String(buttonHref) }),
              ...(pdfUrl !== undefined && { pdfUrl: pdfUrl ? String(pdfUrl) : null }),
              ...(introduction !== undefined && { introduction: introduction ? String(introduction) : null }),
            },
          });
          await prisma.eventLog.create({
            data: {
              type: 'CONTENT',
              action: 'UPDATE',
              resource: 'donation_guide_hero',
              description: 'Hero de guía actualizado',
              userId: auth.userId,
              payload: { id: existing.id },
            },
          });
          return sendJson(res, updated);
        }

        const created = await prisma.donationGuideHero.create({
          data: {
            title: title ? String(title) : 'Donation Guide',
            subtitle: subtitle ? String(subtitle) : null,
            imageUrl: imageUrl ? String(imageUrl) : null,
            buttonText: buttonText ? String(buttonText) : 'Donate Now',
            buttonHref: buttonHref ? String(buttonHref) : '#donacion',
            pdfUrl: pdfUrl ? String(pdfUrl) : null,
            introduction: introduction ? String(introduction) : null,
          },
        });
        await prisma.eventLog.create({
          data: {
            type: 'CONTENT',
            action: 'CREATE',
            resource: 'donation_guide_hero',
            description: 'Hero de guía creado',
            userId: auth.userId,
            payload: { id: created.id },
          },
        });
        return sendJson(res, created);
      }

      return sendError(res, 405, 'Método no permitido');
    }

    // ─── Sponsorship: public GET ─────────────────────────────────────────
    if (action === 'sponsorship-public' && req.method === 'GET') {
      const [levels, benefits, benefitLevels, section] = await Promise.all([
        prisma.donationSponsorshipLevel.findMany({
          where: { status: 'active' },
          orderBy: { displayOrder: 'asc' },
        }),
        prisma.donationSponsorshipBenefit.findMany({
          orderBy: { displayOrder: 'asc' },
        }),
        prisma.donationSponsorshipBenefitLevel.findMany(),
        prisma.donationSponsorshipSection.findFirst(),
      ]);
      return sendJson(res, { levels, benefits, benefitLevels, section });
    }

    // ─── Sponsorship Levels CRUD ─────────────────────────────────────────
    if (action === 'sponsorship-levels') {
      if (req.method === 'GET') {
        const levels = await prisma.donationSponsorshipLevel.findMany({
          orderBy: { displayOrder: 'asc' },
          include: { benefitLevels: true },
        });
        return sendJson(res, levels);
      }

      if (req.method === 'POST') {
        const { nameEn, nameEs, descriptionEn, descriptionEs, minAmount, maxAmount, buttonTextEn, buttonTextEs, buttonAction, icon, color, featured, status, displayOrder } = req.body || {};
        if (!nameEn || !nameEs) return sendError(res, 400, 'Name (EN & ES) is required');
        const level = await prisma.donationSponsorshipLevel.create({
          data: {
            nameEn: String(nameEn),
            nameEs: String(nameEs),
            descriptionEn: descriptionEn ? String(descriptionEn) : null,
            descriptionEs: descriptionEs ? String(descriptionEs) : null,
            minAmount: minAmount ? Number(minAmount) : 0,
            maxAmount: maxAmount ? Number(maxAmount) : null,
            buttonTextEn: buttonTextEn ? String(buttonTextEn) : 'Donate',
            buttonTextEs: buttonTextEs ? String(buttonTextEs) : 'Donar',
            buttonAction: buttonAction ? String(buttonAction) : 'both',
            icon: icon ? String(icon) : 'Award',
            color: color ? String(color) : 'blue',
            featured: featured ?? false,
            status: status ? String(status) : 'active',
            displayOrder: displayOrder ? Number(displayOrder) : 0,
          },
        });
        await prisma.eventLog.create({
          data: {
            type: 'CONTENT',
            action: 'CREATE',
            resource: 'donation_sponsorship_levels',
            description: `Sponsorship level created: ${nameEn}`,
            userId: auth.userId,
            payload: { id: level.id },
          },
        });
        return sendJson(res, level, 201);
      }

      if (req.method === 'PUT') {
        const { id, nameEn, nameEs, descriptionEn, descriptionEs, minAmount, maxAmount, buttonTextEn, buttonTextEs, buttonAction, icon, color, featured, status, displayOrder } = req.body || {};
        if (!id) return sendError(res, 400, 'ID is required');
        const level = await prisma.donationSponsorshipLevel.update({
          where: { id: String(id) },
          data: {
            ...(nameEn !== undefined && { nameEn: String(nameEn) }),
            ...(nameEs !== undefined && { nameEs: String(nameEs) }),
            ...(descriptionEn !== undefined && { descriptionEn: descriptionEn ? String(descriptionEn) : null }),
            ...(descriptionEs !== undefined && { descriptionEs: descriptionEs ? String(descriptionEs) : null }),
            ...(minAmount !== undefined && { minAmount: Number(minAmount) }),
            ...(maxAmount !== undefined && { maxAmount: maxAmount ? Number(maxAmount) : null }),
            ...(buttonTextEn !== undefined && { buttonTextEn: String(buttonTextEn) }),
            ...(buttonTextEs !== undefined && { buttonTextEs: String(buttonTextEs) }),
            ...(buttonAction !== undefined && { buttonAction: String(buttonAction) }),
            ...(icon !== undefined && { icon: String(icon) }),
            ...(color !== undefined && { color: String(color) }),
            ...(featured !== undefined && { featured: Boolean(featured) }),
            ...(status !== undefined && { status: String(status) }),
            ...(displayOrder !== undefined && { displayOrder: Number(displayOrder) }),
          },
        });
        await prisma.eventLog.create({
          data: {
            type: 'CONTENT',
            action: 'UPDATE',
            resource: 'donation_sponsorship_levels',
            description: 'Sponsorship level updated',
            userId: auth.userId,
            payload: { id },
          },
        });
        return sendJson(res, level);
      }

      if (req.method === 'PATCH') {
        const { id, featured, status, displayOrder } = req.body || {};
        if (!id) return sendError(res, 400, 'ID is required');
        const level = await prisma.donationSponsorshipLevel.update({
          where: { id: String(id) },
          data: {
            ...(featured !== undefined && { featured: Boolean(featured) }),
            ...(status !== undefined && { status: String(status) }),
            ...(displayOrder !== undefined && { displayOrder: Number(displayOrder) }),
          },
        });
        return sendJson(res, level);
      }

      if (req.method === 'DELETE') {
        const { id } = req.query;
        if (!id) return sendError(res, 400, 'ID is required');
        await prisma.donationSponsorshipLevel.delete({ where: { id: String(id) } });
        await prisma.eventLog.create({
          data: {
            type: 'CONTENT',
            action: 'DELETE',
            resource: 'donation_sponsorship_levels',
            description: 'Sponsorship level deleted',
            userId: auth.userId,
            payload: { id: String(id) },
          },
        });
        return sendJson(res, { success: true });
      }

      return sendError(res, 405, 'Method not allowed');
    }

    // ─── Sponsorship Benefits CRUD ──────────────────────────────────────
    if (action === 'sponsorship-benefits') {
      if (req.method === 'GET') {
        const benefits = await prisma.donationSponsorshipBenefit.findMany({
          orderBy: { displayOrder: 'asc' },
          include: { benefitLevels: true },
        });
        return sendJson(res, benefits);
      }

      if (req.method === 'POST') {
        const { textEn, textEs, displayOrder } = req.body || {};
        if (!textEn || !textEs) return sendError(res, 400, 'Text (EN & ES) is required');
        const benefit = await prisma.donationSponsorshipBenefit.create({
          data: {
            textEn: String(textEn),
            textEs: String(textEs),
            displayOrder: displayOrder ? Number(displayOrder) : 0,
          },
        });
        await prisma.eventLog.create({
          data: {
            type: 'CONTENT',
            action: 'CREATE',
            resource: 'donation_sponsorship_benefits',
            description: `Benefit created: ${textEn}`,
            userId: auth.userId,
            payload: { id: benefit.id },
          },
        });
        return sendJson(res, benefit, 201);
      }

      if (req.method === 'PUT') {
        const { id, textEn, textEs, displayOrder } = req.body || {};
        if (!id) return sendError(res, 400, 'ID is required');
        const benefit = await prisma.donationSponsorshipBenefit.update({
          where: { id: String(id) },
          data: {
            ...(textEn !== undefined && { textEn: String(textEn) }),
            ...(textEs !== undefined && { textEs: String(textEs) }),
            ...(displayOrder !== undefined && { displayOrder: Number(displayOrder) }),
          },
        });
        await prisma.eventLog.create({
          data: {
            type: 'CONTENT',
            action: 'UPDATE',
            resource: 'donation_sponsorship_benefits',
            description: 'Benefit updated',
            userId: auth.userId,
            payload: { id },
          },
        });
        return sendJson(res, benefit);
      }

      if (req.method === 'DELETE') {
        const { id } = req.query;
        if (!id) return sendError(res, 400, 'ID is required');
        await prisma.donationSponsorshipBenefit.delete({ where: { id: String(id) } });
        await prisma.eventLog.create({
          data: {
            type: 'CONTENT',
            action: 'DELETE',
            resource: 'donation_sponsorship_benefits',
            description: 'Benefit deleted',
            userId: auth.userId,
            payload: { id: String(id) },
          },
        });
        return sendJson(res, { success: true });
      }

      return sendError(res, 405, 'Method not allowed');
    }

    // ─── Sponsorship Benefit-Level junction ─────────────────────────────
    if (action === 'sponsorship-matrix') {
      if (req.method === 'GET') {
        const matrix = await prisma.donationSponsorshipBenefitLevel.findMany();
        return sendJson(res, matrix);
      }

      if (req.method === 'PUT') {
        // Upsert a single cell: { benefitId, levelId, included }
        const { benefitId, levelId, included } = req.body || {};
        if (!benefitId || !levelId) return sendError(res, 400, 'benefitId and levelId are required');
        const cell = await prisma.donationSponsorshipBenefitLevel.upsert({
          where: { benefitId_levelId: { benefitId: String(benefitId), levelId: String(levelId) } },
          update: { included: Boolean(included) },
          create: {
            benefitId: String(benefitId),
            levelId: String(levelId),
            included: Boolean(included),
          },
        });
        return sendJson(res, cell);
      }

      if (req.method === 'POST') {
        // Bulk replace entire matrix: [{ benefitId, levelId, included }, ...]
        const rows = req.body as Array<{ benefitId: string; levelId: string; included: boolean }>;
        if (!Array.isArray(rows)) return sendError(res, 400, 'Expected array of matrix rows');
        await prisma.$transaction(
          rows.map((row) =>
            prisma.donationSponsorshipBenefitLevel.upsert({
              where: { benefitId_levelId: { benefitId: row.benefitId, levelId: row.levelId } },
              update: { included: row.included },
              create: { benefitId: row.benefitId, levelId: row.levelId, included: row.included },
            })
          )
        );
        return sendJson(res, { success: true });
      }

      return sendError(res, 405, 'Method not allowed');
    }

    // ─── Sponsorship Section header ─────────────────────────────────────
    if (action === 'sponsorship-section') {
      if (req.method === 'GET') {
        const section = await prisma.donationSponsorshipSection.findFirst();
        return sendJson(res, section);
      }

      if (req.method === 'PUT') {
        const { titleEn, titleEs, subtitleEn, subtitleEs, descriptionEn, descriptionEs } = req.body || {};
        const existing = await prisma.donationSponsorshipSection.findFirst();
        if (existing) {
          const updated = await prisma.donationSponsorshipSection.update({
            where: { id: existing.id },
            data: {
              ...(titleEn !== undefined && { titleEn: String(titleEn) }),
              ...(titleEs !== undefined && { titleEs: String(titleEs) }),
              ...(subtitleEn !== undefined && { subtitleEn: String(subtitleEn) }),
              ...(subtitleEs !== undefined && { subtitleEs: String(subtitleEs) }),
              ...(descriptionEn !== undefined && { descriptionEn: descriptionEn ? String(descriptionEn) : null }),
              ...(descriptionEs !== undefined && { descriptionEs: descriptionEs ? String(descriptionEs) : null }),
            },
          });
          await prisma.eventLog.create({
            data: {
              type: 'CONTENT',
              action: 'UPDATE',
              resource: 'donation_sponsorship_section',
              description: 'Sponsorship section updated',
              userId: auth.userId,
              payload: { id: existing.id },
            },
          });
          return sendJson(res, updated);
        }
        const created = await prisma.donationSponsorshipSection.create({
          data: {
            titleEn: titleEn ? String(titleEn) : 'Become a Community Sponsor',
            titleEs: titleEs ? String(titleEs) : 'Niveles de Patrocinio',
            subtitleEn: subtitleEn ? String(subtitleEn) : 'Join us in transforming homes and changing lives.',
            subtitleEs: subtitleEs ? String(subtitleEs) : 'Únase a nosotros como socio comunitario y transforme vidas.',
            descriptionEn: descriptionEn ? String(descriptionEn) : null,
            descriptionEs: descriptionEs ? String(descriptionEs) : null,
          },
        });
        return sendJson(res, created);
      }

      return sendError(res, 405, 'Method not allowed');
    }

    return sendError(res, 400, 'Acción no válida');
  } catch (error) {
    console.error('Donation Guide API error:', error);
    return sendError(res, 500, 'Error interno del servidor');
  }
}
