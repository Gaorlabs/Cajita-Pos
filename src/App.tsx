import React, { useState } from 'react';
import { PosProvider, usePos } from './context/PosContext';
import { LoginView } from './components/LoginView';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { VentasModule } from './components/Ventas/VentasModule';
import { MisVentasView } from './components/Ventas/MisVentasView';
import { InventarioModule } from './components/Inventario/InventarioModule';
import { ComprasModule } from './components/Compras/ComprasModule';
import { ReportesModule } from './components/Reportes/ReportesModule';
import { ConfiguracionModule } from './components/Configuracion/ConfiguracionModule';
import { SuperRootModule } from './components/SuperRoot/SuperRootModule';
import { MobileBottomNav } from './components/MobileBottomNav';
import { X } from 'lucide-react';

const MainAppContent: React.FC = () => {
  const { currentUser, activeModule } = usePos();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      // Default to collapsed (Rail: 68px) on tablets (< 1280px) to give maximum space to POS
      return window.innerWidth < 1280;
    }
    return false;
  });

  // Automatically adapt sidebar when window is resized across tablet / desktop threshold
  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsSidebarCollapsed(true);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!currentUser) {
    return <LoginView />;
  }

  const renderActiveModule = () => {
    switch (activeModule) {
      case 'ventas':
        return <VentasModule />;
      case 'mis_ventas':
        return <MisVentasView />;
      case 'inventario':
        return currentUser.role === 'admin' || currentUser.role === 'super_root' ? <InventarioModule /> : <VentasModule />;
      case 'compras':
        return currentUser.role === 'admin' || currentUser.role === 'super_root' ? <ComprasModule /> : <VentasModule />;
      case 'reportes':
        return currentUser.role === 'admin' || currentUser.role === 'super_root' ? <ReportesModule /> : <VentasModule />;
      case 'configuracion':
        return currentUser.role === 'admin' || currentUser.role === 'super_root' ? <ConfiguracionModule /> : <VentasModule />;
      case 'super_root':
        return currentUser.role === 'super_root' ? <SuperRootModule /> : <VentasModule />;
      default:
        return <VentasModule />;
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF6F0] flex flex-col font-sans text-[#1A1A1A] antialiased selection:bg-[#2E7D5B] selection:text-white">
      <Header
        onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        isSidebarCollapsed={isSidebarCollapsed}
        onToggleSidebarCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      <div className="flex-1 flex overflow-hidden relative">
        {/* Responsive Sidebar (Rail on tablet, full or rail on PC) */}
        <div className="hidden md:block shrink-0 h-full">
          <Sidebar
            isCollapsed={isSidebarCollapsed}
            onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          />
        </div>

        {/* Mobile Sidebar Overlay Drawer */}
        {isMobileSidebarOpen && (
          <div className="fixed inset-0 z-40 flex md:hidden">
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
              onClick={() => setIsMobileSidebarOpen(false)}
            />
            <div className="relative flex-1 max-w-xs w-full bg-[#1C2B24] text-[#FAF6F0] z-50">
              <button
                onClick={() => setIsMobileSidebarOpen(false)}
                className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-white cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
              <Sidebar onCloseMobile={() => setIsMobileSidebarOpen(false)} />
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className={`flex-1 overflow-y-auto bg-[#FAF6F0] ${activeModule === 'ventas' ? 'pb-0' : 'pb-16 md:pb-0'}`}>
          {renderActiveModule()}
        </main>
      </div>

      {/* Mobile & Tablet Bottom Navigation Bar */}
      <MobileBottomNav />
    </div>
  );
};

export default function App() {
  return (
    <PosProvider>
      <MainAppContent />
    </PosProvider>
  );
}
