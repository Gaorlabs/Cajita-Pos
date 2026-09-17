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
  Maximize,
  Minimize,
} from 'lucide-react';
import { BUSINESS_SECTORS, BusinessSectorId } from '../data/businessSectors';
import { CajitaLogo } from './CajitaLogo';
import { MariaLogo } from './MariaLogo';
import { User as UserType } from '../types';
import { useFullscreen } from '../utils/fullscreen';

type ActiveView = 'main_menu' | 'register_business' | 'demo_modal' | 'pin_entry';

export const LoginView: React.FC = () => {
  const { login, registerTenant, setIsDemoTour, users } = usePos();
  const { isFullscreen, isSupported, toggle: toggleFullscreen } = useFullscreen();
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
    <div className="relative min-h-[100dvh] w-full bg-gradient-to-b from-[#F2F8F4] via-[#FAF6F0] to-[#EAF4EE] flex flex-col items-center justify-between p-3 sm:p-5 select-none font-sans text-[#1C2B24] overflow-x-hidden">
      
      {/* Luces de ambiente sutiles y vivas en el fondo */}
      <div className="absolute -top-24 -left-20 w-80 h-80 bg-[#2E7D5B]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 -right-24 w-88 h-88 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 left-1/4 w-96 h-96 bg-[#2E7D5B]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Barra superior de utilidades (Pantalla Completa en Móvil / Tablet) */}
      <div className="w-full max-w-2xl flex items-center justify-between z-20 pb-1 pt-0.5">
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#2E7D5B]">
          <span className="h-2 w-2 rounded-full bg-[#2E7D5B] inline-block animate-pulse"></span>
          <span className="hidden sm:inline">Punto de Venta en la Nube · Perú 🇵🇪</span>
          <span className="sm:hidden">Cajita POS 🇵🇪</span>
        </div>

        {isSupported && (
          <button
            id="btn-portal-fullscreen"
            type="button"
            onClick={toggleFullscreen}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/95 hover:bg-white text-[#1C2B24] border border-[#E4DFD3] shadow-xs text-xs font-bold transition-all hover:scale-105 active:scale-95 cursor-pointer"
            title={isFullscreen ? "Restaurar tamaño normal" : "Ver en pantalla completa (oculta barras del navegador para más espacio)"}
          >
            {isFullscreen ? (
              <>
                <Minimize className="w-3.5 h-3.5 text-[#2E7D5B]" />
                <span className="text-[11px] font-bold">Salir de pantalla completa</span>
              </>
            ) : (
              <>
                <Maximize className="w-3.5 h-3.5 text-[#2E7D5B]" />
                <span className="text-[11px] font-bold">Pantalla Completa</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* 1. VISTA PRINCIPAL: MENÚ DE 3 ACCIONES VIVO, ALEGRE E INSPIRADOR */}
      {activeView === 'main_menu' && (
        <div className="w-full max-w-md my-auto flex flex-col items-center space-y-4 sm:space-y-5 animate-in fade-in zoom-in-95 duration-200 relative z-10">
          
          {/* Logo y Marca Cajita en Gran Formato Alegre y Confiable */}
          <div className="text-center space-y-2 flex flex-col items-center pt-1">
            <div className="relative group cursor-pointer transition-transform hover:scale-105 duration-200">
              <div className="w-18 h-18 sm:w-20 sm:h-20 bg-gradient-to-br from-[#2E7D5B] to-[#1C2B24] rounded-[24px] sm:rounded-[28px] flex items-center justify-center shadow-xl shadow-[#2E7D5B]/25 border-4 border-white">
                <CajitaLogo size={46} variant="iconOnly" lidHex="#FFFFFF" checkHex="#2E7D5B" />
              </div>
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2E7D5B] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-[#2E7D5B] border-2 border-white shadow-xs"></span>
              </span>
            </div>

            {/* Badge de estado vivo y confiable */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 backdrop-blur-xs border border-[#E4DFD3] shadow-xs text-[11px] font-bold text-[#2E7D5B]">
              <span className="h-2 w-2 rounded-full bg-[#2E7D5B] inline-block animate-pulse"></span>
              <span>Punto de Venta en la Nube · Perú 🇵🇪</span>
            </div>

            <div>
              <h1 className="font-marketing font-black text-3xl sm:text-4xl text-[#1C2B24] tracking-tight flex items-center justify-center gap-2">
                Cajita
                <span className="text-xs font-black bg-gradient-to-r from-[#2E7D5B] to-[#3BA87A] text-white px-2.5 py-0.5 rounded-lg uppercase tracking-wider shadow-xs flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-300 fill-amber-300" />
                  POS
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-neutral-600 font-medium max-w-sm mx-auto leading-snug mt-1">
                El punto de venta más ágil, alegre y ordenado para hacer crecer tu tienda
              </p>
            </div>

            {/* Badges de súper poderes del sistema */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 pt-0.5 text-[10px] sm:text-[11px] font-bold text-neutral-600">
              <span className="flex items-center gap-1 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-full border border-[#E4DFD3] shadow-2xs">
                <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />
                Cobro Veloz
              </span>
              <span className="flex items-center gap-1 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-full border border-[#E4DFD3] shadow-2xs">
                <Smartphone className="w-3 h-3 text-[#2E7D5B]" />
                Celular o PC
              </span>
              <span className="flex items-center gap-1 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-full border border-[#E4DFD3] shadow-2xs">
                <ShieldCheck className="w-3 h-3 text-[#2E7D5B]" />
                Caja Cuadrada
              </span>
            </div>
          </div>

          {/* LAS 3 OPCIONES: VIVAS, DIFERENCIADAS Y CON GRAN JERARQUÍA */}
          <div className="w-full space-y-2.5 sm:space-y-3">
            
            {/* OPCIÓN 1: PROBAR DEMO GRATIS (Verde Esmeralda Radiante) */}
            <button
              id="btn-probar-demo"
              onClick={() => setActiveView('demo_modal')}
              className="w-full p-3.5 sm:p-4.5 bg-gradient-to-r from-[#236E4E] via-[#2E7D5B] to-[#3BA87A] hover:from-[#1C5B40] hover:via-[#25664A] hover:to-[#319269] text-white rounded-2xl sm:rounded-3xl text-left shadow-lg shadow-[#2E7D5B]/25 hover:shadow-xl hover:shadow-[#2E7D5B]/35 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 flex items-center justify-between cursor-pointer border-2 border-[#3BA87A]/50 group relative overflow-hidden"
            >
              <div className="flex items-center gap-3.5 relative z-10">
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-white text-[#2E7D5B] flex items-center justify-center shadow-md shrink-0 group-hover:scale-105 transition-transform">
                  <Play className="w-5 h-5 fill-[#2E7D5B] ml-0.5" />
                </div>
                <div>
                  <div className="inline-flex items-center gap-1 bg-white/20 backdrop-blur-xs text-white text-[9px] sm:text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider mb-1">
                    ⚡ 1 Clic · Sin Registro · 100% Gratis
                  </div>
                  <h3 className="font-marketing font-black text-base sm:text-lg text-white leading-tight">
                    Probar Demo Interactiva
                  </h3>
                  <p className="text-[11px] sm:text-xs text-[#EAF3EC] font-medium leading-tight mt-0.5">
                    Simula ventas, prueba boletas y revisa tu caja ya
                  </p>
                </div>
              </div>
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white/20 flex items-center justify-center text-white group-hover:bg-white group-hover:text-[#2E7D5B] transition-all shrink-0 ml-2 shadow-xs group-hover:translate-x-0.5">
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
            </button>

            {/* OPCIÓN 2: QUIERO PARA MI NEGOCIO (Carbón Bosque Premium con Destellos Esmeralda) */}
            <button
              id="btn-registrar-negocio"
              onClick={() => {
                setActiveView('register_business');
                setError('');
              }}
              className="w-full p-3.5 sm:p-4.5 bg-gradient-to-r from-[#14201A] via-[#1C2B24] to-[#253D32] hover:from-[#0E1713] hover:via-[#16231D] hover:to-[#1E3229] text-white rounded-2xl sm:rounded-3xl text-left shadow-md shadow-[#1C2B24]/20 hover:shadow-xl hover:shadow-[#1C2B24]/30 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 flex items-center justify-between cursor-pointer border-2 border-[#2E7D5B]/40 hover:border-[#3BA87A] group relative overflow-hidden"
            >
              <div className="flex items-center gap-3.5 relative z-10">
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-white/10 text-[#3BA87A] flex items-center justify-center shadow-inner shrink-0 group-hover:scale-105 transition-transform border border-white/10">
                  <Store className="w-5 h-5 sm:w-6 sm:h-6 text-[#3BA87A]" />
                </div>
                <div>
                  <div className="inline-flex items-center gap-1 bg-[#2E7D5B]/30 border border-[#2E7D5B]/50 text-[#A3E5C7] text-[9px] sm:text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider mb-1">
                    🚀 Plan Emprendedor · Tu Tienda Propia
                  </div>
                  <h3 className="font-marketing font-black text-base sm:text-lg text-white leading-tight">
                    Quiero para mi Negocio
                  </h3>
                  <p className="text-[11px] sm:text-xs text-neutral-300 font-medium leading-tight mt-0.5">
                    Crea tu tienda, sube tus productos y empieza a cobrar
                  </p>
                </div>
              </div>
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white/10 flex items-center justify-center text-neutral-300 group-hover:bg-[#2E7D5B] group-hover:text-white transition-all shrink-0 ml-2 shadow-xs group-hover:translate-x-0.5">
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
            </button>

            {/* OPCIÓN 3: INGRESAR CON PIN (Blanco Puro Luminoso con Borde Esmeralda) */}
            <button
              id="btn-ingresar-pin"
              onClick={() => {
                setActiveView('pin_entry');
                setError('');
                setPin('');
              }}
              className="w-full p-3.5 sm:p-4.5 bg-white hover:bg-[#F2F8F4] text-[#1C2B24] rounded-2xl sm:rounded-3xl text-left shadow-xs hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 flex items-center justify-between cursor-pointer border-2 border-[#E4DFD3] hover:border-[#2E7D5B] group relative overflow-hidden"
            >
              <div className="flex items-center gap-3.5 relative z-10">
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-[#EAF3EC] text-[#2E7D5B] flex items-center justify-center shadow-2xs shrink-0 group-hover:bg-[#2E7D5B] group-hover:text-white transition-colors">
                  <Lock className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div>
                  <div className="inline-flex items-center gap-1 bg-[#FAF6F0] text-neutral-600 border border-[#E4DFD3] text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider mb-1">
                    🔑 Personal de Turno
                  </div>
                  <h3 className="font-marketing font-black text-base sm:text-lg text-[#1C2B24] leading-tight">
                    Ingresar con mi PIN de Caja
                  </h3>
                  <p className="text-[11px] sm:text-xs text-neutral-500 font-medium leading-tight mt-0.5">
                    Acceso instantáneo para cajeros y administradores
                  </p>
                </div>
              </div>
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#FAF6F0] border border-[#E4DFD3] flex items-center justify-center text-neutral-500 group-hover:bg-[#2E7D5B] group-hover:text-white group-hover:border-[#2E7D5B] transition-all shrink-0 ml-2 shadow-xs group-hover:translate-x-0.5">
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
            </button>

          </div>

          {/* Footer cálido con atribución MarIA */}
          <div className="w-full pt-3 border-t border-[#E4DFD3]/80 flex flex-col items-center gap-2">
            <span className="text-[11px] text-neutral-500 font-medium">
              Hecho con ❤️ para comercios y tiendas en Perú 🇵🇪
            </span>

            <div className="opacity-90 hover:opacity-100 transition-opacity">
              <MariaLogo
                size="xs"
                variant="dark"
                prefix="Desarrollado por"
                withLink={true}
              />
            </div>
          </div>

        </div>
      )}

      {/* 2. FORMULARIO MÍNIMO: REGISTRAR NEGOCIO CON YAPE */}
      {activeView === 'register_business' && (
        <div className="w-full max-w-md my-auto bg-white border border-[#E4DFD3] rounded-2xl shadow-xs p-5 sm:p-6 space-y-4 max-h-[96dvh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
          
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
              Plan Emprendedor
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
                  1. Realiza la coordinación por Yape / Plin al número indicado.<br/>
                  2. Tu cuenta será activada de inmediato al confirmar el registro.
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
        <div className="w-full max-w-md my-auto bg-white border border-[#E4DFD3] rounded-2xl shadow-xs p-5 sm:p-6 space-y-4 max-h-[96dvh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
          
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
              <span className="font-marketing font-bold text-sm sm:text-base text-[#1C2B24] tracking-tight">Cajita</span>
              <span className="text-[8px] sm:text-[9px] font-bold bg-[#EAF3EC] text-[#2E7D5B] px-1.5 py-0.2 rounded uppercase tracking-wider border border-[#2E7D5B]/20">
                POS
              </span>
            </div>

            <span className="text-[9px] sm:text-[10px] font-bold uppercase text-[#2E7D5B] bg-[#EAF3EC] px-2 py-0.5 rounded-full border border-[#2E7D5B]/20">
              Demo 1 Clic
            </span>
          </div>

          <div className="text-center space-y-0.5">
            <h2 className="font-marketing font-bold text-lg sm:text-xl text-[#1C2B24]">
              ¿Qué rubro quieres probar?
            </h2>
            <p className="text-[11px] sm:text-xs text-neutral-500 font-normal">
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

          {/* Opciones directas por rubro alegres y vibrantes */}
          <div className="space-y-2">
            {[
              { id: 'tecnologia', label: 'Tecnología, Cómputo & Celulares', icon: '💻', tag: 'Cómputo & Gamer', desc: 'Periféricos gamer, cargadores, cables y discos', bg: 'hover:border-sky-500 hover:bg-sky-50/60' },
              { id: 'ropa', label: 'Tienda de Ropa & Moda', icon: '👗', tag: 'Moda & Calzado', desc: 'Prendas con tallas, colores y ofertas', bg: 'hover:border-purple-500 hover:bg-purple-50/60' },
              { id: 'bodega', label: 'Bodega & Minimarket', icon: '🏪', tag: 'Abarrotes & Snacks', desc: 'Abarrotes, bebidas y venta al peso', bg: 'hover:border-amber-500 hover:bg-amber-50/60' },
              { id: 'cafeteria', label: 'Cafetería & Restaurante', icon: '☕', tag: 'Alimentos & Bebidas', desc: 'Bebidas, combos y snacks de paso', bg: 'hover:border-orange-500 hover:bg-orange-50/60' },
              { id: 'farmacia', label: 'Farmacia & Botica', icon: '💊', tag: 'Salud & Botica', desc: 'Medicamentos, fecha de lote y stock', bg: 'hover:border-emerald-500 hover:bg-emerald-50/60' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => handleLaunchDemo(item.id as BusinessSectorId)}
                className={`w-full p-3 bg-white border border-[#E4DFD3] ${item.bg} rounded-xl text-left transition-all flex items-center justify-between cursor-pointer group shadow-2xs hover:shadow-xs`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl p-1.5 rounded-lg bg-[#FAF6F0] group-hover:scale-110 transition-transform">
                    {item.icon}
                  </span>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-bold text-xs sm:text-sm text-[#1C2B24] leading-tight">
                        {item.label}
                      </h4>
                      <span className="text-[9px] font-bold text-neutral-500 bg-[#FAF6F0] px-1.5 py-0.2 rounded border border-[#E4DFD3]">
                        {item.tag}
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-500 leading-tight mt-0.5">{item.desc}</p>
                  </div>
                </div>
                <div className="w-7 h-7 rounded-lg bg-[#FAF6F0] group-hover:bg-[#2E7D5B] group-hover:text-white text-neutral-400 flex items-center justify-center transition-all shrink-0 ml-1">
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </button>
            ))}
          </div>

        </div>
      )}

      {/* 4. INGRESO RÁPIDO CON PIN (Con Cabecera Oficial Cajita POS) */}
      {activeView === 'pin_entry' && (
        <div className="w-full max-w-xs my-auto bg-white border border-[#E4DFD3] rounded-2xl shadow-xs p-5 space-y-4 animate-in fade-in zoom-in-95 duration-200">
          
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
