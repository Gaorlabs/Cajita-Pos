import React, { useState } from 'react';
import { usePos } from '../context/PosContext';
import { Key, User, ArrowRight, Delete } from 'lucide-react';
import { INITIAL_USERS } from '../data/mockData';
import { CajitaLogo } from './CajitaLogo';

export const LoginView: React.FC = () => {
  const { login } = usePos();
  const [selectedUser, setSelectedUser] = useState<(typeof INITIAL_USERS)[0]>(INITIAL_USERS[0]);
  const [pin, setPin] = useState('');
  const [mode, setMode] = useState<'pin' | 'password'>('pin');
  const [usernameInput, setUsernameInput] = useState('admin');
  const [passwordInput, setPasswordInput] = useState('');
  const [error, setError] = useState('');

  const handleNumClick = (num: string) => {
    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);
      setError('');
      if (newPin.length === 4) {
        const success = login(selectedUser.username, '123');
        if (!success) {
          setError('PIN incorrecto. Prueba con "123".');
          setPin('');
        }
      }
    }
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
    setError('');
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameInput.trim()) {
      setError('Por favor ingresa tu usuario');
      return;
    }
    const success = login(usernameInput, passwordInput);
    if (!success) {
      setError('Usuario o clave no encontrados. Prueba con "admin".');
    }
  };

  const whatsappMessage = encodeURIComponent(
    'Hola Cajita! Quisiera pedir una demo de Cajita POS para mi negocio en Huancayo.'
  );

  return (
    <div className="min-h-screen bg-[#FAF6F0] text-[#1A1A1A] flex flex-col items-center justify-center p-4 selection:bg-[#2E7D5B] selection:text-white font-sans">
      <div className="w-full max-w-sm bg-white border border-[#E4DFD3] rounded-[28px] shadow-xl p-6 sm:p-7 space-y-5 my-auto">
        
        {/* Encabezado: Isotipo + Cajita (Baloo 2) + lema "Tu negocio, bien cuadrado" */}
        <div className="flex flex-col items-center text-center space-y-1.5">
          <div className="flex items-center gap-2.5 justify-center">
            <CajitaLogo size={44} bgHex="#2E7D5B" lidHex="#EAF3EC" checkHex="#2E7D5B" />
            <span className="font-marketing font-extrabold text-2xl text-[#1A1A1A] tracking-tight">
              Cajita
            </span>
          </div>
          <p className="text-xs text-[#6B6B66] font-sans font-medium">
            Tu negocio, bien cuadrado
          </p>
        </div>

        {/* Saludo: "Buenos días, [nombre]" en Baloo 2 bold + "Ingresa tu PIN..." en Inter */}
        <div className="text-center pt-1 border-t border-[#E4DFD3]">
          <h1 className="font-marketing font-bold text-2xl text-[#1A1A1A] leading-tight">
            Buenos días, {selectedUser.name.split(' ')[0]}
          </h1>
          <p className="text-xs text-[#6B6B66] font-sans mt-0.5">
            {mode === 'pin' ? 'Ingresa tu PIN para abrir caja' : 'Ingresa con tu usuario y contraseña'}
          </p>
        </div>

        {/* Selector de Cajero (Lógica por vendedor) */}
        <div className="flex items-center justify-center gap-2 pt-0.5">
          {INITIAL_USERS.map((user) => {
            const isSelected = selectedUser.id === user.id;
            return (
              <button
                key={user.id}
                type="button"
                onClick={() => {
                  setSelectedUser(user);
                  setPin('');
                  setError('');
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#EAF3EC] border-[#2E7D5B] text-[#2E7D5B] font-bold shadow-2xs'
                    : 'bg-[#FAF6F0] border-[#E4DFD3] text-[#6B6B66] hover:bg-[#EAF3EC]/40'
                }`}
              >
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-4 h-4 rounded-full object-cover shrink-0"
                />
                <span className="text-xs font-sans">{user.name.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>

        {error && (
          <div className="p-3 bg-[#FAEEDA] border border-[#B87D0F]/40 text-[#633806] rounded-2xl text-xs font-semibold text-center">
            {error}
          </div>
        )}

        {/* MODO: Acceso por PIN */}
        {mode === 'pin' ? (
          <div className="space-y-4">
            {/* PIN Dots Indicator */}
            <div className="flex justify-center items-center gap-3 py-1">
              {[0, 1, 2, 3].map((idx) => {
                const filled = pin.length > idx;
                return (
                  <div
                    key={idx}
                    className={`w-4 h-4 rounded-full border-2 transition-all ${
                      filled
                        ? 'bg-[#2E7D5B] border-[#2E7D5B] scale-110 shadow-xs'
                        : 'border-[#E4DFD3] bg-white'
                    }`}
                  />
                );
              })}
            </div>

            {/* Teclado numérico grande en pantalla */}
            <div className="grid grid-cols-3 gap-2.5 max-w-[260px] mx-auto">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => handleNumClick(num)}
                  className="h-12 rounded-2xl bg-[#FAF6F0] hover:bg-[#EAF3EC] border border-[#E4DFD3] text-lg font-bold text-[#1A1A1A] active:scale-95 transition-all cursor-pointer flex items-center justify-center font-mono"
                >
                  {num}
                </button>
              ))}
              <div className="h-12" />
              <button
                type="button"
                onClick={() => handleNumClick('0')}
                className="h-12 rounded-2xl bg-[#FAF6F0] hover:bg-[#EAF3EC] border border-[#E4DFD3] text-lg font-bold text-[#1A1A1A] active:scale-95 transition-all cursor-pointer flex items-center justify-center font-mono"
              >
                0
              </button>
              <button
                type="button"
                onClick={handleBackspace}
                className="h-12 rounded-2xl bg-[#FAF6F0] hover:bg-[#EAF3EC] border border-[#E4DFD3] text-[#6B6B66] hover:text-[#1A1A1A] active:scale-95 transition-all cursor-pointer flex items-center justify-center"
              >
                <Delete className="w-5 h-5" />
              </button>
            </div>

            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => {
                  setMode('password');
                  setError('');
                }}
                className="text-xs text-[#2E7D5B] hover:underline font-semibold cursor-pointer"
              >
                ¿Ingresar con usuario y contraseña?
              </button>
            </div>
          </div>
        ) : (
          /* MODO: Formulario clásico */
          <form onSubmit={handlePasswordSubmit} className="space-y-3.5">
            <div>
              <label className="block text-[11px] font-bold text-[#6B6B66] uppercase tracking-wider mb-1">
                Usuario
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#6B6B66] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={usernameInput}
                  onChange={(e) => {
                    setUsernameInput(e.target.value);
                    setError('');
                  }}
                  placeholder="Usuario (admin)"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#FAF6F0] border border-[#E4DFD3] rounded-xl text-sm text-[#1A1A1A] focus:outline-none focus:border-[#2E7D5B] focus:ring-1 focus:ring-[#2E7D5B]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#6B6B66] uppercase tracking-wider mb-1">
                Contraseña
              </label>
              <div className="relative">
                <Key className="w-4 h-4 text-[#6B6B66] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#FAF6F0] border border-[#E4DFD3] rounded-xl text-sm text-[#1A1A1A] focus:outline-none focus:border-[#2E7D5B] focus:ring-1 focus:ring-[#2E7D5B]"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 bg-[#2E7D5B] hover:bg-[#235F45] text-white font-bold rounded-xl text-sm transition-all cursor-pointer shadow-md flex items-center justify-center gap-2 mt-2"
            >
              <span>Entrar a mi caja</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setMode('pin');
                  setError('');
                }}
                className="text-xs text-[#2E7D5B] hover:underline font-semibold cursor-pointer"
              >
                Volver al acceso por PIN rápido
              </button>
            </div>
          </form>
        )}

        {/* Bloque de conversión (fondo carbón-verde #1C2B24) */}
        <div className="p-4 bg-[#1C2B24] text-[#FAF6F0] rounded-2xl space-y-2 border border-[#235F45] shadow-xs">
          <p className="font-marketing font-bold text-sm text-[#EAF3EC] leading-tight text-center">
            ¿Aún no tienes Cajita en tu negocio?
          </p>
          <p className="text-[11px] text-[#EAF3EC]/80 text-center leading-tight">
            Pruébala gratis o pide una demo para tu bodega
          </p>
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={() => login('admin', '123')}
              className="py-2.5 px-3 bg-[#2E7D5B] hover:bg-[#235F45] text-white font-marketing font-bold text-xs rounded-xl transition-all cursor-pointer text-center shadow-xs"
            >
              Probar gratis
            </button>
            <a
              href={`https://wa.me/51999999999?text=${whatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2.5 px-3 bg-transparent hover:bg-[#235F45]/40 text-[#EAF3EC] border border-[#EAF3EC]/40 font-marketing font-bold text-xs rounded-xl transition-all cursor-pointer text-center flex items-center justify-center"
            >
              Pedir demo
            </a>
          </div>
        </div>

      </div>
    </div>
  );
};


