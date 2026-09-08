import React, { useState } from 'react';
import { usePos } from '../../context/PosContext';
import { CashShift, ShiftCashMovement } from '../../types';
import { X, ArrowDownRight, ArrowUpRight, DollarSign, Tag, FileText, CheckCircle2 } from 'lucide-react';

interface CashMovementModalProps {
  shift: CashShift;
  onClose: () => void;
  onSuccess?: (movement: ShiftCashMovement) => void;
  initialType?: 'inflow' | 'outflow';
}

export const CashMovementModal: React.FC<CashMovementModalProps> = ({
  shift,
  onClose,
  onSuccess,
  initialType = 'outflow',
}) => {
  const { addCashMovement, currentUser } = usePos();
  const [type, setType] = useState<'inflow' | 'outflow'>(initialType);
  const [amount, setAmount] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [category, setCategory] = useState<ShiftCashMovement['category']>(
    initialType === 'outflow' ? 'gasto_menor' : 'ajuste_sencillo'
  );
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) return;
    if (!reason.trim()) return;

    const movement = addCashMovement(shift.id, {
      type,
      amount: numAmount,
      reason: reason.trim(),
      category,
    });

    if (movement) {
      setIsSuccess(true);
      setTimeout(() => {
        if (onSuccess) onSuccess(movement);
        onClose();
      }, 700);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-neutral-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className={`p-2 rounded-xl ${
                type === 'inflow'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
              }`}
            >
              {type === 'inflow' ? (
                <ArrowDownRight className="w-5 h-5" />
              ) : (
                <ArrowUpRight className="w-5 h-5" />
              )}
            </div>
            <div>
              <h2 className="text-base font-black tracking-tight uppercase">
                Movimiento de Caja Chica
              </h2>
              <p className="text-xs text-neutral-400">
                Turno activo: <span className="font-mono text-white">{shift.shiftNumber}</span> ({shift.cashierName})
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

        {/* Content */}
        {isSuccess ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h3 className="font-black text-neutral-900 text-lg">Movimiento Registrado</h3>
            <p className="text-xs text-neutral-500">
              El saldo teórico de la caja se ha actualizado automáticamente para el arqueo.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 text-neutral-800">
            {/* Segmented Type Selector */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-neutral-100 rounded-xl border border-neutral-200">
              <button
                type="button"
                onClick={() => {
                  setType('outflow');
                  setCategory('gasto_menor');
                }}
                className={`py-2 px-3 rounded-lg text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  type === 'outflow'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-950'
                }`}
              >
                <ArrowUpRight className="w-4 h-4" />
                <span>Salida / Gasto (-)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setType('inflow');
                  setCategory('ajuste_sencillo');
                }}
                className={`py-2 px-3 rounded-lg text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  type === 'inflow'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-950'
                }`}
              >
                <ArrowDownRight className="w-4 h-4" />
                <span>Entrada / Ingreso (+)</span>
              </button>
            </div>

            {/* Amount */}
            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">
                Monto en Soles (PEN) *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-neutral-400">
                  S/
                </span>
                <input
                  type="number"
                  step="0.10"
                  min="0.10"
                  required
                  autoFocus
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-lg font-black text-neutral-950 font-mono focus:outline-none focus:border-neutral-900 focus:bg-white"
                />
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">
                Clasificación
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-xs font-medium text-neutral-900 focus:outline-none focus:border-neutral-900 focus:bg-white"
              >
                {type === 'outflow' ? (
                  <>
                    <option value="gasto_menor">Gasto Menor (Bolsas, Limpieza, etc.)</option>
                    <option value="pago_proveedor">Pago Directo a Proveedor / Flete</option>
                    <option value="retiro_seguridad">Retiro Parcial de Seguridad (Remesa al Banco/Caja Fuerte)</option>
                    <option value="otro">Otro Egreso</option>
                  </>
                ) : (
                  <>
                    <option value="ajuste_sencillo">Ingreso de Sencillo / Cambio Adicional</option>
                    <option value="otro">Otro Ingreso Extraordinario</option>
                  </>
                )}
              </select>
            </div>

            {/* Reason */}
            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">
                Motivo o Concepto Detallado *
              </label>
              <textarea
                rows={2}
                required
                placeholder={
                  type === 'outflow'
                    ? 'Ej: Compra de 2 paquetes de bolsas biodegradables a distribuidor'
                    : 'Ej: Se ingresan S/ 50 en monedas de 1 y 2 soles para sencillo'
                }
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full p-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900 focus:bg-white"
              />
            </div>

            <div className="p-3 bg-neutral-100 rounded-xl text-[11px] text-neutral-600 flex items-center justify-between">
              <span>Registrado por:</span>
              <span className="font-bold text-neutral-900">{currentUser?.name} ({currentUser?.role})</span>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 px-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className={`flex-1 py-2.5 px-3 text-white font-black text-xs rounded-xl shadow-md transition-all cursor-pointer ${
                  type === 'outflow'
                    ? 'bg-rose-600 hover:bg-rose-700 active:scale-95'
                    : 'bg-emerald-600 hover:bg-emerald-700 active:scale-95'
                }`}
              >
                {type === 'outflow' ? 'Confirmar Salida de Dinero' : 'Confirmar Ingreso de Dinero'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
