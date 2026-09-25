import React from 'react';
import { usePos } from '../context/PosContext';
import {
  LayoutGrid,
  LogOut,
  Sparkles,
  Maximize,
  Minimize,
  Sun,
  Moon,
} from 'lucide-react';
import { useFullscreen } from '../utils/fullscreen';
import { CajitaLogo } from './CajitaLogo';

interface HeaderProps {
  onToggleMobileSidebar?: () => void;
  isSidebarCollapsed?: boolean;
  onToggleSidebarCollapse?: () => void;
}

export const Header: React.FC<HeaderProps> = () => {
  const {
    currentUser,
    activeModule,
    setActiveModule,
    logout,
    darkMode,
    toggleDarkMode,
  } = usePos();

  const { isFullscreen, isSupported, toggle: toggleFullscreen } = useFullscreen();

  return (
    <header className={`h-16 ${darkMode ? 'bg-[#121B16] border-[#223328]' : 'bg-white border-[#E4DFD3]'} border-b px-3 sm:px-4 md:px-6 flex items-center justify-between sticky top-0 z-20 select-none gap-2 shadow-2xs transition-colors duration-200`}>
      {/* Left side: Cajita Logo + Apps Launcher Button + Current Module */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0 overflow-hidden">
        {/* Brand Cajita Logo */}
        <button
          type="button"
          onClick={() => setActiveModule('inicio')}
          className="flex items-center gap-2 p-0.5 rounded-xl hover:opacity-90 transition-transform active:scale-95 cursor-pointer shrink-0"
          title="Ir al Inicio (Menú de Apps)"
        >
          <CajitaLogo size={36} bgHex="#2E7D5B" lidHex="#EAF3EC" checkHex="#2E7D5B" />
        </button>

        {/* Launchpad / Apps Launcher Button right next to Cajita logo */}
        <button
          type="button"
          onClick={() => setActiveModule('inicio')}
          className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer shrink-0 flex items-center gap-1.5 font-bold text-xs ${
            activeModule === 'inicio'
              ? 'bg-[#2E7D5B] text-white shadow-xs'
              : darkMode
              ? 'text-[#FAF6F0] hover:bg-[#1E2E25] border border-[#223328]'
              : 'text-[#1C2B24] hover:bg-[#FAF6F0] border border-[#E4DFD3]'
          }`}
          aria-label="Ir al Menú Principal de Aplicaciones"
          title="Menú de Aplicaciones (Inicio)"
        >
          <LayoutGrid className={`w-4 h-4 ${activeModule === 'inicio' ? 'text-white' : darkMode ? 'text-[#4ADE80]' : 'text-[#2E7D5B]'}`} />
          <span className="text-xs font-bold">Apps</span>
        </button>

        {/* Active Module Indicator (Breadcrumb) */}
        {activeModule !== 'inicio' && (
          <div className={`hidden sm:flex items-center gap-1.5 text-xs font-medium shrink-0 pl-1 border-l ${darkMode ? 'border-[#223328] text-neutral-400' : 'border-[#E4DFD3] text-neutral-400'}`}>
            <span className={`font-bold ${darkMode ? 'text-[#FAF6F0]' : 'text-neutral-900'}`}>
              {activeModule === 'ventas'
                ? 'Punto de Venta'
                : activeModule === 'mis_ventas'
                ? 'Caja'
                : activeModule === 'inventario'
                ? 'Stock / Inventario'
                : activeModule === 'compras'
                ? 'Compras'
                : activeModule === 'reportes'
                ? 'Reportes'
                : activeModule === 'configuracion'
                ? 'Configuración'
                : 'Super Root'}
            </span>
          </div>
        )}
      </div>

      {/* Right side: Fullscreen, Theme Toggle, User Profile */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Fullscreen Mode Toggle */}
        {isSupported && (
          <button
            id="btn-header-fullscreen"
            type="button"
            onClick={toggleFullscreen}
            className={`p-2 rounded-xl transition-all cursor-pointer shrink-0 border ${
              isFullscreen
                ? 'bg-[#EAF3EC] dark:bg-[#1E2E25] text-[#2E7D5B] dark:text-[#4ADE80] border-[#2E7D5B]/30 dark:border-[#4ADE80]/30 shadow-2xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-[#1C2B24] dark:hover:text-white hover:bg-[#FAF6F0] dark:hover:bg-[#1E2E25] border-transparent'
            }`}
            aria-label={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
            title={isFullscreen ? "Restaurar tamaño normal" : "Pantalla completa (Maximizar espacio de venta)"}
          >
            {isFullscreen ? (
              <Minimize className="w-4 h-4 text-[#2E7D5B] dark:text-[#4ADE80]" />
            ) : (
              <Maximize className="w-4 h-4" />
            )}
          </button>
        )}

        {/* Theme Toggle Button (Claro / Oscuro) */}
        <button
          id="btn-header-theme"
          type="button"
          onClick={toggleDarkMode}
          className={`p-2 rounded-xl transition-all cursor-pointer shrink-0 border ${
            darkMode
              ? 'bg-[#1E2E25] text-[#5EEAD4] border-[#2A3E33] shadow-2xs'
              : 'text-neutral-600 hover:text-[#1C2B24] hover:bg-[#FAF6F0] border-transparent'
          }`}
          aria-label={darkMode ? "Cambiar a Modo Claro" : "Cambiar a Modo Oscuro"}
          title={darkMode ? "Modo Oscuro activo (clic para Modo Claro)" : "Modo Claro activo (clic para Modo Oscuro)"}
        >
          {darkMode ? (
            <Moon className="w-4 h-4 text-[#5EEAD4]" />
          ) : (
            <Sun className="w-4 h-4 text-[#F59E0B]" />
          )}
        </button>

        {/* Current User Badge */}
        {currentUser && (
          <div className="flex items-center gap-2 pl-2 border-l border-neutral-200 dark:border-[#223328]">
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-[#1C2B24] dark:bg-[#203D2C] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                {currentUser.name.charAt(0)}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white dark:border-[#121B16]" />
            </div>
            <div className="hidden md:block text-right leading-tight">
              <p className="text-xs font-bold text-neutral-900 dark:text-[#FAF6F0]">{currentUser.name}</p>
              <p className={`text-[10px] uppercase tracking-wider font-bold ${
                currentUser.role === 'super_root'
                  ? 'text-amber-600 font-black'
                  : currentUser.role === 'admin'
                  ? 'text-[#2E7D5B] dark:text-[#4ADE80]'
                  : 'text-neutral-500 dark:text-neutral-400'
              }`}>
                {currentUser.role === 'super_root' ? 'Super Root' : currentUser.role === 'admin' ? 'Administrador' : 'Cajero'}
              </p>
            </div>
            <button
              type="button"
              onClick={logout}
              title="Volver al Portal de Bienvenida, Onboarding o Demo"
              className="ml-1 p-1.5 sm:px-2.5 sm:py-1.5 bg-[#FAF6F0] dark:bg-[#1E2E25] hover:bg-[#EAF3EC] dark:hover:bg-[#273B30] text-neutral-700 dark:text-[#FAF6F0] hover:text-[#2E7D5B] dark:hover:text-[#4ADE80] border border-[#E4DFD3] dark:border-[#2E4337] rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#2E7D5B] dark:text-[#4ADE80]" />
              <span className="hidden sm:inline">Portal / Demo</span>
              <LogOut className="w-3.5 h-3.5 text-neutral-400 sm:ml-0.5" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
