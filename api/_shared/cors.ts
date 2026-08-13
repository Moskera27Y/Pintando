import type { VercelRequest, VercelResponse } from '@vercel/node';

// Suppress DEP0169 (url.parse) warnings emitted by the Node.js HTTP stack
// on Vercel's serverless runtime (Node 18/20). Our code never calls url.parse;
// the warning originates from the platform's own request handling.
process.removeAllListeners('warning');
process.on('warning', (warning) => {
  if (warning.name === 'DeprecationWarning' && warning.message.includes('url.parse')) return;
  console.warn(warning.message);
});

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info',
};

export function sendError(res: VercelResponse, status: number, message: string) {
  return res.status(status).json({ error: message });
}

export function sendJson(res: VercelResponse, data: unknown, status = 200) {
  return res.status(status).json(data);
}

export function handleOptions(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Client-Info');
    return true;
  }
  res.setHeader('Access-Control-Allow-Origin', '*');
  return false;
}
