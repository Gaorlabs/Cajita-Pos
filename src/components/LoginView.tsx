import React, { useState } from 'react';
import { usePos } from '../context/PosContext';
import {
  Lock,
  ArrowRight,
  Store,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  Smartphone,
  User,
  Zap,
  Play,
  QrCode,
  ShieldCheck,
  Building2,
  PhoneCall,
  Check,
  Laptop,
  ShieldAlert,
  ExternalLink,
} from 'lucide-react';
import { BUSINESS_SECTORS, BusinessSectorId } from '../data/businessSectors';
import { CajitaLogo } from './CajitaLogo';
import { MariaLogo } from './MariaLogo';
import { User as UserType } from '../types';

type ActiveView = 'main_menu' | 'register_business' | 'demo_modal' | 'pin_entry';

export const LoginView: React.FC = () => {
  const { login, registerTenant, setIsDemoTour, users } = usePos();
  const [activeView, setActiveView] = useState<ActiveView>('main_menu');
  const [error, setError] = useState('');

  // Formulario Mínimo de Registro de Negocio
  const [ownerName, setOwnerName] = useState('');
  const [storeName, setStoreName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedSector, setSelectedSector] = useState<BusinessSectorId>('tecnologia');
  const [yapeConfirmed, setYapeConfirmed] = useState(false);

  // Demo Rápida
  const [demoStoreName, setDemoStoreName] = useState('');

  // PIN Entry
  const availableUsers = users.length > 0 ? users : [];
  const [selectedUser, setSelectedUser] = useState<UserType>(availableUsers[0]);
  const [pin, setPin] = useState('');

  // Acciones de PIN
  const handleNumClick = (num: string) => {
    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);
      setError('');
      if (newPin.length === 4) {
        const currentUserTarget = selectedUser || availableUsers[0];
        const success = login(currentUserTarget.username, newPin);
        if (!success) {
          setError(`PIN incorrecto (prueba "${currentUserTarget.pin || '123'}")`);
          setPin('');
        }
      }
    }
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
    setError('');
  };

  // Enviar Registro Mínimo con Yape
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ownerName.trim() || !storeName.trim() || !phone.trim()) {
      setError('Por favor completa tu nombre, el nombre de tu negocio y WhatsApp.');
      return;
    }

    setIsDemoTour(false);
    registerTenant(storeName.trim(), selectedSector, ownerName.trim());
  };

  // Lanzar Demo Rápida
  const handleLaunchDemo = (sectorId: BusinessSectorId, nameOverride?: string) => {
    const finalName = nameOverride?.trim() || demoStoreName.trim() || (
      sectorId === 'tecnologia' ? 'CyberTech Perú' :
      sectorId === 'ropa' ? 'Boutique San Isidro' :
      sectorId === 'bodega' ? 'Minimarket Los Andes' :
      sectorId === 'farmacia' ? 'Botica Salud & Vida' :
      sectorId === 'cafeteria' ? 'Café Aroma & Sabor' : 'Mi Tienda Demo'
    );
    setIsDemoTour(true);
    registerTenant(finalName, sectorId, 'Administrador Demo');
  };

  return (
    <div className="h-[100dvh] max-h-[100dvh] w-full bg-[#FAF6F0] flex flex-col items-center justify-between p-3 sm:p-5 select-none font-sans text-[#1C2B24] overflow-hidden">
      
      {/* 1. VISTA PRINCIPAL: MENÚ DE 3 ACCIONES */}
      {activeView === 'main_menu' && (
        <div className="w-full max-w-md my-auto flex flex-col items-center justify-between space-y-3 sm:space-y-4 animate-in fade-in zoom-in-95 duration-200">
          
          {/* Logo y Marca Cajita en Gran Formato */}
          <div className="text-center space-y-1.5 flex flex-col items-center pt-1">
            <div className="relative group cursor-pointer transition-transform hover:scale-105 duration-200">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#2E7D5B] rounded-[22px] sm:rounded-[26px] flex items-center justify-center shadow-lg shadow-[#2E7D5B]/20 border-3 border-white">
                <CajitaLogo size={46} variant="iconOnly" lidHex="#FFFFFF" checkHex="#2E7D5B" />
              </div>
              <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2E7D5B] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-[#2E7D5B] border-2 border-white"></span>
              </span>
            </div>

            <div>
              <h1 className="font-marketing font-black text-3xl sm:text-4xl text-[#1C2B24] tracking-tight flex items-center justify-center gap-1.5">
                Cajita
                <span className="text-[10px] sm:text-xs font-black bg-[#EAF3EC] text-[#2E7D5B] px-2 py-0.5 rounded-full uppercase tracking-wider border border-[#2E7D5B]/20">
                  POS
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-neutral-600 font-medium leading-tight mt-0.5">
                El punto de venta más ágil y ordenado para tu tienda
              </p>
            </div>

            {/* Badges rápidos de confianza en paleta oficial */}
            <div className="flex items-center justify-center gap-1.5 pt-0.5 text-[10px] sm:text-xs font-bold text-neutral-600">
              <span className="flex items-center gap-1 bg-white px-2 py-0.5 rounded-full border border-[#E4DFD3] shadow-2xs">
                <Zap className="w-3 h-3 text-[#B87D0F]" />
                Rápido
              </span>
              <span className="flex items-center gap-1 bg-white px-2 py-0.5 rounded-full border border-[#E4DFD3] shadow-2xs">
                <Smartphone className="w-3 h-3 text-[#2E7D5B]" />
                Móvil / PC
              </span>
              <span className="flex items-center gap-1 bg-white px-2 py-0.5 rounded-full border border-[#E4DFD3] shadow-2xs">
                <ShieldCheck className="w-3 h-3 text-[#2E7D5B]" />
                Caja Cuadrada
              </span>
            </div>
          </div>

          {/* LAS 3 OPCIONES: DIFERENCIADAS DENTRO DE LA PALETA CAJITA */}
          <div className="w-full space-y-2.5 sm:space-y-3">
            
            {/* OPCIÓN 1: VERDE PRIMARIO CAJITA (Probar Demo Gratis) */}
            <button
              id="btn-probar-demo"
              onClick={() => setActiveView('demo_modal')}
              className="w-full p-3 sm:p-4 bg-[#2E7D5B] hover:bg-[#235F45] text-white rounded-2xl sm:rounded-3xl text-left shadow-md shadow-[#2E7D5B]/20 active:scale-[0.98] transition-all duration-150 flex items-center justify-between cursor-pointer border border-[#2E7D5B] group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-white/20 text-white flex items-center justify-center shadow-inner shrink-0 group-hover:scale-105 transition-transform backdrop-blur-xs">
                  <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-white ml-0.5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="bg-white/25 text-white text-[9px] sm:text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider">
                      ⚡ 1 Clic · Sin Registro
                    </span>
                  </div>
                  <h3 className="font-marketing font-black text-base sm:text-lg text-white mt-0.5 leading-tight">
                    Probar Demo Gratis
                  </h3>
                  <p className="text-[11px] sm:text-xs text-[#EAF3EC] font-medium leading-tight">
                    Prueba ventas y productos al instante
                  </p>
                </div>
              </div>
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white/20 flex items-center justify-center text-white group-hover:bg-white group-hover:text-[#2E7D5B] transition-all shrink-0 ml-1">
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
            </button>

            {/* OPCIÓN 2: CARBÓN BOSQUE CAJITA (Quiero para mi Negocio - Plan S/ 30) */}
            <button
              id="btn-registrar-negocio"
              onClick={() => {
                setActiveView('register_business');
                setError('');
              }}
              className="w-full p-3 sm:p-4 bg-[#1C2B24] hover:bg-[#14201a] text-white rounded-2xl sm:rounded-3xl text-left shadow-md shadow-[#1C2B24]/20 active:scale-[0.98] transition-all duration-150 flex items-center justify-between cursor-pointer border border-[#2a3f35] group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-white/10 text-[#EAF3EC] flex items-center justify-center shadow-inner shrink-0 group-hover:scale-105 transition-transform">
                  <Store className="w-5 h-5 sm:w-6 sm:h-6 text-[#2E7D5B]" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="bg-[#EAF3EC] text-[#2E7D5B] text-[9px] sm:text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider">
                      S/ 30 al mes · Yape
                    </span>
                  </div>
                  <h3 className="font-marketing font-black text-base sm:text-lg text-white mt-0.5 leading-tight">
                    Quiero para mi Negocio
                  </h3>
                  <p className="text-[11px] sm:text-xs text-neutral-300 font-medium leading-tight">
                    Crea tu tienda y empieza a cobrar hoy
                  </p>
                </div>
              </div>
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white/10 flex items-center justify-center text-neutral-300 group-hover:bg-[#2E7D5B] group-hover:text-white transition-all shrink-0 ml-1">
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
            </button>

            {/* OPCIÓN 3: CREMA / BLANCO LIMPIO CON BORDE CAJITA (Ingresar con PIN de Caja) */}
            <button
              id="btn-ingresar-pin"
              onClick={() => {
                setActiveView('pin_entry');
                setError('');
                setPin('');
              }}
              className="w-full p-3 sm:p-4 bg-white hover:bg-[#EAF3EC]/60 text-[#1C2B24] rounded-2xl sm:rounded-3xl text-left shadow-2xs hover:shadow-xs active:scale-[0.98] transition-all duration-150 flex items-center justify-between cursor-pointer border-2 border-[#E4DFD3] hover:border-[#2E7D5B] group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-[#FAF6F0] text-[#2E7D5B] border border-[#E4DFD3] flex items-center justify-center shadow-2xs shrink-0 group-hover:bg-[#EAF3EC] transition-colors">
                  <Lock className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div>
                  <span className="bg-[#FAF6F0] text-neutral-600 border border-[#E4DFD3] text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
                    🔑 Personal de Turno
                  </span>
                  <h3 className="font-marketing font-black text-base sm:text-lg text-[#1C2B24] mt-0.5 leading-tight">
                    Ingresar con mi PIN de Caja
                  </h3>
                  <p className="text-[11px] sm:text-xs text-neutral-500 font-medium leading-tight">
                    Acceso para cajeros y personal registrado
                  </p>
                </div>
              </div>
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#FAF6F0] border border-[#E4DFD3] flex items-center justify-center text-neutral-600 group-hover:bg-[#2E7D5B] group-hover:text-white group-hover:border-[#2E7D5B] transition-all shrink-0 ml-1">
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
            </button>

          </div>

          {/* Super Root & Dev Attribution Footer with MarIA Logo */}
          <div className="pt-3 flex flex-col items-center gap-2 border-t border-[#E4DFD3]/80">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setActiveView('pin_entry');
                  const rootUser = availableUsers.find((u) => u.role === 'super_root') || {
                    id: 'user-root',
                    username: 'root',
                    name: 'Super Root (Dueño)',
                    role: 'super_root' as const,
                    pin: '9999',
                  };
                  setSelectedUser(rootUser);
                  setPin('');
                  setError('');
                }}
                className="text-[10px] font-bold text-neutral-400 hover:text-[#2E7D5B] flex items-center gap-1 cursor-pointer transition-colors"
                title="Acceso Maestro Super Root (PIN: 9999)"
              >
                <ShieldAlert className="w-3 h-3" />
                <span>Acceso Super Root (PIN: 9999)</span>
              </button>
            </div>

            <div className="text-center text-[11px] text-neutral-500 font-medium">
              Hecho para comercios, tecnología y tiendas en Perú 🇵🇪
            </div>

            {/* MarIA Official Branding & Website Link */}
            <div className="mt-0.5 pt-1.5 flex flex-col items-center">
              <MariaLogo
                size="md"
                variant="dark"
                showByline={true}
                prefix="Desarrollado por"
                withLink={true}
              />
              <a
                href="https://maria-vert.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] font-bold text-[#7C3AED] hover:text-[#6D28D9] underline decoration-[#7C3AED]/40 hover:decoration-[#6D28D9] flex items-center gap-1 mt-1 transition-colors group"
              >
                <span>https://maria-vert.vercel.app/</span>
                <ExternalLink className="w-3 h-3 opacity-70 group-hover:opacity-100" />
              </a>
            </div>
          </div>

        </div>
      )}

      {/* 2. FORMULARIO MÍNIMO: REGISTRAR NEGOCIO CON YAPE */}
      {activeView === 'register_business' && (
        <div className="w-full max-w-md my-auto bg-white border border-[#E4DFD3] rounded-3xl shadow-xl p-4 sm:p-5 space-y-3 max-h-[96dvh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
          
          {/* CABECERA OFICIAL CAJITA POS */}
          <div className="flex items-center justify-between pb-2.5 border-b border-[#E4DFD3]">
            <button
              onClick={() => setActiveView('main_menu')}
              className="p-1.5 hover:bg-[#FAF6F0] rounded-xl text-neutral-600 hover:text-[#1C2B24] flex items-center gap-1 text-xs font-bold transition-all cursor-pointer border border-transparent hover:border-[#E4DFD3]"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#2E7D5B]" />
              <span>Volver</span>
            </button>

            {/* Logo y Nombre Cajita POS en cabeza */}
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 sm:w-7 sm:h-7 bg-[#2E7D5B] rounded-lg flex items-center justify-center shadow-xs border border-white">
                <CajitaLogo size={16} variant="iconOnly" lidHex="#FFFFFF" checkHex="#2E7D5B" />
              </div>
              <span className="font-marketing font-black text-sm sm:text-base text-[#1C2B24] tracking-tight">Cajita</span>
              <span className="text-[8px] sm:text-[9px] font-black bg-[#EAF3EC] text-[#2E7D5B] px-1.5 py-0.2 rounded uppercase tracking-wider border border-[#2E7D5B]/20">
                POS
              </span>
            </div>

            <span className="text-[9px] sm:text-[10px] font-black uppercase text-[#2E7D5B] bg-[#EAF3EC] px-2 py-0.5 rounded-full border border-[#2E7D5B]/20">
              S/ 30 · Mes
            </span>
          </div>

          <div className="space-y-0.5">
            <h2 className="font-marketing font-black text-lg sm:text-xl text-[#1C2B24] leading-tight">
              Activa tu Cajita POS
            </h2>
            <p className="text-[11px] sm:text-xs text-neutral-600 font-medium">
              Solo 3 datos para crear tu tienda y empezar a vender hoy.
            </p>
          </div>

          {error && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={handleRegisterSubmit} className="space-y-2.5">
            
            {/* 1. Nombre del Dueño */}
            <div>
              <label className="block text-xs font-bold text-[#1C2B24] mb-1">
                Tu Nombre y Apellido
              </label>
              <div className="relative">
                <User className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  placeholder="ej. Carlos Silva / María Quispe"
                  className="w-full pl-9 pr-3 py-2 bg-[#FAF6F0] border border-[#E4DFD3] rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:border-[#2E7D5B]"
                />
              </div>
            </div>

            {/* 2. Nombre del Negocio */}
            <div>
              <label className="block text-xs font-bold text-[#1C2B24] mb-1">
                Nombre de tu Negocio o Tienda
              </label>
              <div className="relative">
                <Store className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  placeholder="ej. CyberTech Wilson / Boutique Las Rosas"
                  className="w-full pl-9 pr-3 py-2 bg-[#FAF6F0] border border-[#E4DFD3] rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:border-[#2E7D5B]"
                />
              </div>
            </div>

            {/* 3. WhatsApp */}
            <div>
              <label className="block text-xs font-bold text-[#1C2B24] mb-1">
                WhatsApp / Celular
              </label>
              <div className="relative">
                <Smartphone className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="ej. 987 654 321"
                  className="w-full pl-9 pr-3 py-2 bg-[#FAF6F0] border border-[#E4DFD3] rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:border-[#2E7D5B]"
                />
              </div>
            </div>

            {/* 4. Rubro Rápido (Incluye Tecnología!) */}
            <div>
              <label className="block text-xs font-bold text-[#1C2B24] mb-1">
                Rubro de tu negocio
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                {[
                  { id: 'tecnologia', label: '💻 Tecnología / Cómputo' },
                  { id: 'ropa', label: '👗 Ropa / Moda' },
                  { id: 'bodega', label: '🏪 Bodega / Market' },
                  { id: 'cafeteria', label: '☕ Cafetería' },
                  { id: 'farmacia', label: '💊 Farmacia' },
                ].map((sec) => (
                  <button
                    key={sec.id}
                    type="button"
                    onClick={() => setSelectedSector(sec.id as BusinessSectorId)}
                    className={`p-2 rounded-xl border text-[10.5px] font-bold flex items-center justify-center text-center transition-all cursor-pointer ${
                      selectedSector === sec.id
                        ? 'bg-[#2E7D5B] text-white border-[#2E7D5B] shadow-xs'
                        : 'bg-[#FAF6F0] text-[#1C2B24] border-[#E4DFD3] hover:bg-[#EAF3EC]'
                    }`}
                  >
                    <span>{sec.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 5. TARJETA VISUAL DE PAGO YAPE */}
            <div className="p-2.5 sm:p-3 bg-[#FAF6F0] border border-[#E4DFD3] rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-[#2E7D5B] text-white flex items-center justify-center font-black text-xs shadow-xs">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="font-black text-xs text-[#1C2B24] leading-tight">
                      Plan Ilimitado (Yape / Plin)
                    </h4>
                    <p className="text-[10px] text-neutral-600 font-medium">
                      Productos, boletas y reportes sin límite
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-marketing font-black text-base text-[#2E7D5B]">
                    S/ 30
                  </span>
                  <span className="text-[9px] text-neutral-500 font-bold block">/ mes</span>
                </div>
              </div>

              <div className="bg-white p-2 rounded-xl border border-[#E4DFD3] flex items-center justify-between text-xs">
                <div>
                  <span className="text-[9px] text-neutral-500 font-bold uppercase block">Yape a este número:</span>
                  <span className="font-mono font-black text-xs text-[#1C2B24] tracking-wider">
                    999 888 777
                  </span>
                  <span className="text-[9px] text-neutral-500 block">Titular: Cajita POS SAC</span>
                </div>
                <div className="p-1 bg-[#FAF6F0] rounded-lg text-[#2E7D5B] border border-[#E4DFD3]">
                  <QrCode className="w-5 h-5" />
                </div>
              </div>

              <label className="flex items-center gap-1.5 text-[11px] font-semibold text-neutral-700 cursor-pointer pt-0.5">
                <input
                  type="checkbox"
                  checked={yapeConfirmed}
                  onChange={(e) => setYapeConfirmed(e.target.checked)}
                  className="w-3.5 h-3.5 rounded text-[#2E7D5B] accent-[#2E7D5B] focus:ring-[#2E7D5B]"
                />
                <span>Ya hice el Yape de S/ 30 o pagaré al iniciar</span>
              </label>
            </div>

            {/* Botón de Enviar en Verde Cajita */}
            <button
              type="submit"
              className="w-full py-2.5 sm:py-3 bg-[#2E7D5B] hover:bg-[#235F45] text-white rounded-xl font-marketing font-extrabold text-sm shadow-md shadow-[#2E7D5B]/20 active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Crear Tienda y Empezar</span>
            </button>

          </form>

        </div>
      )}

      {/* 3. SELECTOR RÁPIDO DE DEMO (Con Rubro de Tecnología y Cabecera Cajita POS) */}
      {activeView === 'demo_modal' && (
        <div className="w-full max-w-md my-auto bg-white border border-[#E4DFD3] rounded-3xl shadow-xl p-4 sm:p-5 space-y-3 max-h-[96dvh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
          
          {/* CABECERA OFICIAL CAJITA POS */}
          <div className="flex items-center justify-between pb-2.5 border-b border-[#E4DFD3]">
            <button
              onClick={() => setActiveView('main_menu')}
              className="p-1.5 hover:bg-[#FAF6F0] rounded-xl text-neutral-600 hover:text-[#1C2B24] flex items-center gap-1 text-xs font-bold transition-all cursor-pointer border border-transparent hover:border-[#E4DFD3]"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#2E7D5B]" />
              <span>Volver</span>
            </button>

            {/* Logo y Nombre Cajita POS en cabeza */}
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 sm:w-7 sm:h-7 bg-[#2E7D5B] rounded-lg flex items-center justify-center shadow-xs border border-white">
                <CajitaLogo size={16} variant="iconOnly" lidHex="#FFFFFF" checkHex="#2E7D5B" />
              </div>
              <span className="font-marketing font-black text-sm sm:text-base text-[#1C2B24] tracking-tight">Cajita</span>
              <span className="text-[8px] sm:text-[9px] font-black bg-[#EAF3EC] text-[#2E7D5B] px-1.5 py-0.2 rounded uppercase tracking-wider border border-[#2E7D5B]/20">
                POS
              </span>
            </div>

            <span className="text-[9px] sm:text-[10px] font-black uppercase text-[#2E7D5B] bg-[#EAF3EC] px-2 py-0.5 rounded-full border border-[#2E7D5B]/20">
              Demo 1 Clic
            </span>
          </div>

          <div className="text-center space-y-0.5">
            <h2 className="font-marketing font-black text-lg sm:text-xl text-[#1C2B24]">
              ¿Qué rubro quieres probar?
            </h2>
            <p className="text-[11px] sm:text-xs text-neutral-600 font-medium">
              Cargaremos un catálogo con productos listos para cobrar.
            </p>
          </div>

          {/* Nombre Opcional de la Tienda */}
          <div>
            <label className="block text-xs font-bold text-[#1C2B24] mb-1">
              Nombre de tu Negocio (Opcional)
            </label>
            <input
              type="text"
              value={demoStoreName}
              onChange={(e) => setDemoStoreName(e.target.value)}
              placeholder="ej. CyberTech Wilson / Boutique Glam"
              className="w-full px-3 py-2 bg-[#FAF6F0] border border-[#E4DFD3] rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:border-[#2E7D5B]"
            />
          </div>

          {/* Opciones directas por rubro en la paleta limpia de Cajita */}
          <div className="space-y-1.5">
            {[
              { id: 'tecnologia', label: 'Tecnología, Cómputo & Celulares', icon: '💻', desc: 'Periféricos gamer, cargadores, cables y discos' },
              { id: 'ropa', label: 'Tienda de Ropa & Moda', icon: '👗', desc: 'Prendas con tallas, colores y ofertas' },
              { id: 'bodega', label: 'Bodega & Minimarket', icon: '🏪', desc: 'Abarrotes, bebidas y venta al peso' },
              { id: 'cafeteria', label: 'Cafetería & Restaurante', icon: '☕', desc: 'Bebidas, combos y snacks de paso' },
              { id: 'farmacia', label: 'Farmacia & Botica', icon: '💊', desc: 'Medicamentos, fecha de lote y stock' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => handleLaunchDemo(item.id as BusinessSectorId)}
                className="w-full p-2.5 bg-[#FAF6F0] hover:bg-[#EAF3EC] border border-[#E4DFD3] hover:border-[#2E7D5B] rounded-2xl text-left transition-all flex items-center justify-between cursor-pointer group shadow-2xs"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">{item.icon}</span>
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm text-[#1C2B24] group-hover:text-[#2E7D5B] leading-tight">
                      {item.label}
                    </h4>
                    <p className="text-[10px] text-neutral-500 leading-tight">{item.desc}</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:text-[#2E7D5B] group-hover:translate-x-1 transition-all" />
              </button>
            ))}
          </div>

        </div>
      )}

      {/* 4. INGRESO RÁPIDO CON PIN (Con Cabecera Oficial Cajita POS) */}
      {activeView === 'pin_entry' && (
        <div className="w-full max-w-xs my-auto bg-white border border-[#E4DFD3] rounded-3xl shadow-xl p-4 sm:p-5 space-y-3.5 animate-in fade-in zoom-in-95 duration-200">
          
          {/* CABECERA OFICIAL CAJITA POS */}
          <div className="flex items-center justify-between pb-2 border-b border-[#E4DFD3]">
            <button
              onClick={() => setActiveView('main_menu')}
              className="p-1 hover:bg-[#FAF6F0] rounded-lg text-neutral-600 hover:text-[#1C2B24] flex items-center gap-1 text-xs font-bold transition-all cursor-pointer border border-transparent hover:border-[#E4DFD3]"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#2E7D5B]" />
              <span>Volver</span>
            </button>

            {/* Logo y Nombre Cajita POS en cabeza */}
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 bg-[#2E7D5B] rounded-lg flex items-center justify-center shadow-xs border border-white">
                <CajitaLogo size={14} variant="iconOnly" lidHex="#FFFFFF" checkHex="#2E7D5B" />
              </div>
              <span className="font-marketing font-black text-sm text-[#1C2B24] tracking-tight">Cajita</span>
              <span className="text-[8px] font-black bg-[#EAF3EC] text-[#2E7D5B] px-1.5 py-0.2 rounded uppercase tracking-wider border border-[#2E7D5B]/20">
                POS
              </span>
            </div>

            <span className="text-[9px] font-bold text-[#2E7D5B] bg-[#EAF3EC] px-2 py-0.5 rounded-full border border-[#2E7D5B]/20">
              PIN
            </span>
          </div>

          {/* Selector de Usuario */}
          <div className="text-center space-y-1">
            <h2 className="font-marketing font-black text-base sm:text-lg text-[#1C2B24] leading-tight">
              ¿Quién está en caja?
            </h2>
            <div className="flex justify-center flex-wrap gap-1.5">
              {availableUsers.map((u) => (
                <button
                  key={u.id}
                  onClick={() => {
                    setSelectedUser(u);
                    setPin('');
                    setError('');
                  }}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                    selectedUser?.id === u.id
                      ? 'bg-[#2E7D5B] text-white shadow-xs'
                      : 'bg-[#FAF6F0] text-neutral-600 hover:bg-[#EAF3EC]'
                  }`}
                >
                  <User className="w-3 h-3" />
                  <span>{u.name.split(' ')[0]}</span>
                  {u.role === 'admin' && (
                    <span className="text-[9px] bg-white/20 px-1 rounded-sm uppercase font-semibold">Admin</span>
                  )}
                  {u.role === 'super_root' && (
                    <span className="text-[9px] bg-amber-400 text-neutral-900 px-1 rounded-sm uppercase font-bold">Root</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Dots del PIN */}
          <div className="flex justify-center items-center gap-2.5 py-0.5">
            {[0, 1, 2, 3].map((idx) => (
              <div
                key={idx}
                className={`w-3 h-3 rounded-full transition-all duration-200 ${
                  pin.length > idx
                    ? 'bg-[#2E7D5B] scale-110 ring-3 ring-[#2E7D5B]/20'
                    : 'bg-neutral-200'
                }`}
              />
            ))}
          </div>

          {error && (
            <p className="text-center text-[11px] text-rose-600 font-bold animate-shake leading-tight">
              {error}
            </p>
          )}

          {/* Teclado Numérico */}
          <div className="grid grid-cols-3 gap-2 max-w-[210px] mx-auto">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
              <button
                key={digit}
                onClick={() => handleNumClick(digit)}
                className="h-10 sm:h-11 rounded-xl bg-[#FAF6F0] hover:bg-[#EAF3EC] active:scale-95 text-lg font-bold text-[#1C2B24] transition-all flex items-center justify-center cursor-pointer border border-[#E4DFD3] shadow-2xs"
              >
                {digit}
              </button>
            ))}
            <div />
            <button
              onClick={() => handleNumClick('0')}
              className="h-10 sm:h-11 rounded-xl bg-[#FAF6F0] hover:bg-[#EAF3EC] active:scale-95 text-lg font-bold text-[#1C2B24] transition-all flex items-center justify-center cursor-pointer border border-[#E4DFD3] shadow-2xs"
            >
              0
            </button>
            <button
              onClick={handleBackspace}
              className="h-10 sm:h-11 rounded-xl bg-[#FAF6F0] hover:bg-rose-50 active:scale-95 text-neutral-600 hover:text-rose-600 transition-all flex items-center justify-center cursor-pointer border border-[#E4DFD3]"
            >
              ⌫
            </button>
          </div>

          <p className="text-center text-[10px] text-neutral-400 font-medium">
            PIN para {selectedUser?.name || 'usuario'}:{' '}
            <strong className="text-neutral-700">{selectedUser?.pin || '123'}</strong>
          </p>

          <div className="pt-1.5 border-t border-[#E4DFD3]/60 flex flex-col items-center">
            <MariaLogo size="xs" variant="dark" prefix="Desarrollado por" withLink={true} />
          </div>

        </div>
      )}

    </div>
  );
};
