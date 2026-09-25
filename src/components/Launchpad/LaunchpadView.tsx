import React, { useState, useMemo } from 'react';
import { usePos } from '../../context/PosContext';
import { NavigationModule, LaunchpadIconTheme } from '../../types';
import { BUSINESS_SECTORS } from '../../data/businessSectors';
import {
  Store,
  Banknote,
  Package,
  Truck,
  BarChart3,
  Sliders,
  ShieldAlert,
  RefreshCw,
  Palette,
  X,
  Check,
  Sparkles,
} from 'lucide-react';
import { CajitaLogo } from '../CajitaLogo';

interface ThemeDefinition {
  id: LaunchpadIconTheme;
  name: string;
  badge: string;
  description: string;
  previewColors: string[];
}

const THEME_OPTIONS: ThemeDefinition[] = [
  {
    id: 'soft',
    name: 'Pastel Soft (Fintech)',
    badge: 'Recomendado',
    description: 'Fondo suave y limpio con el ícono en color vivo. Estilo Toast / Square POS.',
    previewColors: ['bg-emerald-100 text-emerald-700', 'bg-indigo-100 text-indigo-700', 'bg-amber-100 text-amber-700'],
  },
  {
    id: 'solido',
    name: 'Sólido Clásico',
    badge: 'Original',
    description: 'Degradados vivos con borde contrastante e ícono en blanco puro.',
    previewColors: ['bg-emerald-600 text-white', 'bg-teal-600 text-white', 'bg-amber-600 text-white'],
  },
  {
    id: 'monocromo',
    name: 'Monocromo Cajita',
    badge: 'Corporativo',
    description: 'Estética minimalista con el verde insignia y fondo blanco/carbón.',
    previewColors: ['bg-[#2E7D5B]/15 text-[#2E7D5B]', 'bg-[#2E7D5B]/15 text-[#2E7D5B]', 'bg-[#2E7D5B]/15 text-[#2E7D5B]'],
  },
  {
    id: 'neon',
    name: 'Neón Cyber',
    badge: 'Alto Contraste',
    description: 'Fondo negro mate con bordes e íconos luminiscentes vibrantes.',
    previewColors: ['bg-[#0B1A13] text-[#34D399] border border-[#10B981]', 'bg-[#131126] text-[#A5B4FC] border border-[#818CF8]', 'bg-[#1E1609] text-[#FCD34D] border border-[#F59E0B]'],
  },
];

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
    iconTheme,
    setIconTheme,
  } = usePos();

  // Demo status check: only show demo sector switcher in demo mode
  const isDemo = isDemoTour || currentUser?.name?.toLowerCase().includes('demo') || currentUser?.username === 'admin_demo';
  const [showSectorModal, setShowSectorModal] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);

  const lowStockCount = getLowStockProducts().length;
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  // App definitions dynamic based on selected iconTheme
  const apps = useMemo(() => {
    // Style resolver based on theme
    const getAppStyle = (appId: NavigationModule) => {
      switch (iconTheme) {
        case 'soft':
          switch (appId) {
            case 'ventas':
              return {
                iconBg: darkMode ? 'bg-emerald-950/50 border-2 border-emerald-700/60 text-emerald-400' : 'bg-emerald-50 border-2 border-emerald-300 text-emerald-700',
                badgeColor: darkMode ? 'bg-emerald-900 text-emerald-200 border border-emerald-600' : 'bg-white text-emerald-700 border border-emerald-200 font-bold',
              };
            case 'mis_ventas':
              return {
                iconBg: darkMode ? 'bg-indigo-950/50 border-2 border-indigo-700/60 text-indigo-400' : 'bg-indigo-50 border-2 border-indigo-300 text-indigo-700',
                badgeColor: darkMode ? 'bg-indigo-900 text-indigo-200 border border-indigo-600' : 'bg-white text-indigo-700 border border-indigo-200 font-bold',
              };
            case 'inventario':
              return {
                iconBg: darkMode ? 'bg-amber-950/50 border-2 border-amber-700/60 text-amber-400' : 'bg-amber-50 border-2 border-amber-300 text-amber-700',
                badgeColor: darkMode ? 'bg-amber-900 text-amber-200 border border-amber-600' : 'bg-white text-amber-700 border border-amber-200 font-bold',
              };
            case 'compras':
              return {
                iconBg: darkMode ? 'bg-sky-950/50 border-2 border-sky-700/60 text-sky-400' : 'bg-sky-50 border-2 border-sky-300 text-sky-700',
                badgeColor: 'bg-white text-sky-700',
              };
            case 'reportes':
              return {
                iconBg: darkMode ? 'bg-rose-950/50 border-2 border-rose-700/60 text-rose-400' : 'bg-rose-50 border-2 border-rose-300 text-rose-700',
                badgeColor: 'bg-white text-rose-700',
              };
            case 'configuracion':
              return {
                iconBg: darkMode ? 'bg-slate-900/60 border-2 border-slate-700 text-slate-300' : 'bg-slate-100 border-2 border-slate-300 text-slate-700',
                badgeColor: 'bg-white text-slate-700',
              };
            case 'super_root':
              return {
                iconBg: darkMode ? 'bg-orange-950/50 border-2 border-orange-700/60 text-orange-400' : 'bg-orange-50 border-2 border-orange-300 text-orange-700',
                badgeColor: 'bg-white text-orange-700 font-bold',
              };
          }
          break;

        case 'monocromo':
          return {
            iconBg: darkMode
              ? 'bg-[#182720] border-2 border-[#2E7D5B]/60 text-[#4ADE80] hover:border-[#4ADE80]'
              : 'bg-white border-2 border-[#2E7D5B]/30 text-[#2E7D5B] hover:border-[#2E7D5B] shadow-2xs',
            badgeColor: darkMode ? 'bg-[#20362B] text-[#5EEAD4] border border-[#2E7D5B]' : 'bg-[#FAF6F0] text-[#2E7D5B] border border-[#E4DFD3] font-bold',
          };

        case 'neon':
          switch (appId) {
            case 'ventas':
              return {
                iconBg: 'bg-[#0B1A13] border-2 border-[#10B981] text-[#34D399] shadow-[0_0_12px_rgba(16,185,129,0.25)]',
                badgeColor: 'bg-[#10B981] text-black font-black',
              };
            case 'mis_ventas':
              return {
                iconBg: 'bg-[#131126] border-2 border-[#818CF8] text-[#A5B4FC] shadow-[0_0_12px_rgba(129,140,248,0.25)]',
                badgeColor: 'bg-[#818CF8] text-black font-black',
              };
            case 'inventario':
              return {
                iconBg: 'bg-[#1E1609] border-2 border-[#F59E0B] text-[#FCD34D] shadow-[0_0_12px_rgba(245,158,11,0.25)]',
                badgeColor: 'bg-[#F59E0B] text-black font-black',
              };
            case 'compras':
              return {
                iconBg: 'bg-[#0B1829] border-2 border-[#38BDF8] text-[#7DD3FC] shadow-[0_0_12px_rgba(56,189,248,0.25)]',
                badgeColor: 'bg-[#38BDF8] text-black font-black',
              };
            case 'reportes':
              return {
                iconBg: 'bg-[#220B1A] border-2 border-[#F43F5E] text-[#FDA4AF] shadow-[0_0_12px_rgba(244,63,94,0.25)]',
                badgeColor: 'bg-[#F43F5E] text-white font-black',
              };
            case 'configuracion':
              return {
                iconBg: 'bg-[#131920] border-2 border-[#94A3B8] text-[#E2E8F0] shadow-[0_0_12px_rgba(148,163,184,0.25)]',
                badgeColor: 'bg-[#94A3B8] text-black font-black',
              };
            case 'super_root':
              return {
                iconBg: 'bg-[#241307] border-2 border-[#FB923C] text-[#FDBA74] shadow-[0_0_12px_rgba(251,146,60,0.25)]',
                badgeColor: 'bg-[#FB923C] text-black font-black',
              };
          }
          break;

        case 'solido':
        default:
          switch (appId) {
            case 'ventas':
              return {
                iconBg: 'bg-gradient-to-br from-[#10B981] to-[#047857] border-2 border-[#6EE7B7] text-white shadow-sm',
                badgeColor: 'bg-[#FAF6F0] text-[#047857] border border-[#10B981]/40 font-bold',
              };
            case 'mis_ventas':
              return {
                iconBg: 'bg-gradient-to-br from-[#0D9488] to-[#115E59] border-2 border-[#5EEAD4] text-white shadow-sm',
                badgeColor: 'bg-[#EAF6EF] text-[#0D9488] border border-[#0D9488]/40',
              };
            case 'inventario':
              return {
                iconBg: 'bg-gradient-to-br from-[#F59E0B] to-[#B45309] border-2 border-[#FDE68A] text-white shadow-sm',
                badgeColor: 'bg-[#FFF6EB] text-[#B45309] border border-[#FCD34D] font-bold',
              };
            case 'compras':
              return {
                iconBg: 'bg-gradient-to-br from-[#3B82F6] to-[#1D4ED8] border-2 border-[#BFDBFE] text-white shadow-sm',
                badgeColor: 'bg-white text-[#1D4ED8]',
              };
            case 'reportes':
              return {
                iconBg: 'bg-gradient-to-br from-[#06B6D4] to-[#0E7490] border-2 border-[#A5F3FC] text-white shadow-sm',
                badgeColor: 'bg-white text-[#0E7490]',
              };
            case 'configuracion':
              return {
                iconBg: 'bg-gradient-to-br from-[#64748B] to-[#334155] border-2 border-[#E2E8F0] text-white shadow-sm',
                badgeColor: 'bg-white text-[#334155]',
              };
            case 'super_root':
              return {
                iconBg: 'bg-gradient-to-br from-[#78350F] to-[#451A03] border-2 border-[#FDE68A] text-white shadow-sm',
                badgeColor: 'bg-[#FAF6F0] text-[#78350F] font-bold border border-[#FDE68A]',
              };
          }
      }
    };

    const list = [
      {
        id: 'ventas' as NavigationModule,
        name: 'Punto de Venta',
        shortName: 'POS',
        description: 'Ventas en mostrador, códigos de barras y cobro rápido',
        icon: Store,
        ...getAppStyle('ventas'),
        badge: cartCount > 0 ? `${cartCount} en carrito` : null,
        adminOnly: false,
        highlight: true,
      },
      {
        id: 'mis_ventas' as NavigationModule,
        name: 'Caja',
        shortName: 'Caja y Turnos',
        description: 'Apertura de turno, arqueo ciego, cortes X/Z y balance',
        icon: Banknote,
        ...getAppStyle('mis_ventas'),
        badge: activeShift ? 'Abierta' : 'Cerrada',
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
        icon: Package,
        ...getAppStyle('inventario'),
        badge: lowStockCount > 0 ? `${lowStockCount} por agotar` : null,
        adminOnly: true,
      },
      {
        id: 'compras' as NavigationModule,
        name: 'Compras',
        shortName: 'Compras',
        description: 'Proveedores, facturas de compras e ingreso de mercadería',
        icon: Truck,
        ...getAppStyle('compras'),
        badge: null,
        adminOnly: true,
      },
      {
        id: 'reportes' as NavigationModule,
        name: 'Reportes',
        shortName: 'Reportes',
        description: 'Ganancias netas, ventas por hora, productos top y métricas',
        icon: BarChart3,
        ...getAppStyle('reportes'),
        badge: null,
        adminOnly: true,
      },
      {
        id: 'configuracion' as NavigationModule,
        name: 'Configuración',
        shortName: 'Ajustes',
        description: 'Datos del negocio, usuarios, cajeros, rubro e impresora',
        icon: Sliders,
        ...getAppStyle('configuracion'),
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
        icon: ShieldAlert,
        ...getAppStyle('super_root'),
        badge: 'MAESTRO',
        adminOnly: false,
      });
    }

    return list;
  }, [cartCount, activeShift, lowStockCount, currentUser, iconTheme, darkMode]);

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

            <div className="flex items-center gap-2 flex-wrap">
              {/* Botón cambiar rubro SOLO en versión DEMO */}
              {isDemo && (
                <button
                  type="button"
                  onClick={() => setShowSectorModal(true)}
                  className={`inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer border shadow-2xs ${
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

              {/* Selector de 4 estilos de íconos para el cliente */}
              <button
                type="button"
                onClick={() => setShowThemeModal(true)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer border shadow-2xs ${
                  darkMode
                    ? 'bg-[#1C2C23] hover:bg-[#253D30] text-[#FAF6F0] border-[#2E4337]'
                    : 'bg-[#FAF6F0] hover:bg-[#F3EDE2] text-[#1C2B24] border-[#E8E2D5]'
                }`}
                title="Elegir entre 4 estilos visuales para los módulos"
              >
                <Palette className="w-3.5 h-3.5 text-[#2E7D5B] dark:text-[#4ADE80]" />
                <span>
                  Estilo: {iconTheme === 'soft' ? 'Pastel Soft' : iconTheme === 'solido' ? 'Sólido' : iconTheme === 'monocromo' ? 'Monocromo' : 'Neón'}
                </span>
              </button>
            </div>
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
                  className={`group flex flex-col items-center text-center cursor-pointer p-2.5 sm:p-3.5 rounded-3xl border transition-all duration-300 active:scale-95 select-none ${
                    darkMode
                      ? 'border-transparent hover:border-[#2A3E33]/70 hover:bg-[#1A2720]/60'
                      : 'border-transparent hover:border-[#E4DFD3]/70 hover:bg-white/70'
                  }`}
                >
                  {/* App Icon Tile */}
                  <div className="relative">
                    <div
                      className={`w-20 h-20 sm:w-22 sm:h-22 rounded-2xl flex items-center justify-center transition-all duration-200 group-hover:scale-105 ${app.iconBg}`}
                    >
                      <Icon className="w-10 h-10 sm:w-11 sm:h-11" />
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
                    className={`mt-3 text-xs sm:text-sm font-bold tracking-tight leading-tight transition-colors ${
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

      {/* Theme Selector Modal (4 Estilos de Iconos para el cliente) */}
      {showThemeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div
            className={`w-full max-w-xl rounded-3xl border shadow-2xl p-5 sm:p-6 transition-all ${
              darkMode ? 'bg-[#151F1A] border-[#283C30] text-[#FAF6F0]' : 'bg-white border-[#E4DFD3] text-[#1C2B24]'
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200/40 dark:border-neutral-700/40">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#2E7D5B]/15 text-[#2E7D5B] dark:text-[#5EEAD4]">
                  <Palette className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black tracking-tight">Estilo Visual de Íconos</h3>
                  <p className="text-[11px] text-[#55695F] dark:text-[#8E9F94]">
                    Elige el estilo que mejor se adapte al gusto del cliente o tipo de negocio
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowThemeModal(false)}
                className="p-1.5 rounded-xl text-neutral-400 hover:text-neutral-700 dark:hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4">
              {THEME_OPTIONS.map((thm) => {
                const isCurrent = iconTheme === thm.id;
                return (
                  <button
                    key={thm.id}
                    type="button"
                    onClick={() => {
                      setIconTheme(thm.id);
                      setShowThemeModal(false);
                    }}
                    className={`flex flex-col text-left p-3.5 rounded-2xl border transition-all cursor-pointer active:scale-98 ${
                      isCurrent
                        ? darkMode
                          ? 'bg-[#1C2C23] border-[#4ADE80] ring-2 ring-[#4ADE80]/30 shadow-md'
                          : 'bg-[#F2FAF4] border-[#2E7D5B] ring-2 ring-[#2E7D5B]/20 shadow-md'
                        : darkMode
                        ? 'bg-[#1E2E25] hover:bg-[#253A2E] border-[#2A3E33]'
                        : 'bg-[#FAF6F0] hover:bg-[#EAF3EC] border-[#E4DFD3]'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-xs font-black tracking-tight">{thm.name}</span>
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${
                          isCurrent
                            ? 'bg-[#2E7D5B] text-white'
                            : darkMode
                            ? 'bg-[#151F1A] text-neutral-300'
                            : 'bg-white text-neutral-600 border border-neutral-200'
                        }`}>
                          {thm.badge}
                        </span>
                        {isCurrent && <Check className="w-3.5 h-3.5 text-[#2E7D5B] dark:text-[#4ADE80]" />}
                      </div>
                    </div>

                    <p className={`text-[10px] mt-1 line-clamp-2 ${darkMode ? 'text-neutral-300' : 'text-neutral-600'}`}>
                      {thm.description}
                    </p>

                    {/* Mini visual sample pills */}
                    <div className="flex items-center gap-2 mt-3 pt-2.5 border-t border-neutral-200/40 dark:border-neutral-700/40">
                      <span className="text-[9px] uppercase tracking-wider font-bold text-neutral-400">Muestra:</span>
                      <div className="flex items-center gap-1.5">
                        {thm.previewColors.map((cls, idx) => (
                          <div
                            key={idx}
                            className={`w-5 h-5 rounded-lg flex items-center justify-center text-[9px] font-black shadow-2xs ${cls}`}
                          >
                            {idx === 0 ? 'P' : idx === 1 ? 'C' : 'S'}
                          </div>
                        ))}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="pt-4 mt-4 border-t border-neutral-200/40 dark:border-neutral-700/40 flex justify-end">
              <button
                type="button"
                onClick={() => setShowThemeModal(false)}
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
