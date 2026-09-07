import React, { useState } from 'react';
import { usePos } from '../../context/PosContext';
import { Purchase, PurchaseDocType, PurchasePaymentStatus } from '../../types';
import { NewPurchaseModal } from './NewPurchaseModal';
import {
  Truck,
  Plus,
  Search,
  Calendar,
  FileText,
  X,
  Building,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  Clock,
  Receipt,
  CreditCard,
  Banknote,
  Package,
  Layers,
} from 'lucide-react';

export const ComprasModule: React.FC = () => {
  const { purchases, suppliers, addPurchasePayment } = usePos();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterDocType, setFilterDocType] = useState<string>('all');
  const [filterPaymentStatus, setFilterPaymentStatus] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewDetailPurchase, setViewDetailPurchase] = useState<Purchase | null>(null);

  // Quick Payment / Abono modal state
  const [paymentTargetPurchase, setPaymentTargetPurchase] = useState<Purchase | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'wallet' | 'transfer'>('cash');
  const [paymentRef, setPaymentRef] = useState<string>('');
  const [paymentNote, setPaymentNote] = useState<string>('');

  const filteredPurchases = purchases.filter((p) => {
    const term = searchTerm.toLowerCase();
    const matchesTerm =
      p.purchaseNumber.toLowerCase().includes(term) ||
      (p.documentNumber && p.documentNumber.toLowerCase().includes(term)) ||
      p.supplierName.toLowerCase().includes(term) ||
      p.items.some(
        (i) =>
          i.productName.toLowerCase().includes(term) ||
          i.sku.toLowerCase().includes(term)
      );

    const matchesDocType =
      filterDocType === 'all' || p.documentType === filterDocType;

    const matchesPaymentStatus =
      filterPaymentStatus === 'all' ||
      (filterPaymentStatus === 'pending'
        ? (p.pendingAmount || 0) > 0
        : p.paymentStatus === filterPaymentStatus);

    return matchesTerm && matchesDocType && matchesPaymentStatus;
  });

  // KPI Calculations
  const totalSpent = purchases.reduce((acc, p) => acc + p.total, 0);
  const totalPaid = purchases.reduce((acc, p) => acc + (p.amountPaid || 0), 0);
  const totalPendingDebt = purchases.reduce((acc, p) => acc + (p.pendingAmount || 0), 0);
  const pendingCount = purchases.filter((p) => (p.pendingAmount || 0) > 0).length;

  const handleOpenAbonoModal = (purchase: Purchase) => {
    setPaymentTargetPurchase(purchase);
    setPaymentAmount(purchase.pendingAmount || 0);
    setPaymentMethod('cash');
    setPaymentRef('');
    setPaymentNote('');
  };

  const handleConfirmAbono = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentTargetPurchase) return;
    if (paymentAmount <= 0) return alert('El monto del abono debe ser mayor a 0');
    if (paymentAmount > (paymentTargetPurchase.pendingAmount || 0)) {
      return alert(
        `El monto del abono (S/ ${paymentAmount.toFixed(
          2
        )}) supera el saldo pendiente (S/ ${(paymentTargetPurchase.pendingAmount || 0).toFixed(2)})`
      );
    }

    const updated = addPurchasePayment(paymentTargetPurchase.id, {
      amount: paymentAmount,
      method: paymentMethod,
      reference: paymentRef.trim() || undefined,
      notes: paymentNote.trim() || undefined,
    });

    if (updated) {
      alert(
        `¡Abono de S/ ${paymentAmount.toFixed(
          2
        )} registrado con éxito para la compra ${updated.purchaseNumber}!`
      );
      setPaymentTargetPurchase(null);
      if (viewDetailPurchase && viewDetailPurchase.id === updated.id) {
        setViewDetailPurchase(updated);
      }
    }
  };

  const getDocBadge = (type: PurchaseDocType) => {
    switch (type) {
      case 'factura':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-900 border border-blue-200 uppercase">
            Factura
          </span>
        );
      case 'boleta':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-200 uppercase">
            Boleta
          </span>
        );
      case 'recibo':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-neutral-100 text-neutral-800 border border-neutral-300 uppercase">
            Recibo Simple
          </span>
        );
      case 'guia':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-900 border border-purple-200 uppercase">
            Guía Remisión
          </span>
        );
      default:
        return null;
    }
  };

  const getPaymentStatusBadge = (purchase: Purchase) => {
    const isPaid = purchase.paymentStatus === 'pagado' || purchase.pendingAmount <= 0;
    const isCredit = purchase.paymentStatus === 'credito' && (purchase.amountPaid || 0) === 0;

    if (isPaid) {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-200">
          <CheckCircle2 className="w-3 h-3 text-emerald-700" />
          Pagado
        </span>
      );
    }

    if (isCredit) {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-900 border border-rose-200">
          <AlertCircle className="w-3 h-3 text-rose-700" />
          A Crédito (Debe S/ {(purchase.pendingAmount || 0).toFixed(2)})
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
        <Clock className="w-3 h-3 text-amber-700" />
        Parcial (Saldo S/ {(purchase.pendingAmount || 0).toFixed(2)})
      </span>
    );
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner & Action */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs">
        <div>
          <h1 className="text-xl font-black text-neutral-900 tracking-tight uppercase flex items-center gap-2">
            <Truck className="w-6 h-6 text-emerald-600" />
            Compras & Registro de Facturas de Proveedores
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Registra facturas, boletas y recibos de proveedores con control de pagos (contado, crédito o parcial) y actualización automática de stock en inventario.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-neutral-950 rounded-xl font-black text-xs shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-[0.99] shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Registrar Nueva Compra</span>
        </button>
      </div>

      {/* KPI Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block">
              Inversión Total en Compras
            </span>
            <div className="text-2xl font-black text-neutral-950 font-mono mt-1">
              S/ {totalSpent.toFixed(2)}
            </div>
            <span className="text-[10px] text-neutral-400">
              {purchases.length} órdenes registradas
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-700">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block">
              Compras Pagadas al Contado
            </span>
            <div className="text-2xl font-black text-emerald-600 font-mono mt-1">
              S/ {totalPaid.toFixed(2)}
            </div>
            <span className="text-[10px] text-emerald-700 font-medium">
              Liquidado a proveedores
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block">
              Cuentas por Pagar (Crédito / Saldo)
            </span>
            <div className={`text-2xl font-black font-mono mt-1 ${totalPendingDebt > 0 ? 'text-rose-600' : 'text-neutral-900'}`}>
              S/ {totalPendingDebt.toFixed(2)}
            </div>
            <span className="text-[10px] text-neutral-500">
              {pendingCount > 0 ? `${pendingCount} compras con saldo pendiente` : 'Sin deudas pendientes'}
            </span>
          </div>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${totalPendingDebt > 0 ? 'bg-rose-50 text-rose-600' : 'bg-neutral-100 text-neutral-500'}`}>
            <Clock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por N° de orden, Factura/Boleta del proveedor, nombre o producto..."
              className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-xs font-medium text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Filter by Doc Type */}
            <select
              value={filterDocType}
              onChange={(e) => setFilterDocType(e.target.value)}
              className="py-2.5 px-3 bg-neutral-50 border border-neutral-300 rounded-xl font-semibold text-neutral-800 focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="all">Todos los Comprobantes</option>
              <option value="factura">Solo Facturas</option>
              <option value="boleta">Solo Boletas</option>
              <option value="recibo">Solo Recibos Simples</option>
              <option value="guia">Solo Guías Remisión</option>
            </select>

            {/* Filter by Payment status */}
            <select
              value={filterPaymentStatus}
              onChange={(e) => setFilterPaymentStatus(e.target.value)}
              className="py-2.5 px-3 bg-neutral-50 border border-neutral-300 rounded-xl font-semibold text-neutral-800 focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="all">Todos los Estados de Pago</option>
              <option value="pagado">Pagados (100%)</option>
              <option value="pending">Con Saldo Pendiente (Crédito / Parcial)</option>
              <option value="credito">Solo a Crédito</option>
              <option value="parcial">Solo Pagos Parciales</option>
            </select>
          </div>
        </div>
      </div>

      {/* Purchases List & Table */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs overflow-hidden">
        {filteredPurchases.length === 0 ? (
          <div className="p-12 text-center text-neutral-400 space-y-2">
            <Truck className="w-10 h-10 mx-auto text-neutral-300" />
            <p className="font-bold text-sm text-neutral-700">No se encontraron compras con los filtros seleccionados</p>
            <p className="text-xs text-neutral-500">
              Usa el botón "Registrar Nueva Compra" para ingresar mercadería con factura o boleta de proveedor.
            </p>
          </div>
        ) : (
          <>
            {/* Mobile Card List (< md) */}
            <div className="md:hidden divide-y divide-neutral-200">
              {filteredPurchases.map((purchase) => {
                const hasPending = (purchase.pendingAmount || 0) > 0;

                return (
                  <div key={purchase.id} className="p-4 space-y-3 bg-white">
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-mono text-xs font-black text-neutral-900 bg-neutral-100 px-2 py-0.5 rounded border border-neutral-200">
                            {purchase.purchaseNumber}
                          </span>
                          {getDocBadge(purchase.documentType || 'factura')}
                          <span className="font-mono text-xs font-bold text-neutral-800">
                            {purchase.documentNumber || 'S/N'}
                          </span>
                        </div>
                        <p className="text-[11px] text-neutral-500 font-mono">
                          Doc: {purchase.documentDate || new Date(purchase.date).toISOString().split('T')[0]}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-neutral-500 block font-semibold">Total:</span>
                        <span className="text-base font-black text-neutral-950 font-mono">
                          S/ {purchase.total.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs bg-neutral-50 p-2.5 rounded-xl border border-neutral-200">
                      <div className="flex items-center gap-1.5 truncate">
                        <Building className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="font-bold text-neutral-900 truncate">
                          {purchase.supplierName}
                        </span>
                      </div>
                      <div className="shrink-0">{getPaymentStatusBadge(purchase)}</div>
                    </div>

                    <div className="text-xs text-neutral-600 bg-emerald-50/40 p-2 rounded-lg border border-emerald-100/50">
                      <span className="font-bold text-emerald-800 block text-[11px] mb-0.5">
                        Stock ingresado al inventario:
                      </span>
                      <p className="line-clamp-2">
                        {purchase.items.map((i) => `+${i.quantity} ${i.productName}`).join(', ')}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        onClick={() => setViewDetailPurchase(purchase)}
                        className="py-2 px-3 bg-neutral-100 hover:bg-neutral-200 active:bg-neutral-300 text-neutral-900 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                      >
                        <FileText className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Ver Detalle</span>
                      </button>

                      {hasPending ? (
                        <button
                          onClick={() => handleOpenAbonoModal(purchase)}
                          className="py-2 px-3 bg-amber-400 hover:bg-amber-300 text-neutral-950 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          <Banknote className="w-3.5 h-3.5" />
                          <span>Abonar S/ {(purchase.pendingAmount || 0).toFixed(2)}</span>
                        </button>
                      ) : (
                        <div className="flex items-center justify-center text-[11px] font-bold text-emerald-700 bg-emerald-50 rounded-xl border border-emerald-200">
                          Cancelado
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop Table (hidden md:block) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-neutral-100 border-b border-neutral-200 text-neutral-700 uppercase tracking-wider font-bold text-[11px]">
                    <th className="py-3.5 px-4 font-mono">N° Orden</th>
                    <th className="py-3.5 px-4">Comprobante Proveedor</th>
                    <th className="py-3.5 px-4">Fecha Doc.</th>
                    <th className="py-3.5 px-4">Proveedor</th>
                    <th className="py-3.5 px-4">Mercadería Ingresada</th>
                    <th className="py-3.5 px-4 text-center">Estado de Pago</th>
                    <th className="py-3.5 px-4 text-right font-mono">Total Compra</th>
                    <th className="py-3.5 px-4 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {filteredPurchases.map((purchase) => {
                    const hasPending = (purchase.pendingAmount || 0) > 0;

                    return (
                      <tr key={purchase.id} className="hover:bg-neutral-50 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-neutral-900 font-mono">
                          {purchase.purchaseNumber}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5">
                            {getDocBadge(purchase.documentType || 'factura')}
                            <span className="font-mono font-bold text-neutral-900">
                              {purchase.documentNumber || 'S/N'}
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-neutral-600 font-mono">
                          {purchase.documentDate || new Date(purchase.date).toISOString().split('T')[0]}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-neutral-900">
                          <div className="flex items-center gap-1.5">
                            <Building className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                            <span className="truncate max-w-[160px]">{purchase.supplierName}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-neutral-600 max-w-xs truncate">
                          {purchase.items.map((i) => `+${i.quantity} ${i.productName}`).join(', ')}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          {getPaymentStatusBadge(purchase)}
                        </td>
                        <td className="py-3.5 px-4 text-right font-black text-neutral-950 font-mono text-sm">
                          S/ {purchase.total.toFixed(2)}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => setViewDetailPurchase(purchase)}
                              className="p-1.5 text-neutral-700 hover:text-black hover:bg-neutral-200 rounded-lg transition-colors font-bold text-xs inline-flex items-center gap-1 cursor-pointer border border-neutral-300"
                              title="Ver detalle de la compra"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              <span>Detalle</span>
                            </button>

                            {hasPending && (
                              <button
                                onClick={() => handleOpenAbonoModal(purchase)}
                                className="p-1.5 bg-amber-400 hover:bg-amber-300 text-neutral-950 rounded-lg transition-colors font-black text-xs inline-flex items-center gap-1 cursor-pointer shadow-xs"
                                title="Registrar abono de dinero al proveedor"
                              >
                                <Banknote className="w-3.5 h-3.5" />
                                <span>Abonar</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* New Purchase Modal */}
      {isModalOpen && <NewPurchaseModal onClose={() => setIsModalOpen(false)} />}

      {/* Full Detail Modal */}
      {viewDetailPurchase && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-neutral-800 my-6">
            <div className="bg-neutral-950 text-white p-5 flex items-center justify-between border-b border-neutral-800">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-base uppercase tracking-tight">
                    Compra N° {viewDetailPurchase.purchaseNumber}
                  </h3>
                  {getDocBadge(viewDetailPurchase.documentType || 'factura')}
                </div>
                <p className="text-xs text-neutral-400 font-mono mt-0.5">
                  Documento: {viewDetailPurchase.documentNumber || 'S/N'} • Fecha Emisión: {viewDetailPurchase.documentDate || 'N/A'}
                </p>
              </div>
              <button
                onClick={() => setViewDetailPurchase(null)}
                className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs max-h-[75vh] overflow-y-auto">
              {/* Supplier Box */}
              <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-[10px] text-neutral-500 uppercase font-bold block">Proveedor:</span>
                  <span className="font-bold text-neutral-900 text-sm">{viewDetailPurchase.supplierName}</span>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-500 uppercase font-bold block">Condición de Pago:</span>
                  <div>{getPaymentStatusBadge(viewDetailPurchase)}</div>
                </div>
              </div>

              {/* Items Table */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-neutral-700 uppercase tracking-wider text-[11px]">
                    Productos Ingresados al Inventario
                  </span>
                  <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Stock aumentado automáticamente
                  </span>
                </div>

                <div className="border border-neutral-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-neutral-100 text-neutral-700 font-bold uppercase text-[10px]">
                      <tr>
                        <th className="py-2.5 px-3">Producto / SKU</th>
                        <th className="py-2.5 px-3 text-center text-emerald-700">Cant. Ingresada</th>
                        <th className="py-2.5 px-3 text-center">Costo Unit.</th>
                        <th className="py-2.5 px-3 text-center">Precio Venta POS</th>
                        <th className="py-2.5 px-3 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200 text-xs">
                      {viewDetailPurchase.items.map((item, idx) => (
                        <tr key={idx} className="hover:bg-neutral-50">
                          <td className="py-2.5 px-3 font-medium text-neutral-900">
                            <div>{item.productName}</div>
                            <span className="text-neutral-400 font-mono text-[10px]">{item.sku}</span>
                          </td>
                          <td className="py-2.5 px-3 text-center font-black font-mono text-emerald-600 bg-emerald-50/40">
                            +{item.quantity}
                          </td>
                          <td className="py-2.5 px-3 text-center font-mono text-neutral-700">
                            <div className="font-bold">S/ {(item.unitCost || 0).toFixed(2)}</div>
                            {typeof item.previousCost === 'number' && item.previousCost !== item.unitCost && (
                              <span className="text-[10px] text-neutral-400">
                                Ant: S/ {item.previousCost.toFixed(2)}
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-center font-mono">
                            {typeof item.newSalePrice === 'number' ? (
                              <div>
                                <span className="font-black text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded text-[11px]">
                                  S/ {item.newSalePrice.toFixed(2)}
                                </span>
                                {typeof item.previousSalePrice === 'number' && (
                                  <div className="text-[10px] text-neutral-400 line-through">
                                    Ant: S/ {item.previousSalePrice.toFixed(2)}
                                  </div>
                                )}
                              </div>
                            ) : typeof item.previousSalePrice === 'number' ? (
                              <span className="text-neutral-700 font-bold">
                                S/ {item.previousSalePrice.toFixed(2)}
                              </span>
                            ) : (
                              <span className="text-neutral-400 text-[10px]">Sin cambio</span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-right font-black font-mono text-neutral-950">
                            S/ {(item.subtotal || 0).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Payment Summary Box */}
              <div className="bg-neutral-900 text-white p-4 rounded-xl space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-neutral-400">Total Liquidación de Compra:</span>
                  <span className="text-base font-black font-mono text-emerald-400">
                    S/ {viewDetailPurchase.total.toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs border-t border-neutral-800 pt-2">
                  <span className="text-neutral-400">Monto Abonado / Pagado:</span>
                  <span className="font-bold font-mono text-white">
                    S/ {(viewDetailPurchase.amountPaid || 0).toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs border-t border-neutral-800 pt-2">
                  <span className="text-neutral-400">Saldo Pendiente de Pago:</span>
                  <span className={`font-black font-mono text-sm ${(viewDetailPurchase.pendingAmount || 0) > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                    S/ {(viewDetailPurchase.pendingAmount || 0).toFixed(2)}
                  </span>
                </div>

                {viewDetailPurchase.dueDate && (
                  <div className="flex justify-between items-center text-[11px] border-t border-neutral-800 pt-1 text-neutral-400">
                    <span>Fecha Límite / Vencimiento:</span>
                    <span className="font-mono font-bold text-amber-300">
                      {viewDetailPurchase.dueDate}
                    </span>
                  </div>
                )}
              </div>

              {/* Payment History if exists */}
              {viewDetailPurchase.paymentHistory && viewDetailPurchase.paymentHistory.length > 0 && (
                <div className="space-y-1.5">
                  <span className="font-bold text-neutral-700 uppercase tracking-wider text-[11px]">
                    Historial de Pagos / Abonos
                  </span>
                  <div className="border border-neutral-200 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-neutral-100 text-neutral-700 font-bold uppercase text-[10px]">
                        <tr>
                          <th className="py-2 px-3">Fecha</th>
                          <th className="py-2 px-3">Método</th>
                          <th className="py-2 px-3">Detalle / Ref.</th>
                          <th className="py-2 px-3 text-right">Monto</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-200">
                        {viewDetailPurchase.paymentHistory.map((pay, pIdx) => (
                          <tr key={pIdx}>
                            <td className="py-2 px-3 text-neutral-600 font-mono">
                              {new Date(pay.date).toLocaleDateString('es-PE')}
                            </td>
                            <td className="py-2 px-3 font-semibold uppercase text-[10px] text-neutral-800">
                              {pay.method}
                            </td>
                            <td className="py-2 px-3 text-neutral-600 text-[11px]">
                              {pay.notes || pay.reference || 'Abono'}
                            </td>
                            <td className="py-2 px-3 text-right font-black font-mono text-emerald-600">
                              S/ {pay.amount.toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {viewDetailPurchase.notes && (
                <div className="bg-neutral-50 p-2.5 rounded-lg border border-neutral-200 text-neutral-700">
                  <span className="font-bold block text-[10px] uppercase text-neutral-500">Notas / Observaciones:</span>
                  <p className="mt-0.5">{viewDetailPurchase.notes}</p>
                </div>
              )}
            </div>

            <div className="p-4 bg-neutral-100 border-t border-neutral-200 flex items-center justify-between">
              {(viewDetailPurchase.pendingAmount || 0) > 0 ? (
                <button
                  onClick={() => handleOpenAbonoModal(viewDetailPurchase)}
                  className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-black rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Banknote className="w-4 h-4" />
                  <span>Registrar Abono a este Saldo</span>
                </button>
              ) : (
                <span className="text-xs font-bold text-emerald-700">✓ Compra 100% Cancelada</span>
              )}

              <button
                onClick={() => setViewDetailPurchase(null)}
                className="px-4 py-2 bg-neutral-900 hover:bg-black text-white font-bold rounded-xl text-xs cursor-pointer transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Abono Modal */}
      {paymentTargetPurchase && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-neutral-800">
            <div className="bg-neutral-950 text-white p-4 flex items-center justify-between border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <Banknote className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="font-black text-sm uppercase">Registrar Abono de Pago</h3>
                  <p className="text-[11px] text-neutral-400">
                    Compra {paymentTargetPurchase.purchaseNumber} ({paymentTargetPurchase.supplierName})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setPaymentTargetPurchase(null)}
                className="p-1 text-neutral-400 hover:text-white rounded cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmAbono} className="p-5 space-y-4 text-xs">
              <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 flex justify-between items-center">
                <span className="font-bold text-amber-900">Saldo Pendiente Actual:</span>
                <span className="font-black font-mono text-base text-amber-950">
                  S/ {(paymentTargetPurchase.pendingAmount || 0).toFixed(2)}
                </span>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                  Monto a Abonar (S/):
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={paymentTargetPurchase.pendingAmount || 0}
                  value={paymentAmount || ''}
                  onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
                  className="w-full py-2.5 px-3 bg-neutral-50 border border-neutral-300 rounded-xl text-base font-mono font-black text-neutral-900 focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                  Medio de Pago:
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="w-full py-2 px-3 bg-neutral-50 border border-neutral-300 rounded-xl text-xs font-bold text-neutral-900 focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  <option value="cash">Efectivo</option>
                  <option value="transfer">Transferencia Bancaria</option>
                  <option value="wallet">Yape / Plin</option>
                  <option value="card">Tarjeta</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                  N° de Operación / Referencia (Opcional):
                </label>
                <input
                  type="text"
                  value={paymentRef}
                  onChange={(e) => setPaymentRef(e.target.value)}
                  placeholder="Ej: BCP-992102 o YAPE-882"
                  className="w-full py-2 px-3 bg-neutral-50 border border-neutral-300 rounded-xl text-xs font-mono text-neutral-900 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                  Notas de Pago (Opcional):
                </label>
                <input
                  type="text"
                  value={paymentNote}
                  onChange={(e) => setPaymentNote(e.target.value)}
                  placeholder="Ej: Pago de segunda cuota vía transferencia"
                  className="w-full py-2 px-3 bg-neutral-50 border border-neutral-300 rounded-xl text-xs text-neutral-900 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => setPaymentTargetPurchase(null)}
                  className="px-3.5 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold rounded-xl text-xs cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-black rounded-xl text-xs cursor-pointer shadow-md transition-all active:scale-95"
                >
                  Confirmar Abono
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
