import React, { useState, useMemo } from 'react';
import { usePos } from '../../context/PosContext';
import { NavigationModule } from '../../types';
import { BUSINESS_SECTORS } from '../../data/businessSectors';
import {
  Banknote,
  Package,
  Truck,
  BarChart3,
  Sliders,
  ShieldAlert,
  Store,
  RefreshCw,
  X,
  Check,
} from 'lucide-react';
import { CajitaLogo } from '../CajitaLogo';

export const LaunchpadView: React.FC = () => {
  const {
    currentUser,
    setActiveModule,
    storeProfile,
    businessSector,
    setBusinessSector,
    isDemoTour,
    activeShift,
    getLowStockProducts,
    cart,
    darkMode,
  } = usePos();

  // Demo status check: only show demo sector switcher in demo mode
  const isDemo = isDemoTour || currentUser?.name?.toLowerCase().includes('demo') || currentUser?.username === 'admin_demo';
  const [showSectorModal, setShowSectorModal] = useState(false);

  const lowStockCount = getLowStockProducts().length;
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  // Define the core applications with vibrant backgrounds and bright, crisp contour borders
  const apps = useMemo(() => {
    const list = [
      {
        id: 'ventas' as NavigationModule,
        name: 'Punto de Venta',
        shortName: 'POS',
        description: 'Ventas en mostrador, códigos de barras y cobro rápido',
        iconBg: 'bg-gradient-to-br from-[#10B981] to-[#047857] border-[2.5px] border-[#6EE7B7] text-white shadow-sm',
        icon: Store,
        badge: cartCount > 0 ? `${cartCount} en carrito` : null,
        badgeColor: 'bg-[#FAF6F0] text-[#047857] border border-[#10B981]/40 font-bold',
        adminOnly: false,
        highlight: true,
      },
      {
        id: 'mis_ventas' as NavigationModule,
        name: 'Caja',
        shortName: 'Caja y Turnos',
        description: 'Apertura de turno, arqueo ciego, cortes X/Z y balance',
        iconBg: 'bg-gradient-to-br from-[#0D9488] to-[#115E59] border-[2.5px] border-[#5EEAD4] text-white shadow-sm',
        icon: Banknote,
        badge: activeShift ? 'Abierta' : 'Cerrada',
        badgeColor: activeShift
          ? 'bg-[#EAF6EF] text-[#0D9488] border border-[#0D9488]/40'
          : 'bg-[#E4DFD3] text-[#55695F]',
        adminOnly: false,
        statusDetail: activeShift
          ? `Caja #${activeShift.shiftNumber}`
          : 'Requiere abrir caja',
      },
      {
        id: 'inventario' as NavigationModule,
        name: 'Stock / Inventario',
        shortName: 'Inventario',
        description: 'Catálogo de productos, código de barras, combos y precios',
        iconBg: 'bg-gradient-to-br from-[#F59E0B] to-[#B45309] border-[2.5px] border-[#FDE68A] text-white shadow-sm',
        icon: Package,
        badge: lowStockCount > 0 ? `${lowStockCount} por agotar` : null,
        badgeColor: 'bg-[#FFF6EB] text-[#B45309] border border-[#FCD34D] font-bold',
        adminOnly: true,
      },
      {
        id: 'compras' as NavigationModule,
        name: 'Compras',
        shortName: 'Compras',
        description: 'Proveedores, facturas de compras e ingreso de mercadería',
        iconBg: 'bg-gradient-to-br from-[#3B82F6] to-[#1D4ED8] border-[2.5px] border-[#BFDBFE] text-white shadow-sm',
        icon: Truck,
        badge: null,
        adminOnly: true,
      },
      {
        id: 'reportes' as NavigationModule,
        name: 'Reportes',
        shortName: 'Reportes',
        description: 'Ganancias netas, ventas por hora, productos top y métricas',
        iconBg: 'bg-gradient-to-br from-[#06B6D4] to-[#0E7490] border-[2.5px] border-[#A5F3FC] text-white shadow-sm',
        icon: BarChart3,
        badge: null,
        adminOnly: true,
      },
      {
        id: 'configuracion' as NavigationModule,
        name: 'Configuración',
        shortName: 'Ajustes',
        description: 'Datos del negocio, usuarios, cajeros, rubro e impresora',
        iconBg: 'bg-gradient-to-br from-[#64748B] to-[#334155] border-[2.5px] border-[#E2E8F0] text-white shadow-sm',
        icon: Sliders,
        badge: null,
        adminOnly: true,
      },
    ];

    if (currentUser?.role === 'super_root') {
      list.push({
        id: 'super_root' as NavigationModule,
        name: 'Super Root (SaaS)',
        shortName: 'Super Root',
        description: 'Panel maestro de licencias y empresas suscritas',
        iconBg: 'bg-gradient-to-br from-[#78350F] to-[#451A03] border-[2.5px] border-[#FDE68A] text-white shadow-sm',
        icon: ShieldAlert,
        badge: 'MAESTRO',
        badgeColor: 'bg-[#FAF6F0] text-[#78350F] font-bold border border-[#FDE68A]',
        adminOnly: false,
      });
    }

    return list;
  }, [cartCount, activeShift, lowStockCount, currentUser]);

  // Filter apps based on role
  const visibleApps = useMemo(() => {
    return apps.filter((app) => {
      if (app.adminOnly && currentUser?.role !== 'admin' && currentUser?.role !== 'super_root') {
        return false;
      }
      return true;
    });
  }, [apps, currentUser]);

  const handleAppClick = (appId: NavigationModule) => {
    setActiveModule(appId);
  };

  return (
    <div
      className={`min-h-full flex flex-col justify-between p-4 sm:p-6 md:p-8 select-none font-sans transition-colors duration-200 ${
        darkMode
          ? 'bg-gradient-to-b from-[#111714] via-[#16201B] to-[#0D1410] text-[#FAF6F0]'
          : 'bg-gradient-to-b from-[#F3F7F4] via-[#FAF7F2] to-[#EDF3EE] text-[#1C2B24]'
      }`}
    >
      
      {/* Top Store Header - Ultra simple & minimal as requested */}
      <div className="max-w-5xl w-full mx-auto">
        <div className="flex items-center gap-3.5">
          <CajitaLogo size={52} bgHex="#2E7D5B" lidHex="#EAF3EC" checkHex="#2E7D5B" />
          <div className="flex flex-col items-start gap-1">
            <h1 className={`text-xl sm:text-2xl font-black tracking-tight ${darkMode ? 'text-[#FAF6F0]' : 'text-[#1C2B24]'}`}>
              {storeProfile.businessName || storeProfile.name || 'Mi Negocio'}
            </h1>

            {/* Botón cambiar rubro SOLO en versión DEMO */}
            {isDemo && (
              <button
                type="button"
                onClick={() => setShowSectorModal(true)}
                className={`inline-flex items-center gap-2 px-4 py-1 rounded-full text-xs font-bold transition-all cursor-pointer border shadow-2xs ${
                  darkMode
                    ? 'bg-[#1C2C23] hover:bg-[#253D30] text-[#5EEAD4] border-[#2E4337]'
                    : 'bg-[#FAF6F0] hover:bg-[#F3EDE2] text-[#246347] border-[#E8E2D5]'
                }`}
                title="Cambiar rubro en la Demo interactiva"
              >
                <RefreshCw className="w-3.5 h-3.5 text-[#246347] dark:text-[#5EEAD4]" />
                <span>Cambiar rubro</span>
              </button>
            )}
          </div>
        </div>

        {/* Apps Grid (Clean Launchpad View) */}
        <div className="pt-6 sm:pt-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
            {visibleApps.map((app) => {
              const Icon = app.icon;
              return (
                <div
                  key={app.id}
                  onClick={() => handleAppClick(app.id)}
                  className={`group flex flex-col items-center text-center cursor-pointer p-3 sm:p-4 rounded-3xl border transition-all duration-200 active:scale-95 select-none ${
                    darkMode
                      ? 'border-transparent hover:border-[#2A3E33] hover:bg-[#1A2720]/80'
                      : 'border-transparent hover:border-[#E4DFD3]/80 hover:bg-white/90 hover:shadow-xs'
                  }`}
                >
                  {/* App Icon Tile */}
                  <div className="relative">
                    <div
                      className={`w-20 h-20 sm:w-22 sm:h-22 rounded-2xl flex items-center justify-center transition-all duration-200 group-hover:scale-105 ${app.iconBg}`}
                    >
                      <Icon className="w-10 h-10 sm:w-11 sm:h-11 transition-transform group-hover:scale-110" />
                    </div>

                    {/* Badge */}
                    {app.badge && (
                      <span
                        className={`absolute -top-1.5 -right-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold shadow-xs whitespace-nowrap ${
                          app.badgeColor || 'bg-black text-white'
                        }`}
                      >
                        {app.badge}
                      </span>
                    )}
                  </div>

                  {/* App Name */}
                  <span
                    className={`mt-3.5 text-xs sm:text-sm font-bold tracking-tight leading-tight transition-colors ${
                      darkMode
                        ? 'text-[#FAF6F0] group-hover:text-[#4ADE80]'
                        : 'text-[#1C2B24] group-hover:text-[#2E7D5B]'
                    }`}
                  >
                    {app.name}
                  </span>

                  {/* Subtle Subtitle / Detail */}
                  <span
                    className={`text-[10px] font-medium mt-0.5 line-clamp-1 ${
                      darkMode ? 'text-[#8E9F94]' : 'text-[#55695F]'
                    }`}
                  >
                    {app.shortName}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Footer Info */}
      <div className={`max-w-5xl w-full mx-auto pt-8 pb-4 flex flex-wrap items-center justify-center gap-2 text-xs font-medium ${darkMode ? 'text-neutral-500' : 'text-neutral-400'}`}>
        <div className="inline-flex items-center gap-1.5">
          <CajitaLogo size={20} bgHex="#2E7D5B" lidHex="#EAF3EC" checkHex="#2E7D5B" />
          <span className={`font-brand font-bold text-xs tracking-tight ${darkMode ? 'text-[#FAF6F0]' : 'text-[#1C2B24]'}`}>Cajita POS</span>
        </div>
        <span className={darkMode ? 'text-neutral-700' : 'text-neutral-300'}>&middot;</span>
        <span>Desarrollado por <strong className={darkMode ? 'text-neutral-300 font-semibold' : 'text-neutral-700 font-semibold'}>MarIA</strong></span>
      </div>

      {/* Sector Switcher Modal (ONLY available in Demo Mode) */}
      {showSectorModal && isDemo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div
            className={`w-full max-w-lg rounded-3xl border shadow-2xl p-5 sm:p-6 transition-all ${
              darkMode ? 'bg-[#151F1A] border-[#283C30] text-[#FAF6F0]' : 'bg-white border-[#E4DFD3] text-[#1C2B24]'
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200/40 dark:border-neutral-700/40">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#2E7D5B]/15 text-[#2E7D5B] dark:text-[#5EEAD4]">
                  <RefreshCw className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black tracking-tight">Cambiar Rubro de Negocio (Demo)</h3>
                  <p className="text-[11px] text-[#55695F] dark:text-[#8E9F94]">
                    Carga productos y configuración del rubro seleccionado
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowSectorModal(false)}
                className="p-1.5 rounded-xl text-neutral-400 hover:text-neutral-700 dark:hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-4">
              {Object.values(BUSINESS_SECTORS).map((sec) => {
                const isCurrent = businessSector === sec.id;
                return (
                  <button
                    key={sec.id}
                    type="button"
                    onClick={() => {
                      setBusinessSector(sec.id, true);
                      setShowSectorModal(false);
                    }}
                    className={`flex items-start gap-2.5 p-3 rounded-2xl text-left border transition-all cursor-pointer active:scale-95 ${
                      isCurrent
                        ? 'bg-[#2E7D5B] text-white border-[#2E7D5B] shadow-sm'
                        : darkMode
                        ? 'bg-[#1E2E25] hover:bg-[#253A2E] border-[#2A3E33] text-[#FAF6F0]'
                        : 'bg-[#FAF6F0] hover:bg-[#EAF3EC] border-[#E4DFD3] text-[#1C2B24]'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-bold truncate">{sec.name}</span>
                        {isCurrent && <Check className="w-3.5 h-3.5 text-white shrink-0" />}
                      </div>
                      <p className={`text-[10px] mt-0.5 line-clamp-2 ${isCurrent ? 'text-white/80' : 'text-[#55695F] dark:text-[#8E9F94]'}`}>
                        {sec.tagline}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="pt-4 mt-4 border-t border-neutral-200/40 dark:border-neutral-700/40 flex justify-end">
              <button
                type="button"
                onClick={() => setShowSectorModal(false)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                  darkMode ? 'bg-[#202E27] hover:bg-[#2A3E34] text-[#FAF6F0] border-[#2E4337]' : 'bg-[#FAF6F0] hover:bg-[#EAF3EC] text-[#1C2B24] border-[#E4DFD3]'
                }`}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
