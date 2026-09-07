import React, { useState } from 'react';
import { usePos } from '../../context/PosContext';
import { CashClosureModal } from './CashClosureModal';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Award,
  Calculator,
  Calendar,
  Download,
  Percent,
  Banknote,
  CreditCard,
  Smartphone,
} from 'lucide-react';

export const ReportesModule: React.FC = () => {
  const { sales, products, categories } = usePos();

  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month' | 'all'>('month');
  const [showClosureModal, setShowClosureModal] = useState(false);

  // Time calculations
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).getTime();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

  const filteredSales = sales.filter((s) => {
    const time = new Date(s.date).getTime();
    if (timeRange === 'today') return time >= startOfToday;
    if (timeRange === 'week') return time >= startOfWeek;
    if (timeRange === 'month') return time >= startOfMonth;
    return true;
  });

  // Calculate Key Metrics
  let totalRevenue = 0;
  let totalDiscount = 0;
  let estimatedProfit = 0;

  // Payment breakdown
  let cashSum = 0;
  let cardSum = 0;
  let walletSum = 0;

  // Top products calculation map
  const productStats: Record<
    string,
    { name: string; sku: string; quantity: number; revenue: number; profit: number }
  > = {};

  filteredSales.forEach((sale) => {
    totalRevenue += sale.total;
    totalDiscount += sale.discountTotal;

    sale.payments.forEach((p) => {
      if (p.method === 'cash') cashSum += p.amount;
      else if (p.method === 'card') cardSum += p.amount;
      else if (p.method === 'wallet') walletSum += p.amount;
    });

    sale.items.forEach((item) => {
      const itemRevenue = item.subtotal;
      const itemCost = item.purchasePrice * item.quantity;
      const itemProfit = itemRevenue - itemCost;
      estimatedProfit += itemProfit;

      if (!productStats[item.productId]) {
        productStats[item.productId] = {
          name: item.productName,
          sku: item.sku,
          quantity: 0,
          revenue: 0,
          profit: 0,
        };
      }
      productStats[item.productId].quantity += item.quantity;
      productStats[item.productId].revenue += itemRevenue;
      productStats[item.productId].profit += itemProfit;
    });
  });

  const transactionCount = filteredSales.length;
  const avgTicket = transactionCount > 0 ? totalRevenue / transactionCount : 0;

  // Sorted Top Products
  const topProductsList = Object.values(productStats)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  const maxTopQty = topProductsList[0]?.quantity || 1;

  // Daily breakdown chart data (last 7 days)
  const daysMap: Record<string, number> = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const key = d.toLocaleDateString('es-PE', { weekday: 'short', day: '2-digit' });
    daysMap[key] = 0;
  }

  filteredSales.forEach((s) => {
    const dKey = new Date(s.date).toLocaleDateString('es-PE', { weekday: 'short', day: '2-digit' });
    if (daysMap[dKey] !== undefined) {
      daysMap[dKey] += s.total;
    }
  });

  const chartEntries = Object.entries(daysMap);
  const maxChartVal = Math.max(...Object.values(daysMap), 10);

  // CSV Export
  const handleExportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,Ticket,Fecha,Cajero,Cliente,Total,MetodoPago\n';
    filteredSales.forEach((s) => {
      const methods = s.payments.map((p) => p.method).join(';');
      csvContent += `${s.ticketNumber},${new Date(s.date).toLocaleString('es-PE')},${s.cashierName},${s.customerName || 'Contado'},${s.total.toFixed(2)},${methods}\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `reporte_ventas_${timeRange}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs">
        <div>
          <h1 className="text-xl font-black text-neutral-900 tracking-tight uppercase">
            Reportes & Analítica de Ventas
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Métricas de ingresos, utilidad estimada, cierre de caja y productos top
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Period selector */}
          <div className="bg-neutral-100 p-1 rounded-xl flex items-center gap-1 border border-neutral-300 text-xs">
            {(
              [
                { id: 'today', label: 'Hoy' },
                { id: 'week', label: 'Esta Semana' },
                { id: 'month', label: 'Este Mes' },
                { id: 'all', label: 'Todo' },
              ] as const
            ).map((p) => (
              <button
                key={p.id}
                onClick={() => setTimeRange(p.id)}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  timeRange === p.id
                    ? 'bg-black text-white shadow-xs'
                    : 'text-neutral-600 hover:text-black'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowClosureModal(true)}
            className="py-2.5 px-3.5 bg-black hover:bg-neutral-800 text-white rounded-xl font-bold text-xs shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Calculator className="w-4 h-4 text-white" />
            <span>Cierre de Caja</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="py-2.5 px-3.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border border-neutral-300 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
            title="Exportar reporte a CSV"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Exportar CSV</span>
          </button>
        </div>
      </div>

      {/* METRIC CARDS (4 Columns) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Total Vendido</span>
            <div className="w-9 h-9 rounded-xl bg-neutral-100 text-neutral-900 flex items-center justify-center font-bold border border-neutral-200">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-neutral-950 tracking-tight font-mono">
            S/ {totalRevenue.toFixed(2)}
          </div>
          <p className="text-[11px] text-neutral-700 font-bold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> En {transactionCount} ventas realizadas
          </p>
        </div>

        {/* Estimated Profit */}
        <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Ganancia Estimada</span>
            <div className="w-9 h-9 rounded-xl bg-neutral-100 text-neutral-900 flex items-center justify-center font-bold border border-neutral-200">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-neutral-950 tracking-tight font-mono">
            S/ {estimatedProfit.toFixed(2)}
          </div>
          <p className="text-[11px] text-neutral-500 font-medium">
            (Precio Venta - Precio Compra)
          </p>
        </div>

        {/* Total Transactions */}
        <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">N° Transacciones</span>
            <div className="w-9 h-9 rounded-xl bg-neutral-100 text-neutral-900 flex items-center justify-center font-bold border border-neutral-200">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-neutral-950 tracking-tight font-mono">
            {transactionCount}
          </div>
          <p className="text-[11px] text-neutral-500 font-medium">
            Tickets emitidos en el periodo
          </p>
        </div>

        {/* Average Ticket */}
        <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Ticket Promedio</span>
            <div className="w-9 h-9 rounded-xl bg-neutral-100 text-neutral-900 flex items-center justify-center font-bold border border-neutral-200">
              <Percent className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-neutral-950 tracking-tight font-mono">
            S/ {avgTicket.toFixed(2)}
          </div>
          <p className="text-[11px] text-neutral-500 font-medium">
            Promedio gastado por compra
          </p>
        </div>
      </div>

      {/* CHARTS & ANALYTICS ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Trend Bar Chart (2 cols) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-neutral-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-black text-sm text-neutral-900 uppercase tracking-tight">Evolución de Ventas por Día</h3>
              <p className="text-xs text-neutral-500">Monto total vendido en los últimos 7 días</p>
            </div>
          </div>

          {/* SVG Custom Responsive Bar Chart */}
          <div className="h-56 flex items-end gap-3 pt-6 pb-2 px-2 border-b border-neutral-200">
            {chartEntries.map(([label, val], idx) => {
              const heightPercent = maxChartVal > 0 ? (val / maxChartVal) * 100 : 0;
              return (
                <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group">
                  <span className="text-[10px] font-bold text-neutral-900 opacity-0 group-hover:opacity-100 transition-opacity mb-1 font-mono">
                    S/ {val.toFixed(0)}
                  </span>
                  <div
                    style={{ height: `${Math.max(6, heightPercent)}%` }}
                    className="w-full max-w-[40px] bg-neutral-900 hover:bg-neutral-700 rounded-t-md transition-all duration-200 relative border border-black"
                  />
                  <span className="text-[11px] font-bold text-neutral-600 mt-2 truncate w-full text-center capitalize">
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Payment Methods Breakdown (1 col) */}
        <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="font-black text-sm text-neutral-900 uppercase tracking-tight">Ventas por Medio de Pago</h3>
            <p className="text-xs text-neutral-500 mt-0.5">Distribución de ingresos recopilados</p>
          </div>

          <div className="space-y-3.5">
            {/* Cash */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-neutral-800">
                  <Banknote className="w-4 h-4 text-neutral-900" /> Efectivo
                </span>
                <span className="font-mono font-bold text-neutral-950">S/ {cashSum.toFixed(2)}</span>
              </div>
              <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden border border-neutral-200">
                <div
                  style={{ width: `${totalRevenue > 0 ? (cashSum / totalRevenue) * 100 : 0}%` }}
                  className="h-full bg-black"
                />
              </div>
            </div>

            {/* Card */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-neutral-800">
                  <CreditCard className="w-4 h-4 text-neutral-700" /> Tarjeta
                </span>
                <span className="font-mono font-bold text-neutral-950">S/ {cardSum.toFixed(2)}</span>
              </div>
              <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden border border-neutral-200">
                <div
                  style={{ width: `${totalRevenue > 0 ? (cardSum / totalRevenue) * 100 : 0}%` }}
                  className="h-full bg-neutral-600"
                />
              </div>
            </div>

            {/* Wallet */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-neutral-800">
                  <Smartphone className="w-4 h-4 text-neutral-700" /> Yape / Plin
                </span>
                <span className="font-mono font-bold text-neutral-950">S/ {walletSum.toFixed(2)}</span>
              </div>
              <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden border border-neutral-200">
                <div
                  style={{ width: `${totalRevenue > 0 ? (walletSum / totalRevenue) * 100 : 0}%` }}
                  className="h-full bg-neutral-400"
                />
              </div>
            </div>
          </div>

          <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-center text-xs text-neutral-700">
            <span>Total Recaudado: </span>
            <span className="font-bold text-neutral-950 font-mono">S/ {totalRevenue.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* TOP SELLING PRODUCTS */}
      <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-neutral-900" />
            <div>
              <h3 className="font-black text-sm text-neutral-900 uppercase tracking-tight">Productos Más Vendidos</h3>
              <p className="text-xs text-neutral-500">Ranking por volumen de unidades vendidas</p>
            </div>
          </div>
        </div>

        {topProductsList.length === 0 ? (
          <div className="p-8 text-center text-xs text-neutral-400">
            No hay suficientes ventas registradas en este periodo.
          </div>
        ) : (
          <div className="space-y-3">
            {topProductsList.map((prod, idx) => {
              const widthPct = (prod.quantity / maxTopQty) * 100;
              return (
                <div
                  key={idx}
                  className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200 flex flex-col md:flex-row md:items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs shrink-0 ${
                        idx === 0
                          ? 'bg-black text-white'
                          : idx === 1
                          ? 'bg-neutral-800 text-white'
                          : idx === 2
                          ? 'bg-neutral-600 text-white'
                          : 'bg-neutral-300 text-neutral-900'
                      }`}
                    >
                      #{idx + 1}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-xs text-neutral-900 truncate">{prod.name}</h4>
                      <p className="text-[10px] text-neutral-500 font-mono">SKU: {prod.sku}</p>

                      {/* Progress bar */}
                      <div className="w-full h-1.5 bg-neutral-200 rounded-full mt-1.5 overflow-hidden">
                        <div
                          style={{ width: `${widthPct}%` }}
                          className="h-full bg-black rounded-full"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 text-xs text-right shrink-0">
                    <div>
                      <span className="text-[10px] text-neutral-500 block font-semibold uppercase">Vendidos</span>
                      <span className="font-bold text-neutral-900 font-mono">{prod.quantity} unidades</span>
                    </div>

                    <div>
                      <span className="text-[10px] text-neutral-500 block font-semibold uppercase">Ingreso</span>
                      <span className="font-black text-neutral-950 font-mono">S/ {prod.revenue.toFixed(2)}</span>
                    </div>

                    <div>
                      <span className="text-[10px] text-neutral-500 block font-semibold uppercase">Ganancia</span>
                      <span className="font-bold text-neutral-800 font-mono">S/ {prod.profit.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Cash Closure Modal */}
      {showClosureModal && <CashClosureModal onClose={() => setShowClosureModal(false)} />}
    </div>
  );
};
