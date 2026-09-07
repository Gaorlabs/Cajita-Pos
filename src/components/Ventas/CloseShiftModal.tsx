import React, { useState } from 'react';
import { usePos } from '../../context/PosContext';
import { CashShift, Sale } from '../../types';
import { X, Lock, AlertTriangle, CheckCircle2, DollarSign, Banknote } from 'lucide-react';

interface CloseShiftModalProps {
  shift: CashShift;
  sales: Sale[];
  onClose: () => void;
  onSuccess: (closedShift: CashShift) => void;
}

export const CloseShiftModal: React.FC<CloseShiftModalProps> = ({
  shift,
  sales,
  onClose,
  onSuccess,
}) => {
  const { closeCashShift } = usePos();

  // Calculate cash sales for this shift
  const shiftSales = sales.filter((s) => s.shiftId === shift.id);
  const cashSalesTotal = shiftSales.reduce((sum, s) => {
    const cashPayments = s.payments.filter((p) => p.method === 'cash');
    return sum + cashPayments.reduce((pSum, p) => pSum + p.amount, 0);
  }, 0);

  const initialCash = shift.initialCash;
  const expectedCash = initialCash + cashSalesTotal;

  const [countedCash, setCountedCash] = useState<number>(expectedCash);
  const [notes, setNotes] = useState<string>('Cierre regular de turno. Conteo de gaveta conforme.');

  const difference = countedCash - expectedCash;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const closed = closeCashShift(shift.id, countedCash, notes);
    onSuccess(closed);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden">
        {/* Header */}
        <div className="p-5 bg-neutral-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-rose-500/20 text-rose-400 rounded-xl border border-rose-500/30">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black tracking-tight uppercase">
                Cierre de Turno ({shift.shiftNumber})
              </h2>
              <p className="text-xs text-neutral-400">Arqueo y cuadre de efectivo en caja</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-neutral-800">
          {/* Shift Details */}
          <div className="bg-neutral-50 rounded-xl p-3.5 border border-neutral-200 space-y-2 text-xs font-mono">
            <div className="flex justify-between items-center text-neutral-600">
              <span>Cajero:</span>
              <span className="font-bold text-neutral-900 font-sans">{shift.cashierName}</span>
            </div>
            <div className="flex justify-between items-center text-neutral-600">
              <span>Fondo Inicial de Apertura:</span>
              <span className="font-bold text-neutral-900">S/ {initialCash.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-neutral-600">
              <span>(+) Ventas Cobradas en Efectivo:</span>
              <span className="font-bold text-emerald-600">+ S/ {cashSalesTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-neutral-200 text-sm font-bold text-neutral-950">
              <span>(=) Efectivo Esperado en Gaveta:</span>
              <span className="text-emerald-700 text-base">S/ {expectedCash.toFixed(2)}</span>
            </div>
          </div>

          {/* Input: Counted Cash */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 uppercase mb-1">
              Efectivo Físico Contado en Caja
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-neutral-400">
                S/
              </span>
              <input
                type="number"
                step="0.10"
                min="0"
                required
                value={countedCash}
                onChange={(e) => setCountedCash(parseFloat(e.target.value) || 0)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-neutral-300 rounded-xl text-base font-black text-neutral-950 font-mono focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
              />
            </div>
            <p className="text-[11px] text-neutral-500 mt-1">
              Ingresa la suma física de billetes y monedas que hay en la gaveta.
            </p>
          </div>

          {/* Difference Display */}
          <div
            className={`p-3 rounded-xl border text-xs font-mono flex items-center justify-between ${
              difference === 0
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : difference > 0
                ? 'bg-blue-50 border-blue-200 text-blue-900'
                : 'bg-rose-50 border-rose-200 text-rose-900'
            }`}
          >
            <div className="flex items-center gap-2">
              {difference === 0 ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-500" />
              )}
              <span className="font-bold">
                {difference === 0
                  ? 'Cuadre Exacto'
                  : difference > 0
                  ? 'Sobrante en caja'
                  : 'Faltante en caja'}
              </span>
            </div>
            <span className="font-bold text-sm">
              {difference === 0
                ? 'S/ 0.00'
                : `${difference > 0 ? '+ S/' : '- S/'} ${Math.abs(difference).toFixed(2)}`}
            </span>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 uppercase mb-1">
              Observaciones de Cierre
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notas u observaciones del turno..."
              className="w-full px-3.5 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-xs text-neutral-800 focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
            />
          </div>

          {/* Action buttons */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-neutral-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-neutral-600 hover:text-neutral-900 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Lock className="w-4 h-4" />
              <span>Confirmar y Cerrar Turno</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
