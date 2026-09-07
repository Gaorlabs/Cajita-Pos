import React, { useState } from 'react';
import { usePos } from '../../context/PosContext';
import { X, Printer, Calculator, Banknote, CreditCard, Smartphone, Check, Calendar } from 'lucide-react';

interface CashClosureModalProps {
  onClose: () => void;
}

export const CashClosureModal: React.FC<CashClosureModalProps> = ({ onClose }) => {
  const { sales } = usePos();

  const [initialFloat, setInitialFloat] = useState<number>(100.0); // Monto inicial en caja (base)
  const [filterPeriod, setFilterPeriod] = useState<'today' | 'week' | 'month'>('today');

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).getTime();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

  const filteredSales = sales.filter((s) => {
    const saleTime = new Date(s.date).getTime();
    if (filterPeriod === 'today') return saleTime >= startOfToday;
    if (filterPeriod === 'week') return saleTime >= startOfWeek;
    if (filterPeriod === 'month') return saleTime >= startOfMonth;
    return true;
  });

  // Calculate breakdown by method
  let cashTotal = 0;
  let cardTotal = 0;
  let walletTotal = 0;

  filteredSales.forEach((s) => {
    s.payments.forEach((p) => {
      if (p.method === 'cash') cashTotal += p.amount;
      else if (p.method === 'card') cardTotal += p.amount;
      else if (p.method === 'wallet') walletTotal += p.amount;
    });
  });

  const totalSalesRevenue = cashTotal + cardTotal + walletTotal;
  const expectedTotalCashInDrawer = initialFloat + cashTotal;

  const handlePrintClosure = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden my-8 border border-neutral-800">
        <div className="bg-black text-white p-5 flex items-center justify-between border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white text-black flex items-center justify-center font-bold">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black uppercase tracking-tight">Cierre & Arqueo de Caja</h2>
              <p className="text-xs text-neutral-400">Resumen consolidado por medio de pago</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Period selector */}
          <div className="flex items-center justify-between bg-neutral-50 p-3 rounded-xl border border-neutral-200">
            <span className="text-xs font-bold text-neutral-800">Rango de Cierre:</span>
            <div className="flex gap-1">
              {(
                [
                  { id: 'today', label: 'Hoy' },
                  { id: 'week', label: 'Esta Semana' },
                  { id: 'month', label: 'Este Mes' },
                ] as const
              ).map((p) => (
                <button
                  key={p.id}
                  onClick={() => setFilterPeriod(p.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    filterPeriod === p.id
                      ? 'bg-black text-white'
                      : 'bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-100'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Initial Base Cash Input */}
          <div className="flex items-center justify-between bg-neutral-50 p-3 rounded-xl border border-neutral-200">
            <div>
              <label className="text-xs font-bold text-neutral-900 block">Fondo Inicial de Caja (Base):</label>
              <span className="text-[11px] text-neutral-500">Efectivo asignado al iniciar turno</span>
            </div>
            <input
              type="number"
              step="10"
              value={initialFloat}
              onChange={(e) => setInitialFloat(parseFloat(e.target.value) || 0)}
              className="w-28 py-1.5 px-3 bg-white border border-neutral-300 rounded-lg text-right font-bold text-xs text-neutral-900 font-mono focus:outline-none focus:border-black"
            />
          </div>

          {/* Breakdown cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-neutral-100 border border-neutral-300 p-3 rounded-xl text-center space-y-1">
              <Banknote className="w-5 h-5 text-neutral-900 mx-auto" />
              <span className="text-[10px] font-bold text-neutral-700 uppercase block">Efectivo</span>
              <span className="text-sm font-black text-neutral-950 block font-mono">
                S/ {cashTotal.toFixed(2)}
              </span>
            </div>

            <div className="bg-neutral-100 border border-neutral-300 p-3 rounded-xl text-center space-y-1">
              <CreditCard className="w-5 h-5 text-neutral-700 mx-auto" />
              <span className="text-[10px] font-bold text-neutral-700 uppercase block">Tarjeta</span>
              <span className="text-sm font-black text-neutral-950 block font-mono">
                S/ {cardTotal.toFixed(2)}
              </span>
            </div>

            <div className="bg-neutral-100 border border-neutral-300 p-3 rounded-xl text-center space-y-1">
              <Smartphone className="w-5 h-5 text-neutral-700 mx-auto" />
              <span className="text-[10px] font-bold text-neutral-700 uppercase block">Yape / Plin</span>
              <span className="text-sm font-black text-neutral-950 block font-mono">
                S/ {walletTotal.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Final Totals Table */}
          <div className="bg-neutral-950 text-white p-4 rounded-xl space-y-2 text-xs border border-neutral-800">
            <div className="flex justify-between text-neutral-400">
              <span>Total Ventas Cobradas ({filteredSales.length} comprobantes):</span>
              <span className="font-bold text-white font-mono">S/ {totalSalesRevenue.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-neutral-400">
              <span>Fondo Inicial + Ventas en Efectivo:</span>
              <span className="font-bold text-white font-mono">S/ {expectedTotalCashInDrawer.toFixed(2)}</span>
            </div>
            <div className="pt-2 border-t border-neutral-800 flex justify-between text-sm font-black text-white">
              <span>EFECTIVO ESPERADO EN CAJÓN:</span>
              <span className="text-white text-base font-mono">S/ {expectedTotalCashInDrawer.toFixed(2)}</span>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={handlePrintClosure}
              className="flex-1 py-3 px-4 bg-neutral-100 hover:bg-neutral-200 text-neutral-900 border border-neutral-300 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir Cierre</span>
            </button>
            <button
              onClick={onClose}
              className="flex-1 py-3 px-4 bg-black hover:bg-neutral-800 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <span>Concluir Cierre</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
