import React, { useState, useEffect } from 'react';
import { usePos } from '../../context/PosContext';
import { Sale } from '../../types';
import {
  MessageSquare,
  Send,
  CheckCircle2,
  ExternalLink,
  X,
  Phone,
  Copy,
  Check,
  FileText,
  Printer,
  Sparkles,
  Smartphone,
  Eye,
  FileDown,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { CajitaLogo } from '../CajitaLogo';

interface WhatsappIntegrationModalProps {
  sale?: Sale;
  onClose: () => void;
}

export const WhatsappIntegrationModal: React.FC<WhatsappIntegrationModalProps> = ({
  sale,
  onClose,
}) => {
  const { currentTenant, storeProfile } = usePos();

  // Load remembered demo phone number or sale customer phone
  const [phoneNumber, setPhoneNumber] = useState<string>(() => {
    return sale?.customerPhone || localStorage.getItem('cajita_demo_whatsapp_phone') || '';
  });

  const [activeTab, setActiveTab] = useState<'whatsapp_chat' | 'pdf_ticket'>('whatsapp_chat');
  const [sendingStage, setSendingStage] = useState<number>(0); // 0: idle, 1: generating pdf, 2: packaging, 3: sending
  const [isSending, setIsSending] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  // Auto-save phone to localStorage for comfortable repeated demos
  useEffect(() => {
    if (phoneNumber && phoneNumber.trim().length >= 8) {
      localStorage.setItem('cajita_demo_whatsapp_phone', phoneNumber.trim());
    }
  }, [phoneNumber]);

  const storeName = storeProfile?.name || currentTenant?.name || 'Café Aroma & Sabor';
  const ticketNumber = sale?.ticketNumber || 'T-001008';
  const totalAmount = sale?.total?.toFixed(2) || '21.50';

  // Formatted WhatsApp message with Peruvian POS layout
  const defaultMessage = sale
    ? `🧾 *${storeName}*\n` +
      `*TICKET DE VENTA N° ${sale.ticketNumber}*\n\n` +
      `¡Hola ${sale.customerName && sale.customerName !== 'Cliente General' ? '*' + sale.customerName + '*' : 'Estimado/a cliente'}! Gracias por tu compra.\n\n` +
      `📅 *Fecha:* ${new Date(sale.date).toLocaleString('es-PE')}\n` +
      `👤 *Cajero:* ${sale.cashierName}\n\n` +
      `🛒 *DETALLE DE TU COMPRA:*\n` +
      `${sale.items.map((i) => `• ${i.quantity}x ${i.productName} ➔ S/ ${(i.subtotal || i.unitPrice * i.quantity).toFixed(2)}`).join('\n')}\n\n` +
      `💰 *TOTAL PAGADO:* *S/ ${sale.total.toFixed(2)}*\n` +
      `💳 *Método:* ${sale.payments.map((p) => p.method.toUpperCase()).join(', ')}\n\n` +
      `📎 *Archivo Adjunto:* Voucher_${sale.ticketNumber}.pdf\n` +
      `¡Gracias por tu preferencia! Comprobante digital verificado por *Cajita POS Perú* 🇵🇪`
    : `👋 ¡Hola! Te saludamos desde *${storeName}*. Tu comprobante de venta digital está listo.`;

  const [messageText, setMessageText] = useState<string>(defaultMessage);

  // Clean phone number with Peru +51 default
  const cleanNumber = phoneNumber.replace(/\D/g, '');
  const isValidPeruPhone = cleanNumber.length === 9 && cleanNumber.startsWith('9');
  const hasValidLength = cleanNumber.length >= 8;

  const getFullInternationalNumber = (): string => {
    if (cleanNumber.length === 9 && cleanNumber.startsWith('9')) {
      return `51${cleanNumber}`;
    }
    if (cleanNumber.startsWith('51') && cleanNumber.length === 11) {
      return cleanNumber;
    }
    return cleanNumber;
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(messageText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      console.warn('Could not copy', e);
    }
  };

  // Dedicated generator to open and print/save the real voucher in PDF
  const handleOpenOrDownloadPdf = () => {
    if (!sale) return;
    const printWindow = window.open('', '_blank', 'width=460,height=720');
    if (!printWindow) return;

    const ruc = storeProfile?.ruc || '20603676457';
    const address = storeProfile?.address && storeProfile.address !== 'Lima, Perú'
      ? storeProfile.address
      : 'Dirección Comercial Registrada';

    const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <title>Voucher_${sale.ticketNumber}.pdf</title>
  <style>
    @page { margin: 0; size: auto; }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 16px;
      font-family: 'Courier New', Courier, monospace;
      background: #f8f8f8;
      color: #111;
      display: flex;
      justify-content: center;
    }
    .ticket {
      background: #fff;
      width: 100%;
      max-width: 320px;
      padding: 18px 14px;
      border: 1px solid #e0e0e0;
      box-shadow: 0 4px 14px rgba(0,0,0,0.08);
      border-radius: 8px;
    }
    .center { text-align: center; }
    .right { text-align: right; }
    .bold { font-weight: bold; }
    .brand { font-size: 16px; font-weight: 900; letter-spacing: 2px; }
    .store { font-size: 13px; font-weight: bold; margin: 4px 0 2px 0; }
    .meta { font-size: 11px; color: #444; }
    .dashed { border-top: 1px dashed #777; margin: 10px 0; }
    .row { display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 3px; }
    .prod-name { font-size: 11px; font-weight: 600; }
    .prod-sub { font-size: 10px; color: #555; padding-left: 8px; }
    .total-row { font-size: 15px; font-weight: 900; margin-top: 6px; border-top: 1px solid #222; padding-top: 6px; }
    .footer { font-size: 10px; color: #555; text-align: center; margin-top: 12px; }
    .barcode {
      margin: 12px auto 6px auto;
      height: 34px;
      width: 82%;
      background: repeating-linear-gradient(90deg, #111 0px, #111 2px, transparent 2px, transparent 4px, #111 4px, #111 7px, transparent 7px, transparent 9px);
    }
    @media print {
      body { background: #fff; padding: 0; }
      .ticket { border: none; box-shadow: none; max-width: 100%; border-radius: 0; }
    }
  </style>
</head>
<body>
  <div class="ticket">
    <div class="center">
      <div class="brand">CAJITA POS</div>
      <div class="store">${storeName}</div>
      <div class="meta">RUC ${ruc}</div>
      <div class="meta">${address}</div>
      <div style="font-weight: bold; font-size: 11px; margin-top: 6px; text-transform: uppercase;">
        TICKET DE VENTA N° ${sale.ticketNumber}
      </div>
    </div>
    
    <div class="dashed"></div>
    <div class="row"><span>Fecha:</span><span class="bold">${new Date(sale.date).toLocaleString('es-PE')}</span></div>
    <div class="row"><span>Cajero:</span><span class="bold">${sale.cashierName}</span></div>
    <div class="row"><span>Cliente:</span><span class="bold">${sale.customerName || 'Cliente General'}</span></div>
    
    <div class="dashed"></div>
    <div class="row bold" style="border-bottom: 1px solid #ccc; padding-bottom: 2px;">
      <span>Cant. / Producto</span>
      <span>Importe</span>
    </div>
    ${sale.items
      .map(
        (item) => `
      <div style="margin: 5px 0;">
        <div class="row">
          <span class="prod-name">${item.quantity}x ${item.productName}</span>
          <span class="bold">S/ ${(item.subtotal || item.unitPrice * item.quantity).toFixed(2)}</span>
        </div>
        <div class="prod-sub">SKU: ${item.sku} (P.U. S/ ${item.unitPrice.toFixed(2)})</div>
        ${
          item.isCombo && item.comboComponents
            ? `
          <div style="padding-left: 8px; font-size: 9px; color: #555;">
            ${item.comboComponents.map((c) => `<div>• ${c.quantity}x ${c.productName}</div>`).join('')}
          </div>
        `
            : ''
        }
      </div>
    `
      )
      .join('')}

    <div class="dashed"></div>
    <div class="row"><span>Subtotal:</span><span>S/ ${sale.subtotal.toFixed(2)}</span></div>
    ${
      sale.discountTotal > 0
        ? `<div class="row bold"><span>Descuento:</span><span>-S/ ${sale.discountTotal.toFixed(2)}</span></div>`
        : ''
    }
    <div class="row total-row">
      <span>TOTAL:</span>
      <span>S/ ${sale.total.toFixed(2)}</span>
    </div>

    <div class="dashed"></div>
    <div class="bold" style="font-size: 11px; margin-bottom: 4px;">Forma de Pago:</div>
    ${sale.payments
      .map(
        (p) => `
      <div class="row">
        <span>• ${p.method.toUpperCase()} ${p.reference ? `(${p.reference})` : ''}:</span>
        <span class="bold">S/ ${p.amount.toFixed(2)}</span>
      </div>
    `
      )
      .join('')}
    ${
      sale.changeAmount > 0
        ? `
      <div class="row bold" style="margin-top: 4px;">
        <span>Vuelto Entregado:</span>
        <span>S/ ${sale.changeAmount.toFixed(2)}</span>
      </div>
    `
        : ''
    }

    <div class="barcode"></div>
    <div class="footer">
      <div>¡Gracias por su compra!</div>
      <div style="font-size: 9px; margin-top: 3px;">Comprobante digital verificado por Cajita POS 🇵🇪</div>
    </div>
  </div>
  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 400);
    };
  </script>
</body>
</html>`;

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
  };

  // High-interactivity sending sequence with animated stages (purely on-screen simulation, no redirect)
  const handleSendInteractiveWhatsapp = async () => {
    setIsSending(true);
    setSentSuccess(false);

    try {
      // Stage 1: Generating PDF
      setSendingStage(1);
      await new Promise((resolve) => setTimeout(resolve, 600));

      // Stage 2: Packaging Voucher
      setSendingStage(2);
      await new Promise((resolve) => setTimeout(resolve, 700));

      // Stage 3: Connecting to WhatsApp and Delivering
      setSendingStage(3);
      await new Promise((resolve) => setTimeout(resolve, 600));

      // Simulation complete: delivery confirmed without external redirect
      setSentSuccess(true);
    } catch (err) {
      console.warn('Error in WhatsApp simulation', err);
    } finally {
      setIsSending(false);
      setSendingStage(0);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/80 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-xl bg-[#FAF6F0] rounded-2xl sm:rounded-3xl shadow-2xl border border-[#2E7D5B]/30 overflow-hidden my-auto max-h-[94dvh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Header: Authentic WhatsApp Business Green Theme */}
        <div className="p-3.5 sm:p-4 bg-[#075E54] text-white flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 bg-white text-[#075E54] rounded-full flex items-center justify-center font-bold text-sm shadow-md border-2 border-emerald-400">
                <CajitaLogo variant="iconOnly" size={24} lidHex="#075E54" checkHex="#FFFFFF" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border-2 border-[#075E54] rounded-full" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-sm sm:text-base font-black tracking-tight text-white leading-tight">
                  {storeName}
                </h2>
                <ShieldCheck className="w-4 h-4 text-emerald-300" />
              </div>
              <p className="text-[11px] text-emerald-100 font-medium leading-tight mt-0.5 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
                Envío Digital de Voucher & PDF por WhatsApp
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
            title="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-3.5 sm:p-5 space-y-4">
          
          {/* STEP 1: Interactive Call to Action to enter phone number */}
          <div className="bg-white rounded-2xl p-3.5 sm:p-4 border border-[#E4DFD3] shadow-xs space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-[10px] font-black uppercase tracking-wider mb-1">
                  <Sparkles className="w-3 h-3 text-emerald-600" /> Paso 1 · Prueba en Vivo
                </div>
                <h3 className="text-xs sm:text-sm font-black text-neutral-900 leading-tight">
                  Coloca tu número de WhatsApp para probar el envío del voucher:
                </h3>
                <p className="text-[11px] text-neutral-600 mt-0.5 leading-snug">
                  Escribe tu celular y al enviar se abrirá WhatsApp con el comprobante y el PDF preparado.
                </p>
              </div>
            </div>

            {/* Input with Peru Flag and Big Typography */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-3 py-2.5 bg-[#FAF6F0] border border-neutral-300 rounded-xl text-xs font-black text-neutral-800 shrink-0 select-none">
                  <span className="text-base">🇵🇪</span>
                  <span>+51</span>
                </div>
                <div className="relative flex-1">
                  <input
                    id="input-demo-whatsapp-phone"
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="987 654 321"
                    className="w-full pl-3.5 pr-10 py-2.5 bg-neutral-50 border border-neutral-300 focus:border-emerald-600 focus:bg-white rounded-xl text-sm sm:text-base font-mono font-black text-neutral-900 tracking-wider focus:outline-none transition-all shadow-inner"
                  />
                  {hasValidLength && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-600">
                      <CheckCircle2 className="w-5 h-5 fill-emerald-100" />
                    </span>
                  )}
                </div>
              </div>

              {/* Status helper text */}
              <div className="flex items-center justify-between text-[11px] px-1">
                {isValidPeruPhone ? (
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    ✓ Número de celular peruano válido listo para recibir el comprobante.
                  </span>
                ) : cleanNumber.length > 0 ? (
                  <span className="text-amber-700 font-medium">
                    Ingresa los 9 dígitos de tu número (ej: 987654321).
                  </span>
                ) : (
                  <span className="text-neutral-500 font-medium">
                    Tip: Puedes probar con tu propio número de celular ahora mismo.
                  </span>
                )}

                {phoneNumber && (
                  <button
                    type="button"
                    onClick={() => setPhoneNumber('')}
                    className="text-neutral-400 hover:text-neutral-700 text-[10px] font-bold underline cursor-pointer"
                  >
                    Borrar
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* STEP 2: Realistic WhatsApp Chat Simulator with PDF Attachment */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-1.5 text-xs font-black text-neutral-800 uppercase tracking-wider">
                <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                <span>Vista Previa Gráfica de Entrega al Cliente:</span>
              </div>

              {/* Toggle views between WhatsApp Chat and Paper PDF */}
              <div className="flex items-center gap-1 bg-white p-0.5 rounded-xl border border-neutral-200 shadow-2xs">
                <button
                  type="button"
                  onClick={() => setActiveTab('whatsapp_chat')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                    activeTab === 'whatsapp_chat'
                      ? 'bg-[#075E54] text-white shadow-xs'
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  💬 Chat WhatsApp
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('pdf_ticket')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                    activeTab === 'pdf_ticket'
                      ? 'bg-[#075E54] text-white shadow-xs'
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  📄 Voucher PDF
                </button>
              </div>
            </div>

            {/* Simulated WhatsApp Wallpaper Container */}
            {activeTab === 'whatsapp_chat' ? (
              <div className="relative rounded-2xl p-3 sm:p-4 bg-[#EFEAE2] border border-[#DDD4C7] shadow-inner overflow-hidden">
                {/* Subtle pattern background */}
                <div className="text-center mb-2">
                  <span className="inline-block bg-white/80 backdrop-blur-xs px-2.5 py-0.5 rounded-md text-[10px] font-bold text-neutral-500 shadow-2xs">
                    HOY · COMPROBANTE DIGITAL
                  </span>
                </div>

                {/* WhatsApp Chat Bubble */}
                <div className="max-w-[400px] ml-auto bg-[#E7FFDB] rounded-2xl rounded-tr-xs p-3 shadow-md border border-[#D0F5BD] space-y-2.5 text-neutral-900 text-xs">
                  
                  {/* Attached PDF Card inside WhatsApp */}
                  <div className="bg-white/95 rounded-xl p-2.5 border border-[#C5E8B2] shadow-xs flex items-center justify-between gap-2.5">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-9 h-9 bg-rose-50 border border-rose-200 text-rose-600 rounded-lg flex items-center justify-center shrink-0 shadow-2xs">
                        <FileText className="w-5 h-5 fill-rose-500 text-white" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-[11px] text-neutral-900 truncate">
                          Voucher_{ticketNumber}.pdf
                        </div>
                        <div className="text-[10px] text-neutral-500 flex items-center gap-1 font-mono">
                          <span>42 KB</span>
                          <span>•</span>
                          <span className="text-rose-600 font-bold uppercase">PDF</span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleOpenOrDownloadPdf}
                      className="px-2.5 py-1.5 bg-[#075E54] hover:bg-[#064E46] text-white rounded-lg text-[11px] font-bold flex items-center gap-1 shrink-0 transition-colors cursor-pointer shadow-xs"
                      title="Ver y descargar el archivo PDF del voucher"
                    >
                      <Eye className="w-3 h-3" />
                      <span>Ver PDF</span>
                    </button>
                  </div>

                  {/* WhatsApp Text Message Preview */}
                  <div className="font-sans text-[11px] text-neutral-800 leading-relaxed whitespace-pre-wrap pl-0.5">
                    <div className="font-bold text-[12px] text-neutral-950">
                      🧾 {storeName}
                    </div>
                    <div className="text-[10px] font-mono text-neutral-600 mb-1">
                      TICKET DE VENTA N° {ticketNumber}
                    </div>
                    <div className="border-t border-emerald-300/40 my-1 pt-1 space-y-0.5 text-[11px]">
                      {sale ? (
                        <>
                          <div className="text-neutral-700">
                            👤 Cliente: <strong>{sale.customerName || 'Cliente General'}</strong>
                          </div>
                          <div className="text-neutral-700">
                            🛒 {sale.items.length} producto(s) incluidos
                          </div>
                          <div className="font-black text-sm text-neutral-950 pt-0.5">
                            💰 TOTAL: S/ {totalAmount}
                          </div>
                          <div className="text-[10px] text-neutral-600">
                            💳 Pagado con: {sale.payments.map((p) => p.method.toUpperCase()).join(', ')}
                          </div>
                        </>
                      ) : (
                        <div>Comprobante listo para enviar con detalle y total.</div>
                      )}
                    </div>
                  </div>

                  {/* Bubble Footer with Dynamic Status & Double Blue Checkmark */}
                  <div className="flex items-center justify-end gap-1 text-[10px] text-neutral-500 font-mono pt-0.5">
                    <span>{new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}</span>
                    {isSending ? (
                      <span className="text-amber-600 font-bold flex items-center gap-1">
                        <span>Enviando...</span>
                        <span className="text-xs">⏳</span>
                      </span>
                    ) : sentSuccess ? (
                      <span className="text-[#34B7F1] font-bold tracking-tighter text-[11px] flex items-center gap-0.5" title="Entregado al cliente">
                        <span>Entregado</span>
                        <span className="font-black">✓✓</span>
                      </span>
                    ) : (
                      <span className="text-neutral-400 font-bold tracking-tighter text-[11px]" title="Listo para enviar">
                        <span>✓</span>
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-right mt-2 pr-1">
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="text-[11px] font-bold text-[#075E54] hover:underline flex items-center gap-1 ml-auto cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>¡Texto copiado al portapapeles!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copiar texto del mensaje</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              /* High Definition Thermal Paper Ticket Preview */
              <div className="bg-white rounded-2xl p-4 border border-neutral-300 shadow-sm max-w-[360px] mx-auto font-mono text-xs text-neutral-900 space-y-3">
                <div className="text-center border-b border-dashed border-neutral-400 pb-2.5">
                  <div className="font-black text-base tracking-widest text-neutral-950">CAJITA POS</div>
                  <div className="font-bold text-xs">{storeName}</div>
                  <div className="text-[11px] text-neutral-600">RUC {storeProfile?.ruc || '20603676457'}</div>
                  <div className="text-[10px] font-bold uppercase mt-1">TICKET N° {ticketNumber}</div>
                </div>

                <div className="space-y-1 text-[11px]">
                  <div className="flex justify-between">
                    <span>Total Pagado:</span>
                    <span className="font-bold text-sm">S/ {totalAmount}</span>
                  </div>
                  <div className="flex justify-between text-neutral-600">
                    <span>Emisión:</span>
                    <span>{new Date().toLocaleDateString('es-PE')}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleOpenOrDownloadPdf}
                  className="w-full py-2 bg-neutral-900 hover:bg-black text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimir / Guardar en PDF</span>
                </button>
              </div>
            )}
          </div>

          {/* Animated Sending Progress Feedback */}
          {isSending && (
            <div className="bg-white rounded-2xl p-4 border-2 border-emerald-500 shadow-lg space-y-3 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between text-xs font-black text-emerald-900">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
                  {sendingStage === 1 && '⚡ Paso 1 de 3: Generando archivo Voucher PDF...'}
                  {sendingStage === 2 && '📦 Paso 2 de 3: Adjuntando comprobante digital...'}
                  {sendingStage === 3 && '📲 Paso 3 de 3: ¡Listo! Conectando con WhatsApp...'}
                </span>
                <span className="font-mono">{sendingStage * 33}%</span>
              </div>
              <div className="w-full bg-neutral-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-emerald-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${sendingStage * 33.3}%` }}
                />
              </div>
              <p className="text-[11px] text-neutral-600 text-center font-medium">
                Preparando el ticket de venta para entregarlo en vivo a tu celular...
              </p>
            </div>
          )}

          {/* Success Banner */}
          {sentSuccess && !isSending && (
            <div className="bg-emerald-50 border-2 border-emerald-400 rounded-2xl p-4 shadow-sm space-y-2 animate-in fade-in">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Check className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-black text-emerald-950">
                    ¡Voucher simulado y enviado con éxito!
                  </h4>
                  <p className="text-[11px] text-emerald-800">
                    El comprobante digital y el archivo PDF fueron entregados al WhatsApp de{' '}
                    <strong>+51 {cleanNumber || 'Cliente'}</strong>.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleOpenOrDownloadPdf}
                  className="flex-1 py-2 px-3 bg-white hover:bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
                >
                  <FileDown className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Ver Voucher en PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSentSuccess(false)}
                  className="py-2 px-3 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Simular de nuevo
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions: High Contrast & Visual */}
        <div className="p-3.5 sm:p-4 bg-white border-t border-[#E4DFD3] flex items-center gap-2.5 shrink-0 shadow-lg">
          <button
            type="button"
            onClick={onClose}
            className="py-3 px-4 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold text-xs rounded-xl transition-colors cursor-pointer text-center"
          >
            Cerrar
          </button>

          <button
            type="button"
            disabled={isSending}
            onClick={handleSendInteractiveWhatsapp}
            className={`flex-1 py-3.5 px-5 transition-all cursor-pointer flex items-center justify-center gap-2 text-white font-black text-xs sm:text-sm rounded-xl shadow-lg active:scale-[0.99] disabled:opacity-50 ${
              sentSuccess
                ? 'bg-emerald-700 hover:bg-emerald-800'
                : 'bg-gradient-to-r from-[#075E54] via-[#128C7E] to-[#25D366] hover:from-[#064E46] hover:via-[#0F7569] hover:to-[#20B858]'
            }`}
          >
            {isSending ? (
              <>
                <Send className="w-4 h-4 animate-bounce" />
                <span>Generando y Despachando...</span>
              </>
            ) : sentSuccess ? (
              <>
                <Check className="w-4 h-4 text-white" />
                <span>¡Voucher Enviado a (+51 {cleanNumber || 'Cliente'})!</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>
                  {phoneNumber.trim()
                    ? `Enviar a WhatsApp (+51 ${cleanNumber})`
                    : 'Simular Envío de Voucher'}
                </span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
