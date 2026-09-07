import React from 'react';
import { usePos } from '../context/PosContext';
import { NavigationModule } from '../types';
import { ShoppingCart, History, Package, Truck, BarChart3 } from 'lucide-react';

export const MobileBottomNav: React.FC = () => {
  const { currentUser, activeModule, setActiveModule, cart, getLowStockProducts } = usePos();

  if (!currentUser) return null;
  if (activeModule === 'ventas') return null;

  const lowStockCount = getLowStockProducts().length;
  const cartItemCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const navItems = [
    {
      id: 'ventas' as NavigationModule,
      label: 'Caja POS',
      icon: ShoppingCart,
      badge: cartItemCount > 0 ? cartItemCount : null,
      badgeColor: 'bg-emerald-500 text-neutral-950',
      adminOnly: false,
    },
    {
      id: 'mis_ventas' as NavigationModule,
      label: 'Historial',
      icon: History,
      badge: null,
      adminOnly: false,
    },
    {
      id: 'inventario' as NavigationModule,
      label: 'Inventario',
      icon: Package,
      badge: lowStockCount > 0 ? lowStockCount : null,
      badgeColor: 'bg-amber-500 text-neutral-950',
      adminOnly: true,
    },
    {
      id: 'compras' as NavigationModule,
      label: 'Compras',
      icon: Truck,
      badge: null,
      adminOnly: true,
    },
    {
      id: 'reportes' as NavigationModule,
      label: 'Reportes',
      icon: BarChart3,
      badge: null,
      adminOnly: true,
    },
  ];

  const visibleItems = navItems.filter((i) => !i.adminOnly || currentUser.role === 'admin');

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-[#1C2B24] border-t border-[#235F45] px-2 py-1.5 shadow-2xl safe-area-bottom"
      aria-label="Navegación móvil inferior"
    >
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeModule === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveModule(item.id)}
              className={`flex-1 min-h-[48px] flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all cursor-pointer relative ${
                isActive
                  ? 'text-[#2E7D5B] font-bold bg-[#14211B]'
                  : 'text-[#EAF3EC]/60 hover:text-[#FAF6F0] active:scale-95'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
                {item.badge !== null && (
                  <span
                    className={`absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 rounded-full text-[9px] font-black flex items-center justify-center font-mono ${
                      item.badgeColor || 'bg-[#2E7D5B] text-[#FAF6F0]'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-1 leading-none tracking-tight">
                {item.label}
              </span>
              {isActive && (
                <span className="absolute bottom-0.5 w-6 h-0.5 rounded-full bg-[#2E7D5B]" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
