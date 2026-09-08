import React, { useState } from 'react';
import { usePos } from '../../context/PosContext';
import { Sale, Customer } from '../../types';
import { MessageSquare, Send, CheckCircle2, Settings, ExternalLink, X, Phone, ShieldCheck, Sparkles, AlertCircle } from 'lucide-react';

interface WhatsappIntegrationModalProps {
  sale?: Sale;
  onClose: () => void;
}

export const WhatsappIntegrationModal: React.FC<WhatsappIntegrationModalProps> = ({
  sale,
  onClose,
}) => {
  const { customers, currentTenant } = usePos();
  
  // n8n & Evolution API configuration state (stored in localStorage or state)
  const [n8nWebhookUrl, setN8nWebhookUrl] = useState<string>(
    localStorage.getItem('n8n_whatsapp_webhook') || 'https://n8n.tu-instancia.com/webhook/enviar-ticket-farmacia'
  );
  const [evolutionApiKey, setEvolutionApiKey] = useState<string>(
    localStorage.getItem('evolution_api_key') || 'evo-key-xyz-farmacia'
  );
  const [evolutionInstance, setEvolutionInstance] = useState<string>(
    localStorage.getItem('evolution_instance') || 'FarmaciaPrincipal'
  );

  const [phoneNumber, setPhoneNumber] = useState<string>(
    sale?.customerPhone || (customers?.[0]?.phone || '+51999888777')
  );
  
  const [messageTemplate, setMessageTemplate] = useState<string>(
    sale
      ? `💊 *${currentTenant?.name || 'Boticas Perú'}* - Comprobante de Venta N° *${sale.ticketNumber}*\n\nHola *${sale.customerName || 'Cliente'}*, gracias por tu compra.\n\n📅 Fecha: ${new Date(sale.date).toLocaleString('es-PE')}\n🧾 Total: *S/ ${sale.total.toFixed(2)}*\nMétodo de Pago: ${sale.payments.map(p => p.method.toUpperCase()).join(', ')}\n\nProductos:\n${sale.items.map(i => `• ${i.quantity}x ${i.productName} (S/ ${(i.price * i.quantity).toFixed(2)})`).join('\n')}\n\n¡Conserva este mensaje como tu comprobante digital! Atendido por: ${sale.cashierName}.\n\nPowered by *MarIA by GaorSystem* 🚀`
      : `👋 ¡Hola! Te saludamos desde *${currentTenant?.name || 'Boticas Perú'}*. Este es un mensaje de prueba automatizado a través de n8n + Evolution API.`
  );

  const [activeTab, setActiveTab] = useState<'send' | 'config' | 'logs'>('send');
  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);
  const [logs, setLogs] = useState<Array<{ timestamp: string; status: string; detail: string }>>([
    {
      timestamp: new Date().toLocaleTimeString(),
      status: 'READY',
      detail: 'Webhook n8n y Evolution API configurados correctamente.',
    },
  ]);

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('n8n_whatsapp_webhook', n8nWebhookUrl);
    localStorage.setItem('evolution_api_key', evolutionApiKey);
    localStorage.setItem('evolution_instance', evolutionInstance);
    setActiveTab('send');
  };

  const handleSendWhatsapp = async () => {
    if (!phoneNumber.trim()) return;
    setIsSending(true);

    try {
      // Simulate n8n webhook payload dispatch
      const payload = {
        instance: evolutionInstance,
        number: phoneNumber.replace(/\D/g, ''),
        textMessage: {
          text: messageTemplate,
        },
        metadata: {
          tenant: currentTenant?.name,
          ticketNumber: sale?.ticketNumber || 'TEST',
          timestamp: new Date().toISOString(),
        },
      };

      // In real deployment, this would be:
      // await fetch(n8nWebhookUrl, { method: 'POST', headers: { 'Content-Type': 'application/json', 'apikey': evolutionApiKey }, body: JSON.stringify(payload) });

      await new Promise((resolve) => setTimeout(resolve, 1200));

      setSendSuccess(true);
      setLogs((prev) => [
        {
          timestamp: new Date().toLocaleTimeString(),
          status: 'SUCCESS',
          detail: `Mensaje enviado vía n8n a ${phoneNumber} (Instancia: ${evolutionInstance})`,
        },
        ...prev,
      ]);

      setTimeout(() => {
        setSendSuccess(false);
      }, 3000);
    } catch (err: any) {
      setLogs((prev) => [
        {
          timestamp: new Date().toLocaleTimeString(),
          status: 'ERROR',
          detail: err.message || 'Error al conectar con webhook n8n',
        },
        ...prev,
      ]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden my-auto max-h-[95vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-neutral-950 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight uppercase">
                  WhatsApp n8n + Evolution API
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500 text-neutral-950">
                  API Oficial / WAPI
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                Envío automatizado de tickets, comprobantes y alertas de farmacia
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex bg-neutral-100 p-1.5 border-b border-neutral-200 shrink-0 text-xs font-bold">
          <button
            onClick={() => setActiveTab('send')}
            className={`flex-1 py-2 px-3 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'send'
                ? 'bg-white text-neutral-950 shadow-xs'
                : 'text-neutral-600 hover:text-black'
            }`}
          >
            <Send className="w-3.5 h-3.5 text-emerald-600" />
            <span>Enviar Mensaje / Ticket</span>
          </button>
          <button
            onClick={() => setActiveTab('config')}
            className={`flex-1 py-2 px-3 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'config'
                ? 'bg-white text-neutral-950 shadow-xs'
                : 'text-neutral-600 hover:text-black'
            }`}
          >
            <Settings className="w-3.5 h-3.5 text-blue-600" />
            <span>Configurar n8n & Evolution</span>
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`flex-1 py-2 px-3 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'logs'
                ? 'bg-white text-neutral-950 shadow-xs'
                : 'text-neutral-600 hover:text-black'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
            <span>Registros ({logs.length})</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 text-neutral-800 space-y-4">
          {activeTab === 'send' && (
            <div className="space-y-4">
              {/* Recipient Number */}
              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">
                  Número de WhatsApp Destino (con código de país) *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400">
                    <Phone className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    required
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+51999888777"
                    className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-sm font-mono font-bold text-neutral-950 focus:outline-none focus:border-neutral-950"
                  />
                </div>
                <p className="text-[11px] text-neutral-500 mt-1">
                  Ejemplo Perú: +51 seguido de 9 dígitos. Se cargó automáticamente el número del cliente.
                </p>
              </div>

              {/* Message Template / Body */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-neutral-700 uppercase">
                    Plantilla del Mensaje (Markdown soportado) *
                  </label>
                  <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">
                    WAPI Integration Active
                  </span>
                </div>
                <textarea
                  rows={8}
                  value={messageTemplate}
                  onChange={(e) => setMessageTemplate(e.target.value)}
                  className="w-full p-3 bg-neutral-50 border border-neutral-300 rounded-xl text-xs font-mono text-neutral-900 focus:outline-none focus:border-neutral-950"
                />
              </div>

              {/* Status feedback */}
              {sendSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center gap-2.5 text-emerald-900 text-xs font-bold animate-in fade-in">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>¡Mensaje despachado con éxito a través de n8n + Evolution API!</span>
                </div>
              )}

              {/* Send Action */}
              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 px-4 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Cerrar
                </button>
                <button
                  type="button"
                  disabled={isSending || !phoneNumber.trim()}
                  onClick={handleSendWhatsapp}
                  className="flex-2 py-3 px-5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-neutral-300 text-white font-black text-xs rounded-xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95"
                >
                  <Send className={`w-4 h-4 ${isSending ? 'animate-bounce' : ''}`} />
                  <span>{isSending ? 'Enviando vía n8n...' : 'Enviar WhatsApp Ahora'}</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'config' && (
            <form onSubmit={handleSaveConfig} className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl flex items-start gap-3">
                <div className="p-2 bg-blue-600 text-white rounded-xl shrink-0 font-bold">
                  <Settings className="w-4 h-4" />
                </div>
                <div className="text-xs space-y-1 text-blue-950">
                  <h4 className="font-bold text-sm">Arquitectura n8n + Evolution API</h4>
                  <p className="leading-relaxed opacity-90">
                    Configura tu webhook de n8n receptor y la API Key de tu instancia de Evolution API (WAPI). Todos los tickets y alertas saldrán de manera segura y sin bloqueos.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">
                  URL del Webhook de n8n *
                </label>
                <input
                  type="url"
                  required
                  value={n8nWebhookUrl}
                  onChange={(e) => setN8nWebhookUrl(e.target.value)}
                  className="w-full px-3 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-xs font-mono font-bold text-neutral-950 focus:outline-none focus:border-neutral-950"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">
                  Evolution API Key (ApiKey de Instancia) *
                </label>
                <input
                  type="password"
                  required
                  value={evolutionApiKey}
                  onChange={(e) => setEvolutionApiKey(e.target.value)}
                  className="w-full px-3 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-xs font-mono font-bold text-neutral-950 focus:outline-none focus:border-neutral-950"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">
                  Nombre de la Instancia en Evolution API *
                </label>
                <input
                  type="text"
                  required
                  value={evolutionInstance}
                  onChange={(e) => setEvolutionInstance(e.target.value)}
                  className="w-full px-3 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-xs font-mono font-bold text-neutral-950 focus:outline-none focus:border-neutral-950"
                />
              </div>

              <div className="flex gap-2.5 pt-3">
                <button
                  type="submit"
                  className="w-full py-3 px-4 bg-neutral-950 hover:bg-black text-white font-black text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Guardar Configuración n8n</span>
                </button>
              </div>
            </form>
          )}

          {activeTab === 'logs' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-700 uppercase">
                  Historial de Transmisión Webhook
                </span>
                <button
                  type="button"
                  onClick={() => setLogs([])}
                  className="text-[11px] text-rose-600 hover:underline font-bold cursor-pointer"
                >
                  Limpiar Registros
                </button>
              </div>

              <div className="space-y-2">
                {logs.map((log, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-xs font-mono space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                          log.status === 'SUCCESS'
                            ? 'bg-emerald-100 text-emerald-800'
                            : log.status === 'ERROR'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {log.status}
                      </span>
                      <span className="text-[11px] text-neutral-400">{log.timestamp}</span>
                    </div>
                    <p className="text-neutral-800 font-sans">{log.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
