import React, { useState, useMemo } from 'react';
import { usePos } from '../../context/PosContext';
import { Sale, SaleItem, CashShift } from '../../types';
import { ReceiptModal } from './ReceiptModal';
import { ShiftSummaryModal } from './ShiftSummaryModal';
import { OpenShiftModal } from './OpenShiftModal';
import { CloseShiftModal } from './CloseShiftModal';
import {
  Search,
  Calendar,
  User,
  Printer,
  Eye,
  FileText,
  Clock,
  Banknote,
  Smartphone,
  CreditCard,
  Package,
  TrendingUp,
  Receipt,
  Lock,
  Unlock,
  PlusCircle,
  BarChart3,
  Layers,
  ChevronDown,
  Activity,
  CheckCircle2,
} from 'lucide-react';

export const MisVentasView: React.FC = () => {
  const { sales, shifts, activeShift, currentUser } = usePos();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);

  // Filter mode: 'today' (real-time daily) | 'shift' (cash drawer session) | 'all' (full history)
  const [scopeFilter, setScopeFilter] = useState<'today' | 'shift' | 'all'>('today');

  // Shift selection state: 'active' | 'all' | specific shift id
  const [selectedShiftId, setSelectedShiftId] = useState<string>(() => {
    if (activeShift) return activeShift.id;
    if (shifts.length > 0) return shifts[0].id;
    return 'all';
  });

  // Active view tab: 'tickets' | 'products'
  const [activeTab, setActiveTab] = useState<'tickets' | 'products'>('tickets');

  // Modals
  const [showShiftSummaryModal, setShowShiftSummaryModal] = useState(false);
  const [showOpenShiftModal, setShowOpenShiftModal] = useState(false);
  const [shiftToClose, setShiftToClose] = useState<CashShift | null>(null);

  // Target shift object
  const currentSelectedShift = useMemo(() => {
    if (selectedShiftId === 'all') return null;
    return shifts.find((s) => s.id === selectedShiftId) || null;
  }, [selectedShiftId, shifts]);

  // Helper to check if a date is today
  const isToday = (isoDate: string) => {
    const d = new Date(isoDate);
    const now = new Date();
    return (
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate()
    );
  };

  // Real-time today's sales across system / user
  const todaySales = useMemo(() => {
    let list = sales.filter((s) => isToday(s.date));
    if (currentUser?.role === 'cajero') {
      list = list.filter((s) => s.cashierId === currentUser.id);
    }
    return list;
  }, [sales, currentUser]);

  const todayTotalRevenue = useMemo(() => {
    return todaySales.reduce((sum, s) => sum + s.total, 0);
  }, [todaySales]);

  // Filter sales based on user permissions AND scope filter
  const userSales = useMemo(() => {
    let list = sales;
    if (currentUser?.role === 'cajero') {
      list = list.filter((s) => s.cashierId === currentUser.id);
    }

    if (scopeFilter === 'today') {
      list = list.filter((s) => isToday(s.date));
    } else if (scopeFilter === 'shift') {
      if (selectedShiftId !== 'all') {
        list = list.filter((s) => s.shiftId === selectedShiftId);
      }
    }
    return list;
  }, [sales, currentUser, scopeFilter, selectedShiftId]);

  // Filter sales by search term
  const filteredSales = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return userSales;

    return userSales.filter((sale) => {
      return (
        sale.ticketNumber.toLowerCase().includes(term) ||
        (sale.customerName && sale.customerName.toLowerCase().includes(term)) ||
        sale.items.some(
          (i) =>
            i.productName.toLowerCase().includes(term) ||
            i.sku.toLowerCase().includes(term)
        )
      );
    });
  }, [userSales, searchTerm]);

  // Consolidated products sold in this shift/selection
  const consolidatedProducts = useMemo(() => {
    const map: Record<
      string,
      {
        productId: string;
        productName: string;
        sku: string;
        quantity: number;
        unitPrice: number;
        total: number;
      }
    > = {};

    userSales.forEach((sale) => {
      sale.items.forEach((item: SaleItem) => {
        if (!map[item.productId]) {
          map[item.productId] = {
            productId: item.productId,
            productName: item.productName,
            sku: item.sku,
            quantity: 0,
            unitPrice: item.unitPrice,
            total: 0,
          };
        }
        map[item.productId].quantity += item.quantity;
        map[item.productId].total += item.subtotal;
      });
    });

    let list = Object.values(map).sort((a, b) => b.total - a.total);

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.productName.toLowerCase().includes(term) ||
          p.sku.toLowerCase().includes(term)
      );
    }

    return list;
  }, [userSales, searchTerm]);

  // Payment Breakdown Calculations
  const paymentSummary = useMemo(() => {
    let cash = 0;
    let cashCount = 0;
    let card = 0;
    let cardCount = 0;
    let wallet = 0;
    let walletCount = 0;

    userSales.forEach((sale) => {
      sale.payments.forEach((p) => {
        if (p.method === 'cash') {
          cash += p.amount;
          cashCount += 1;
        } else if (p.method === 'card') {
          card += p.amount;
          cardCount += 1;
        } else if (p.method === 'wallet') {
          wallet += p.amount;
          walletCount += 1;
        }
      });
    });

    const total = userSales.reduce((sum, s) => sum + s.total, 0);

    return {
      cash,
      cashCount,
      cashPercent: total > 0 ? (cash / total) * 100 : 0,
      card,
      cardCount,
      cardPercent: total > 0 ? (card / total) * 100 : 0,
      wallet,
      walletCount,
      walletPercent: total > 0 ? (wallet / total) * 100 : 0,
      total,
      ticketsCount: userSales.length,
      averageTicket: userSales.length > 0 ? total / userSales.length : 0,
    };
  }, [userSales]);

  // Expected drawer balance
  const initialCash = useMemo(() => {
    if (scopeFilter === 'shift') {
      return currentSelectedShift ? currentSelectedShift.initialCash : 0;
    }
    if (scopeFilter === 'today') {
      return activeShift ? activeShift.initialCash : 0;
    }
    return 0;
  }, [scopeFilter, currentSelectedShift, activeShift]);

  const expectedCashInDrawer = initialCash + paymentSummary.cash;
  const totalUnitsSold = consolidatedProducts.reduce((sum, p) => sum + p.quantity, 0);

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Header & Turno Filter Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-neutral-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-neutral-900 tracking-tight uppercase">
                {currentUser?.role === 'cajero' ? 'Mis Ventas y Turnos' : 'Gestión de Ventas por Turno'}
              </h1>
              {activeShift ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Caja Abierta ({activeShift.shiftNumber})
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-neutral-100 text-neutral-700 border border-neutral-300">
                  <Lock className="w-3 h-3 text-neutral-500" />
                  Caja Cerrada
                </span>
              )}
            </div>
            <p className="text-xs text-neutral-500 mt-0.5">
              Consulta de ventas diarias en tiempo real, sesiones de apertura de caja y productos despachados
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {/* View / Print Full Report (Corte) */}
            <button
              onClick={() => setShowShiftSummaryModal(true)}
              className="px-3.5 py-2 bg-neutral-900 hover:bg-black text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              title="Ver o imprimir reporte de ventas / corte de caja"
            >
              <Receipt className="w-4 h-4 text-emerald-400" />
              <span>
                {scopeFilter === 'today'
                  ? 'Ver Reporte del Día (Corte)'
                  : scopeFilter === 'shift'
                  ? 'Ver Corte de Turno'
                  : 'Ver Reporte Consolidado'}
              </span>
            </button>

            {/* Close Shift if active */}
            {activeShift && (
              <button
                onClick={() => setShiftToClose(activeShift)}
                className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Cerrar sesión de caja y realizar arqueo"
              >
                <Lock className="w-4 h-4 text-rose-600" />
                <span>Cerrar Turno de Caja</span>
              </button>
            )}

            {/* Open New Shift button if no active shift */}
            {!activeShift && (
              <button
                onClick={() => setShowOpenShiftModal(true)}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                title="Iniciar una nueva sesión de apertura de caja con fondo inicial"
              >
                <Unlock className="w-4 h-4" />
                <span>Abrir Turno de Caja</span>
              </button>
            )}
          </div>
        </div>

        {/* Scope Filter Selector (Hoy en Tiempo Real vs Por Turno vs Histórico) */}
        <div className="pt-3 border-t border-neutral-100 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            {/* Tab 1: Hoy en tiempo real */}
            <button
              onClick={() => setScopeFilter('today')}
              className={`px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer ${
                scopeFilter === 'today'
                  ? 'bg-neutral-950 text-white shadow-xs'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              <Activity
                className={`w-3.5 h-3.5 ${
                  scopeFilter === 'today' ? 'text-emerald-400 animate-pulse' : 'text-emerald-600'
                }`}
              />
              <span>Venta Diaria de Hoy (En Vivo)</span>
              <span
                className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${
                  scopeFilter === 'today'
                    ? 'bg-neutral-800 text-emerald-300'
                    : 'bg-neutral-200 text-neutral-800'
                }`}
              >
                S/ {todayTotalRevenue.toFixed(2)} ({todaySales.length})
              </span>
            </button>

            {/* Tab 2: Por Turno de Caja */}
            <button
              onClick={() => setScopeFilter('shift')}
              className={`px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer ${
                scopeFilter === 'shift'
                  ? 'bg-neutral-950 text-white shadow-xs'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-blue-500" />
              <span>Por Turno de Caja</span>
              <span
                className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${
                  scopeFilter === 'shift'
                    ? 'bg-neutral-800 text-blue-300'
                    : 'bg-neutral-200 text-neutral-800'
                }`}
              >
                {shifts.length} turnos
              </span>
            </button>

            {/* Tab 3: Todas las Ventas */}
            <button
              onClick={() => setScopeFilter('all')}
              className={`px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer ${
                scopeFilter === 'all'
                  ? 'bg-neutral-950 text-white shadow-xs'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-purple-500" />
              <span>Histórico Completo</span>
              <span
                className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${
                  scopeFilter === 'all'
                    ? 'bg-neutral-800 text-purple-300'
                    : 'bg-neutral-200 text-neutral-800'
                }`}
              >
                {sales.length}
              </span>
            </button>
          </div>

          {/* Sub-bar based on scopeFilter */}
          {scopeFilter === 'today' && (
            <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
              <div className="flex items-center gap-2 text-emerald-950 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <span>
                  <strong>Monitoreo en Tiempo Real:</strong> Mostrando ventas de hoy ({new Date().toLocaleDateString('es-PE', { weekday: 'long', day: '2-digit', month: 'long' })}).
                </span>
              </div>
              <div className="flex items-center gap-3 text-neutral-600 text-[11px] font-mono">
                {activeShift ? (
                  <span>
                    Turno Activo: <strong className="text-emerald-800 font-sans">{activeShift.shiftNumber}</strong> ({activeShift.cashierName})
                  </span>
                ) : (
                  <span className="text-rose-700 font-bold">
                    No hay turno de caja abierto en este momento
                  </span>
                )}
              </div>
            </div>
          )}

          {scopeFilter === 'shift' && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-2.5 flex-1 max-w-xl">
                <span className="text-xs font-bold text-neutral-600 uppercase tracking-wider shrink-0 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-neutral-400" />
                  Seleccionar Turno:
                </span>
                <div className="relative flex-1">
                  <select
                    value={selectedShiftId}
                    onChange={(e) => setSelectedShiftId(e.target.value)}
                    className="w-full pl-3 pr-8 py-2 bg-neutral-50 hover:bg-neutral-100 border border-neutral-300 rounded-xl text-xs font-bold text-neutral-900 cursor-pointer focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                  >
                    {activeShift && (
                      <option value={activeShift.id}>
                        🟢 Turno Actual ({activeShift.shiftNumber}) — {activeShift.cashierName} (Abierto)
                      </option>
                    )}
                    <option value="all">📁 Todos los turnos (Consolidado)</option>
                    {shifts
                      .filter((s) => !activeShift || s.id !== activeShift.id)
                      .map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.shiftNumber} — {s.cashierName} ({new Date(s.openedAt).toLocaleDateString('es-PE', { day: '2-digit', month: 'short' })}) [{s.status === 'open' ? 'Abierto' : 'Cerrado'}]
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              {/* Quick Shift Status Tag */}
              {currentSelectedShift && (
                <div className="text-xs text-neutral-500 flex items-center gap-2 font-mono">
                  <span>Apertura: {new Date(currentSelectedShift.openedAt).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}</span>
                  <span>•</span>
                  <span>Fondo Inicial: <strong className="text-neutral-900">S/ {currentSelectedShift.initialCash.toFixed(2)}</strong></span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* KPI Cards: Shift Totals Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Sold */}
        <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-xs">
          <div className="flex items-center justify-between text-neutral-400 mb-1">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-neutral-500">
              Total Vendido
            </span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-neutral-950 font-mono">
            S/ {paymentSummary.total.toFixed(2)}
          </p>
          <span className="text-[11px] text-neutral-500 mt-0.5 block">
            {paymentSummary.ticketsCount} tickets emitidos
          </span>
        </div>

        {/* Expected Cash in Drawer */}
        <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-xs">
          <div className="flex items-center justify-between text-neutral-400 mb-1">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-neutral-500">
              Efectivo en Gaveta
            </span>
            <Banknote className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-emerald-600 font-mono">
            S/ {expectedCashInDrawer.toFixed(2)}
          </p>
          <span className="text-[11px] text-neutral-500 mt-0.5 block">
            Fondo S/ {initialCash.toFixed(2)} + Ventas S/ {paymentSummary.cash.toFixed(2)}
          </span>
        </div>

        {/* Average Ticket */}
        <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-xs">
          <div className="flex items-center justify-between text-neutral-400 mb-1">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-neutral-500">
              Ticket Promedio
            </span>
            <BarChart3 className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-neutral-950 font-mono">
            S/ {paymentSummary.averageTicket.toFixed(2)}
          </p>
          <span className="text-[11px] text-neutral-500 mt-0.5 block">
            Por comprobante
          </span>
        </div>

        {/* Items Sold */}
        <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-xs">
          <div className="flex items-center justify-between text-neutral-400 mb-1">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-neutral-500">
              Unidades Vendidas
            </span>
            <Package className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-neutral-950 font-mono">
            {totalUnitsSold} unid.
          </p>
          <span className="text-[11px] text-neutral-500 mt-0.5 block">
            {consolidatedProducts.length} productos distintos
          </span>
        </div>
      </div>

      {/* Summary by Payment Method (Requested explicitly by user) */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-neutral-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-neutral-700 uppercase tracking-wider flex items-center gap-1.5">
            <Banknote className="w-4 h-4 text-emerald-600" />
            Resumen de lo Vendido por Método de Pago
          </h2>
          <span className="text-xs font-mono font-bold text-neutral-500">
            Total: S/ {paymentSummary.total.toFixed(2)}
          </span>
        </div>

        {/* 3 Payment Columns */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Efectivo */}
          <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-neutral-900 flex items-center gap-1.5">
                <Banknote className="w-4 h-4 text-emerald-600" />
                Efectivo
              </span>
              <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                {paymentSummary.cashPercent.toFixed(1)}%
              </span>
            </div>
            <div className="text-lg font-black text-neutral-950 font-mono">
              S/ {paymentSummary.cash.toFixed(2)}
            </div>
            <div className="w-full bg-neutral-200 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${paymentSummary.cashPercent}%` }}
              />
            </div>
            <span className="text-[10px] text-neutral-500 block">
              {paymentSummary.cashCount} transacciones en efectivo
            </span>
          </div>

          {/* Yape / Plin */}
          <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-neutral-900 flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-purple-600" />
                Yape / Plin
              </span>
              <span className="font-mono font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
                {paymentSummary.walletPercent.toFixed(1)}%
              </span>
            </div>
            <div className="text-lg font-black text-neutral-950 font-mono">
              S/ {paymentSummary.wallet.toFixed(2)}
            </div>
            <div className="w-full bg-neutral-200 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-purple-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${paymentSummary.walletPercent}%` }}
              />
            </div>
            <span className="text-[10px] text-neutral-500 block">
              {paymentSummary.walletCount} transacciones billetera
            </span>
          </div>

          {/* Tarjetas */}
          <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-neutral-900 flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-blue-600" />
                Tarjetas (POS)
              </span>
              <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                {paymentSummary.cardPercent.toFixed(1)}%
              </span>
            </div>
            <div className="text-lg font-black text-neutral-950 font-mono">
              S/ {paymentSummary.card.toFixed(2)}
            </div>
            <div className="w-full bg-neutral-200 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-blue-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${paymentSummary.cardPercent}%` }}
              />
            </div>
            <span className="text-[10px] text-neutral-500 block">
              {paymentSummary.cardCount} transacciones tarjeta
            </span>
          </div>
        </div>
      </div>

      {/* Tabs & Search Filter */}
      <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Navigation Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-neutral-100 rounded-xl border border-neutral-200">
            <button
              onClick={() => setActiveTab('tickets')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'tickets'
                  ? 'bg-white text-neutral-950 shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>Tickets de Venta ({userSales.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'products'
                  ? 'bg-white text-neutral-950 shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>Productos Vendidos ({consolidatedProducts.length})</span>
            </button>
          </div>

          {/* Search Input */}
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={
                activeTab === 'tickets'
                  ? 'Buscar por ticket, cliente o producto...'
                  : 'Buscar producto por nombre o SKU...'
              }
              className="w-full pl-10 pr-4 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-xs font-medium text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* Main Content: Tickets View vs Products Sold View */}
      {activeTab === 'tickets' ? (
        /* TAB 1: TICKETS / COMPROBANTES */
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs overflow-hidden">
          {filteredSales.length === 0 ? (
            <div className="p-12 text-center text-neutral-400 space-y-2">
              <FileText className="w-10 h-10 mx-auto text-neutral-300" />
              <p className="font-bold text-sm text-neutral-700">No se encontraron tickets en esta selección</p>
              <p className="text-xs text-neutral-500">
                Cambia el filtro de turno o realiza ventas desde el módulo de Punto de Venta.
              </p>
            </div>
          ) : (
            <>
              {/* Mobile Card List (< sm) */}
              <div className="sm:hidden divide-y divide-neutral-200">
                {filteredSales.map((sale) => (
                  <div key={sale.id} className="p-4 space-y-3 bg-white">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="font-mono text-xs font-black text-neutral-950 bg-neutral-100 px-2 py-0.5 rounded border border-neutral-200">
                          {sale.ticketNumber}
                        </span>
                        <p className="text-[11px] text-neutral-500 font-mono mt-1">
                          {new Date(sale.date).toLocaleString('es-PE', {
                            day: '2-digit',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-neutral-500 block">Total:</span>
                        <span className="text-base font-black text-emerald-600 font-mono">
                          S/ {sale.total.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <div className="text-xs text-neutral-700 space-y-1">
                      <div className="flex justify-between">
                        <span className="text-neutral-500">Cliente:</span>
                        <span className="font-medium text-neutral-900">
                          {sale.customerName || 'Cliente Contado'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-500">Cajero:</span>
                        <span className="font-medium text-neutral-800">{sale.cashierName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-500">Método de Pago:</span>
                        <span className="font-medium text-neutral-800 uppercase text-[11px]">
                          {sale.payments.map((p) => p.method).join(', ')}
                        </span>
                      </div>
                      <p className="text-neutral-600 line-clamp-2 pt-1 text-[11px]">
                        {sale.items.map((i) => `${i.quantity}x ${i.productName}`).join(', ')}
                      </p>
                    </div>

                    <button
                      onClick={() => setSelectedSale(sale)}
                      className="w-full py-2 px-3 bg-neutral-100 hover:bg-neutral-200 active:bg-neutral-300 text-neutral-950 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors border border-neutral-200"
                    >
                      <Printer className="w-4 h-4 text-emerald-600" />
                      <span>Ver / Reimprimir Ticket</span>
                    </button>
                  </div>
                ))}
              </div>

              {/* Tablet & Desktop Table (hidden sm:block) */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-neutral-100 border-b border-neutral-200 text-neutral-700 uppercase tracking-wider font-bold text-[11px]">
                      <th className="py-3 px-4 font-mono">Ticket N°</th>
                      <th className="py-3 px-4">Fecha & Hora</th>
                      <th className="py-3 px-4">Cajero</th>
                      <th className="py-3 px-4">Cliente</th>
                      <th className="py-3 px-4">Método Pago</th>
                      <th className="py-3 px-4">Productos</th>
                      <th className="py-3 px-4 text-right font-mono">Total</th>
                      <th className="py-3 px-4 text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200">
                    {filteredSales.map((sale) => (
                      <tr key={sale.id} className="hover:bg-neutral-50 transition-colors">
                        <td className="py-3 px-4 font-bold text-black font-mono">{sale.ticketNumber}</td>
                        <td className="py-3 px-4 text-neutral-600 font-mono">
                          {new Date(sale.date).toLocaleString('es-PE', {
                            day: '2-digit',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td className="py-3 px-4 text-neutral-800 font-medium">{sale.cashierName}</td>
                        <td className="py-3 px-4 text-neutral-800">{sale.customerName || 'Cliente Contado'}</td>
                        <td className="py-3 px-4">
                          <div className="flex gap-1 flex-wrap">
                            {sale.payments.map((p, idx) => (
                              <span
                                key={idx}
                                className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-neutral-100 text-neutral-700 border border-neutral-200"
                              >
                                {p.method}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-neutral-600 max-w-xs truncate">
                          {sale.items.map((i) => `${i.quantity}x ${i.productName}`).join(', ')}
                        </td>
                        <td className="py-3 px-4 text-right font-black text-neutral-950 font-mono">
                          S/ {sale.total.toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => setSelectedSale(sale)}
                            className="p-1.5 text-neutral-800 hover:text-neutral-950 hover:border-emerald-500 hover:bg-emerald-50 rounded-lg transition-colors inline-flex items-center gap-1 font-bold text-xs cursor-pointer border border-neutral-300"
                            title="Ver / Imprimir Ticket"
                          >
                            <Printer className="w-4 h-4 text-emerald-600" />
                            <span>Ver Ticket</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      ) : (
        /* TAB 2: PRODUCTOS VENDIDOS EN EL TURNO (Requested explicitly by user) */
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs overflow-hidden">
          {consolidatedProducts.length === 0 ? (
            <div className="p-12 text-center text-neutral-400 space-y-2">
              <Package className="w-10 h-10 mx-auto text-neutral-300" />
              <p className="font-bold text-sm text-neutral-700">No se encontraron productos vendidos</p>
              <p className="text-xs text-neutral-500">
                No hay registro de productos despachados para el criterio de búsqueda o turno actual.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-neutral-100 border-b border-neutral-200 text-neutral-700 uppercase tracking-wider font-bold text-[11px]">
                    <th className="py-3 px-4 text-center">#</th>
                    <th className="py-3 px-4">Producto / Descripción</th>
                    <th className="py-3 px-4 font-mono">SKU</th>
                    <th className="py-3 px-4 text-center">Unidades Vendidas</th>
                    <th className="py-3 px-4 text-right">Precio Unit.</th>
                    <th className="py-3 px-4 text-right font-mono">Total Recaudado</th>
                    <th className="py-3 px-4 text-right">% Turno</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {consolidatedProducts.map((prod, index) => {
                    const percentOfSales =
                      paymentSummary.total > 0 ? (prod.total / paymentSummary.total) * 100 : 0;

                    return (
                      <tr key={prod.productId} className="hover:bg-neutral-50 transition-colors">
                        <td className="py-3 px-4 text-center font-mono font-bold text-neutral-400">
                          {index + 1}
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-bold text-neutral-900">{prod.productName}</p>
                        </td>
                        <td className="py-3 px-4 font-mono text-neutral-500 text-[11px]">
                          {prod.sku}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="font-mono font-bold text-neutral-900 bg-neutral-100 px-2.5 py-1 rounded-lg border border-neutral-200">
                            {prod.quantity} unid.
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-neutral-600">
                          S/ {prod.unitPrice.toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-right font-black text-neutral-950 font-mono text-sm">
                          S/ {prod.total.toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-neutral-600">
                          {percentOfSales.toFixed(1)}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-neutral-100 border-t border-neutral-200 font-bold text-neutral-900 text-xs">
                    <td colSpan={3} className="py-3 px-4 text-right uppercase">
                      Totales del Turno:
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-black text-sm">
                      {totalUnitsSold} unid.
                    </td>
                    <td></td>
                    <td className="py-3 px-4 text-right font-mono font-black text-emerald-700 text-sm">
                      S/ {paymentSummary.total.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold">100%</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      )}

      {/* MODAL 1: Ticket Modal */}
      {selectedSale && (
        <ReceiptModal sale={selectedSale} onClose={() => setSelectedSale(null)} />
      )}

      {/* MODAL 2: Full Shift Summary / Corte de Turno Modal */}
      {showShiftSummaryModal && (
        <ShiftSummaryModal
          shift={scopeFilter === 'shift' ? currentSelectedShift : activeShift || null}
          sales={userSales}
          customTitle={
            scopeFilter === 'today'
              ? 'Reporte de Ventas del Día (Tiempo Real)'
              : scopeFilter === 'shift' && currentSelectedShift
              ? `Corte de Caja - ${currentSelectedShift.shiftNumber}`
              : 'Reporte General de Ventas'
          }
          subtitle={
            scopeFilter === 'today'
              ? `Ventas del día: ${new Date().toLocaleDateString('es-PE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} • Total: S/ ${paymentSummary.total.toFixed(2)} (${paymentSummary.ticketsCount} comprobantes)`
              : undefined
          }
          onClose={() => setShowShiftSummaryModal(false)}
        />
      )}

      {/* MODAL 3: Open Shift Modal */}
      {showOpenShiftModal && (
        <OpenShiftModal
          onClose={() => setShowOpenShiftModal(false)}
          onSuccess={() => {
            if (activeShift) setSelectedShiftId(activeShift.id);
          }}
        />
      )}

      {/* MODAL 4: Close Shift Modal */}
      {shiftToClose && (
        <CloseShiftModal
          shift={shiftToClose}
          sales={sales}
          onClose={() => setShiftToClose(null)}
          onSuccess={(closed) => {
            setShiftToClose(null);
            setShowShiftSummaryModal(true);
          }}
        />
      )}
    </div>
  );
};
