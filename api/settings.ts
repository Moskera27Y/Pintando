import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../src/lib/prisma.js';
import { sendError, sendJson, handleOptions } from './_shared/cors.js';
import { requireAuth } from './auth.js';

type SettingsShape = {
  siteName: string; siteDescription: string; logo: string; favicon: string; footerText: string;
  social: { facebook: string; instagram: string; tiktok: string; twitter: string; youtube: string; linkedin: string; whatsapp: string };
  seo: { metaTitle: string; metaDescription: string; keywords: string; ogImage: string };
  donation: { enabled: boolean; paypalLink: string; receiverEmail: string; buttonText: string; currency: string };
  stripe: { publishableKey: string; donationLink: string; preferredDonationMethod: 'stripe' | 'paypal' | 'both' };
  analytics: { googleAnalyticsId: string; metaPixelId: string };
  currency: string; donationAmounts: number[];
  subscriptionSettings: { minAmount: number; defaultInterval: 'monthly' | 'annual'; allowCustom: boolean };
};

export const DEFAULT_SETTINGS: SettingsShape = {
  siteName: 'Pintando Sueños',
  siteDescription: 'Transformando comunidades a través del arte',
  logo: '/imagen_2026-07-30_174722687.png',
  favicon: '/favicon/favicon.ico',
  footerText: 'Pintando Sueños — Transformando comunidades a través del arte',
  social: { facebook: 'https://www.facebook.com/share/1Bh1t7pxvQ/?mibextid=wwXIfr', instagram: 'https://www.instagram.com/pintandosuenos97', tiktok: 'https://www.tiktok.com/@pintandosuenos1', twitter: '', youtube: '', linkedin: '', whatsapp: '' },
  seo: { metaTitle: 'Pintando Sueños — Arte comunitario', metaDescription: 'Transformando comunidades a través del arte', keywords: 'pintando sueños, arte comunitario, remodelación, voluntariado', ogImage: '' },
  donation: { enabled: true, paypalLink: 'https://paypal.me/Pintando712', receiverEmail: 'paintingdreams@pintandosuenos.com', buttonText: 'Donar ahora', currency: 'USD' },
  stripe: { publishableKey: '', donationLink: 'https://donate.stripe.com/test_3cI9AVgzK6fu3SU5KF1Jm00', preferredDonationMethod: 'both' },
  analytics: { googleAnalyticsId: '', metaPixelId: '' },
  currency: 'USD', donationAmounts: [25, 50, 100],
  subscriptionSettings: { minAmount: 10, defaultInterval: 'monthly', allowCustom: true },
};

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function strOr(raw: unknown, fallback: string): string {
  return typeof raw === 'string' && raw.trim() ? raw : fallback;
}

function mergeSettings(raw: unknown): SettingsShape {
  if (!isObject(raw)) return { ...DEFAULT_SETTINGS };
  const r = raw as Record<string, unknown>;
  const s = isObject(r.social) ? r.social : {};
  const se = isObject(r.seo) ? r.seo : {};
  const d = isObject(r.donation) ? r.donation : {};
  const st = isObject(r.stripe) ? r.stripe : {};
  const a = isObject(r.analytics) ? r.analytics : {};
  const sub = isObject(r.subscriptionSettings) ? r.subscriptionSettings : {};
  return {
    siteName: typeof r.siteName === 'string' ? r.siteName : DEFAULT_SETTINGS.siteName,
    siteDescription: typeof r.siteDescription === 'string' ? r.siteDescription : DEFAULT_SETTINGS.siteDescription,
    logo: strOr(r.logo, DEFAULT_SETTINGS.logo),
    favicon: strOr(r.favicon, DEFAULT_SETTINGS.favicon),
    footerText: typeof r.footerText === 'string' ? r.footerText : DEFAULT_SETTINGS.footerText,
    social: { facebook: strOr(s.facebook, DEFAULT_SETTINGS.social.facebook), instagram: strOr(s.instagram, DEFAULT_SETTINGS.social.instagram), tiktok: strOr(s.tiktok, DEFAULT_SETTINGS.social.tiktok), twitter: typeof s.twitter === 'string' ? s.twitter : DEFAULT_SETTINGS.social.twitter, youtube: typeof s.youtube === 'string' ? s.youtube : DEFAULT_SETTINGS.social.youtube, linkedin: typeof s.linkedin === 'string' ? s.linkedin : DEFAULT_SETTINGS.social.linkedin, whatsapp: typeof s.whatsapp === 'string' ? s.whatsapp : DEFAULT_SETTINGS.social.whatsapp },
    seo: { metaTitle: typeof se.metaTitle === 'string' ? se.metaTitle : DEFAULT_SETTINGS.seo.metaTitle, metaDescription: typeof se.metaDescription === 'string' ? se.metaDescription : DEFAULT_SETTINGS.seo.metaDescription, keywords: typeof se.keywords === 'string' ? se.keywords : DEFAULT_SETTINGS.seo.keywords, ogImage: typeof se.ogImage === 'string' ? se.ogImage : DEFAULT_SETTINGS.seo.ogImage },
    donation: { enabled: typeof d.enabled === 'boolean' ? d.enabled : DEFAULT_SETTINGS.donation.enabled, paypalLink: strOr(d.paypalLink, DEFAULT_SETTINGS.donation.paypalLink), receiverEmail: typeof d.receiverEmail === 'string' ? d.receiverEmail : DEFAULT_SETTINGS.donation.receiverEmail, buttonText: typeof d.buttonText === 'string' ? d.buttonText : DEFAULT_SETTINGS.donation.buttonText, currency: typeof d.currency === 'string' ? d.currency : DEFAULT_SETTINGS.donation.currency },
    stripe: { publishableKey: typeof st.publishableKey === 'string' ? st.publishableKey : DEFAULT_SETTINGS.stripe.publishableKey, donationLink: typeof st.donationLink === 'string' ? st.donationLink : DEFAULT_SETTINGS.stripe.donationLink, preferredDonationMethod: st.preferredDonationMethod === 'stripe' || st.preferredDonationMethod === 'paypal' || st.preferredDonationMethod === 'both' ? st.preferredDonationMethod : DEFAULT_SETTINGS.stripe.preferredDonationMethod },
    analytics: { googleAnalyticsId: typeof a.googleAnalyticsId === 'string' ? a.googleAnalyticsId : DEFAULT_SETTINGS.analytics.googleAnalyticsId, metaPixelId: typeof a.metaPixelId === 'string' ? a.metaPixelId : DEFAULT_SETTINGS.analytics.metaPixelId },
    currency: typeof r.currency === 'string' && r.currency ? r.currency : DEFAULT_SETTINGS.currency,
    donationAmounts: Array.isArray(r.donationAmounts) ? (r.donationAmounts as number[]).filter((n) => typeof n === 'number' && n > 0) : DEFAULT_SETTINGS.donationAmounts,
    subscriptionSettings: { minAmount: typeof sub.minAmount === 'number' ? sub.minAmount : DEFAULT_SETTINGS.subscriptionSettings.minAmount, defaultInterval: sub.defaultInterval === 'annual' ? 'annual' : 'monthly', allowCustom: typeof sub.allowCustom === 'boolean' ? sub.allowCustom : DEFAULT_SETTINGS.subscriptionSettings.allowCustom },
  };
}

