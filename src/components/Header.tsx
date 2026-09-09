import React, { useState, useEffect, useMemo } from 'react';
import { usePos } from '../context/PosContext';
import {
  Menu,
  AlertTriangle,
  Clock,
  Lock,
  Unlock,
  ChevronDown,
  Activity,
  Receipt,
  Sliders,
  LogOut,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  ArrowUpRight,
  Sun,
  Moon,
} from 'lucide-react';
import { MariaLogo } from './MariaLogo';
import { OpenShiftModal } from './Ventas/OpenShiftModal';
import { CloseShiftModal } from './Ventas/CloseShiftModal';
import { ShiftSummaryModal } from './Ventas/ShiftSummaryModal';
import { CashMovementModal } from './Ventas/CashMovementModal';

interface HeaderProps {
  onToggleMobileSidebar: () => void;
  isSidebarCollapsed?: boolean;
  onToggleSidebarCollapse?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleMobileSidebar,
  isSidebarCollapsed = false,
  onToggleSidebarCollapse,
}) => {
  const {
    currentUser,
    activeShift,
    sales,
    getLowStockProducts,
    setActiveModule,
    sectorConfig,
    logout,
    darkMode,
    toggleDarkMode,
  } = usePos();

  const [timeStr, setTimeStr] = useState('');

  // Shift & Sales modals state directly in Header
  const [showOpenShiftModal, setShowOpenShiftModal] = useState(false);
  const [showCloseShiftModal, setShowCloseShiftModal] = useState(false);
  const [showShiftSummaryModal, setShowShiftSummaryModal] = useState(false);
  const [showDailySummaryModal, setShowDailySummaryModal] = useState(false);
  const [showShiftDropdown, setShowShiftDropdown] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleDateString('es-PE', {
          weekday: 'short',
          day: '2-digit',
          month: 'short',
        }) +
          ' | ' +
          now.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const lowStockCount = getLowStockProducts().length;

  // Real-time sales calculations for header stats & sparkline
  const todaySales = useMemo(() => {
    const now = new Date();
    return sales.filter((s) => {
      const d = new Date(s.date);
      return (
        d.getFullYear() === now.getFullYear() &&
        d.getMonth() === now.getMonth() &&
        d.getDate() === now.getDate()
      );
    });
  }, [sales]);

  const todayTotal = useMemo(() => {
    return todaySales.reduce((sum, s) => sum + s.total, 0);
  }, [todaySales]);

  const shiftSales = useMemo(() => {
    if (!activeShift) return [];
    return sales.filter((s) => s.shiftId === activeShift.id);
  }, [sales, activeShift]);

  const shiftTotal = useMemo(() => {
    return shiftSales.reduce((sum, s) => sum + s.total, 0);
  }, [shiftSales]);

  const handleLowStockClick = () => {
    if (currentUser?.role === 'admin') {
      setActiveModule('inventario');
    }
  };

  const handleMenuButtonClick = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      onToggleMobileSidebar();
    } else if (onToggleSidebarCollapse) {
      onToggleSidebarCollapse();
    } else {
      onToggleMobileSidebar();
    }
  };

  return (
    <>
      <header className="h-16 bg-white dark:bg-[#1C2B24] border-b border-neutral-200 dark:border-[#2E5A44] px-3 sm:px-4 md:px-6 flex items-center justify-between sticky top-0 z-20 select-none gap-2">
        {/* Left side: Mobile menu toggle / Rail toggle + Date & Time + Shift Options */}
        <div className="flex items-center gap-2 sm:gap-4 min-w-0 overflow-hidden">
          <button
            onClick={handleMenuButtonClick}
            className="p-2 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl transition-colors cursor-pointer shrink-0"
            aria-label="Alternar menú lateral"
            title={isSidebarCollapsed ? "Expandir menú lateral" : "Colapsar menú lateral"}
          >
            <Menu className="w-5 h-5 text-neutral-800 dark:text-neutral-200" />
          </button>

          {/* Date & Time */}
          <div className="hidden xl:flex items-center gap-1.5 text-neutral-500 dark:text-neutral-400 text-xs font-normal border-r border-neutral-200 dark:border-neutral-800 pr-3 shrink-0">
            <Clock className="w-3.5 h-3.5 text-neutral-500 dark:text-neutral-400" />
            <span className="whitespace-nowrap">{timeStr}</span>
          </div>

          {/* Shift status & Today Sales as simple text with icons, no background pills */}
          <div className="relative flex items-center gap-4 sm:gap-6 shrink-0">
            {activeShift ? (
              <button
                type="button"
                onClick={() => setShowShiftDropdown(!showShiftDropdown)}
                className="flex items-center gap-1.5 text-xs font-normal text-[#6B6B66] hover:text-[#1A1A1A] transition-colors cursor-pointer whitespace-nowrap shrink-0"
                title="Ver detalles de la caja activa"
              >
                <div className="w-3.5 h-3.5 border border-[#6B6B66] rounded-xs shrink-0 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-[#6B6B66] rounded-xs" />
                </div>
                <span>Caja {activeShift.shiftNumber.startsWith('TUR-') ? activeShift.shiftNumber : `TUR-00${activeShift.shiftNumber}`}:</span>
                <span className="font-mono font-medium text-[#1A1A1A]">S/ {shiftTotal.toFixed(2)}</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-[#5F5E5A] transition-transform shrink-0 ${
                    showShiftDropdown ? 'rotate-180' : ''
                  }`}
                />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setShowOpenShiftModal(true)}
                className="flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:text-rose-700 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                title="Haz clic para aperturar turno de caja"
              >
                <Lock className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                <span>Caja Cerrada (Abrir)</span>
              </button>
            )}

            {/* Real-time Today Sales - Simple Text with icon */}
            <button
              type="button"
              onClick={() => setShowDailySummaryModal(true)}
              className="hidden lg:flex items-center gap-1.5 text-xs font-normal text-[#6B6B66] hover:text-[#1A1A1A] transition-colors cursor-pointer whitespace-nowrap shrink-0"
              title="Ver reporte consolidado de ventas de hoy"
            >
              <div className="w-3.5 h-3.5 border border-[#6B6B66] rounded-xs shrink-0 flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-[#6B6B66] rounded-xs" />
              </div>
              <span>Venta hoy:</span>
              <span className="font-mono font-medium text-[#1A1A1A]">S/ {todayTotal.toFixed(2)}</span>
            </button>

            {/* Shift Dropdown Popover */}
            {showShiftDropdown && activeShift && (
              <div className="absolute top-full left-0 mt-2 w-72 bg-white border border-neutral-200 rounded-2xl shadow-xl p-3.5 z-30 space-y-3 animate-in fade-in-50 zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
                  <div>
                    <div className="text-xs font-bold text-neutral-900">Caja #{activeShift.shiftNumber}</div>
                    <div className="text-[11px] text-neutral-500">{activeShift.cashierName}</div>
                  </div>
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full">
                    Turno Abierto
                  </span>
                </div>

                <div className="space-y-1.5 text-xs font-medium">
                  <div className="flex justify-between text-neutral-600">
                    <span>Fondo Inicial:</span>
                    <span className="font-mono font-bold text-neutral-900">
                      S/ {(activeShift.initialCash || 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-neutral-600">
                    <span>Ventas del Turno:</span>
                    <span className="font-mono font-bold text-emerald-700">S/ {shiftTotal.toFixed(2)}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-neutral-100 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowShiftSummaryModal(true);
                      setShowShiftDropdown(false);
                    }}
                    className="px-2 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-bold rounded-xl flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  >
                    <Receipt className="w-3.5 h-3.5 text-neutral-600" />
                    <span>Corte X</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCloseShiftModal(true);
                      setShowShiftDropdown(false);
                    }}
                    className="px-2 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  >
                    <Lock className="w-3.5 h-3.5 text-rose-600" />
                    <span>Cerrar Caja</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right side: Low Stock Alert, Theme Toggle & User Profile */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={toggleDarkMode}
            className="p-2 bg-[#FAF6F0] dark:bg-neutral-800 hover:bg-[#EAF3EC] dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 hover:text-[#2E7D5B] border border-[#E4DFD3] dark:border-neutral-700 rounded-xl transition-all cursor-pointer flex items-center justify-center shadow-2xs"
            title={darkMode ? "Cambiar a Modo Claro" : "Cambiar a Modo Oscuro"}
          >
            {darkMode ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-neutral-700" />
            )}
          </button>

          {/* Low Stock Pill - The ONLY solid badge per specification */}
          {lowStockCount > 0 && currentUser?.role === 'admin' && (
            <button
              onClick={handleLowStockClick}
              className="flex items-center gap-2 px-3 py-1.5 bg-[#FAEEDA] dark:bg-amber-950/40 hover:bg-[#F3E2BD] dark:hover:bg-amber-900/50 text-[#633806] dark:text-amber-200 rounded-xl text-xs font-normal transition-colors cursor-pointer border border-[#EF9F27]/30 whitespace-nowrap shrink-0"
              title="Ver productos con bajo stock en inventario"
            >
              <div className="w-3.5 h-3.5 border border-[#633806] dark:border-amber-300 rounded-xs shrink-0 flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-[#633806] dark:bg-amber-300 rounded-xs" />
              </div>
              <span className="whitespace-nowrap font-normal">
                Stock bajo: <strong className="font-bold">{lowStockCount}</strong>
              </span>
            </button>
          )}

          {/* Current User Badge */}
          {currentUser && (
            <div className="flex items-center gap-2 pl-2 border-l border-neutral-200">
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-bold text-xs">
                  {currentUser.name.charAt(0)}
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white" />
              </div>
              <div className="hidden md:block text-right leading-tight">
                <p className="text-xs font-bold text-neutral-900">{currentUser.name}</p>
                <p className={`text-[10px] uppercase tracking-wider font-bold ${
                  currentUser.role === 'super_root'
                    ? 'text-amber-600 font-black'
                    : currentUser.role === 'admin'
                    ? 'text-emerald-600'
                    : 'text-neutral-500'
                }`}>
                  {currentUser.role === 'super_root' ? 'Super Root' : currentUser.role}
                </p>
              </div>
              <div className="hidden lg:flex items-center">
                <MariaLogo
                  size="xs"
                  variant="dark"
                  prefix="Desarrollado por"
                  withLink={true}
                  className="bg-neutral-100/90 hover:bg-neutral-200/80 px-2.5 py-1 rounded-xl border border-neutral-200 shadow-2xs"
                />
              </div>
              <button
                type="button"
                onClick={logout}
                title="Volver al Portal de Bienvenida, Onboarding o Demo"
                className="ml-1 p-1.5 sm:px-2.5 sm:py-1.5 bg-[#FAF6F0] hover:bg-[#EAF3EC] text-neutral-700 hover:text-[#2E7D5B] border border-[#E4DFD3] rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#2E7D5B]" />
                <span className="hidden sm:inline">Portal / Demo</span>
                <LogOut className="w-3.5 h-3.5 text-neutral-400 sm:ml-0.5" />
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Open Shift Modal */}
      {showOpenShiftModal && (
        <OpenShiftModal
          onClose={() => setShowOpenShiftModal(false)}
          onSuccess={() => setShowOpenShiftModal(false)}
        />
      )}

      {/* Close Shift Modal */}
      {showCloseShiftModal && activeShift && (
        <CloseShiftModal
          shift={activeShift}
          sales={sales}
          onClose={() => setShowCloseShiftModal(false)}
          onSuccess={() => {
            setShowCloseShiftModal(false);
            setShowShiftSummaryModal(true);
          }}
        />
      )}

      {/* Shift Summary Modal */}
      {showShiftSummaryModal && activeShift && (
        <ShiftSummaryModal
          shift={activeShift}
          sales={shiftSales}
          onClose={() => setShowShiftSummaryModal(false)}
        />
      )}

      {/* Daily Summary Modal */}
      {showDailySummaryModal && (
        <ShiftSummaryModal
          shift={null}
          sales={todaySales}
          customTitle="Reporte de Ventas del Día (Tiempo Real)"
          subtitle={`Total vendido hoy: S/ ${todayTotal.toFixed(2)} (${todaySales.length} comprobantes emitidos)`}
          onClose={() => setShowDailySummaryModal(false)}
        />
      )}
    </>
  );
};

