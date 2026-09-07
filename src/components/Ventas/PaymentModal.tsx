import React, { useState } from 'react';
import { PaymentDetail, PaymentMethod } from '../../types';
import { Banknote, CreditCard, Smartphone, X, AlertCircle, Square } from 'lucide-react';

interface PaymentModalProps {
  total: number;
  initialCustomerName?: string;
  onConfirm: (payments: PaymentDetail[], customerName?: string, actualCashGiven?: number) => void;
  onClose: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  total,
  initialCustomerName = '',
  onConfirm,
  onClose,
}) => {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('mixed'); // Default to mixed/dividido or cash
  const [customerName, setCustomerName] = useState(initialCustomerName);

  // Cash state
  const [cashInput, setCashInput] = useState<string>(() => total.toFixed(2));

  // References
  const [cardRef, setCardRef] = useState('');
  const [walletRef, setWalletRef] = useState('');

  // Mixed payment state default setup (Efectivo + Yape/Plin split like screenshot)
  const defaultCash = 10.0;
  const defaultWallet = Number((total - defaultCash > 0 ? total - defaultCash : 0).toFixed(2));

  const [mixedCash, setMixedCash] = useState<number>(() => defaultCash);
  const [mixedWallet, setMixedWallet] = useState<number>(() => defaultWallet);
  const [mixedCard, setMixedCard] = useState<number>(0);

  // Numeric parsing
  const cashGiven = parseFloat(cashInput) || 0;
  const cashDiff = cashGiven - total;
  const isCashSufficient = cashDiff >= -0.001;
  const cashChange = Math.max(0, cashDiff);

  // Mixed total paid & remaining
  const mixedSum = Math.round((mixedCash + mixedCard + mixedWallet) * 100) / 100;
  const mixedRemaining = Math.round((total - mixedSum) * 100) / 100;

  // Presets
  const getPresetDenominations = (tot: number) => {
    const list: { label: string; value: number }[] = [];
    const bills = [20, 50, 100];

    bills.forEach((b) => {
      if (b >= tot && !list.some((i) => i.value === b)) {
        list.push({ label: `S/ ${b}`, value: b });
      }
    });

    if (list.length === 0) {
      const roundNext = Math.ceil(tot / 10) * 10;
      list.push({ label: `S/ ${roundNext}`, value: roundNext });
      list.push({ label: `S/ ${roundNext + 50}`, value: roundNext + 50 });
    }

    list.push({ label: 'Exacto', value: Number(tot.toFixed(2)) });
    return list;
  };

  const presetOptions = getPresetDenominations(total);

  const handleQuickCash = (amount: number) => {
    setCashInput(amount.toFixed(2));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let finalPayments: PaymentDetail[] = [];
    let actualPaid = total;

    if (selectedMethod === 'cash') {
      if (!isCashSufficient) return;
      actualPaid = cashGiven;
      finalPayments = [{ method: 'cash', amount: total }];
    } else if (selectedMethod === 'card') {
      finalPayments = [{ method: 'card', amount: total, reference: cardRef || undefined }];
      actualPaid = total;
    } else if (selectedMethod === 'wallet') {
      finalPayments = [{ method: 'wallet', amount: total, reference: walletRef || undefined }];
      actualPaid = total;
    } else if (selectedMethod === 'mixed') {
      if (Math.abs(mixedRemaining) > 0.01) return;
      if (mixedCash > 0) finalPayments.push({ method: 'cash', amount: mixedCash });
      if (mixedCard > 0) finalPayments.push({ method: 'card', amount: mixedCard });
      if (mixedWallet > 0)
        finalPayments.push({
          method: 'wallet',
          amount: mixedWallet,
          reference: walletRef || undefined,
        });
      actualPaid = total;
    }

    onConfirm(finalPayments, customerName.trim() || undefined, actualPaid);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto font-sans selection:bg-[#2E7D5B] selection:text-white">
      <div className="bg-[#141412] text-[#F1EFE8] rounded-3xl border border-[#262624] shadow-2xl w-full max-w-[420px] overflow-hidden p-6 space-y-5 my-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight text-[#F1EFE8]">Cobrar venta</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-[#888880] hover:text-[#F1EFE8] hover:bg-[#282825] rounded-lg transition-colors cursor-pointer"
          >
            <Square className="w-5 h-5 text-[#888880] hover:text-[#F1EFE8]" />
          </button>
        </div>

        {/* Total Box */}
        <div className="bg-[#0E0E0D] border border-[#222220] rounded-2xl p-4 flex items-center justify-between">
          <div className="text-left leading-tight">
            <span className="text-xs text-[#B4B2A9] font-medium block">Total a</span>
            <span className="text-xs text-[#B4B2A9] font-medium block">cobrar</span>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-[#2E7D5B] font-mono tracking-tight">
            S/ {total.toFixed(2)}
          </div>
        </div>

        <form noValidate onSubmit={handleSubmit} className="space-y-5">
          {/* Método de pago */}
          <div>
            <label className="block text-xs text-[#B4B2A9] font-medium mb-2.5">
              Método de pago
            </label>
            <div className="grid grid-cols-4 gap-2">
              {/* Efectivo */}
              <button
                type="button"
                onClick={() => setSelectedMethod('cash')}
                className={`py-3.5 px-1 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  selectedMethod === 'cash'
                    ? 'bg-[#EAF3EC] text-[#2E7D5B] border-[#2E7D5B] font-bold shadow-xs'
                    : 'bg-[#1C1C1A] text-[#F1EFE8] border-[#2C2C2A] hover:bg-[#262624] font-medium'
                }`}
              >
                <Square className={`w-4 h-4 ${selectedMethod === 'cash' ? 'text-[#2E7D5B]' : 'text-[#888880]'}`} />
                <span className="text-xs">Efectivo</span>
              </button>

              {/* Tarjeta */}
              <button
                type="button"
                onClick={() => setSelectedMethod('card')}
                className={`py-3.5 px-1 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  selectedMethod === 'card'
                    ? 'bg-[#EAF3EC] text-[#2E7D5B] border-[#2E7D5B] font-bold shadow-xs'
                    : 'bg-[#1C1C1A] text-[#F1EFE8] border-[#2C2C2A] hover:bg-[#262624] font-medium'
                }`}
              >
                <Square className={`w-4 h-4 ${selectedMethod === 'card' ? 'text-[#2E7D5B]' : 'text-[#888880]'}`} />
                <span className="text-xs">Tarjeta</span>
              </button>

              {/* Yape/Plin */}
              <button
                type="button"
                onClick={() => setSelectedMethod('wallet')}
                className={`py-3.5 px-1 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  selectedMethod === 'wallet'
                    ? 'bg-[#EAF3EC] text-[#2E7D5B] border-[#2E7D5B] font-bold shadow-xs'
                    : 'bg-[#1C1C1A] text-[#F1EFE8] border-[#2C2C2A] hover:bg-[#262624] font-medium'
                }`}
              >
                <Square className={`w-4 h-4 ${selectedMethod === 'wallet' ? 'text-[#2E7D5B]' : 'text-[#888880]'}`} />
                <span className="text-xs truncate">Yape/Plin</span>
              </button>

              {/* Dividido */}
              <button
                type="button"
                onClick={() => setSelectedMethod('mixed')}
                className={`py-3.5 px-1 rounded-2xl border flex items-center justify-center transition-all cursor-pointer ${
                  selectedMethod === 'mixed'
                    ? 'bg-[#EAF3EC] text-[#2E7D5B] border-[#2E7D5B] font-bold shadow-xs'
                    : 'bg-[#1C1C1A] text-[#F1EFE8] border-[#2C2C2A] hover:bg-[#262624] font-medium'
                }`}
              >
                <span className="text-xs">Dividido</span>
              </button>
            </div>
          </div>

          {/* EFECTIVO VIEW */}
          {selectedMethod === 'cash' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-[#B4B2A9] font-medium mb-2">
                  Recibido en efectivo
                </label>
                <div className="bg-[#0E0E0D] border border-[#262624] rounded-xl px-4 py-3 text-right">
                  <input
                    type="number"
                    inputMode="decimal"
                    step="any"
                    value={cashInput}
                    onChange={(e) => setCashInput(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-transparent text-right text-2xl font-bold font-mono text-[#F1EFE8] focus:outline-none"
                    autoFocus
                  />
                </div>
              </div>

              {/* Quick Cash Pills */}
              <div className="grid grid-cols-4 gap-2">
                {presetOptions.map((opt, idx) => {
                  const isSelected = Math.abs(cashGiven - opt.value) < 0.01;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleQuickCash(opt.value)}
                      className={`py-2 px-1 rounded-xl text-xs font-semibold border transition-all cursor-pointer text-center ${
                        isSelected
                          ? 'bg-[#2E7D5B] text-[#FAF6F0] border-[#2E7D5B]'
                          : 'bg-[#1C1C1A] text-[#F1EFE8] border-[#2C2C2A] hover:bg-[#262624]'
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>

              {/* Vuelto Section */}
              <div className="pt-3 border-t border-[#262624] flex items-center justify-between">
                <span className="text-base font-medium text-[#F1EFE8]">Vuelto</span>
                <div className="text-right">
                  <span className="text-2xl font-bold font-mono text-[#F1EFE8]">
                    S/ {cashChange.toFixed(2)}
                  </span>
                </div>
              </div>

              {!isCashSufficient && (
                <div className="p-3 bg-[#2A2315] border border-[#EF9F27]/30 rounded-xl flex items-center gap-2 text-[#FAEEDA] text-xs">
                  <AlertCircle className="w-4 h-4 text-[#EF9F27] shrink-0" />
                  <span>
                    Monto insuficiente. Faltan{' '}
                    <strong className="text-[#EF9F27]">S/ {Math.abs(cashDiff).toFixed(2)}</strong>
                  </span>
                </div>
              )}
            </div>
          )}

          {/* TARJETA VIEW */}
          {selectedMethod === 'card' && (
            <div className="space-y-3 bg-[#0E0E0D] p-4 rounded-2xl border border-[#222220]">
              <label className="block text-xs text-[#B4B2A9] font-medium">
                N° de Operación (Opcional):
              </label>
              <input
                type="text"
                value={cardRef}
                onChange={(e) => setCardRef(e.target.value)}
                placeholder="Ej. VISA-9812"
                className="w-full py-2.5 px-3 bg-[#1C1C1A] border border-[#2C2C2A] rounded-xl text-xs font-medium text-[#F1EFE8] focus:outline-none focus:border-[#2E7D5B]"
              />
              <p className="text-[11px] text-[#888880]">
                Verifica la aprobación en el POS físico antes de confirmar.
              </p>
            </div>
          )}

          {/* YAPE / PLIN VIEW */}
          {selectedMethod === 'wallet' && (
            <div className="space-y-3 bg-[#0E0E0D] p-4 rounded-2xl border border-[#222220]">
              <label className="block text-xs text-[#B4B2A9] font-medium">
                N° de Operación Yape/Plin (Opcional):
              </label>
              <input
                type="text"
                value={walletRef}
                onChange={(e) => setWalletRef(e.target.value)}
                placeholder="Ej. OP-738219"
                className="w-full py-2.5 px-3 bg-[#1C1C1A] border border-[#2C2C2A] rounded-xl text-xs font-medium text-[#F1EFE8] focus:outline-none focus:border-[#2E7D5B]"
              />
              <p className="text-[11px] text-[#888880]">
                Verifica la notificación de abono en el celular de la tienda.
              </p>
            </div>
          )}

          {/* DIVIDIDO (MIXED) VIEW - EXACT MATCH TO IMAGE */}
          {selectedMethod === 'mixed' && (
            <div className="space-y-4">
              <label className="block text-xs text-[#B4B2A9] font-medium">
                Divide el pago entre métodos
              </label>

              <div className="space-y-3">
                {/* Efectivo Row */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#EAF3EC] flex items-center justify-center shrink-0 border border-[#2E7D5B]/20">
                      <Square className="w-4 h-4 text-[#2E7D5B]" />
                    </div>
                    <span className="text-sm font-semibold text-[#F1EFE8]">Efectivo</span>
                  </div>
                  <div className="w-32 bg-[#0E0E0D] border border-[#262624] rounded-xl px-3 py-2 text-right">
                    <input
                      type="number"
                      step="any"
                      value={mixedCash || ''}
                      onChange={(e) => setMixedCash(parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                      className="w-full bg-transparent text-right text-base font-bold font-mono text-[#F1EFE8] focus:outline-none"
                    />
                  </div>
                </div>

                {/* Yape / Plin Row */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#FDF4E3] flex items-center justify-center shrink-0 border border-[#633806]/20">
                      <Square className="w-4 h-4 text-[#633806]" />
                    </div>
                    <span className="text-sm font-semibold text-[#F1EFE8]">Yape / Plin</span>
                  </div>
                  <div className="w-32 bg-[#0E0E0D] border border-[#262624] rounded-xl px-3 py-2 text-right">
                    <input
                      type="number"
                      step="any"
                      value={mixedWallet || ''}
                      onChange={(e) => setMixedWallet(parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                      className="w-full bg-transparent text-right text-base font-bold font-mono text-[#F1EFE8] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Summary Breakdown - Vertical stacked text as in screenshot */}
              <div className="pt-4 border-t border-[#262624] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#B4B2A9] font-medium">Suma ingresada</span>
                  <div className="text-right leading-tight">
                    <span className="text-[10px] text-[#888880] font-mono block">S/</span>
                    <span className="text-base font-bold font-mono text-[#F1EFE8]">
                      {mixedSum.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#B4B2A9] font-medium">Falta por cubrir</span>
                  <div className="text-right leading-tight">
                    <span
                      className={`text-[10px] font-mono block ${
                        Math.abs(mixedRemaining) < 0.01 ? 'text-[#1D9E75]' : 'text-[#EF9F27]'
                      }`}
                    >
                      S/
                    </span>
                    <span
                      className={`text-base font-bold font-mono ${
                        Math.abs(mixedRemaining) < 0.01 ? 'text-[#1D9E75]' : 'text-[#EF9F27]'
                      }`}
                    >
                      {Math.max(0, mixedRemaining).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Confirm Button */}
          <button
            type="submit"
            disabled={
              selectedMethod === 'cash'
                ? !isCashSufficient
                : selectedMethod === 'mixed'
                ? Math.abs(mixedRemaining) > 0.01
                : false
            }
            className={`w-full py-3.5 px-4 rounded-2xl font-bold text-base transition-all cursor-pointer text-center ${
              (selectedMethod === 'cash' && !isCashSufficient) ||
              (selectedMethod === 'mixed' && Math.abs(mixedRemaining) > 0.01)
                ? 'bg-[#222220] text-[#888880] cursor-not-allowed'
                : 'bg-[#2E7D5B] hover:bg-[#235F45] text-[#FAF6F0] shadow-md'
            }`}
          >
            Confirmar cobro
          </button>
        </form>
      </div>
    </div>
  );
};
