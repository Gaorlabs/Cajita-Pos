import React from 'react';
import { PosProvider, usePos } from './context/PosContext';
import { LoginView } from './components/LoginView';
import { Header } from './components/Header';
import { LaunchpadView } from './components/Launchpad/LaunchpadView';
import { VentasModule } from './components/Ventas/VentasModule';
import { MisVentasView } from './components/Ventas/MisVentasView';
import { InventarioModule } from './components/Inventario/InventarioModule';
import { ComprasModule } from './components/Compras/ComprasModule';
import { ReportesModule } from './components/Reportes/ReportesModule';
import { ConfiguracionModule } from './components/Configuracion/ConfiguracionModule';
import { SuperRootModule } from './components/SuperRoot/SuperRootModule';

const MainAppContent: React.FC = () => {
  const { currentUser, activeModule, darkMode } = usePos();

  if (!currentUser) {
    return <LoginView />;
  }

  const renderActiveModule = () => {
    switch (activeModule) {
      case 'inicio':
        return <LaunchpadView />;
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
    <div
      className={`min-h-screen ${
        darkMode ? 'dark bg-[#111714] text-[#F3F4F6]' : 'bg-[#FAF6F0] text-[#1A1A1A]'
      } flex flex-col font-sans antialiased selection:bg-[#2E7D5B] selection:text-white transition-colors duration-200`}
    >
      <Header />

      <div className="flex-1 flex overflow-hidden relative">
        {/* Main Content Area - Full width and height workspace */}
        <main
          className={`flex-1 overflow-y-auto ${
            darkMode ? 'bg-[#111714]' : 'bg-[#FAF6F0]'
          } transition-colors duration-200`}
        >
          {renderActiveModule()}
        </main>
      </div>
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
