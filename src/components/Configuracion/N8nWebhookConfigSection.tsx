import React, { useState } from 'react';
import { usePos } from '../../context/PosContext';
import {
  Webhook,
  Send,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Copy,
  Check,
  Server,
  Smartphone,
  FileCode2,
  ExternalLink,
  Zap,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import {
  DEFAULT_N8N_WEBHOOK_URL,
  sendSaleVoucherToN8n,
  formatPeruPhoneForEvolution,
} from '../../utils/voucherWebhook';
import { Sale } from '../../types';

export const N8nWebhookConfigSection: React.FC = () => {
  const { storeProfile, updateStoreProfile, darkMode } = usePos();

  const [webhookUrl, setWebhookUrl] = useState<string>(
    storeProfile.n8nWebhookUrl || DEFAULT_N8N_WEBHOOK_URL
  );
  const [webhookActive, setWebhookActive] = useState<boolean>(
    storeProfile.n8nWebhookActive !== undefined ? storeProfile.n8nWebhookActive : true
  );
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Test form state
  const [testPhone, setTestPhone] = useState<string>(() => {
    return localStorage.getItem('cajita_test_webhook_phone') || '987654321';
  });
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    status: string;
    message: string;
    durationMs?: number;
    rawResponse?: any;
  } | null>(null);
  const [copiedPayload, setCopiedPayload] = useState(false);
  const [showJsonSample, setShowJsonSample] = useState(false);

  const handleSaveConfig = () => {
    updateStoreProfile({
      n8nWebhookUrl: webhookUrl.trim(),
      n8nWebhookActive: webhookActive,
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleResetToDefault = () => {
    setWebhookUrl(DEFAULT_N8N_WEBHOOK_URL);
    updateStoreProfile({
      n8nWebhookUrl: DEFAULT_N8N_WEBHOOK_URL,
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleRunLiveTest = async () => {
    if (!testPhone.trim()) return;
    setIsTesting(true);
    setTestResult(null);

    // Save phone for convenience
    localStorage.setItem('cajita_test_webhook_phone', testPhone.trim());

    const startTime = performance.now();

    // Mock realistic test sale for dispatch
    const sampleSale: Sale = {
      id: 'test-sale-' + Date.now(),
      ticketNumber: 'T-PRUEBA-' + Math.floor(1000 + Math.random() * 9000),
      date: new Date().toISOString(),
      cashierId: 'cajero-test',
      cashierName: 'Cajero Demo',
      subtotal: 45.0,
      discountTotal: 5.0,
      total: 40.0,
      payments: [
        {
          method: 'wallet',
          amount: 40.0,
          reference: 'Yape 987***',
        },
      ],
      amountPaid: 40.0,
      changeAmount: 0,
      customerName: 'Cliente Prueba WhatsApp',
      items: [
        {
          productId: 'prod-demo-1',
          productName: 'Producto de Prueba Cajita',
          sku: 'DEMO-001',
          quantity: 2,
          unitPrice: 15.0,
          purchasePrice: 8.0,
          discount: 0,
          subtotal: 30.0,
        },
        {
          productId: 'prod-demo-2',
          productName: 'Bebida Energizante 500ml',
          sku: 'DEMO-002',
          quantity: 1,
          unitPrice: 15.0,
          purchasePrice: 10.0,
          discount: 5.0,
          subtotal: 10.0,
        },
      ],
    };

    try {
      const res = await sendSaleVoucherToN8n(
        webhookUrl,
        sampleSale,
        storeProfile,
        testPhone,
        'Cliente Prueba WhatsApp'
      );
      const durationMs = Math.round(performance.now() - startTime);

      setTestResult({
        success: res.success,
        status: res.status,
        message: res.message,
        durationMs,
        rawResponse: res.rawResponse,
      });
    } catch (err: any) {
      const durationMs = Math.round(performance.now() - startTime);
      setTestResult({
        success: false,
        status: 'error',
        message: err.message || 'Error inesperado al conectar con n8n.',
        durationMs,
      });
    } finally {
      setIsTesting(false);
    }
  };

  const samplePayloadString = JSON.stringify(
    {
      tenant: {
        name: storeProfile.name || 'Mi Negocio',
        ruc: storeProfile.ruc || '20600000000',
        address: storeProfile.address || 'Lima, Perú',
      },
      customer: {
        name: 'Juan Pérez',
        phone: formatPeruPhoneForEvolution(testPhone || '987654321'),
      },
      sale: {
        ticketNumber: 'B001-000452',
        date: new Date().toISOString(),
        cashierName: 'Carlos Mendoza',
        subtotal: 45.0,
        discountTotal: 5.0,
        total: 40.0,
        payments: [{ method: 'yape', amount: 40.0 }],
        items: [
          { productName: 'Producto A', quantity: 2, subtotal: 30.0 },
          { productName: 'Producto B', quantity: 1, subtotal: 10.0 },
        ],
      },
    },
    null,
    2
  );

  const handleCopyPayload = () => {
    navigator.clipboard.writeText(samplePayloadString);
    setCopiedPayload(true);
    setTimeout(() => setCopiedPayload(false), 2000);
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div
        className={`p-5 rounded-2xl border shadow-xs ${
          darkMode ? 'bg-[#182720] border-[#2A3E33]' : 'bg-white border-[#E4DFD3]'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
              <Webhook className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-emerald-600 text-white">
                  Producción VPS
                </span>
                <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> n8n + Gotenberg + Evolution API
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-neutral-900 dark:text-white tracking-tight mt-1">
                Despacho de Vouchers por WhatsApp (Webhook n8n)
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Envía automáticamente el comprobante en PDF al WhatsApp del cliente al cerrar cada venta en POS.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={webhookActive}
                onChange={(e) => setWebhookActive(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded-md focus:ring-emerald-500 cursor-pointer"
              />
              <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                {webhookActive ? 'Integración Activa' : 'Desactivada'}
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Pipeline Diagram (How it works) */}
      <div
        className={`p-4 rounded-2xl border ${
          darkMode ? 'bg-[#151F1A] border-[#24372C]' : 'bg-[#FAF6F0] border-[#E8E2D5]'
        }`}
      >
        <p className="text-[11px] font-black uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-3">
          Flujo de Entrega en tu VPS:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 text-xs">
          <div className="p-3 bg-white dark:bg-[#1C2C23] rounded-xl border border-neutral-200 dark:border-neutral-700/60 shadow-2xs">
            <div className="flex items-center gap-1.5 font-bold text-neutral-900 dark:text-neutral-100 mb-1">
              <Zap className="w-3.5 h-3.5 text-amber-500" /> 1. Cajita POS
            </div>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
              Dispara POST con datos del ticket, cliente y totales.
            </p>
          </div>

          <div className="p-3 bg-white dark:bg-[#1C2C23] rounded-xl border border-neutral-200 dark:border-neutral-700/60 shadow-2xs">
            <div className="flex items-center gap-1.5 font-bold text-neutral-900 dark:text-neutral-100 mb-1">
              <Webhook className="w-3.5 h-3.5 text-emerald-500" /> 2. n8n Webhook
            </div>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
              Recibe JSON y genera el código HTML del ticket 80mm.
            </p>
          </div>

          <div className="p-3 bg-white dark:bg-[#1C2C23] rounded-xl border border-neutral-200 dark:border-neutral-700/60 shadow-2xs">
            <div className="flex items-center gap-1.5 font-bold text-neutral-900 dark:text-neutral-100 mb-1">
              <Server className="w-3.5 h-3.5 text-blue-500" /> 3. Gotenberg
            </div>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
              Convierte el HTML en un archivo PDF nítido.
            </p>
          </div>

          <div className="p-3 bg-white dark:bg-[#1C2C23] rounded-xl border border-neutral-200 dark:border-neutral-700/60 shadow-2xs">
            <div className="flex items-center gap-1.5 font-bold text-neutral-900 dark:text-neutral-100 mb-1">
              <Smartphone className="w-3.5 h-3.5 text-emerald-600" /> 4. Evolution API
            </div>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
              Entrega el PDF por WhatsApp al número (+51...) del cliente.
            </p>
          </div>
        </div>
      </div>

      {/* Webhook Configuration Form */}
      <div
        className={`p-5 rounded-2xl border shadow-xs space-y-4 ${
          darkMode ? 'bg-[#182720] border-[#2A3E33]' : 'bg-white border-[#E4DFD3]'
        }`}
      >
        <div>
          <label className="block text-xs font-black uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1">
            URL del Webhook de Producción (n8n)
          </label>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <input
              type="url"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              placeholder="https://mn8nwebhook.mariasuite.cloud/webhook/sale-receipt-dispatch"
              className="flex-1 px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#111A15] text-xs font-mono font-bold text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button
              type="button"
              onClick={handleSaveConfig}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-colors shrink-0"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Guardar URL</span>
            </button>
            <button
              type="button"
              onClick={handleResetToDefault}
              className="px-3 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-[#203026] text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors shrink-0"
              title="Restaurar la URL de MariaSuite Cloud"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Defecto</span>
            </button>
          </div>
          {saveSuccess && (
            <p className="text-[11px] text-emerald-600 font-bold mt-1.5 flex items-center gap-1 animate-in fade-in">
              <CheckCircle2 className="w-3.5 h-3.5" /> Configuración de webhook guardada correctamente.
            </p>
          )}
        </div>

        {/* Live Test Panel */}
        <div
          className={`p-4 rounded-xl border ${
            darkMode ? 'bg-[#142019] border-[#22352A]' : 'bg-neutral-50 border-neutral-200'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-black uppercase tracking-wider text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-500" /> Probar Envío Real a tu Celular
            </span>
            <button
              type="button"
              onClick={() => setShowJsonSample(!showJsonSample)}
              className="text-[11px] text-emerald-600 hover:underline font-bold flex items-center gap-1 cursor-pointer"
            >
              <FileCode2 className="w-3 h-3" />
              {showJsonSample ? 'Ocultar JSON' : 'Ver JSON enviado'}
            </button>
          </div>

          <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-3">
            Ingresa tu número de WhatsApp para disparar un ticket de prueba (S/ 40.00) hacia tu n8n y verificar la respuesta de Evolution API:
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-[#1A2821] border border-neutral-300 dark:border-neutral-700 rounded-xl text-xs font-bold text-neutral-800 dark:text-neutral-200 shrink-0">
              <span>🇵🇪 +51</span>
            </div>
            <input
              type="tel"
              value={testPhone}
              onChange={(e) => setTestPhone(e.target.value)}
              placeholder="987 654 321"
              className="flex-1 px-3.5 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#1A2821] text-xs font-mono font-bold text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button
              type="button"
              disabled={isTesting || !testPhone.trim()}
              onClick={handleRunLiveTest}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 disabled:opacity-50 text-white text-xs font-black flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all shrink-0"
            >
              {isTesting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Enviando a n8n...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Disparar Voucher de Prueba</span>
                </>
              )}
            </button>
          </div>

          {/* Test Result Feedback */}
          {testResult && (
            <div
              className={`mt-3.5 p-3.5 rounded-xl border animate-in fade-in duration-200 ${
                testResult.success
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-100'
                  : 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-700 text-rose-900 dark:text-rose-100'
              }`}
            >
              <div className="flex items-start gap-2.5">
                {testResult.success ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                )}
                <div className="flex-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-black">
                      {testResult.success
                        ? '¡Voucher procesado y enviado con éxito!'
                        : 'No se pudo completar el envío del voucher'}
                    </span>
                    {testResult.durationMs && (
                      <span className="font-mono text-[10px] opacity-75">
                        Latencia: {testResult.durationMs}ms
                      </span>
                    )}
                  </div>
                  <p className="mt-1 font-medium">{testResult.message}</p>

                  {testResult.rawResponse && (
                    <div className="mt-2 p-2 rounded-lg bg-black/10 dark:bg-black/30 font-mono text-[10px] overflow-x-auto">
                      {JSON.stringify(testResult.rawResponse)}
                    </div>
                  )}

                  {!testResult.success && (
                    <div className="mt-2.5 p-2.5 bg-neutral-900/10 dark:bg-black/40 rounded-lg text-[11px] leading-relaxed">
                      <strong>💡 Diagnóstico rápido:</strong>
                      <ul className="list-disc list-inside mt-1 space-y-1">
                        <li>
                          <strong>Workflow Inactivo:</strong> Si dice <em>"webhook is not registered"</em>, ingresa a tu n8n y activa el interruptor <strong>"Active"</strong> en la esquina superior derecha del flujo.
                        </li>
                        <li>
                          <strong>Webhook de Prueba:</strong> Si vas a pulsar <em>"Test step"</em> o <em>"Listen for test event"</em> en n8n, cambia la URL a: <code className="bg-black/20 px-1 py-0.5 rounded font-mono text-[10px]">https://mn8nwebhook.mariasuite.cloud/webhook-test/sale-receipt-dispatch</code>
                        </li>
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Collapsible JSON Preview */}
          {showJsonSample && (
            <div className="mt-3 pt-3 border-t border-neutral-200 dark:border-neutral-700">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-bold text-neutral-600 dark:text-neutral-300">
                  Payload JSON enviado a tu n8n:
                </span>
                <button
                  type="button"
                  onClick={handleCopyPayload}
                  className="text-[10px] font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 cursor-pointer"
                >
                  {copiedPayload ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {copiedPayload ? '¡Copiado!' : 'Copiar JSON'}
                </button>
              </div>
              <pre className="p-3 rounded-lg bg-neutral-900 text-neutral-100 font-mono text-[11px] overflow-x-auto max-h-48">
                {samplePayloadString}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
