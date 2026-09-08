import React from 'react';
import { CashShift, Sale, SaleItem } from '../../types';
import {
  X,
  Printer,
  Calendar,
  User,
  DollarSign,
  CreditCard,
  Smartphone,
  Banknote,
  Package,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Receipt,
  ShieldCheck,
  ShieldAlert,
  ArrowUpRight,
  ArrowDownRight,
  Coins,
} from 'lucide-react';

interface ShiftSummaryModalProps {
  shift: CashShift | null; // null if viewing all sales or custom period
  sales: Sale[];
  onClose: () => void;
  customTitle?: string;
  subtitle?: string;
}

interface ProductConsolidated {
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export const ShiftSummaryModal: React.FC<ShiftSummaryModalProps> = ({
  shift,
  sales,
  onClose,
  customTitle,
  subtitle,
}) => {
  // Aggregate sales data
  const totalSalesAmount = sales.reduce((sum, s) => sum + s.total, 0);
  const totalTickets = sales.length;
  const averageTicket = totalTickets > 0 ? totalSalesAmount / totalTickets : 0;

  // Aggregate payment methods
  let cashTotal = 0;
  let cashCount = 0;
  let cardTotal = 0;
  let cardCount = 0;
  let walletTotal = 0;
  let walletCount = 0;

  sales.forEach((s) => {
    s.payments.forEach((p) => {
      if (p.method === 'cash') {
        cashTotal += p.amount;
        cashCount += 1;
      } else if (p.method === 'card') {
        cardTotal += p.amount;
        cardCount += 1;
      } else if (p.method === 'wallet') {
        walletTotal += p.amount;
        walletCount += 1;
      }
    });
  });

  // Consolidate products sold
  const productMap: Record<string, ProductConsolidated> = {};
  sales.forEach((sale) => {
    sale.items.forEach((item: SaleItem) => {
      if (!productMap[item.productId]) {
        productMap[item.productId] = {
          productId: item.productId,
          productName: item.productName,
          sku: item.sku,
          quantity: 0,
          unitPrice: item.unitPrice,
          total: 0,
        };
      }
      productMap[item.productId].quantity += item.quantity;
      productMap[item.productId].total += item.subtotal;
    });
  });

  const consolidatedProducts = Object.values(productMap).sort((a, b) => b.total - a.total);
  const totalUnitsSold = consolidatedProducts.reduce((sum, p) => sum + p.quantity, 0);

  // Drawer cash balance
  const initialCash = shift ? shift.initialCash : 0;
  const shiftMovements = shift?.movements || [];
  const totalInflows = shiftMovements
    .filter((m) => m.type === 'inflow')
    .reduce((sum, m) => sum + m.amount, 0);
  const totalOutflows = shiftMovements
    .filter((m) => m.type === 'outflow')
    .reduce((sum, m) => sum + m.amount, 0);
  const expectedCashInDrawer = Math.round((initialCash + cashTotal + totalInflows - totalOutflows) * 100) / 100;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-neutral-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-neutral-800 rounded-xl border border-neutral-700">
              <Receipt className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight uppercase">
                {customTitle || (shift ? `Corte de Caja - ${shift.shiftNumber}` : 'Resumen General de Ventas')}
              </h2>
              <p className="text-[11px] text-neutral-400">
                {subtitle ||
                  (shift?.status === 'open'
                    ? 'Turno en curso (Reporte Parcial X)'
                    : shift?.status === 'closed'
                    ? 'Turno cerrado (Corte Final Z)'
                    : 'Consolidado de período')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-black font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Imprimir</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-white rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 text-neutral-800">
          {/* Shift Metadata Card */}
          {shift && (
            <div className="bg-neutral-50 rounded-xl p-3.5 sm:p-4 border border-neutral-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-[10px] text-neutral-500 font-medium uppercase block">Turno N°</span>
                <span className="font-mono font-bold text-neutral-900">{shift.shiftNumber}</span>
              </div>
              <div>
                <span className="text-[10px] text-neutral-500 font-medium uppercase block">Cajero Responsable</span>
                <span className="font-semibold text-neutral-900 truncate block">{shift.cashierName}</span>
              </div>
              <div>
                <span className="text-[10px] text-neutral-500 font-medium uppercase block">Apertura</span>
                <span className="font-mono text-neutral-800 text-[11px]">
                  {new Date(shift.openedAt).toLocaleString('es-PE', {
                    day: '2-digit',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-neutral-500 font-medium uppercase block">Estado</span>
                {shift.status === 'open' ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                    En Curso
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-neutral-700 bg-neutral-200 px-2 py-0.5 rounded-full">
                    Cerrado
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Section 1: Financial Overview */}
          <div>
            <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5" />
              Resumen de Ventas
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="bg-white p-3.5 rounded-xl border border-neutral-200 shadow-xs">
                <span className="text-[10px] text-neutral-500 font-medium uppercase block">Total Vendido</span>
                <span className="text-lg font-black text-neutral-900 font-mono">
                  S/ {totalSalesAmount.toFixed(2)}
                </span>
                <span className="text-[10px] text-neutral-400 block mt-0.5">Ingreso neto</span>
              </div>
              <div className="bg-white p-3.5 rounded-xl border border-neutral-200 shadow-xs">
                <span className="text-[10px] text-neutral-500 font-medium uppercase block">Comprobantes</span>
                <span className="text-lg font-black text-neutral-900 font-mono">
                  {totalTickets}
                </span>
                <span className="text-[10px] text-neutral-400 block mt-0.5">Tickets emitidos</span>
              </div>
              <div className="bg-white p-3.5 rounded-xl border border-neutral-200 shadow-xs col-span-2 sm:col-span-1">
                <span className="text-[10px] text-neutral-500 font-medium uppercase block">Ticket Promedio</span>
                <span className="text-lg font-black text-neutral-900 font-mono">
                  S/ {averageTicket.toFixed(2)}
                </span>
                <span className="text-[10px] text-neutral-400 block mt-0.5">Por transacción</span>
              </div>
            </div>
          </div>

          {/* Section 2: Breakdown by Payment Method */}
          <div>
            <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5" />
              Desglose por Método de Pago
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Cash */}
              <div className="bg-emerald-50/50 p-3.5 rounded-xl border border-emerald-200/80">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                    <Banknote className="w-4 h-4 text-emerald-600" />
                    Efectivo
                  </span>
                  <span className="text-[11px] font-mono font-bold text-emerald-700">
                    {totalSalesAmount > 0 ? ((cashTotal / totalSalesAmount) * 100).toFixed(0) : 0}%
                  </span>
                </div>
                <div className="text-base font-black text-neutral-900 font-mono">
                  S/ {cashTotal.toFixed(2)}
                </div>
                <div className="text-[10px] text-neutral-500 mt-1">
                  {cashCount} {cashCount === 1 ? 'operación' : 'operaciones'}
                </div>
              </div>

              {/* Digital Wallets (Yape / Plin) */}
              <div className="bg-purple-50/50 p-3.5 rounded-xl border border-purple-200/80">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-purple-950 flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4 text-purple-600" />
                    Yape / Plin
                  </span>
                  <span className="text-[11px] font-mono font-bold text-purple-700">
                    {totalSalesAmount > 0 ? ((walletTotal / totalSalesAmount) * 100).toFixed(0) : 0}%
                  </span>
                </div>
                <div className="text-base font-black text-neutral-900 font-mono">
                  S/ {walletTotal.toFixed(2)}
                </div>
                <div className="text-[10px] text-neutral-500 mt-1">
                  {walletCount} {walletCount === 1 ? 'operación' : 'operaciones'}
                </div>
              </div>

              {/* Cards */}
              <div className="bg-blue-50/50 p-3.5 rounded-xl border border-blue-200/80">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-blue-950 flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4 text-blue-600" />
                    Tarjetas (POS)
                  </span>
                  <span className="text-[11px] font-mono font-bold text-blue-700">
                    {totalSalesAmount > 0 ? ((cardTotal / totalSalesAmount) * 100).toFixed(0) : 0}%
                  </span>
                </div>
                <div className="text-base font-black text-neutral-900 font-mono">
                  S/ {cardTotal.toFixed(2)}
                </div>
                <div className="text-[10px] text-neutral-500 mt-1">
                  {cardCount} {cardCount === 1 ? 'operación' : 'operaciones'}
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Cash Drawer Balance (Arqueo Ciego Anti-Robo de Efectivo Físico) */}
          {shift && (
            <div className="bg-neutral-900 text-white rounded-2xl p-4 sm:p-5 border border-neutral-800 space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg border border-emerald-500/30">
                    <Banknote className="w-4 h-4" />
                  </span>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-200">
                      Acta de Arqueo Ciego de Gaveta
                    </h4>
                    <span className="text-[10px] text-neutral-400">Auditoría Anti-Robo & Cero Pérdidas</span>
                  </div>
                </div>
                {shift.isBlindAudit && (
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Protocolo Ciego
                  </span>
                )}
              </div>

              <div className="space-y-2 text-xs divide-y divide-neutral-800 font-mono">
                <div className="flex justify-between items-center py-1">
                  <span className="text-neutral-400 font-sans">Fondo Inicial de Apertura:</span>
                  <span className="font-bold">S/ {initialCash.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-neutral-400 font-sans">(+) Ventas Cobradas en Efectivo:</span>
                  <span className="font-bold text-emerald-400">+ S/ {cashTotal.toFixed(2)}</span>
                </div>
                {totalInflows > 0 && (
                  <div className="flex justify-between items-center py-1">
                    <span className="text-neutral-400 font-sans">(+) Entradas / Sencillo en Caja Chica:</span>
                    <span className="font-bold text-emerald-400">+ S/ {totalInflows.toFixed(2)}</span>
                  </div>
                )}
                {totalOutflows > 0 && (
                  <div className="flex justify-between items-center py-1">
                    <span className="text-neutral-400 font-sans">(-) Salidas / Gastos de Caja Chica:</span>
                    <span className="font-bold text-rose-400">- S/ {totalOutflows.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center py-1.5 text-sm font-bold bg-neutral-800/60 px-2.5 rounded-lg">
                  <span className="text-neutral-200 font-sans">(=) Total Efectivo Esperado por Sistema:</span>
                  <span className="text-emerald-400 font-mono text-base">S/ {expectedCashInDrawer.toFixed(2)}</span>
                </div>

                {shift.status === 'closed' && shift.finalCashCounted !== undefined && (
                  <>
                    <div className="flex justify-between items-center py-1 text-neutral-300">
                      <span className="font-sans">Efectivo Físico Declarado por Cajero:</span>
                      <span className="font-bold text-white text-sm">S/ {shift.finalCashCounted.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center py-1.5 text-sm font-black">
                      <span className="font-sans">Resultado del Cuadre:</span>
                      <span
                        className={
                          (shift.difference || 0) === 0
                            ? 'text-emerald-400'
                            : (shift.difference || 0) > 0
                            ? 'text-blue-400'
                            : 'text-rose-400'
                        }
                      >
                        {(shift.difference || 0) === 0
                          ? 'S/ 0.00 (Cuadre Exacto - Cero Pérdidas)'
                          : `${(shift.difference || 0) > 0 ? '+ S/' : '- S/'} ${Math.abs(shift.difference || 0).toFixed(2)} (${(shift.difference || 0) > 0 ? 'Sobrante en Custodia' : 'Faltante en Caja'})`}
                      </span>
                    </div>
                    {shift.discrepancyReason && (
                      <div className="pt-2 text-[11px] text-neutral-300 font-sans bg-neutral-800/40 p-2.5 rounded-lg">
                        <strong className="text-neutral-200 block mb-0.5">Justificación de Auditoría:</strong>
                        <span>{shift.discrepancyReason}</span>
                        {shift.supervisorName && (
                          <span className="block mt-1 text-[10px] text-neutral-400">
                            Validado por supervisor: <strong>{shift.supervisorName}</strong>
                          </span>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Movements history if any */}
              {shiftMovements.length > 0 && (
                <div className="pt-2 border-t border-neutral-800 space-y-1.5">
                  <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">
                    Movimientos de Caja Chica Registrados ({shiftMovements.length})
                  </span>
                  <div className="space-y-1">
                    {shiftMovements.map((m) => (
                      <div
                        key={m.id}
                        className="flex items-center justify-between text-[11px] py-1 px-2 rounded-lg bg-neutral-800/50"
                      >
                        <span className="text-neutral-300 flex items-center gap-1.5 truncate">
                          {m.type === 'inflow' ? (
                            <ArrowDownRight className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          ) : (
                            <ArrowUpRight className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                          )}
                          <span className="truncate">{m.reason}</span>
                        </span>
                        <span
                          className={`font-mono font-bold shrink-0 ${
                            m.type === 'inflow' ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {m.type === 'inflow' ? '+' : '-'} S/ {m.amount.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Section 4: Consolidated Sold Products */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5" />
                Productos Vendidos en el Turno ({consolidatedProducts.length} productos / {totalUnitsSold} unidades)
              </h3>
            </div>

            {consolidatedProducts.length === 0 ? (
              <div className="p-6 bg-neutral-50 rounded-xl text-center text-xs text-neutral-500 border border-neutral-200">
                No se registraron productos vendidos en este turno o sesión.
              </div>
            ) : (
              <div className="border border-neutral-200 rounded-xl overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-neutral-100 border-b border-neutral-200 text-neutral-700 font-bold uppercase text-[10px]">
                      <th className="py-2.5 px-3">#</th>
                      <th className="py-2.5 px-3">Producto</th>
                      <th className="py-2.5 px-3 text-center">Cant.</th>
                      <th className="py-2.5 px-3 text-right">P. Unit</th>
                      <th className="py-2.5 px-3 text-right">Total (S/)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {consolidatedProducts.map((p, idx) => (
                      <tr key={p.productId} className="hover:bg-neutral-50">
                        <td className="py-2 px-3 text-neutral-400 font-mono text-[11px]">{idx + 1}</td>
                        <td className="py-2 px-3">
                          <p className="font-bold text-neutral-900 leading-tight">{p.productName}</p>
                          <span className="text-[10px] text-neutral-400 font-mono">{p.sku}</span>
                        </td>
                        <td className="py-2 px-3 text-center font-bold text-neutral-800 font-mono">
                          {p.quantity}
                        </td>
                        <td className="py-2 px-3 text-right font-mono text-neutral-600">
                          S/ {p.unitPrice.toFixed(2)}
                        </td>
                        <td className="py-2 px-3 text-right font-black font-mono text-neutral-950">
                          S/ {p.total.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-neutral-50 border-t border-neutral-200 font-bold text-neutral-900 text-xs">
                      <td colSpan={2} className="py-2.5 px-3 text-right">
                        Totales:
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono font-black">
                        {totalUnitsSold} unid.
                      </td>
                      <td></td>
                      <td className="py-2.5 px-3 text-right font-mono font-black text-emerald-700 text-sm">
                        S/ {totalSalesAmount.toFixed(2)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-neutral-100 border-t border-neutral-200 flex items-center justify-between shrink-0">
          <p className="text-[11px] text-neutral-500">
            Reporte generado: {new Date().toLocaleTimeString('es-PE')}
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-neutral-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            Cerrar Resumen
          </button>
        </div>
      </div>
    </div>
  );
};
