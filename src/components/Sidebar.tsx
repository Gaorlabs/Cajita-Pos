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
} from 'lucide-react';

export const Sidebar: React.FC<{ isOpen?: boolean; onCloseMobile?: () => void }> = ({
  onCloseMobile,
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
      icon: ShoppingCart,
      adminOnly: false,
      badge: null,
    },
    {
      id: 'mis_ventas' as NavigationModule,
      label: 'Mis Ventas / Caja',
      icon: History,
      adminOnly: false,
      badge: null,
    },
    {
      id: 'inventario' as NavigationModule,
      label: 'Inventario',
      icon: Package,
      adminOnly: true,
      badge: lowStockCount > 0 ? lowStockCount : null,
      badgeColor: 'bg-amber-500 text-white',
    },
    {
      id: 'compras' as NavigationModule,
      label: 'Compras',
      icon: Truck,
      adminOnly: true,
      badge: null,
    },
    {
      id: 'reportes' as NavigationModule,
      label: 'Reportes',
      icon: BarChart3,
      adminOnly: true,
      badge: null,
    },
    {
      id: 'configuracion' as NavigationModule,
      label: 'Configuración',
      subtitle: `Rubro: ${sectorConfig.name || sectorConfig.shortName}`,
      icon: Sliders,
      adminOnly: true,
      badge: null,
    },
  ];

  const visibleItems = navItems.filter(
    (item) => !item.adminOnly || currentUser.role === 'admin'
  );

  return (
    <aside className="w-64 bg-[#1C2B24] text-[#FAF6F0] flex flex-col h-full border-r border-[#235F45]">
      {/* Brand Header */}
      <div className="p-4 border-b border-[#235F45] flex items-center justify-between">
        <div className="flex items-center gap-3 overflow-hidden">
          <CajitaLogo size={40} bgHex="#2E7D5B" lidHex="#EAF3EC" checkHex="#2E7D5B" />
          <div className="truncate">
            <h1 className="font-brand font-semibold text-base leading-tight text-[#FAF6F0] tracking-tight truncate">
              Cajita
            </h1>
            <p className="text-[11px] text-[#EAF3EC]/70 font-medium leading-tight truncate">
              Tu negocio, bien cuadrado
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-bold text-[#EAF3EC]/50 uppercase tracking-widest">
          MODULOS
        </div>
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeModule === item.id;
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

      {/* Low Stock Warning Banner if admin - Amber Badge per Cajita spec */}
      {currentUser.role === 'admin' && lowStockCount > 0 && (
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
      <div className="p-3 border-t border-[#235F45] bg-[#14211B]">
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
                {currentUser.role === 'admin' ? (
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
      </div>
    </aside>
  );
};
