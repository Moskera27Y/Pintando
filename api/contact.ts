import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../src/lib/prisma.js';
import { sendError, sendJson, handleOptions } from './_shared/cors.js';

// ─────────────────────────────────────────────────────────────────────────────
// /api/contact — Sends email via Resend for the two public forms:
//   1. Family application (type: "family")
//   2. Contact message    (type: "contact")
//
// Environment variables (set in Vercel, NOT in frontend):
//   RESEND_API_KEY  — Resend API key (server-side only)
//   CONTACT_EMAIL   — Destination address, e.g. paintingdreams@pintandosueños.com
// ─────────────────────────────────────────────────────────────────────────────

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_MESSAGE = 5000;
const MAX_NAME = 200;

/** Escape text for safe inclusion inside HTML. */
function escHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Escape for plain-text fallback (strip angle brackets). */
function escText(value: string): string {
  return value.replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

interface FamilyPayload {
  type: 'family';
  applicantName: string;
  applicantEmail: string;
  applicantPhone: string;
  familyName: string;
  address: string;
  city: string;
  state: string;
  spaces: string[];
  story: string;
  photos: { name: string; url: string }[];
}

interface ContactPayload {
  type: 'contact';
  name: string;
  email: string;
  organization?: string;
  interest?: string;
  message: string;
}

type Payload = FamilyPayload | ContactPayload;

function validateFamily(p: Partial<FamilyPayload>): string[] {
  const errs: string[] = [];
  if (!p.applicantName?.trim()) errs.push('Nombre completo es requerido');
  if (p.applicantName && p.applicantName.length > MAX_NAME) errs.push('Nombre demasiado largo');
  if (!p.applicantEmail?.trim()) errs.push('Email es requerido');
  else if (!EMAIL_RE.test(p.applicantEmail)) errs.push('Email inválido');
  if (!p.familyName?.trim()) errs.push('Nombre de la familia es requerido');
  if (p.story && p.story.length > MAX_MESSAGE) errs.push('Historia demasiado larga');
  return errs;
}

function validateContact(p: Partial<ContactPayload>): string[] {
  const errs: string[] = [];
  if (!p.name?.trim()) errs.push('Nombre es requerido');
  if (p.name && p.name.length > MAX_NAME) errs.push('Nombre demasiado largo');
  if (!p.email?.trim()) errs.push('Email es requerido');
  else if (!EMAIL_RE.test(p.email)) errs.push('Email inválido');
  if (!p.message?.trim()) errs.push('Mensaje es requerido');
  if (p.message && p.message.length > MAX_MESSAGE) errs.push('Mensaje demasiado largo');
  return errs;
}

function buildFamilyEmail(p: FamilyPayload): { subject: string; html: string; text: string } {
  const subject = 'Nueva solicitud de ayuda — Pintando Sueños';
  const rows: [string, string][] = [
    ['Nombre completo', p.applicantName],
    ['Nombre de la familia', p.familyName],
    ['Email', p.applicantEmail],
    ['Teléfono', p.applicantPhone || '—'],
    ['Dirección', p.address || '—'],
    ['Ciudad', p.city || '—'],
    ['Estado', p.state || '—'],
    ['Espacios seleccionados', p.spaces.length ? p.spaces.join(', ') : '—'],
  ];

  const rowsHtml = rows
    .map(
      ([label, val]) =>
        `<tr><td style="padding:6px 12px;font-weight:600;color:#374151;white-space:nowrap;">${escHtml(label)}</td><td style="padding:6px 12px;color:#111827;">${escHtml(val)}</td></tr>`,
    )
    .join('');

  const photosHtml = p.photos.length
    ? `<h3 style="margin-top:24px;font-size:15px;color:#374151;">Fotos del hogar</h3><ul style="padding-left:18px;">${p.photos
        .map(
          (ph) =>
            `<li style="margin-bottom:4px;"><a href="${escHtml(ph.url)}" style="color:#2563eb;">${escHtml(ph.name)}</a></li>`,
        )
        .join('')}</ul>`
    : '';

  const storyHtml = p.story
    ? `<h3 style="margin-top:24px;font-size:15px;color:#374151;">Historia / Información adicional</h3><p style="white-space:pre-wrap;color:#111827;">${escHtml(p.story)}</p>`
    : '';

  const html = `
<div style="font-family:Arial,Helvetica,sans-serif;max-width:600px;margin:0 auto;">
  <h2 style="color:#1e3a5f;">Nueva solicitud de ayuda — Pintando Sueños</h2>
  <p style="color:#6b7280;">Se ha recibido una nueva solicitud de ayuda familiar.</p>
  <table style="border-collapse:collapse;margin-top:16px;width:100%;">${rowsHtml}</table>
  ${storyHtml}
  ${photosHtml}
  <hr style="margin-top:24px;border:none;border-top:1px solid #e5e7eb;" />
  <p style="font-size:12px;color:#9ca3af;">Este correo fue enviado desde el formulario de solicitud de ayuda en pintandosueños.com</p>
</div>`.trim();

  const text = [
    `Nueva solicitud de ayuda — Pintando Sueños`,
    ``,
    `Nombre completo: ${escText(p.applicantName)}`,
    `Nombre de la familia: ${escText(p.familyName)}`,
    `Email: ${escText(p.applicantEmail)}`,
    `Teléfono: ${escText(p.applicantPhone || '—')}`,
    `Dirección: ${escText(p.address || '—')}`,
    `Ciudad: ${escText(p.city || '—')}`,
    `Estado: ${escText(p.state || '—')}`,
    `Espacios: ${escText(p.spaces.join(', ') || '—')}`,
    ``,
    `Historia:`,
    escText(p.story),
    ``,
    p.photos.length ? `Fotos:\n${p.photos.map((ph) => `- ${escText(ph.name)}: ${escText(ph.url)}`).join('\n')}` : '',
  ]
    .filter(Boolean)
    .join('\n');

  return { subject, html, text };
}

function buildContactEmail(p: ContactPayload): { subject: string; html: string; text: string } {
  const subject = 'Nuevo mensaje de contacto — Pintando Sueños';
  const rows: [string, string][] = [
    ['Nombre', p.name],
    ['Email', p.email],
    ['Organización', p.organization || '—'],
    ['Tipo de consulta', p.interest || '—'],
  ];

  const rowsHtml = rows
    .map(
      ([label, val]) =>
        `<tr><td style="padding:6px 12px;font-weight:600;color:#374151;white-space:nowrap;">${escHtml(label)}</td><td style="padding:6px 12px;color:#111827;">${escHtml(val)}</td></tr>`,
    )
    .join('');

  const html = `
<div style="font-family:Arial,Helvetica,sans-serif;max-width:600px;margin:0 auto;">
  <h2 style="color:#1e3a5f;">Nuevo mensaje de contacto — Pintando Sueños</h2>
  <p style="color:#6b7280;">Se ha recibido un nuevo mensaje de contacto.</p>
  <table style="border-collapse:collapse;margin-top:16px;width:100%;">${rowsHtml}</table>
  <h3 style="margin-top:24px;font-size:15px;color:#374151;">Mensaje</h3>
  <p style="white-space:pre-wrap;color:#111827;">${escHtml(p.message)}</p>
  <hr style="margin-top:24px;border:none;border-top:1px solid #e5e7eb;" />
  <p style="font-size:12px;color:#9ca3af;">Este correo fue enviado desde el formulario de contacto en pintandosueños.com</p>
</div>`.trim();

  const text = [
    `Nuevo mensaje de contacto — Pintando Sueños`,
    ``,
    `Nombre: ${escText(p.name)}`,
    `Email: ${escText(p.email)}`,
    `Organización: ${escText(p.organization || '—')}`,
    `Tipo de consulta: ${escText(p.interest || '—')}`,
    ``,
    `Mensaje:`,
    escText(p.message),
  ].join('\n');

  return { subject, html, text };
}

/** Send email via Resend REST API. Returns true on success. */
async function sendResendEmail(
  to: string,
  subject: string,
  html: string,
  text: string,
): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error('[contact] RESEND_API_KEY is not set — email not sent');
    return false;
  }

  const resp = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Pintando Sueños <noreply@xn--pintandosueos-skb.com>',
      to,
      subject,
      html,
      text,
    }),
  });

  if (!resp.ok) {
    const body = await resp.text().catch(() => '');
    console.error(`[contact] Resend API error ${resp.status}: ${body}`);
    return false;
  }

  return true;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleOptions(req, res)) return;

  if (req.method !== 'POST') {
    return sendError(res, 405, 'Método no permitido');
  }

  try {
    const body = req.body || {};
    const type = String(body.type || '');

    // ─── Validate ────────────────────────────────────────────────────────
    let errors: string[];
    let emailContent: { subject: string; html: string; text: string };
    let dbData: { name: string; email: string; subject: string; message: string };

    if (type === 'family') {
      const p: Partial<FamilyPayload> = {
        applicantName: String(body.applicantName || '').trim(),
        applicantEmail: String(body.applicantEmail || '').trim(),
        applicantPhone: String(body.applicantPhone || '').trim(),
        familyName: String(body.familyName || '').trim(),
        address: String(body.address || '').trim(),
        city: String(body.city || '').trim(),
        state: String(body.state || '').trim(),
        spaces: Array.isArray(body.spaces) ? body.spaces.map(String) : [],
        story: String(body.story || '').trim(),
        photos: Array.isArray(body.photos) ? body.photos.map((ph: { name?: string; url?: string }) => ({
          name: String(ph.name || ''),
          url: String(ph.url || ''),
        })).filter((ph: { url: string }) => ph.url) : [],
      };

      errors = validateFamily(p);
      if (errors.length) return sendError(res, 400, errors[0]);

      const payload: FamilyPayload = p as FamilyPayload;
      emailContent = buildFamilyEmail(payload);

      const details = [
        `Familia: ${payload.familyName}`,
        `Solicitante: ${payload.applicantName}`,
        `Email: ${payload.applicantEmail}`,
        payload.applicantPhone && `Teléfono: ${payload.applicantPhone}`,
        payload.address && `Dirección: ${payload.address}`,
        payload.city && `Ciudad: ${payload.city}`,
        payload.state && `Estado: ${payload.state}`,
        payload.spaces.length && `Espacios: ${payload.spaces.join(', ')}`,
        payload.photos.length && `Fotos: ${payload.photos.map((ph) => ph.name).join(', ')}`,
        ``,
        payload.story,
      ].filter(Boolean).join('\n');

      dbData = {
        name: payload.applicantName,
        email: payload.applicantEmail,
        subject: `Postulación familiar — ${payload.familyName}`,
        message: details,
      };
    } else if (type === 'contact') {
      const p: Partial<ContactPayload> = {
        name: String(body.name || '').trim(),
        email: String(body.email || '').trim(),
        organization: String(body.organization || '').trim(),
        interest: String(body.interest || ''),
        message: String(body.message || '').trim(),
      };

      errors = validateContact(p);
      if (errors.length) return sendError(res, 400, errors[0]);

      const payload: ContactPayload = p as ContactPayload;
      emailContent = buildContactEmail(payload);
      dbData = {
        name: payload.name,
        email: payload.email,
        subject: payload.organization ? `${payload.organization} — ${payload.interest || 'Consulta'}` : (payload.interest || 'Consulta'),
        message: payload.message,
      };
    } else {
      return sendError(res, 400, 'Tipo de formulario inválido');
    }

    // ─── Save to database (always, so data is never lost) ────────────────
    await prisma.contact.create({
      data: {
        name: dbData.name,
        email: dbData.email,
        subject: dbData.subject,
        message: dbData.message,
        status: 'NEW',
      },
    });

    // ─── Send email via Resend ───────────────────────────────────────────
    const to = process.env.CONTACT_EMAIL || 'paintingdreams@pintandosueños.com';
    const sent = await sendResendEmail(to, emailContent.subject, emailContent.html, emailContent.text);

    if (!sent) {
      // DB save succeeded, but email failed — tell the user it was received
      // (the message IS stored; admin can see it in the dashboard)
      console.warn('[contact] Email not sent, but DB record was saved');
    }

    return sendJson(res, { success: true, emailSent: sent });
  } catch (error) {
    console.error('Contact API error:', error);
    return sendError(res, 500, 'Error interno del servidor');
  }
}
