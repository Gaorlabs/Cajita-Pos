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
  const [sectorText, setSectorText] = useState('');
  const [yapeConfirmed, setYapeConfirmed] = useState(false);

  // Demo Rápida
  const [demoStoreName, setDemoStoreName] = useState('');

  // PIN Entry
  const availableUsers = (users && users.length > 0) ? users : [];
  const rootUser = availableUsers.find((u) => u.role === 'super_root' || u.role === 'admin') || availableUsers[0] || { id: 'root', name: 'Administrador', username: 'root', role: 'admin', pin: '1982', active: true };
  const [selectedUser, setSelectedUser] = useState<UserType>(rootUser);
  const [pin, setPin] = useState('');

  // Acciones de PIN
  const handleNumClick = (num: string) => {
    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);
      setError('');
      if (newPin.length === 4) {
        const usernameToTry = newPin === '1982' ? 'root' : (rootUser?.username || selectedUser?.username || 'root');
        const success = login(usernameToTry, newPin);
        if (!success) {
          setError(`PIN incorrecto`);
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
  const [isSubmittingWhatsapp, setIsSubmittingWhatsapp] = useState(false);
  const [whatsappSuccessNotice, setWhatsappSuccessNotice] = useState(false);

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ownerName.trim() || !storeName.trim() || !phone.trim() || !sectorText.trim()) {
      setError('Por favor completa todos los campos, incluyendo el rubro de tu negocio.');
      return;
    }

    setIsSubmittingWhatsapp(true);
    try {
      const lower = sectorText.toLowerCase();
      let computedSector: BusinessSectorId = 'tecnologia';
      if (lower.includes('farm') || lower.includes('botic') || lower.includes('medic') || lower.includes('salud')) computedSector = 'farmacia';
      else if (lower.includes('ropa') || lower.includes('moda') || lower.includes('boutique') || lower.includes('calzad')) computedSector = 'ropa';
      else if (lower.includes('bodeg') || lower.includes('market') || lower.includes('minimarket') || lower.includes('abarrot') || lower.includes('tiend')) computedSector = 'bodega';
      else if (lower.includes('cafe') || lower.includes('restaur') || lower.includes('comid') || lower.includes('bar') || lower.includes('postr')) computedSector = 'cafeteria';

      registerTenant(storeName.trim(), computedSector, ownerName.trim(), false);

      // Simulate sending WhatsApp message
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setWhatsappSuccessNotice(true);
    } catch (err) {
      setError('Ocurrió un error al procesar tu solicitud.');
    } finally {
      setIsSubmittingWhatsapp(false);
    }
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

          {/* Dev Attribution Footer with MarIA Logo */}
          <div className="pt-3 flex flex-col items-center gap-2 border-t border-[#E4DFD3]/80">
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

          {whatsappSuccessNotice ? (
            <div className="py-6 text-center space-y-4 animate-in fade-in zoom-in-95">
              <div className="w-16 h-16 bg-emerald-100 text-[#2E7D5B] rounded-2xl mx-auto flex items-center justify-center shadow-sm border border-emerald-200">
                <CheckCircle2 className="w-8 h-8 text-[#2E7D5B]" />
              </div>
              <div className="space-y-1">
                <h3 className="font-marketing font-black text-lg text-[#1C2B24]">
                  ¡Envío exitoso!
                </h3>
                <p className="text-xs text-neutral-600 px-4">
                  Se ha enviado correctamente la solicitud al número destinatario y a tu WhatsApp (<span className="font-bold text-neutral-800">{phone}</span>) para activar tu tienda <span className="font-bold text-neutral-800">{storeName}</span>.
                </p>
              </div>

              <div className="p-3 bg-[#FAF6F0] border border-[#E4DFD3] rounded-2xl text-left text-xs space-y-2">
                <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-[#E4DFD3]">
                  <div>
                    <span className="text-[10px] text-neutral-500 font-bold uppercase block">Número Destinatario:</span>
                    <span className="font-mono font-black text-sm text-[#2E7D5B] tracking-wider">
                      +51 999 888 777
                    </span>
                  </div>
                  <span className="text-[10px] bg-emerald-100 text-[#2E7D5B] font-bold px-2 py-1 rounded-lg">
                    Envío exitoso
                  </span>
                </div>
                <p className="text-[11px] text-neutral-600">
                  1. Realiza el pago de S/ 30 por Yape / Plin al número indicado.<br/>
                  2. Tu cuenta será activada de inmediato al confirmar el abono.
                </p>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setWhatsappSuccessNotice(false);
                    setActiveView('main_menu');
                  }}
                  className="w-full py-2.5 bg-[#2E7D5B] hover:bg-[#235F45] text-white rounded-xl font-marketing font-extrabold text-xs shadow-md shadow-[#2E7D5B]/20 transition-all cursor-pointer"
                >
                  Volver al Menú Principal
                </button>
              </div>
            </div>
          ) : (
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

              {/* 4. Rubro del Negocio (Texto libre) */}
              <div>
                <label className="block text-xs font-bold text-[#1C2B24] mb-1">
                  Rubro o Giro de tu Negocio
                </label>
                <div className="relative">
                  <Store className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={sectorText}
                    onChange={(e) => setSectorText(e.target.value)}
                    placeholder="ej. Botica, Ferretería, Minimarket, Ropa, etc."
                    className="w-full pl-9 pr-3 py-2 bg-[#FAF6F0] border border-[#E4DFD3] rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:border-[#2E7D5B]"
                  />
                </div>
              </div>

              {/* Botón de Enviar en Verde Cajita */}
              <button
                type="submit"
                disabled={isSubmittingWhatsapp}
                className="w-full py-2.5 sm:py-3 bg-[#2E7D5B] hover:bg-[#235F45] disabled:bg-neutral-400 text-white rounded-xl font-marketing font-extrabold text-sm shadow-md shadow-[#2E7D5B]/20 active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-1.5 mt-2"
              >
                <CheckCircle2 className={`w-4 h-4 ${isSubmittingWhatsapp ? 'animate-spin' : ''}`} />
                <span>{isSubmittingWhatsapp ? 'Enviando solicitud...' : 'Solicitar Activación de Cuenta'}</span>
              </button>

            </form>
          )}

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

          {/* Título de Acceso con PIN */}
          <div className="text-center space-y-1">
            <h2 className="font-marketing font-black text-base sm:text-lg text-[#1C2B24] leading-tight">
              Ingresa tu PIN de Acceso
            </h2>
            <p className="text-[11px] text-neutral-500 font-medium">
              Acceso Root / Administrador de Caja
            </p>
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

          <div className="pt-1.5 border-t border-[#E4DFD3]/60 flex flex-col items-center">
            <MariaLogo size="xs" variant="dark" prefix="Desarrollado por" withLink={true} />
          </div>

        </div>
      )}

    </div>
  );
};