function mergePublicSettings(raw: unknown) {
  const full = mergeSettings(raw);
  return {
    siteName: full.siteName, siteDescription: full.siteDescription, logo: full.logo, favicon: full.favicon, footerText: full.footerText,
    social: full.social, seo: full.seo, currency: full.currency, donationAmounts: full.donationAmounts,
    donation: { enabled: full.donation.enabled, paypalLink: full.donation.paypalLink, buttonText: full.donation.buttonText, currency: full.donation.currency },
    stripe: full.stripe,
  };
}

function validateSettings(s: SettingsShape): string | null {
  if (!s.siteName.trim()) return 'El nombre del sitio es obligatorio';
  if (!s.seo.metaTitle.trim()) return 'El meta título SEO es obligatorio';
  if (s.donationAmounts.length === 0) return 'Debe haber al menos un monto de donación';
  if (s.subscriptionSettings.minAmount < 1) return 'El monto mínimo de suscripción debe ser mayor a 0';
  return null;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleOptions(req, res)) return;

  const action = (req.query.action as string) || '';

  try {
    // GET /api/settings?action=public — no auth
    if (action === 'public' && req.method === 'GET') {
      const row = await prisma.settings.findUnique({ where: { key: 'site' } });
      const settings = row ? mergePublicSettings(row.value) : mergePublicSettings(DEFAULT_SETTINGS);
      return sendJson(res, settings);
    }

    // GET /api/settings?action=plans — public, no auth
    if (action === 'plans' && req.method === 'GET') {
      const plans = await prisma.plan.findMany({
        where: { active: true },
        orderBy: { sortOrder: 'asc' },
      });
      return sendJson(res, plans.map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        tagline: p.tagline,
        price: Number(p.price),
        currency: p.currency,
        billingInterval: p.billingInterval,
        stripePriceId: p.stripePriceId,
        benefits: p.benefits,
        icon: p.icon,
        color: p.color,
        sortOrder: p.sortOrder,
      })));
    }

    // GET /api/settings?action=gallery — public, no auth (Community Gallery)
    if (action === 'gallery' && req.method === 'GET') {
      const items = await prisma.gallery.findMany({
        where: { status: 'active' },
        orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }],
      });
      return sendJson(res, items);
    }

    // GET /api/settings?action=media — public, no auth (dynamic site images)
    if (action === 'media' && req.method === 'GET') {
      const { category } = req.query;
      const where: Record<string, unknown> = { status: 'active' };
      if (category) where.category = String(category);
      const items = await prisma.media.findMany({
        where,
        orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }],
      });
      return sendJson(res, items);
    }

    // All other actions require auth
    const auth = requireAuth(req, res);
    if (!auth) return;

    // GET /api/settings — admin get all
    if (req.method === 'GET' && !action) {
      const row = await prisma.settings.findUnique({ where: { key: 'site' } });
      const settings = row ? mergeSettings(row.value) : DEFAULT_SETTINGS;
      return sendJson(res, settings);
    }

    // PUT /api/settings — admin update
    if (req.method === 'PUT' && !action) {
      const merged = mergeSettings(req.body);
      const error = validateSettings(merged);
      if (error) return sendError(res, 400, error);
      await prisma.settings.upsert({ where: { key: 'site' }, create: { key: 'site', value: merged }, update: { value: merged } });
      await prisma.eventLog.create({ data: { type: 'SETTINGS', action: 'UPDATE', resource: 'settings', description: 'Configuración del sitio actualizada', userId: auth.userId, payload: {} } });
      return sendJson(res, merged);
    }

    return sendError(res, 405, 'Método no permitido');
  } catch (error) {
    console.error('Settings API error:', error);
    return sendError(res, 500, 'Error interno del servidor');
  }
}
