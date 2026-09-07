import React, { useState } from 'react';
import { usePos } from '../../context/PosContext';
import { X, Lock, DollarSign, Banknote, ShieldCheck } from 'lucide-react';

interface OpenShiftModalProps {
  onClose: () => void;
  onSuccess?: () => void;
}

export const OpenShiftModal: React.FC<OpenShiftModalProps> = ({ onClose, onSuccess }) => {
  const { currentUser, openCashShift } = usePos();
  const [initialCash, setInitialCash] = useState<number>(100);
  const [notes, setNotes] = useState<string>('Apertura de turno regular. Sencillo en monedas y billetes.');

  const presets = [50, 80, 100, 150, 200];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    openCashShift(initialCash, notes);
    if (onSuccess) onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden">
        {/* Header */}
        <div className="p-5 bg-neutral-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
              <Banknote className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black tracking-tight uppercase">Apertura de Turno de Caja</h2>
              <p className="text-xs text-neutral-400">Inicia una nueva sesión de cobro</p>
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
          <div>
            <label className="block text-xs font-semibold text-neutral-600 uppercase mb-1">
              Cajero Responsable
            </label>
            <input
              type="text"
              disabled
              value={currentUser ? `${currentUser.name} (${currentUser.role})` : 'Cajero'}
              className="w-full px-3.5 py-2.5 bg-neutral-100 border border-neutral-300 rounded-xl text-xs font-bold text-neutral-700 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-600 uppercase mb-1">
              Fondo Inicial de Caja (Efectivo / Sencillo)
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
                value={initialCash}
                onChange={(e) => setInitialCash(parseFloat(e.target.value) || 0)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-neutral-300 rounded-xl text-base font-black text-neutral-950 font-mono focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            {/* Quick Presets */}
            <div className="flex items-center gap-1.5 mt-2">
              <span className="text-[10px] text-neutral-400 font-medium">Sugeridos:</span>
              {presets.map((amount) => (
                <button
                  key={amount}
                  type="button"
                  onClick={() => setInitialCash(amount)}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition-colors cursor-pointer ${
                    initialCash === amount
                      ? 'bg-neutral-900 text-white border-neutral-900'
                      : 'bg-neutral-50 text-neutral-700 border-neutral-200 hover:bg-neutral-100'
                  }`}
                >
                  S/ {amount}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-600 uppercase mb-1">
              Notas u Observaciones de Apertura
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej. Billetes de 10, 20 y monedas de 1 sol"
              className="w-full px-3.5 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-xs text-neutral-800 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>

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
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Confirmar y Abrir Turno</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
