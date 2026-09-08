import React, { useState } from 'react';
import { usePos } from '../../context/PosContext';
import { BusinessSectorId, BUSINESS_SECTORS } from '../../data/businessSectors';
import {
  Store,
  Coffee,
  Shirt,
  Sparkles,
  Pill,
  LayoutGrid,
  Laptop,
  CheckCircle2,
  Sliders,
  Building2,
  Phone,
  FileText,
  MapPin,
  Save,
  RotateCcw,
  Scale,
  Gift,
  Barcode,
  Layers,
  Sparkle,
  Check,
  Info,
} from 'lucide-react';

export const ConfiguracionModule: React.FC = () => {
  const {
    businessSector,
    sectorConfig,
    setBusinessSector,
    storeProfile,
    updateStoreProfile,
    resetToInitialData,
  } = usePos();

  const [selectedSector, setSelectedSector] = useState<BusinessSectorId>(businessSector);
  const [loadCatalogOption, setLoadCatalogOption] = useState(true);
  const [profileForm, setProfileForm] = useState(storeProfile);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [showSwitchConfirm, setShowSwitchConfirm] = useState(false);
  const [pendingSector, setPendingSector] = useState<BusinessSectorId | null>(null);

  // Admin confirmation for Reset Data
  const [showResetModal, setShowResetModal] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [resetError, setResetError] = useState('');

  const handleConfirmReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPassword === '123' || adminPassword === 'admin') {
      resetToInitialData();
      setShowResetModal(false);
      setAdminPassword('');
      setResetError('');
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } else {
      setResetError('Contraseña de administrador incorrecta. Intenta con "123".');
    }
  };

  const sectorList = Object.values(BUSINESS_SECTORS);

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
      case 'Laptop':
        return Laptop;
      case 'LayoutGrid':
      default:
        return LayoutGrid;
    }
  };

  const handleSelectSectorClick = (secId: BusinessSectorId) => {
    if (secId === businessSector) return;
    setPendingSector(secId);
    setShowSwitchConfirm(true);
  };

  const handleConfirmSectorSwitch = () => {
    if (pendingSector) {
      setBusinessSector(pendingSector, loadCatalogOption);
      setSelectedSector(pendingSector);
      const newSec = BUSINESS_SECTORS[pendingSector];
      setProfileForm({
        name: newSec.storeInfo.storeName,
        ruc: newSec.storeInfo.ruc,
        address: newSec.storeInfo.address,
        phone: newSec.storeInfo.phone,
      });
      setShowSwitchConfirm(false);
      setPendingSector(null);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateStoreProfile(profileForm);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const activeSectorConfig = BUSINESS_SECTORS[businessSector];

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-lg text-xs font-black uppercase tracking-wider bg-neutral-900 text-white flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-emerald-400" />
              Configuración del Sistema
            </span>
            <span className={`px-2.5 py-1 rounded-lg text-xs font-black uppercase tracking-wider border ${activeSectorConfig.badgeColor}`}>
              Rubro Activo: {activeSectorConfig.shortName}
            </span>
          </div>
          <h1 className="text-xl font-black text-neutral-900 tracking-tight mt-2 uppercase">
            Personalización por Rubro & Datos del Negocio
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Adapta la interfaz, módulos y formularios según el giro comercial de tu tienda en Perú.
          </p>
        </div>

        {savedSuccess && (
          <div className="px-4 py-2 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl text-xs font-bold flex items-center gap-2 animate-fadeIn">
            <Check className="w-4 h-4 text-emerald-600" />
            ¡Cambios guardados exitosamente!
          </div>
        )}
      </div>

      {/* Grid of Business Sectors */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-black text-neutral-900 uppercase tracking-wide">
              1. Selecciona el Giro / Rubro de tu Negocio
            </h2>
            <p className="text-xs text-neutral-500">
              Al cambiar de rubro, el sistema activará o simplificará los módulos (ej. balanza de sacos en bodegas, tallas en ropa, vencimientos en farmacias).
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {sectorList.map((sec) => {
            const Icon = getSectorIcon(sec.icon);
            const isCurrent = sec.id === businessSector;

            return (
              <div
                key={sec.id}
                onClick={() => handleSelectSectorClick(sec.id)}
                className={`relative p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isCurrent
                    ? 'bg-neutral-900 text-white border-neutral-900 shadow-md ring-2 ring-emerald-500'
                    : 'bg-white hover:bg-neutral-50 text-neutral-900 border-neutral-200 hover:border-neutral-300 shadow-xs'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        isCurrent
                          ? 'bg-emerald-500 text-neutral-950 font-black'
                          : 'bg-neutral-100 text-neutral-800'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>

                    {isCurrent ? (
                      <span className="flex items-center gap-1 text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500 text-neutral-950">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Activo
                      </span>
                    ) : (
                      <span className="text-[11px] font-bold text-neutral-400 hover:text-neutral-700">
                        Cambiar a este rubro →
                      </span>
                    )}
                  </div>

                  <h3 className={`font-black text-sm tracking-tight ${isCurrent ? 'text-white' : 'text-neutral-900'}`}>
                    {sec.name}
                  </h3>
                  <p className={`text-xs mt-1 leading-relaxed ${isCurrent ? 'text-neutral-300' : 'text-neutral-500'}`}>
                    {sec.description}
                  </p>
                </div>

                {/* Features badges */}
                <div className="mt-4 pt-3 border-t border-neutral-100/20 flex flex-wrap gap-1.5">
                  {sec.features.enableBulkSales && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 ${
                      isCurrent ? 'bg-neutral-800 text-emerald-400' : 'bg-neutral-100 text-neutral-700'
                    }`}>
                      <Scale className="w-3 h-3" /> Balanza / Soles
                    </span>
                  )}
                  {sec.features.enableBulkSackPurchases && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 ${
                      isCurrent ? 'bg-neutral-800 text-cyan-400' : 'bg-neutral-100 text-neutral-700'
                    }`}>
                      <Layers className="w-3 h-3" /> Sacos / Fardos
                    </span>
                  )}
                  {sec.features.enableApparelVariants && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 ${
                      isCurrent ? 'bg-neutral-800 text-indigo-300' : 'bg-neutral-100 text-neutral-700'
                    }`}>
                      <Shirt className="w-3 h-3" /> Tallas & Colores
                    </span>
                  )}
                  {sec.features.enableVolumePacks && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 ${
                      isCurrent ? 'bg-neutral-800 text-rose-300' : 'bg-neutral-100 text-neutral-700'
                    }`}>
                      <Sparkles className="w-3 h-3" /> Frascos & ml
                    </span>
                  )}
                  {sec.features.enablePharmaExpiry && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 ${
                      isCurrent ? 'bg-neutral-800 text-teal-300' : 'bg-neutral-100 text-neutral-700'
                    }`}>
                      <Pill className="w-3 h-3" /> Blíster / Vencimientos
                    </span>
                  )}
                  {sec.features.enableCombos && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 ${
                      isCurrent ? 'bg-neutral-800 text-amber-300' : 'bg-neutral-100 text-neutral-700'
                    }`}>
                      <Gift className="w-3 h-3" /> Packs Odoo 19
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Store Information Profile */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs overflow-hidden">
        <div className="p-5 bg-neutral-50 border-b border-neutral-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-neutral-900 text-white flex items-center justify-center font-black">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-black text-neutral-900 uppercase tracking-wide">
                2. Datos de la Empresa / Comprobante (SUNAT / Tickets)
              </h2>
              <p className="text-xs text-neutral-500">
                Esta información se imprimirá en los tickets de venta e informes de caja.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Store className="w-3.5 h-3.5 text-neutral-400" />
                Nombre Comercial del Establecimiento:
              </label>
              <input
                type="text"
                value={profileForm.name}
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                placeholder="Ej. Minimarket & Bodega Don Pepe"
                className="w-full py-2.5 px-3.5 bg-neutral-50 border border-neutral-300 rounded-xl text-xs font-bold text-neutral-900 focus:outline-none focus:border-black focus:ring-1 focus:ring-black"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-neutral-400" />
                RUC / DNI de la Empresa (11 dígitos):
              </label>
              <input
                type="text"
                maxLength={11}
                value={profileForm.ruc}
                onChange={(e) => setProfileForm({ ...profileForm, ruc: e.target.value })}
                placeholder="20601234567"
                className="w-full py-2.5 px-3.5 bg-neutral-50 border border-neutral-300 rounded-xl text-xs font-mono font-bold text-neutral-900 focus:outline-none focus:border-black focus:ring-1 focus:ring-black"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                Dirección Física:
              </label>
              <input
                type="text"
                value={profileForm.address}
                onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                placeholder="Av. Los Próceres 450, Lima"
                className="w-full py-2.5 px-3.5 bg-neutral-50 border border-neutral-300 rounded-xl text-xs font-medium text-neutral-900 focus:outline-none focus:border-black focus:ring-1 focus:ring-black"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-neutral-400" />
                Teléfono / WhatsApp de Contacto:
              </label>
              <input
                type="text"
                value={profileForm.phone}
                onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                placeholder="(01) 456-7890 / 999 888 777"
                className="w-full py-2.5 px-3.5 bg-neutral-50 border border-neutral-300 rounded-xl text-xs font-medium text-neutral-900 focus:outline-none focus:border-black focus:ring-1 focus:ring-black"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-100">
            <button
              type="submit"
              className="px-5 py-2.5 bg-neutral-900 hover:bg-black text-white rounded-xl font-black text-xs flex items-center gap-2 cursor-pointer shadow-xs transition-colors"
            >
              <Save className="w-4 h-4 text-emerald-400" />
              Guardar Datos del Negocio
            </button>
          </div>
        </form>
      </div>

      {/* Acciones de Mantenimiento & Restablecimiento Protegido */}
      <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-xs space-y-4">
        <div>
          <h2 className="text-sm font-black text-neutral-900 uppercase tracking-wide flex items-center gap-2">
            <RotateCcw className="w-4 h-4 text-amber-600" />
            3. Restablecer Datos de Demostración
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Reinicia el inventario, ventas y turnos a los valores iniciales. Esta es una acción destructiva y requiere confirmación con contraseña de administrador.
          </p>
        </div>

        <div className="p-4 bg-[#FAEEDA] border border-[#EF9F27]/30 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-xs text-[#633806] space-y-1">
            <p className="font-bold">Restablecer datos de fábrica</p>
            <p className="text-[11px] text-[#633806]/80">
              Restaura los productos de prueba y vacía el historial de ventas actual.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setAdminPassword('');
              setResetError('');
              setShowResetModal(true);
            }}
            className="px-4 py-2 bg-[#EF9F27] hover:bg-[#D98B1B] text-[#141412] font-bold text-xs rounded-xl transition-colors cursor-pointer shrink-0"
          >
            Restablecer Datos...
          </button>
        </div>
      </div>

      {/* Admin Password Reset Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#141412] text-[#F1EFE8] rounded-2xl border border-[#262624] shadow-2xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#2C2C2A]">
              <h3 className="font-brand font-bold text-base text-[#F1EFE8]">
                Confirmar Restablecimiento
              </h3>
              <button
                type="button"
                onClick={() => setShowResetModal(false)}
                className="text-[#888880] hover:text-[#F1EFE8] text-sm"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-[#B4B2A9]">
              Ingresa la contraseña de administrador para confirmar el restablecimiento de datos de prueba:
            </p>

            {resetError && (
              <div className="p-3 bg-[#FAEEDA] border border-[#EF9F27]/40 text-[#633806] rounded-xl text-xs font-semibold">
                {resetError}
              </div>
            )}

            <form onSubmit={handleConfirmReset} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-[#B4B2A9] uppercase tracking-wider mb-1">
                  Contraseña Admin
                </label>
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => {
                    setAdminPassword(e.target.value);
                    setResetError('');
                  }}
                  placeholder="Contraseña (ej. 123)"
                  className="w-full py-2.5 px-3.5 bg-[#262624] border border-[#444441] rounded-xl text-xs text-[#F1EFE8] focus:outline-none focus:border-[#2E7D5B] focus:ring-1 focus:ring-[#2E7D5B]"
                  autoFocus
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowResetModal(false)}
                  className="px-4 py-2 bg-[#262624] hover:bg-[#30302E] text-[#F1EFE8] font-bold text-xs rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#EF9F27] hover:bg-[#D98B1B] text-[#141412] font-bold text-xs rounded-xl cursor-pointer"
                >
                  Confirmar y Restablecer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Switch Sector Confirmation Modal */}
      {showSwitchConfirm && pendingSector && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-neutral-800 animate-in fade-in zoom-in-95">
            <div className="bg-neutral-950 text-white p-5 flex items-center justify-between border-b border-neutral-800">
              <div className="flex items-center gap-2.5">
                <Sliders className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-black uppercase tracking-wider">
                  Cambiar Rubro a: {BUSINESS_SECTORS[pendingSector].name}
                </h3>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-3.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-800 space-y-2">
                <p className="font-bold text-neutral-900">
                  ¿Cómo deseas configurar los productos de tu nuevo rubro?
                </p>
                <p className="text-neutral-600 leading-relaxed">
                  El sistema adaptará automáticamente el menú POS, los formularios de inventario y las opciones de compras según las necesidades de este sector.
                </p>
              </div>

              <div className="space-y-2">
                <label className="flex items-start gap-3 p-3 rounded-xl border border-neutral-200 hover:bg-neutral-50 cursor-pointer">
                  <input
                    type="radio"
                    name="catalogOption"
                    checked={loadCatalogOption}
                    onChange={() => setLoadCatalogOption(true)}
                    className="mt-0.5 text-emerald-600 focus:ring-emerald-500"
                  />
                  <div>
                    <span className="text-xs font-bold text-neutral-900 block">
                      Cargar catálogo y categorías de ejemplo del rubro (Recomendado)
                    </span>
                    <span className="text-[11px] text-neutral-500 block leading-tight mt-0.5">
                      Carga productos típicos de {BUSINESS_SECTORS[pendingSector].name} para comenzar a vender inmediatamente.
                    </span>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3 rounded-xl border border-neutral-200 hover:bg-neutral-50 cursor-pointer">
                  <input
                    type="radio"
                    name="catalogOption"
                    checked={!loadCatalogOption}
                    onChange={() => setLoadCatalogOption(false)}
                    className="mt-0.5 text-emerald-600 focus:ring-emerald-500"
                  />
                  <div>
                    <span className="text-xs font-bold text-neutral-900 block">
                      Mantener mis productos actuales
                    </span>
                    <span className="text-[11px] text-neutral-500 block leading-tight mt-0.5">
                      Solo cambia la configuración de interfaz sin modificar tu inventario existente.
                    </span>
                  </div>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowSwitchConfirm(false);
                    setPendingSector(null);
                  }}
                  className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-xl font-bold text-xs cursor-pointer transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmSectorSwitch}
                  className="px-5 py-2 bg-neutral-950 hover:bg-neutral-900 text-white rounded-xl font-black text-xs flex items-center gap-2 cursor-pointer shadow-md transition-colors"
                >
                  <Check className="w-4 h-4 text-emerald-400" />
                  Aplicar Rubro
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
