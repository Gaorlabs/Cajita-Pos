import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Solo permitir método POST
  if (req.method !== 'POST') {
    return res.status(405).json({
      ok: false,
      error: `Method ${req.method} not allowed. Please use POST.`,
    });
  }

  try {
    const { webhookUrl, payload } = req.body || {};

    if (!webhookUrl) {
      return res.status(400).json({
        ok: false,
        error: 'Missing required field: "webhookUrl"',
      });
    }

    if (!payload) {
      return res.status(400).json({
        ok: false,
        error: 'Missing required field: "payload"',
      });
    }

    // Despacho server-to-server a n8n para eliminar 100% las restricciones de CORS
    const externalResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const contentType = externalResponse.headers.get('content-type') || '';
    let data: any;

    if (contentType.includes('application/json')) {
      data = await externalResponse.json();
    } else {
      const text = await externalResponse.text();
      data = { message: text };
    }

    return res.status(externalResponse.status).json({
      httpStatus: externalResponse.status,
      ok: externalResponse.ok,
      data,
    });
  } catch (error: any) {
    console.error('[Vercel Serverless] Error dispatching voucher to n8n:', error);
    return res.status(502).json({
      ok: false,
      error: error?.message || 'Error de conexión con el webhook n8n en el servidor VPS.',
    });
  }
}
