import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { sendError, sendJson, handleOptions } from './_shared/cors.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-08-27.basil' as Stripe.LatestApiVersion,
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleOptions(req, res)) return;

  const action = (req.query.action as string) || '';

  try {
    if (action === 'create-checkout-session' && req.method === 'POST') {
      const { priceId } = req.body || {};

      if (!priceId || typeof priceId !== 'string') return sendError(res, 400, 'Price ID es requerido');
      if (!process.env.STRIPE_SECRET_KEY) return sendError(res, 500, 'Stripe no está configurado en el servidor');

      const origin = req.headers.origin || `https://${req.headers.host}`;
      const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: `${origin}/?checkout=success`,
        cancel_url: `${origin}/?checkout=cancelled`,
      });

      return sendJson(res, { checkoutUrl: session.url });
    }

    return sendError(res, 405, 'Método no permitido');
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('Stripe API error:', msg);
    return sendError(res, 500, 'Error al crear la sesión de Stripe');
  }
}
