import React, { useState } from 'react';
import { usePos } from '../../context/PosContext';
import { User, UserRole } from '../../types';
import {
  Users,
  Shield,
  UserCheck,
  Plus,
  Edit2,
  Trash2,
  Lock,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle2,
  Smartphone,
  PhoneCall,
  X,
  Check,
  Info,
  Crown,
  ExternalLink,
} from 'lucide-react';
import { MariaLogo } from '../MariaLogo';

export const UserManagementSection: React.FC = () => {
  const { users, license, currentUser, addUser, updateUser, deleteUser } = usePos();

  const [showAddModal, setShowAddModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showPinMap, setShowPinMap] = useState<Record<string, boolean>>({});
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Add User Form
  const [newUserName, setNewUserName] = useState('');
  const [newUserUsername, setNewUserUsername] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('cajero');
  const [newUserPin, setNewUserPin] = useState('123');
  const [newUserPhone, setNewUserPhone] = useState('');

  // Edit User Form
  const [editName, setEditName] = useState('');
  const [editPin, setEditPin] = useState('');
  const [editPhone, setEditPhone] = useState('');

  // Filter out super_root from regular store staff list
  const storeUsers = users.filter((u) => u.role !== 'super_root');
  const activeCount = storeUsers.filter((u) => u.status !== 'inactive').length;
  const isQuotaFull = activeCount >= license.maxUsers;

  const togglePinVisibility = (userId: string) => {
    setShowPinMap((prev) => ({ ...prev, [userId]: !prev[userId] }));
  };

  const handleOpenAdd = () => {
    if (isQuotaFull) {
      setShowUpgradeModal(true);
    } else {
      setNewUserName('');
      setNewUserUsername('');
      setNewUserRole('cajero');
      setNewUserPin('123');
      setNewUserPhone('');
      setShowAddModal(true);
    }
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim()) return;

    const res = addUser({
      name: newUserName.trim(),
      username: newUserUsername.trim() || newUserName.trim().toLowerCase().replace(/\s+/g, ''),
      role: newUserRole,
      pin: newUserPin.trim() || '123',
      phone: newUserPhone.trim(),
      avatar:
        newUserRole === 'admin'
          ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces'
          : 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80',
      status: 'active',
    });

    if (res.success) {
      setShowAddModal(false);
      setStatusMessage({ type: 'success', text: 'Usuario creado exitosamente.' });
      setTimeout(() => setStatusMessage(null), 3500);
    } else {
      setStatusMessage({ type: 'error', text: res.error || 'Error al crear usuario.' });
    }
  };

  const handleOpenEdit = (user: User) => {
    setEditingUser(user);
    setEditName(user.name);
    setEditPin(user.pin || '123');
    setEditPhone(user.phone || '');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    const res = updateUser({
      ...editingUser,
      name: editName.trim(),
      pin: editPin.trim() || '123',
      phone: editPhone.trim(),
    });

    if (res.success) {
      setEditingUser(null);
      setStatusMessage({ type: 'success', text: 'Datos de usuario actualizados.' });
      setTimeout(() => setStatusMessage(null), 3500);
    } else {
      setStatusMessage({ type: 'error', text: res.error || 'Error al actualizar usuario.' });
    }
  };

  const handleDelete = (userId: string) => {
    if (confirm('¿Estás seguro de eliminar este usuario?')) {
      const res = deleteUser(userId);
      if (res.success) {
        setStatusMessage({ type: 'success', text: 'Usuario eliminado correctamente.' });
        setTimeout(() => setStatusMessage(null), 3500);
      } else {
        setStatusMessage({ type: 'error', text: res.error || 'No se pudo eliminar.' });
      }
    }
  };

  const openWhatsAppUpgrade = () => {
    const text = encodeURIComponent(
      `Hola Cajita POS, deseo ampliar el cupo de usuarios de mi negocio en el Plan Emprendedor (actualmente tengo ${activeCount}/${license.maxUsers} usuarios).`
    );
    window.open(`https://wa.me/51999888777?text=${text}`, '_blank');
  };

  return (
    <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs overflow-hidden space-y-6 p-5 sm:p-6">
      {/* Header with Plan Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-neutral-200">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-1 rounded-lg text-xs font-black uppercase tracking-wider bg-[#1C2B24] text-[#FAF6F0] flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-[#2E7D5B]" />
              Control de Personal & Roles (RBAC)
            </span>
            <span className="px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider bg-[#EAF3EC] text-[#2E7D5B] border border-[#2E7D5B]/30 flex items-center gap-1">
              <Crown className="w-3.5 h-3.5" />
              {license.planName}
            </span>
          </div>
          <h2 className="text-base sm:text-lg font-black text-neutral-900 tracking-tight mt-2 uppercase">
            Usuarios del Establecimiento & Permisos de Acceso
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5 max-w-2xl leading-relaxed">
            Tu plan incluye <strong>hasta {license.maxUsers} usuarios</strong> (1 Administrador para control total y 1 Vendedor enfocado únicamente en cobros y caja chica).
          </p>
        </div>

        {/* Quota counter button */}
        <div className="flex items-center gap-3 self-start sm:self-center">
          <div className="text-right">
            <div className="text-xs text-neutral-500 font-medium">Cupo del Plan</div>
            <div className="text-sm font-black text-neutral-900">
              {activeCount} / {license.maxUsers} Usuarios
            </div>
          </div>

          <button
            onClick={handleOpenAdd}
            className={`px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shadow-xs ${
              isQuotaFull
                ? 'bg-[#FAF6F0] hover:bg-[#EAF3EC] text-[#2E7D5B] border border-[#2E7D5B]/40'
                : 'bg-[#2E7D5B] hover:bg-[#235F45] text-white'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>{isQuotaFull ? 'Solicitar más usuarios' : 'Agregar Vendedor'}</span>
          </button>
        </div>
      </div>

      {/* Notification Banner */}
      {statusMessage && (
        <div
          className={`p-3.5 rounded-xl text-xs font-bold flex items-center justify-between gap-2 animate-fadeIn ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 border border-emerald-300 text-emerald-900'
              : 'bg-rose-50 border border-rose-300 text-rose-900'
          }`}
        >
          <div className="flex items-center gap-2">
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
          <button onClick={() => setStatusMessage(null)} className="text-neutral-400 hover:text-neutral-700">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Security explanation card */}
      <div className="p-3.5 bg-[#FAF6F0] border border-[#E4DFD3] rounded-xl flex items-start gap-3 text-xs text-neutral-700">
        <Info className="w-4 h-4 text-[#2E7D5B] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-[#1C2B24]">Protección de negocio garantizada en tu plan de S/ 30:</p>
          <p className="text-[11px] text-neutral-600 leading-relaxed">
            El perfil <strong>Vendedor (Cajero)</strong> solo puede cobrar en el POS y registrar apertura/cierre de su turno. No tiene acceso a tus costos de compra, stock total, reportes de ganancia ni configuraciones del sistema.
          </p>
        </div>
      </div>

      {/* User Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {storeUsers.map((user) => {
          const isAdmin = user.role === 'admin';
          const isCurrentLoggedIn = currentUser?.id === user.id;
          const isPinVisible = !!showPinMap[user.id];

          return (
            <div
              key={user.id}
              className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                isAdmin
                  ? 'bg-white border-[#2E7D5B]/30 shadow-2xs hover:border-[#2E7D5B]/60'
                  : 'bg-white border-neutral-200 shadow-2xs hover:border-neutral-300'
              }`}
            >
              <div>
                {/* Header card: Avatar, name, role badge */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative shrink-0">
                      <img
                        src={
                          user.avatar ||
                          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
                        }
                        alt={user.name}
                        className="w-11 h-11 rounded-full object-cover border-2 border-neutral-200"
                      />
                      <span
                        className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
                          user.status === 'active' ? 'bg-[#2E7D5B]' : 'bg-neutral-400'
                        }`}
                      />
                    </div>
                    <div className="truncate">
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-bold text-sm text-neutral-900 truncate">{user.name}</h4>
                        {isCurrentLoggedIn && (
                          <span className="text-[9px] bg-[#EAF3EC] text-[#2E7D5B] font-bold px-1.5 py-0.2 rounded">
                            Tú
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-neutral-500 font-mono">@{user.username}</p>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shrink-0 ${
                      isAdmin
                        ? 'bg-[#1C2B24] text-[#FAF6F0]'
                        : 'bg-[#EAF3EC] text-[#2E7D5B] border border-[#2E7D5B]/20'
                    }`}
                  >
                    {isAdmin ? <Shield className="w-3 h-3 text-[#2E7D5B]" /> : <UserCheck className="w-3 h-3 text-[#2E7D5B]" />}
                    {isAdmin ? 'Administrador' : 'Vendedor'}
                  </span>
                </div>

                {/* Details: PIN & Phone */}
                <div className="bg-[#FAF6F0] rounded-xl p-2.5 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-neutral-600">
                    <span className="font-medium text-neutral-500 flex items-center gap-1.5">
                      <Lock className="w-3 h-3 text-neutral-400" />
                      PIN de Acceso:
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold text-neutral-900">
                        {isPinVisible ? user.pin || '123' : '••••'}
                      </span>
                      <button
                        type="button"
                        onClick={() => togglePinVisibility(user.id)}
                        className="p-1 text-neutral-400 hover:text-neutral-700 cursor-pointer"
                        title={isPinVisible ? 'Ocultar PIN' : 'Mostrar PIN'}
                      >
                        {isPinVisible ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>

                  {user.phone && (
                    <div className="flex items-center justify-between text-neutral-600">
                      <span className="font-medium text-neutral-500 flex items-center gap-1.5">
                        <Smartphone className="w-3 h-3 text-neutral-400" />
                        WhatsApp / Celular:
                      </span>
                      <span className="font-mono font-bold text-neutral-800">{user.phone}</span>
                    </div>
                  )}
                </div>

                {/* Permissions summary */}
                <div className="mt-3 pt-2.5 border-t border-neutral-100">
                  <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block mb-1">
                    Permisos de este perfil:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {isAdmin ? (
                      <>
                        <span className="text-[10px] font-medium bg-[#EAF3EC] text-[#2E7D5B] px-2 py-0.5 rounded-md">
                          ✓ Ventas POS
                        </span>
                        <span className="text-[10px] font-medium bg-[#EAF3EC] text-[#2E7D5B] px-2 py-0.5 rounded-md">
                          ✓ Inventario & Costos
                        </span>
                        <span className="text-[10px] font-medium bg-[#EAF3EC] text-[#2E7D5B] px-2 py-0.5 rounded-md">
                          ✓ Compras
                        </span>
                        <span className="text-[10px] font-medium bg-[#EAF3EC] text-[#2E7D5B] px-2 py-0.5 rounded-md">
                          ✓ Reportes & Ganancias
                        </span>
                        <span className="text-[10px] font-medium bg-[#EAF3EC] text-[#2E7D5B] px-2 py-0.5 rounded-md">
                          ✓ Configuración
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="text-[10px] font-medium bg-[#EAF3EC] text-[#2E7D5B] px-2 py-0.5 rounded-md">
                          ✓ Ventas (Cobro POS)
                        </span>
                        <span className="text-[10px] font-medium bg-[#EAF3EC] text-[#2E7D5B] px-2 py-0.5 rounded-md">
                          ✓ Arqueo / Cierre de su Turno
                        </span>
                        <span className="text-[10px] font-medium bg-neutral-100 text-neutral-400 px-2 py-0.5 rounded-md line-through">
                          ✗ Costos & Ganancias
                        </span>
                        <span className="text-[10px] font-medium bg-neutral-100 text-neutral-400 px-2 py-0.5 rounded-md line-through">
                          ✗ Configuración
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => handleOpenEdit(user)}
                  className="px-3 py-1.5 bg-[#FAF6F0] hover:bg-[#EAF3EC] text-neutral-700 hover:text-[#2E7D5B] rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer border border-[#E4DFD3]"
                >
                  <Edit2 className="w-3 h-3" />
                  <span>Editar Datos / PIN</span>
                </button>

                {!isAdmin && (
                  <button
                    type="button"
                    onClick={() => handleDelete(user.id)}
                    className="p-1.5 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                    title="Eliminar usuario"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Attribution & Support footer with MarIA logo */}
      <div className="p-4 rounded-2xl bg-[#FAF6F0] border border-[#E4DFD3] flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <MariaLogo size="sm" variant="dark" prefix="Desarrollado por" withLink={false} />
          <div className="text-xs text-neutral-600">
            Plataforma SaaS para comercios impulsada por{' '}
            <a
              href="https://maria-vert.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-[#7C3AED] hover:underline"
            >
              MarIA
            </a>
          </div>
        </div>
        <a
          href="https://maria-vert.vercel.app/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-bold text-[#7C3AED] hover:text-[#6D28D9] flex items-center gap-1.5 transition-colors group"
        >
          <span className="group-hover:underline">https://maria-vert.vercel.app/</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Modal: Add User */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full border border-neutral-200 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-4 sm:p-5 bg-[#1C2B24] text-[#FAF6F0] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#2E7D5B]" />
                <h3 className="font-black text-sm uppercase tracking-wider">Crear Nuevo Vendedor / Usuario</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-neutral-400 hover:text-white text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="p-5 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Nombre y Apellido</label>
                <input
                  type="text"
                  required
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="ej. Ana Gómez"
                  className="w-full px-3 py-2 bg-[#FAF6F0] border border-[#E4DFD3] rounded-xl text-xs font-medium focus:outline-none focus:border-[#2E7D5B]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Nombre de Usuario (Login)</label>
                <input
                  type="text"
                  value={newUserUsername}
                  onChange={(e) => setNewUserUsername(e.target.value)}
                  placeholder="ej. ana / cajero2"
                  className="w-full px-3 py-2 bg-[#FAF6F0] border border-[#E4DFD3] rounded-xl text-xs font-mono focus:outline-none focus:border-[#2E7D5B]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">Rol</label>
                  <select
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 bg-[#FAF6F0] border border-[#E4DFD3] rounded-xl text-xs font-medium focus:outline-none focus:border-[#2E7D5B]"
                  >
                    <option value="cajero">Vendedor (Cajero)</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">PIN de Caja (3-4 dígitos)</label>
                  <input
                    type="password"
                    maxLength={4}
                    value={newUserPin}
                    onChange={(e) => setNewUserPin(e.target.value)}
                    placeholder="123"
                    className="w-full px-3 py-2 bg-[#FAF6F0] border border-[#E4DFD3] rounded-xl text-xs font-mono font-bold focus:outline-none focus:border-[#2E7D5B]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">WhatsApp / Celular (Opcional)</label>
                <input
                  type="tel"
                  value={newUserPhone}
                  onChange={(e) => setNewUserPhone(e.target.value)}
                  placeholder="ej. 987 654 321"
                  className="w-full px-3 py-2 bg-[#FAF6F0] border border-[#E4DFD3] rounded-xl text-xs font-medium focus:outline-none focus:border-[#2E7D5B]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#2E7D5B] hover:bg-[#235F45] text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Check className="w-3.5 h-3.5" />
                  Crear Usuario
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit User */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full border border-neutral-200 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-4 sm:p-5 bg-[#1C2B24] text-[#FAF6F0] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-[#2E7D5B]" />
                <h3 className="font-black text-sm uppercase tracking-wider">Modificar Datos de {editingUser.name}</h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="text-neutral-400 hover:text-white text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-5 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Nombre Completo</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FAF6F0] border border-[#E4DFD3] rounded-xl text-xs font-medium focus:outline-none focus:border-[#2E7D5B]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Nuevo PIN de Acceso</label>
                <input
                  type="text"
                  maxLength={6}
                  value={editPin}
                  onChange={(e) => setEditPin(e.target.value)}
                  placeholder="ej. 123"
                  className="w-full px-3 py-2 bg-[#FAF6F0] border border-[#E4DFD3] rounded-xl text-xs font-mono font-bold focus:outline-none focus:border-[#2E7D5B]"
                />
                <p className="text-[11px] text-neutral-400 mt-1">Este PIN será usado para ingresar en el POS.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">WhatsApp / Celular</label>
                <input
                  type="tel"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="ej. 987 654 321"
                  className="w-full px-3 py-2 bg-[#FAF6F0] border border-[#E4DFD3] rounded-xl text-xs font-medium focus:outline-none focus:border-[#2E7D5B]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-3.5 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#2E7D5B] hover:bg-[#235F45] text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Check className="w-3.5 h-3.5" />
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Upgrade / Quota Limit reached */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full border border-neutral-200 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-4 sm:p-5 bg-[#1C2B24] text-[#FAF6F0] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Crown className="w-4 h-4 text-[#B87D0F]" />
                <h3 className="font-black text-sm uppercase tracking-wider">Límite de Cupo Alcanzado</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowUpgradeModal(false)}
                className="text-neutral-400 hover:text-white text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="p-3 bg-[#FAEEDA] border border-[#EF9F27]/30 rounded-2xl flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-[#B87D0F] shrink-0 mt-0.5" />
                <div className="text-xs text-[#633806] space-y-1">
                  <p className="font-bold">Máximo 2 Usuarios en Plan Emprendedor (S/ 30/mes)</p>
                  <p className="text-[11px] leading-relaxed">
                    Tu plan actual incluye <strong>1 Administrador</strong> y <strong>1 Vendedor</strong>. Tienes los {license.maxUsers} cupos ocupados.
                  </p>
                </div>
              </div>

              <div className="space-y-2 text-xs text-neutral-600">
                <p>
                  ¿Necesitas habilitar otra caja o vendedor de turno para tu tienda?
                </p>
                <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 space-y-1">
                  <p className="font-bold text-neutral-800">Opción 1: Usuario adicional (+ S/ 15/mes)</p>
                  <p className="text-[11px] text-neutral-500">Agrega un 3er o 4to cajero sin cambiar de plan.</p>
                  <p className="font-bold text-neutral-800 pt-1">Opción 2: Reemplazar el vendedor actual</p>
                  <p className="text-[11px] text-neutral-500">Puedes editar el nombre o PIN del vendedor existente sin costo.</p>
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <button
                  type="button"
                  onClick={openWhatsAppUpgrade}
                  className="w-full py-2.5 px-4 bg-[#2E7D5B] hover:bg-[#235F45] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all"
                >
                  <Smartphone className="w-4 h-4" />
                  <span>Solicitar más usuarios por WhatsApp</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowUpgradeModal(false)}
                  className="w-full py-2 px-4 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Entendido, volver
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
