import express from 'express';
import { createServer as createViteServer } from 'vite';

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

  // Proxy endpoint to dispatch vouchers to external n8n instances without browser CORS issues
  app.post('/api/dispatch-voucher', async (req, res) => {
    try {
      const { webhookUrl, payload } = req.body;

      if (!webhookUrl) {
        return res.status(400).json({ error: 'webhookUrl is required' });
      }

      const externalResponse = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const responseContentType = externalResponse.headers.get('content-type') || '';
      let data: any;

      if (responseContentType.includes('application/json')) {
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
      console.error('Server proxy dispatch error:', error);
      return res.status(502).json({
        ok: false,
        error: error.message || 'Error al comunicarse con el servidor n8n',
      });
    }
  });

  // Vite development middleware
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });

  app.use(vite.middlewares);

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Cajita POS server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
