import React, { useState } from 'react';
import { usePos } from '../../context/PosContext';
import { RegisteredTenant } from '../../types';
import {
  ShieldAlert,
  Building2,
  Users,
  DollarSign,
  Search,
  Plus,
  Edit,
  PauseCircle,
  PlayCircle,
  Smartphone,
  ExternalLink,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Laptop,
  Store,
  Shirt,
  Coffee,
  Pill,
  Send,
  Lock,
} from 'lucide-react';
import { BusinessSectorId, BUSINESS_SECTORS } from '../../data/businessSectors';
import { MariaLogo } from '../MariaLogo';

export const SuperRootModule: React.FC = () => {
  const {
    tenants,
    users,
    license,
    updateTenantLicense,
    registerTenant,
    currentUser,
    setActiveModule,
  } = usePos();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSectorFilter, setSelectedSectorFilter] = useState<string>('all');
  const [showAddTenantModal, setShowAddTenantModal] = useState(false);
  const [editingTenant, setEditingTenant] = useState<RegisteredTenant | null>(null);

  // New Tenant Form
  const [newStoreName, setNewStoreName] = useState('');
  const [newOwnerName, setNewOwnerName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newSector, setNewSector] = useState<BusinessSectorId>('tecnologia');
  const [newMaxUsers, setNewMaxUsers] = useState<number>(2);

  // Success alert
  const [alertMsg, setAlertMsg] = useState<string | null>(null);

  // Metrics
  const totalTenants = tenants.length;
  const activeTenants = tenants.filter((t) => t.status === 'active').length;
  const suspendedTenants = tenants.filter((t) => t.status === 'suspended').length;
  const estimatedRevenue = activeTenants * 30;

  const filteredTenants = tenants.filter((t) => {
    const matchesSearch =
      t.storeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.phone.includes(searchTerm);
    const matchesSector =
      selectedSectorFilter === 'all' || t.sectorId === selectedSectorFilter;
    return matchesSearch && matchesSector;
  });

  const handleToggleStatus = (tenant: RegisteredTenant) => {
    const newStatus = tenant.status === 'active' ? 'suspended' : 'active';
    updateTenantLicense(tenant.id, tenant.maxUsers, newStatus);
    setAlertMsg(
      `Tienda "${tenant.storeName}" marcada como ${
        newStatus === 'active' ? 'ACTIVA' : 'SUSPENDIDA'
      }.`
    );
    setTimeout(() => setAlertMsg(null), 3000);
  };

  const handleUpdateQuota = (tenant: RegisteredTenant, newQuota: number) => {
    updateTenantLicense(tenant.id, newQuota, tenant.status);
    setAlertMsg(`Cupo de usuarios para "${tenant.storeName}" actualizado a ${newQuota} usuarios.`);
    setTimeout(() => setAlertMsg(null), 3000);
  };

  const handleCreateTenant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStoreName.trim() || !newOwnerName.trim()) return;

    registerTenant(newStoreName.trim(), newSector, newOwnerName.trim());
    setShowAddTenantModal(false);
    setAlertMsg(`Nueva tienda "${newStoreName}" aprovisionada con éxito.`);
    setTimeout(() => setAlertMsg(null), 3500);
  };

  const getSectorIcon = (sectorId: string) => {
    switch (sectorId) {
      case 'tecnologia':
        return <Laptop className="w-4 h-4 text-cyan-600" />;
      case 'ropa':
        return <Shirt className="w-4 h-4 text-purple-600" />;
      case 'cafeteria':
        return <Coffee className="w-4 h-4 text-amber-600" />;
      case 'farmacia':
        return <Pill className="w-4 h-4 text-emerald-600" />;
      case 'bodega':
      default:
        return <Store className="w-4 h-4 text-neutral-600" />;
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Super Root Header Banner */}
      <div className="bg-[#14211B] text-[#FAF6F0] p-5 sm:p-6 rounded-3xl border border-[#235F45] shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-1 rounded-lg text-xs font-black uppercase tracking-wider bg-[#2E7D5B] text-white flex items-center gap-1.5 shadow-xs">
              <ShieldAlert className="w-3.5 h-3.5 text-[#FAF6F0]" />
              Perfil Super Root Maestro
            </span>
            <span className="px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider bg-[#235F45]/60 text-[#EAF3EC] border border-[#2E7D5B]/30">
              Administración SaaS Cajita POS
            </span>
            <a
              href="https://maria-vert.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 flex items-center gap-2 transition-colors"
            >
              <MariaLogo size="xs" variant="light" prefix="Desarrollado por" withLink={false} />
              <ExternalLink className="w-3 h-3 text-emerald-400 opacity-80" />
            </a>
          </div>

          <h1 className="text-xl sm:text-2xl font-black tracking-tight mt-2 uppercase text-white">
            Control de Negocios, Licencias & Límites de Usuarios
          </h1>
          <p className="text-xs text-[#EAF3EC]/80 mt-1 max-w-2xl leading-relaxed">
            Solo tú como Super Root tienes acceso a este panel para crear tiendas, controlar el límite de 2 usuarios (Plan Emprendedor S/ 30), activar/pausar suscripciones y dar soporte.
          </p>
        </div>

        <button
          onClick={() => setShowAddTenantModal(true)}
          className="px-4 py-2.5 bg-[#2E7D5B] hover:bg-[#235F45] text-white rounded-2xl text-xs font-black flex items-center gap-2 shadow-md transition-all cursor-pointer self-start md:self-center border border-white/20"
        >
          <Plus className="w-4 h-4" />
          <span>+ Aprovisionar Nueva Tienda</span>
        </button>
      </div>

      {/* Alert message */}
      {alertMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-2xl text-xs font-bold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{alertMsg}</span>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-2xs">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Tiendas Totales</span>
            <Building2 className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="text-2xl font-black text-neutral-900">{totalTenants}</div>
          <span className="text-[11px] text-emerald-700 font-bold">100% cloud multitenant</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-2xs">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Tiendas Activas</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-600">{activeTenants}</div>
          <span className="text-[11px] text-neutral-500 font-medium">Al día con suscripción</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-2xs">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Plan S/ 30 (MRR)</span>
            <DollarSign className="w-4 h-4 text-[#2E7D5B]" />
          </div>
          <div className="text-2xl font-black text-neutral-900">S/ {estimatedRevenue}.00</div>
          <span className="text-[11px] text-neutral-500 font-medium">Recaudación mensual est.</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-2xs">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Regla de Cupos</span>
            <Users className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-neutral-900">2 Usr / Tienda</div>
          <span className="text-[11px] text-amber-700 font-bold">1 Admin + 1 Vendedor</span>
        </div>
      </div>

      {/* Store Directory Management Table */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-neutral-50/50">
          <div>
            <h2 className="text-sm font-black text-neutral-900 uppercase tracking-wide">
              Directorio Maestro de Tiendas & Licencias
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Gestiona límites de usuarios, activa o suspende accesos y supervisa los negocios creados.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por negocio, dueño..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-white border border-neutral-300 rounded-xl text-xs font-medium focus:outline-none focus:border-[#2E7D5B]"
              />
            </div>

            <select
              value={selectedSectorFilter}
              onChange={(e) => setSelectedSectorFilter(e.target.value)}
              className="py-1.5 px-3 bg-white border border-neutral-300 rounded-xl text-xs font-bold text-neutral-700 focus:outline-none focus:border-[#2E7D5B]"
            >
              <option value="all">Todos los rubros</option>
              <option value="tecnologia">Tecnología</option>
              <option value="ropa">Ropa / Moda</option>
              <option value="bodega">Bodega / Market</option>
              <option value="cafeteria">Cafetería</option>
              <option value="farmacia">Farmacia</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-neutral-100/60 border-b border-neutral-200 text-[11px] font-black uppercase text-neutral-600 tracking-wider">
                <th className="py-3 px-4">Establecimiento</th>
                <th className="py-3 px-4">Rubro</th>
                <th className="py-3 px-4">Propietario / Contacto</th>
                <th className="py-3 px-4">Plan & Límite</th>
                <th className="py-3 px-4">Estado</th>
                <th className="py-3 px-4 text-right">Acciones Super Root</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 text-xs">
              {filteredTenants.map((t) => {
                const isActive = t.status === 'active';
                return (
                  <tr key={t.id} className="hover:bg-neutral-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-neutral-900">{t.storeName}</div>
                      <div className="text-[10px] text-neutral-500 font-mono">ID: {t.id}</div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-neutral-100 text-neutral-800">
                        {getSectorIcon(t.sectorId)}
                        <span className="capitalize">{t.sectorId}</span>
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-bold text-neutral-800">{t.ownerName}</div>
                      <div className="text-[11px] text-neutral-500 flex items-center gap-1">
                        <Smartphone className="w-3 h-3 text-[#2E7D5B]" />
                        <span>{t.phone}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="font-black text-neutral-900">Plan S/ 30</span>
                        <span className="px-2 py-0.5 bg-[#EAF3EC] text-[#2E7D5B] font-bold text-[10px] rounded-md border border-[#2E7D5B]/20">
                          {t.maxUsers} Usuarios
                        </span>
                      </div>
                      <div className="text-[10px] text-neutral-500 mt-0.5">
                        (1 Admin + {t.maxUsers - 1} Vendedor{t.maxUsers > 2 ? 'es' : ''})
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          isActive
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {isActive ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                        {isActive ? 'Activo' : 'Suspendido'}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Quota Selector button */}
                        <div className="flex items-center border border-neutral-300 rounded-xl overflow-hidden bg-white">
                          <button
                            type="button"
                            onClick={() => handleUpdateQuota(t, Math.max(1, t.maxUsers - 1))}
                            className="px-2 py-1 text-neutral-600 hover:bg-neutral-100 text-xs font-bold"
                            title="Reducir cupo de usuarios"
                          >
                            -
                          </button>
                          <span className="px-2 text-xs font-mono font-bold text-neutral-900">
                            {t.maxUsers}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleUpdateQuota(t, t.maxUsers + 1)}
                            className="px-2 py-1 text-neutral-600 hover:bg-neutral-100 text-xs font-bold"
                            title="Aumentar cupo de usuarios (+ S/ 15/mes)"
                          >
                            +
                          </button>
                        </div>

                        {/* Toggle Status */}
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(t)}
                          className={`p-1.5 rounded-xl border transition-colors cursor-pointer ${
                            isActive
                              ? 'text-rose-600 hover:bg-rose-50 border-rose-200'
                              : 'text-emerald-600 hover:bg-emerald-50 border-emerald-200'
                          }`}
                          title={isActive ? 'Suspender acceso a la tienda' : 'Reactivar tienda'}
                        >
                          {isActive ? <PauseCircle className="w-4 h-4" /> : <PlayCircle className="w-4 h-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Integration Information for Evolution API & n8n */}
      <div className="bg-[#FAF6F0] p-5 rounded-2xl border border-[#E4DFD3] space-y-3">
        <div className="flex items-center gap-2">
          <Send className="w-4 h-4 text-[#2E7D5B]" />
          <h3 className="font-black text-xs uppercase tracking-wider text-[#1C2B24]">
            Integración de Comprobantes por WhatsApp (n8n + Evolution API)
          </h3>
        </div>
        <p className="text-xs text-neutral-600 leading-relaxed">
          Los comprobantes de venta emitidos por los vendedores y administradores se envían automáticamente al WhatsApp del cliente mediante webhook conectado a tu instancia de <strong>Evolution API</strong> a través de <strong>n8n</strong>.
        </p>
        <div className="p-3 bg-white rounded-xl border border-neutral-200 text-[11px] font-mono text-neutral-700 flex items-center justify-between flex-wrap gap-2">
          <div>
            <span className="text-neutral-400">Webhook n8n: </span>
            <span className="text-[#2E7D5B] font-bold">https://n8n.cajitapos.com/webhook/send-receipt</span>
          </div>
          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-md font-sans text-[10px] font-bold">
            Evolution API v2 Ready
          </span>
        </div>
      </div>

      {/* Modal: Aprovisionar Nueva Tienda */}
      {showAddTenantModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full border border-neutral-200 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-4 sm:p-5 bg-[#1C2B24] text-[#FAF6F0] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#2E7D5B]" />
                <h3 className="font-black text-sm uppercase tracking-wider">Aprovisionar Tienda como Super Root</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddTenantModal(false)}
                className="text-neutral-400 hover:text-white text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTenant} className="p-5 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Nombre Comercial del Negocio</label>
                <input
                  type="text"
                  required
                  value={newStoreName}
                  onChange={(e) => setNewStoreName(e.target.value)}
                  placeholder="ej. HardTech Solutions"
                  className="w-full px-3 py-2 bg-[#FAF6F0] border border-[#E4DFD3] rounded-xl text-xs font-medium focus:outline-none focus:border-[#2E7D5B]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Nombre del Administrador / Dueño</label>
                <input
                  type="text"
                  required
                  value={newOwnerName}
                  onChange={(e) => setNewOwnerName(e.target.value)}
                  placeholder="ej. Juan Pérez"
                  className="w-full px-3 py-2 bg-[#FAF6F0] border border-[#E4DFD3] rounded-xl text-xs font-medium focus:outline-none focus:border-[#2E7D5B]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Giro / Rubro del Negocio</label>
                <select
                  value={newSector}
                  onChange={(e) => setNewSector(e.target.value as BusinessSectorId)}
                  className="w-full px-3 py-2 bg-[#FAF6F0] border border-[#E4DFD3] rounded-xl text-xs font-medium focus:outline-none focus:border-[#2E7D5B]"
                >
                  <option value="tecnologia">💻 Tecnología & Cómputo</option>
                  <option value="ropa">👗 Ropa & Moda</option>
                  <option value="bodega">🏪 Bodega & Minimarket</option>
                  <option value="cafeteria">☕ Cafetería & Snacks</option>
                  <option value="farmacia">💊 Farmacia & Botica</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Límite de Usuarios (Plan S/ 30)</label>
                <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-xs text-neutral-700">
                  <strong>2 Usuarios Permitidos:</strong> 1 Administrador (Juan) + 1 Vendedor inicial (PIN: 123).
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setShowAddTenantModal(false)}
                  className="px-3.5 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#2E7D5B] hover:bg-[#235F45] text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Crear y Activar Tienda
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
