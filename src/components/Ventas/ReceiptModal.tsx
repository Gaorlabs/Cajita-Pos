import React, { useState } from 'react';
import { Sale } from '../../types';
import { usePos } from '../../context/PosContext';
import { CheckCircle2, Printer, X, MessageSquare } from 'lucide-react';
import { CajitaLogo } from '../CajitaLogo';
import { WhatsappIntegrationModal } from '../Whatsapp/WhatsappIntegrationModal';

interface ReceiptModalProps {
  sale: Sale;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ sale, onClose }) => {
  const { storeProfile } = usePos();
  const [showWhatsappModal, setShowWhatsappModal] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const paymentLabels: Record<string, string> = {
    cash: 'Efectivo',
    card: 'Tarjeta (Débito/Crédito)',
    wallet: 'Yape / Plin',
    transfer: 'Transferencia Bancaria',
    credit: 'Crédito',
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-2.5 sm:p-4 overflow-hidden">
      {/* Print-specific style to isolate the receipt paper */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #printable-ticket, #printable-ticket * {
            visibility: visible !important;
          }
          #printable-ticket {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 80mm !important;
            margin: 0 auto !important;
            padding: 8px !important;
            border: none !important;
            box-shadow: none !important;
          }
        }
      `}</style>

      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-md max-h-[94dvh] flex flex-col overflow-hidden my-auto border border-neutral-800">
        {/* Compact Pinned Header */}
        <div className="bg-[#1C2B24] text-[#FAF6F0] px-4 py-3 sm:py-3.5 flex items-center justify-between print:hidden border-b border-[#235F45] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 sm:w-9 sm:h-9 bg-[#2E7D5B] text-white rounded-xl flex items-center justify-center shrink-0 shadow-md">
              <CheckCircle2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black uppercase tracking-tight text-[#FAF6F0] leading-tight">
                ¡Venta Exitosa!
              </h2>
              <p className="text-[11px] text-[#3BA87A] font-bold leading-none mt-0.5">
                Ticket N° {sale.ticketNumber} · Guardado
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white hover:bg-[#235F45] rounded-xl transition-colors cursor-pointer"
            title="Cerrar comprobante"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Ticket Viewport */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 bg-[#FAF6F0]/80">
          {/* Ticket Paper Sheet */}
          <div id="printable-ticket" className="bg-white border border-neutral-200 rounded-xl p-4 sm:p-5 shadow-xs font-mono text-xs text-neutral-900 space-y-3.5 max-w-[360px] mx-auto">
            {/* Header Store info & Cajita Logo */}
            <div className="text-center border-b border-dashed border-neutral-400 pb-3 space-y-1">
              <div className="flex justify-center mb-1">
                <CajitaLogo variant="iconOnly" size={32} lidHex="#2E7D5B" checkHex="#FFFFFF" />
              </div>
              <h3 className="font-extrabold text-base text-black tracking-widest font-mono">
                CAJITA
              </h3>
              <p className="text-[12px] font-sans font-medium text-neutral-800">
                {storeProfile.name || 'Bodega Don Mario – Huancayo'}
              </p>
              <p className="text-[11px] text-neutral-700">RUC {storeProfile.ruc || '10412345678'}</p>
              {storeProfile.address && storeProfile.address !== 'Lima, Perú' && (
                <p className="text-[11px] text-neutral-700">{storeProfile.address}</p>
              )}
              <div className="pt-1.5 text-[11px] font-bold text-black uppercase tracking-wider">
                TICKET DE VENTA N° {sale.ticketNumber}
              </div>
            </div>

            {/* Ticket metadata */}
            <div className="space-y-1 text-[11px] border-b border-dashed border-neutral-400 pb-2.5">
              <div className="flex justify-between">
                <span className="text-neutral-600">Fecha:</span>
                <span className="font-bold">{new Date(sale.date).toLocaleString('es-PE')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600">Cajero:</span>
                <span className="font-bold">{sale.cashierName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600">Cliente:</span>
                <span className="font-bold">{sale.customerName || 'Cliente General'}</span>
              </div>
            </div>

            {/* Items breakdown */}
            <div>
              <div className="flex justify-between font-bold text-[11px] border-b border-neutral-300 pb-1 mb-1.5">
                <span>Cant. / Producto</span>
                <span>Importe</span>
              </div>
              <div className="space-y-2">
                {sale.items.map((item, idx) => (
                  <div key={idx} className="space-y-0.5">
                    <div className="flex justify-between font-medium text-[11px]">
                      <span className="truncate max-w-[210px]">
                        {item.quantity}x {item.productName}
                      </span>
                      <span className="font-bold">S/ {item.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-[10px] text-neutral-600 pl-3">
                      <span>SKU: {item.sku} (P.U. S/ {item.unitPrice.toFixed(2)})</span>
                      {item.discount > 0 && (
                        <span className="font-bold text-black">Desc: -S/ {item.discount.toFixed(2)}</span>
                      )}
                    </div>
                    {item.isCombo && item.comboComponents && item.comboComponents.length > 0 && (
                      <div className="pl-3 pt-0.5 space-y-0.5 text-[9.5px] text-neutral-700">
                        <span className="font-bold text-black uppercase block text-[9px]">Incluye en este pack:</span>
                        {item.comboComponents.map((comp, cIdx) => (
                          <div key={cIdx} className="text-neutral-600 font-mono">
                            • {comp.quantity}x {comp.productName}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div className="border-t border-dashed border-neutral-400 pt-2.5 space-y-1.5">
              <div className="flex justify-between text-[11px] text-neutral-700">
                <span>Subtotal:</span>
                <span>S/ {sale.subtotal.toFixed(2)}</span>
              </div>
              {sale.discountTotal > 0 && (
                <div className="flex justify-between text-[11px] text-black font-bold">
                  <span>Descuento Total:</span>
                  <span>-S/ {sale.discountTotal.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-black text-black pt-1 border-t border-neutral-300">
                <span>TOTAL</span>
                <span>S/ {sale.total.toFixed(2)}</span>
              </div>
            </div>

            {/* Payment breakdown */}
            <div className="border-t border-dashed border-neutral-400 pt-2.5 space-y-1 text-[11px]">
              <div className="font-bold text-black">Forma de Pago:</div>
              {sale.payments.map((p, idx) => (
                <div key={idx} className="flex justify-between text-neutral-700">
                  <span>
                    • {paymentLabels[p.method] || p.method} {p.reference ? `(${p.reference})` : ''}:
                  </span>
                  <span className="font-bold">S/ {p.amount.toFixed(2)}</span>
                </div>
              ))}
              {sale.payments.some((p) => p.method === 'cash') && sale.amountPaid > sale.total && (
                <div className="flex justify-between text-neutral-700">
                  <span>• Efectivo Recibido:</span>
                  <span className="font-bold">S/ {sale.amountPaid.toFixed(2)}</span>
                </div>
              )}
              {sale.changeAmount > 0 && (
                <div className="flex justify-between font-bold text-black pt-1">
                  <span>VUELTO ENTREGADO:</span>
                  <span>S/ {sale.changeAmount.toFixed(2)}</span>
                </div>
              )}
            </div>

            <div className="text-center pt-3 border-t border-dashed border-neutral-400 text-[11px] text-neutral-700">
              <p className="font-medium">Gracias por su compra</p>
            </div>
          </div>
        </div>

        {/* Footer Actions - Fixed at Bottom & 100% Visible */}
        <div className="p-3 sm:p-4 bg-white border-t border-neutral-200 flex flex-col gap-2 shrink-0 print:hidden shadow-lg">
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex-1 py-2.5 px-3 bg-neutral-50 hover:bg-neutral-100 text-neutral-900 border border-neutral-300 hover:border-[#2E7D5B] rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer min-h-[42px]"
            >
              <Printer className="w-4 h-4 text-[#2E7D5B]" />
              <span>Imprimir</span>
            </button>
            <button
              onClick={() => setShowWhatsappModal(true)}
              className="flex-1 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs min-h-[42px]"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Enviar WhatsApp</span>
            </button>
          </div>
          <button
            onClick={onClose}
            className="w-full py-3 px-4 bg-[#2E7D5B] hover:bg-[#235F45] active:bg-[#1C2B24] text-white rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.99] cursor-pointer min-h-[44px]"
          >
            <span>Nueva Venta</span>
          </button>
        </div>
      </div>

      {showWhatsappModal && (
        <WhatsappIntegrationModal sale={sale} onClose={() => setShowWhatsappModal(false)} />
      )}
    </div>
  );
};

