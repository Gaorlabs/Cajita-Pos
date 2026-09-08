import React from 'react';
import { usePos } from '../context/PosContext';
import { NavigationModule } from '../types';
import { CajitaLogo } from './CajitaLogo';
import {
  ShoppingCart,
  Package,
  Truck,
  BarChart3,
  LogOut,
  Shield,
  UserCheck,
  AlertTriangle,
  History,
  Sliders,
  Store,
  Coffee,
  Shirt,
  Sparkles,
  Pill,
  LayoutGrid,
  ShieldAlert,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { MariaLogo, MariaRocketIcon } from './MariaLogo';

export const Sidebar: React.FC<{
  isOpen?: boolean;
  onCloseMobile?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}> = ({
  onCloseMobile,
  isCollapsed = false,
  onToggleCollapse,
}) => {
  const {
    currentUser,
    activeModule,
    setActiveModule,
    logout,
    getLowStockProducts,
    sectorConfig,
    storeProfile,
  } = usePos();

  if (!currentUser) return null;

  const lowStockCount = getLowStockProducts().length;

  const handleNavClick = (module: NavigationModule) => {
    setActiveModule(module);
    if (onCloseMobile) onCloseMobile();
  };

  const getSectorIcon = (iconName: string) => {
    switch (iconName) {
      case 'Store':
        return Store;
      case 'Coffee':
        return Coffee;
      case 'Shirt':
        return Shirt;
      case 'Sparkles':
        return Sparkles;
      case 'Pill':
        return Pill;
      default:
        return LayoutGrid;
    }
  };

  const SectorIcon = getSectorIcon(sectorConfig.icon);

  const navItems = [
    {
      id: 'ventas' as NavigationModule,
      label: 'Ventas (POS)',
      shortLabel: 'POS',
      icon: ShoppingCart,
      adminOnly: false,
      badge: null,
    },
    {
      id: 'mis_ventas' as NavigationModule,
      label: 'Mis Ventas / Caja',
      shortLabel: 'Caja',
      icon: History,
      adminOnly: false,
      badge: null,
    },
    {
      id: 'inventario' as NavigationModule,
      label: 'Inventario',
      shortLabel: 'Stock',
      icon: Package,
      adminOnly: true,
      badge: lowStockCount > 0 ? lowStockCount : null,
      badgeColor: 'bg-amber-500 text-white',
    },
    {
      id: 'compras' as NavigationModule,
      label: 'Compras',
      shortLabel: 'Compras',
      icon: Truck,
      adminOnly: true,
      badge: null,
    },
    {
      id: 'reportes' as NavigationModule,
      label: 'Reportes',
      shortLabel: 'Reportes',
      icon: BarChart3,
      adminOnly: true,
      badge: null,
    },
    {
      id: 'configuracion' as NavigationModule,
      label: 'Configuración',
      shortLabel: 'Config',
      subtitle: `Rubro: ${sectorConfig.name || sectorConfig.shortName}`,
      icon: Sliders,
      adminOnly: true,
      badge: null,
    },
    {
      id: 'super_root' as NavigationModule,
      label: 'Super Root (SaaS)',
      shortLabel: 'Root',
      subtitle: 'Dueño de Plataforma',
      icon: ShieldAlert,
      superRootOnly: true,
      badge: 'MAESTRO',
      badgeColor: 'bg-[#2E7D5B] text-white',
    },
  ];

  const visibleItems = navItems.filter((item) => {
    if (item.superRootOnly) {
      return currentUser.role === 'super_root';
    }
    if (currentUser.role === 'super_root') {
      return true;
    }
    if (item.adminOnly) {
      return currentUser.role === 'admin';
    }
    return true;
  });

  return (
    <aside
      className={`bg-[#1C2B24] text-[#FAF6F0] flex flex-col h-full border-r border-[#235F45] transition-all duration-200 shrink-0 select-none ${
        isCollapsed ? 'w-16 md:w-[70px]' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className={`border-b border-[#235F45] flex items-center ${isCollapsed ? 'p-2.5 justify-center flex-col gap-2' : 'p-4 justify-between'}`}>
        <div className={`flex items-center gap-3 overflow-hidden ${isCollapsed ? 'justify-center' : ''}`}>
          <CajitaLogo size={isCollapsed ? 32 : 40} bgHex="#2E7D5B" lidHex="#EAF3EC" checkHex="#2E7D5B" />
          {!isCollapsed && (
            <div className="truncate">
              <h1 className="font-brand font-semibold text-base leading-tight text-[#FAF6F0] tracking-tight truncate">
                Cajita
              </h1>
              <p className="text-[11px] text-[#EAF3EC]/70 font-medium leading-tight truncate">
                Tu negocio, bien cuadrado
              </p>
            </div>
          )}
        </div>

        {/* Optional Collapse/Expand toggle button inside sidebar */}
        {onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            className={`p-1.5 rounded-lg text-[#EAF3EC]/60 hover:text-[#FAF6F0] hover:bg-[#235F45]/70 transition-colors cursor-pointer ${
              isCollapsed ? 'w-full flex items-center justify-center' : ''
            }`}
            title={isCollapsed ? 'Expandir barra lateral' : 'Colapsar barra lateral'}
            aria-label={isCollapsed ? 'Expandir menú' : 'Colapsar menú'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        )}
      </div>

      {/* Navigation Items */}
      <nav className={`flex-1 overflow-y-auto space-y-1.5 ${isCollapsed ? 'p-1.5' : 'px-3 py-4'}`}>
        {!isCollapsed && (
          <div className="px-3 pb-2 text-[11px] font-bold text-[#EAF3EC]/50 uppercase tracking-widest">
            MODULOS
          </div>
        )}
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeModule === item.id;

          if (isCollapsed) {
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                title={item.label}
                className={`w-full flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all cursor-pointer relative group ${
                  isActive
                    ? 'bg-[#2E7D5B] text-[#FAF6F0] font-bold shadow-xs'
                    : 'text-[#EAF3EC]/70 hover:bg-[#235F45]/60 hover:text-[#FAF6F0]'
                }`}
              >
                <div className="relative">
                  <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-[#FAF6F0]' : 'text-[#EAF3EC]/70'}`} />
                  {item.badge !== null && (
                    <span
                      className={`absolute -top-1 -right-2 min-w-[15px] h-3.5 px-1 rounded-full text-[9px] font-black flex items-center justify-center font-mono ${
                        isActive ? 'bg-[#1C2B24] text-[#FAF6F0]' : 'bg-amber-500 text-neutral-950 shadow-xs'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="text-[9px] font-bold mt-1 leading-tight tracking-tight text-center truncate max-w-full">
                  {item.shortLabel || item.label}
                </span>
              </button>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-xs transition-all text-left cursor-pointer ${
                isActive
                  ? 'bg-[#2E7D5B] text-[#FAF6F0] font-bold shadow-sm'
                  : 'text-[#EAF3EC]/70 hover:bg-[#235F45]/60 hover:text-[#FAF6F0]'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#FAF6F0]' : 'text-[#EAF3EC]/60'}`} />
                <div className="truncate">
                  <span className="block truncate">{item.label}</span>
                  {item.subtitle && (
                    <span className={`block text-[10px] font-normal truncate mt-0.5 ${
                      isActive ? 'text-[#FAF6F0]/80' : 'text-[#2E7D5B]'
                    }`}>
                      {item.subtitle}
                    </span>
                  )}
                </div>
              </div>
              {item.badge !== null && (
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold max-w-[90px] truncate shrink-0 ${
                    isActive ? 'bg-[#235F45] text-[#FAF6F0]' : item.badgeColor || 'bg-[#235F45]/40 text-[#EAF3EC]/80'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Low Stock Warning Banner if admin (Expanded only) */}
      {!isCollapsed && currentUser.role === 'admin' && lowStockCount > 0 && (
        <div
          onClick={() => handleNavClick('inventario')}
          className="px-3.5 py-2.5 mx-3 mb-2 bg-[#FAEEDA]/10 border border-[#B87D0F]/30 rounded-xl text-[#FAEEDA] flex items-center gap-2.5 text-xs cursor-pointer hover:bg-[#FAEEDA]/20 transition-colors"
        >
          <AlertTriangle className="w-4 h-4 text-[#B87D0F] shrink-0" />
          <div className="min-w-0 flex-1">
            <span className="font-bold text-[#B87D0F] block text-[11px]">Stock Bajo: {lowStockCount}</span>
            <span className="text-[10px] text-[#EAF3EC]/70 block truncate">Reponer inventario</span>
          </div>
        </div>
      )}

      {/* User Profile Footer */}
      <div className={`border-t border-[#235F45] bg-[#14211B] ${isCollapsed ? 'p-2 flex flex-col items-center gap-2' : 'p-3'}`}>
        {isCollapsed ? (
          <>
            {/* Collapsed Avatar & Logout */}
            <div className="relative group cursor-pointer" title={`${currentUser.name} (${currentUser.role})`}>
              <img
                src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                alt={currentUser.name}
                className="w-8 h-8 rounded-full object-cover border border-[#235F45]"
              />
              <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-[#14211B] bg-[#2E7D5B]" />
            </div>

            <button
              onClick={logout}
              title="Cerrar Sesión"
              className="p-1.5 text-[#EAF3EC]/50 hover:text-[#FAF6F0] hover:bg-[#235F45]/60 rounded-lg transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>

            {/* MarIA Rocket Icon in Rail */}
            <a
              href="https://maria-vert.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 rounded-lg hover:bg-[#235F45]/40 transition-all cursor-pointer group flex flex-col items-center pt-1"
              title="Desarrollado por MARIA by GaorSystem (maria-vert.vercel.app)"
            >
              <MariaRocketIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span className="text-[7px] text-emerald-300/80 font-black tracking-tighter mt-0.5">MARIA</span>
            </a>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between gap-3 p-2 rounded-lg">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="relative shrink-0">
                  <img
                    src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                    alt={currentUser.name}
                    className="w-8 h-8 rounded-full object-cover border border-[#235F45]"
                  />
                  <div
                    className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-[#14211B] bg-[#2E7D5B]"
                  />
                </div>
                <div className="truncate">
                  <p className="text-xs font-bold text-[#FAF6F0] truncate">{currentUser.name}</p>
                  <div className="flex items-center gap-1 text-[10px]">
                    {currentUser.role === 'super_root' ? (
                      <>
                        <ShieldAlert className="w-3 h-3 text-amber-400" />
                        <span className="text-amber-400 font-bold uppercase tracking-wider">Super Root</span>
                      </>
                    ) : currentUser.role === 'admin' ? (
                      <>
                        <Shield className="w-3 h-3 text-[#2E7D5B]" />
                        <span className="text-[#2E7D5B] font-semibold uppercase tracking-wider">Admin</span>
                      </>
                    ) : (
                      <>
                        <UserCheck className="w-3 h-3 text-[#2E7D5B]" />
                        <span className="text-[#2E7D5B] font-semibold uppercase tracking-wider">Cajero</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <button
                onClick={logout}
                title="Cerrar Sesión"
                className="p-1.5 text-[#EAF3EC]/50 hover:text-[#FAF6F0] hover:bg-[#235F45]/60 rounded-lg transition-colors shrink-0 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>

            {/* Developer Attribution Link with MarIA Logo */}
            <div className="px-2 pt-2 border-t border-[#235F45]/60 flex flex-col items-center">
              <MariaLogo
                size="sm"
                variant="light"
                prefix="Desarrollado por"
                withLink={true}
              />
              <a
                href="https://maria-vert.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] text-emerald-300 hover:text-white underline decoration-emerald-400/40 hover:decoration-white transition-colors inline-flex items-center gap-1 mt-0.5 group font-semibold"
              >
                <span>maria-vert.vercel.app</span>
                <ExternalLink className="w-2.5 h-2.5 opacity-80 group-hover:opacity-100" />
              </a>
            </div>
          </>
        )}
      </div>
    </aside>
  );
};
