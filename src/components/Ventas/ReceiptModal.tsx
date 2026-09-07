import React from 'react';
import { Sale } from '../../types';
import { usePos } from '../../context/PosContext';
import { CheckCircle2, Printer, X } from 'lucide-react';
import { CajitaLogo } from '../CajitaLogo';

interface ReceiptModalProps {
  sale: Sale;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ sale, onClose }) => {
  const { storeProfile } = usePos();

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
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden my-8 border border-neutral-800">
        {/* Top Header */}
        <div className="bg-[#1C2B24] text-[#FAF6F0] p-6 text-center relative print:hidden border-b border-[#235F45]">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-[#EAF3EC]/50 hover:text-[#FAF6F0] hover:bg-[#235F45] rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="w-12 h-12 bg-[#2E7D5B] text-[#FAF6F0] rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-lg">
            <CheckCircle2 className="w-6 h-6 text-[#FAF6F0]" />
          </div>
          <h2 className="text-xl font-bold uppercase tracking-tight text-[#FAF6F0]">¡Venta Exitosa!</h2>
          <p className="text-xs text-[#2E7D5B] mt-1 font-medium">Comprobante generado correctamente</p>
        </div>

        {/* Ticket Content (Printable section - styled to match Cajita Ticket spec) */}
        <div id="printable-ticket" className="p-6 bg-white font-mono text-xs text-black space-y-4">
          {/* Header Store info & Cajita Logo */}
          <div className="text-center border-b border-dashed border-neutral-400 pb-4 space-y-1">
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
            <div className="pt-2 text-[11px] font-bold text-black uppercase tracking-wider">
              TICKET DE VENTA N° {sale.ticketNumber}
            </div>
          </div>

          {/* Ticket metadata */}
          <div className="space-y-1 text-[11px] border-b border-dashed border-neutral-400 pb-3">
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
              <span className="font-bold">{sale.customerName || 'Cliente Contado'}</span>
            </div>
          </div>

          {/* Items breakdown */}
          <div>
            <div className="flex justify-between font-bold text-[11px] border-b border-neutral-300 pb-1 mb-2">
              <span>Cant. / Producto</span>
              <span>Importe</span>
            </div>
            <div className="space-y-2">
              {sale.items.map((item, idx) => (
                <div key={idx} className="space-y-0.5">
                  <div className="flex justify-between font-medium text-[11px]">
                    <span className="truncate max-w-[220px]">
                      {item.quantity}x {item.productName}
                    </span>
                    <span className="font-bold">S/ {item.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-[10px] text-neutral-600 pl-4">
                    <span>SKU: {item.sku} (P.U. S/ {item.unitPrice.toFixed(2)})</span>
                    {item.discount > 0 && (
                      <span className="font-bold text-black">Desc: -S/ {item.discount.toFixed(2)}</span>
                    )}
                  </div>
                  {item.isCombo && item.comboComponents && item.comboComponents.length > 0 && (
                    <div className="pl-4 pt-1 space-y-0.5 text-[9.5px] text-neutral-700">
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
          <div className="border-t border-dashed border-neutral-400 pt-3 space-y-1.5">
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
          <div className="border-t border-dashed border-neutral-400 pt-3 space-y-1 text-[11px]">
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

          <div className="text-center pt-4 border-t border-dashed border-neutral-400 text-[11px] text-neutral-700">
            <p className="font-medium">Gracias por su compra</p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-neutral-100 border-t border-neutral-300 flex items-center justify-between gap-3 print:hidden">
          <button
            onClick={handlePrint}
            className="flex-1 py-2.5 px-4 bg-white hover:bg-neutral-50 text-black border border-neutral-300 hover:border-[#2E7D5B] rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4 text-[#2E7D5B]" />
            <span>Imprimir Ticket</span>
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2.5 px-4 bg-[#2E7D5B] hover:bg-[#235F45] text-[#FAF6F0] rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
          >
            <span>Nueva Venta</span>
          </button>
        </div>
      </div>
    </div>
  );
};

