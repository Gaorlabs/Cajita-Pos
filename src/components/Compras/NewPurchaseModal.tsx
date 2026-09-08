import React, { useState, useRef } from 'react';
import { usePos } from '../../context/PosContext';
import { PurchaseDocType, PurchasePaymentStatus } from '../../types';
import {
  X,
  Plus,
  Trash2,
  Truck,
  Check,
  Building,
  FileText,
  Calendar,
  CreditCard,
  Banknote,
  Receipt,
  AlertCircle,
  Package,
  ArrowUpRight,
  ArrowDownRight,
  Percent,
  Sparkles,
  Tag,
  Search,
  CheckCheck,
  Layers,
  Scale,
} from 'lucide-react';

interface NewPurchaseModalProps {
  onClose: () => void;
}

interface PurchaseItemDraft {
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitCost: number;
  previousCost: number;
  previousSalePrice: number;
  newSalePrice?: number;
}

export const NewPurchaseModal: React.FC<NewPurchaseModalProps> = ({ onClose }) => {
  const { suppliers, products, addPurchase, addSupplier } = usePos();

  // Filter out pure combos from raw purchase restocking
  const baseProducts = products.filter((p) => p.type !== 'combo');

  const [supplierId, setSupplierId] = useState<string>(suppliers?.[0]?.id || '');
  
  // Document details from supplier
  const [documentType, setDocumentType] = useState<PurchaseDocType>('factura');
  const [documentNumber, setDocumentNumber] = useState<string>('');
  const [documentDate, setDocumentDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  // Payment status & condition
  const [paymentStatus, setPaymentStatus] = useState<PurchasePaymentStatus>('pagado');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'wallet' | 'transfer' | 'credit'>('cash');
  const [partialAmountPaid, setPartialAmountPaid] = useState<number>(0);
  const [dueDate, setDueDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 15);
    return d.toISOString().split('T')[0];
  });

  const [notes, setNotes] = useState('');

  // Purchase items list (supports multiple products per supplier invoice)
  const [items, setItems] = useState<PurchaseItemDraft[]>([]);

  // Search and selector state for rapid multi-product entry
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const initialProduct = baseProducts[0] || products[0];
  const [selectedProdId, setSelectedProdId] = useState<string>(initialProduct?.id || '');
  const [addQty, setAddQty] = useState<number>(10);
  const [addCost, setAddCost] = useState<number>(() => (initialProduct ? initialProduct.purchasePrice || 0 : 1.0));
  const [addSalePrice, setAddSalePrice] = useState<number>(() => (initialProduct ? initialProduct.salePrice || 0 : 1.5));
  const [updateSalePrice, setUpdateSalePrice] = useState<boolean>(true);

  // Sack / Bulk purchase conversion helper state
  const [showSackCalculator, setShowSackCalculator] = useState(false);
  const [sackCount, setSackCount] = useState<number>(1);
  const [sackWeightKg, setSackWeightKg] = useState<number>(50);
  const [sackCostTotal, setSackCostTotal] = useState<number>(170);

  // Quick Supplier Add state
  const [isAddingSupplier, setIsAddingSupplier] = useState(false);
  const [newSupName, setNewSupName] = useState('');
  const [newSupRuc, setNewSupRuc] = useState('');
  const [newSupPhone, setNewSupPhone] = useState('');

  // Currently selected product details
  const currentSelectedProduct = products.find((p) => p.id === selectedProdId) || initialProduct;
  const prevPurchasePrice = currentSelectedProduct ? (currentSelectedProduct.purchasePrice || 0) : 0;
  const currentCatalogPrice = currentSelectedProduct ? (currentSelectedProduct.salePrice || 0) : 0;

  // Cost variation calculation for the currently selected product
  const costDiff = (addCost || 0) - prevPurchasePrice;
  const isCostHigher = costDiff > 0.001;
  const isCostLower = costDiff < -0.001;
  const costChangePercent = prevPurchasePrice > 0 ? (costDiff / prevPurchasePrice) * 100 : 0;

  // Real-time margin calculation for the product being added
  const activeEffectiveSalePrice = updateSalePrice ? (addSalePrice || 0) : currentCatalogPrice;
  const profitAmount = activeEffectiveSalePrice - (addCost || 0);
  const profitMarginPercent =
    activeEffectiveSalePrice > 0 ? (profitAmount / activeEffectiveSalePrice) * 100 : 0;

  const oldPriceMarginPercent =
    currentCatalogPrice > 0 ? ((currentCatalogPrice - (addCost || 0)) / currentCatalogPrice) * 100 : 0;

  // Filtered products for quick search
  const filteredProducts = baseProducts.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.barcode && p.barcode.includes(searchQuery))
  );

  const handleSelectProduct = (prod: typeof baseProducts[0]) => {
    setSelectedProdId(prod.id);
    setAddCost(prod.purchasePrice || 0);
    setAddSalePrice(prod.salePrice || 0);
    setUpdateSalePrice(false);
    setSearchQuery('');
    setIsSearchDropdownOpen(false);
  };

  // Quick preset margin handler: Price = Cost / (1 - margin%)
  const handleApplyQuickMargin = (targetMarginPercent: number) => {
    if ((addCost || 0) <= 0) return;
    const marginFactor = 1 - targetMarginPercent / 100;
    if (marginFactor <= 0) return;
    const calculatedPrice = Math.round(((addCost || 0) / marginFactor) * 10) / 10;
    setAddSalePrice(calculatedPrice);
    setUpdateSalePrice(true);
  };

  // Add item to the multi-product list
  const handleAddItem = () => {
    if (!selectedProdId) return;
    if (addQty <= 0) return alert('La cantidad debe ser mayor a 0');
    if (addCost < 0) return alert('El costo no puede ser negativo');
    if (updateSalePrice && addSalePrice <= 0) {
      return alert('El precio de venta debe ser mayor a 0');
    }

    const prod = products.find((p) => p.id === selectedProdId);
    if (!prod) return;

    const prevCost = prod.purchasePrice || 0;
    const prevPrice = prod.salePrice || 0;

    const newItem: PurchaseItemDraft = {
      productId: prod.id,
      productName: prod.name,
      sku: prod.sku,
      quantity: addQty,
      unitCost: addCost,
      previousCost: prevCost,
      previousSalePrice: prevPrice,
      newSalePrice: updateSalePrice && addSalePrice !== prevPrice ? addSalePrice : undefined,
    };

    const existingIndex = items.findIndex((i) => i.productId === selectedProdId);
    if (existingIndex > -1) {
      const updated = [...items];
      updated[existingIndex] = {
        ...updated[existingIndex],
        quantity: updated[existingIndex].quantity + addQty,
        unitCost: addCost,
        newSalePrice: newItem.newSalePrice,
      };
      setItems(updated);
    } else {
      setItems([...items, newItem]);
    }

    // Reset update toggle and re-focus search for the next product
    setUpdateSalePrice(false);
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  // Direct Inline Table Edits for multi-item ease
  const handleUpdateItemQuantity = (index: number, newQty: number) => {
    const updated = [...items];
    updated[index].quantity = Math.max(1, newQty || 1);
    setItems(updated);
  };

  const handleUpdateItemUnitCost = (index: number, newCost: number) => {
    const updated = [...items];
    updated[index].unitCost = Math.max(0, newCost || 0);
    setItems(updated);
  };

  const handleUpdateItemSalePrice = (index: number, newPrice: number) => {
    const updated = [...items];
    updated[index].newSalePrice = newPrice > 0 ? newPrice : undefined;
    setItems(updated);
  };

  const handleApplyMarginToRow = (index: number, marginPercent: number) => {
    const item = items[index];
    if (item.unitCost <= 0) return;
    const factor = 1 - marginPercent / 100;
    if (factor <= 0) return;
    const calculated = Math.round((item.unitCost / factor) * 10) / 10;
    handleUpdateItemSalePrice(index, calculated);
  };

  // Bulk Apply Margin to all items with higher cost
  const handleBulkApplyMargin = (targetMargin: number) => {
    const updated = items.map((item) => {
      if (item.unitCost > item.previousCost) {
        const factor = 1 - targetMargin / 100;
        const calculated = Math.round((item.unitCost / factor) * 10) / 10;
        return {
          ...item,
          newSalePrice: calculated,
        };
      }
      return item;
    });
    setItems(updated);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleClearAllItems = () => {
    if (items.length === 0) return;
    if (window.confirm('¿Deseas vaciar todos los productos agregados a esta compra?')) {
      setItems([]);
    }
  };

  const handleCreateSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSupName.trim()) return alert('El nombre o razón social del proveedor es obligatorio');
    const created = addSupplier({
      name: newSupName.trim(),
      ruc: newSupRuc.trim() || '20000000001',
      phone: newSupPhone.trim() || '999888777',
    });
    setSupplierId(created.id);
    setIsAddingSupplier(false);
    setNewSupName('');
    setNewSupRuc('');
    setNewSupPhone('');
  };

  // Aggregated multi-product metrics
  const totalItemsCount = items.length;
  const totalUnitsCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const purchaseTotal = items.reduce((sum, item) => sum + item.quantity * item.unitCost, 0);
  const itemsWithCostIncrease = items.filter((i) => i.unitCost > i.previousCost).length;
  const itemsWithPriceUpdate = items.filter((i) => typeof i.newSalePrice === 'number' && i.newSalePrice > 0).length;

  // Calculate actual paid and pending amounts based on selection
  let finalPaidAmount = 0;
  let finalPendingAmount = 0;

  if (paymentStatus === 'pagado') {
    finalPaidAmount = purchaseTotal;
    finalPendingAmount = 0;
  } else if (paymentStatus === 'credito') {
    finalPaidAmount = 0;
    finalPendingAmount = purchaseTotal;
  } else if (paymentStatus === 'parcial') {
    finalPaidAmount = Math.min(purchaseTotal, Math.max(0, partialAmountPaid));
    finalPendingAmount = Math.max(0, purchaseTotal - finalPaidAmount);
  }

  const handleSavePurchase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierId) return alert('Por favor selecciona un proveedor');
    if (items.length === 0) return alert('Agrega al menos un producto a la compra');

    if (!documentNumber.trim()) {
      const defaultDoc = `${documentType.toUpperCase().slice(0, 3)}-${Date.now().toString().slice(-6)}`;
      setDocumentNumber(defaultDoc);
    }

    const result = addPurchase({
      supplierId,
      items: items.map((i) => ({
        productId: i.productId,
        quantity: i.quantity,
        unitCost: i.unitCost,
        previousCost: i.previousCost,
        previousSalePrice: i.previousSalePrice,
        newSalePrice: i.newSalePrice,
      })),
      documentType,
      documentNumber: documentNumber.trim(),
      documentDate,
      paymentStatus,
      paymentMethod: paymentStatus === 'credito' ? 'credit' : paymentMethod,
      amountPaid: finalPaidAmount,
      dueDate: paymentStatus !== 'pagado' ? dueDate : undefined,
      notes: notes.trim() || undefined,
    });

    if (result) {
      alert(
        `¡Compra N° ${result.purchaseNumber} (${result.documentType.toUpperCase()} ${result.documentNumber}) registrada con éxito!\n\n` +
          `• Total de la factura: S/ ${result.total.toFixed(2)}\n` +
          `• Cantidad de productos: ${totalItemsCount} productos (${totalUnitsCount} unidades ingresadas a inventario)\n` +
          `• Estado de pago: ${result.paymentStatus.toUpperCase()}\n` +
          (itemsWithPriceUpdate > 0
            ? `• Precios de venta actualizados en POS: ${itemsWithPriceUpdate} producto(s).`
            : `• Precios de venta en POS mantenidos.`)
      );
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl overflow-hidden my-4 border border-neutral-800">
        {/* Modal Header */}
        <div className="bg-neutral-950 text-white p-4 sm:p-5 flex items-center justify-between border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 text-neutral-950 flex items-center justify-center font-bold shadow-md shadow-emerald-500/20">
              <Truck className="w-5 h-5 text-neutral-950" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black uppercase tracking-tight flex items-center gap-2">
                <span>Registrar Compra / Factura de Proveedor</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold px-2 py-0.5 rounded-full">
                  Multi-Producto
                </span>
              </h2>
              <p className="text-xs text-neutral-400">
                Ingresa todos los productos de la factura, detecta variaciones de costo y ajusta márgenes en bloque o individualmente.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-xl transition-colors cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSavePurchase} className="p-4 sm:p-6 space-y-5 max-h-[84vh] overflow-y-auto">
          {/* SECTION 1: PROVEEDOR */}
          <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-neutral-800 uppercase tracking-wider flex items-center gap-1.5">
                <Building className="w-4 h-4 text-emerald-600" />
                1. Datos del Proveedor
              </label>
              <button
                type="button"
                onClick={() => setIsAddingSupplier(!isAddingSupplier)}
                className="text-xs text-emerald-600 hover:text-emerald-700 font-bold flex items-center gap-1 cursor-pointer underline underline-offset-2"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isAddingSupplier ? 'Cancelar' : '+ Nuevo Proveedor'}</span>
              </button>
            </div>

            {!isAddingSupplier ? (
              <select
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
                className="w-full py-2.5 px-3 bg-white border border-neutral-300 rounded-xl text-xs font-semibold text-neutral-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 cursor-pointer"
              >
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} — RUC: {s.ruc} {s.phone ? `| Tel: ${s.phone}` : ''}
                  </option>
                ))}
              </select>
            ) : (
              <div className="bg-white p-3.5 rounded-xl border border-neutral-300 space-y-2.5">
                <p className="text-[11px] font-bold text-neutral-700">Registrar Nuevo Proveedor:</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={newSupName}
                    onChange={(e) => setNewSupName(e.target.value)}
                    placeholder="Nombre / Razón Social *"
                    className="text-xs py-2 px-2.5 border border-neutral-300 rounded-lg focus:border-emerald-500 focus:outline-none"
                    required
                  />
                  <input
                    type="text"
                    value={newSupRuc}
                    onChange={(e) => setNewSupRuc(e.target.value)}
                    placeholder="RUC (11 dígitos)"
                    className="text-xs py-2 px-2.5 border border-neutral-300 rounded-lg focus:border-emerald-500 focus:outline-none"
                  />
                  <input
                    type="text"
                    value={newSupPhone}
                    onChange={(e) => setNewSupPhone(e.target.value)}
                    placeholder="Teléfono / Contacto"
                    className="text-xs py-2 px-2.5 border border-neutral-300 rounded-lg focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsAddingSupplier(false)}
                    className="px-3 py-1.5 text-xs text-neutral-600 hover:text-neutral-900 cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleCreateSupplier}
                    className="px-3.5 py-1.5 bg-emerald-500 text-neutral-950 font-bold text-xs rounded-lg hover:bg-emerald-400 cursor-pointer transition-colors"
                  >
                    Guardar y Seleccionar
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* SECTION 2: DOCUMENTO DEL PROVEEDOR */}
          <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200 space-y-3">
            <label className="text-xs font-black text-neutral-800 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-emerald-600" />
              2. Documento de Compra (Factura, Boleta, Guía o Recibo)
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              <div className="sm:col-span-4">
                <label className="block text-[11px] font-bold text-neutral-600 mb-1">
                  Tipo de Documento:
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setDocumentType('factura')}
                    className={`py-2 px-2 rounded-lg text-xs font-bold border transition-all cursor-pointer text-center ${
                      documentType === 'factura'
                        ? 'bg-neutral-900 text-white border-neutral-900 shadow-xs'
                        : 'bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-100'
                    }`}
                  >
                    Factura
                  </button>
                  <button
                    type="button"
                    onClick={() => setDocumentType('boleta')}
                    className={`py-2 px-2 rounded-lg text-xs font-bold border transition-all cursor-pointer text-center ${
                      documentType === 'boleta'
                        ? 'bg-neutral-900 text-white border-neutral-900 shadow-xs'
                        : 'bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-100'
                    }`}
                  >
                    Boleta
                  </button>
                  <button
                    type="button"
                    onClick={() => setDocumentType('recibo')}
                    className={`py-2 px-2 rounded-lg text-xs font-bold border transition-all cursor-pointer text-center ${
                      documentType === 'recibo'
                        ? 'bg-neutral-900 text-white border-neutral-900 shadow-xs'
                        : 'bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-100'
                    }`}
                  >
                    Recibo Simple
                  </button>
                  <button
                    type="button"
                    onClick={() => setDocumentType('guia')}
                    className={`py-2 px-2 rounded-lg text-xs font-bold border transition-all cursor-pointer text-center ${
                      documentType === 'guia'
                        ? 'bg-neutral-900 text-white border-neutral-900 shadow-xs'
                        : 'bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-100'
                    }`}
                  >
                    Guía Remisión
                  </button>
                </div>
              </div>

              <div className="sm:col-span-4">
                <label className="block text-[11px] font-bold text-neutral-600 mb-1">
                  N° de Documento / Folio Impreso:
                </label>
                <input
                  type="text"
                  value={documentNumber}
                  onChange={(e) => setDocumentNumber(e.target.value)}
                  placeholder={
                    documentType === 'factura'
                      ? 'Ej: F001-0004928'
                      : documentType === 'boleta'
                      ? 'Ej: B001-001284'
                      : documentType === 'guia'
                      ? 'Ej: T001-000192'
                      : 'Ej: REC-9921'
                  }
                  className="w-full py-2.5 px-3 bg-white border border-neutral-300 rounded-xl text-xs font-mono font-bold text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="sm:col-span-4">
                <label className="block text-[11px] font-bold text-neutral-600 mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                  Fecha de Emisión del Documento:
                </label>
                <input
                  type="date"
                  value={documentDate}
                  onChange={(e) => setDocumentDate(e.target.value)}
                  className="w-full py-2.5 px-3 bg-white border border-neutral-300 rounded-xl text-xs font-mono font-bold text-neutral-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: INGRESO RÁPIDO DE MÚLTIPLES PRODUCTOS */}
          <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="text-xs font-black text-neutral-800 uppercase tracking-wider flex items-center gap-1.5">
                <Package className="w-4 h-4 text-emerald-600" />
                3. Ingreso de Productos de la Factura
              </label>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-neutral-600 bg-white px-2.5 py-1 rounded-lg border border-neutral-300 flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-emerald-600" />
                  {totalItemsCount} productos ({totalUnitsCount} unidades)
                </span>
                {itemsWithCostIncrease > 0 && (
                  <span className="text-[11px] font-bold text-rose-700 bg-rose-100 px-2.5 py-1 rounded-lg border border-rose-300 flex items-center gap-1">
                    <ArrowUpRight className="w-3.5 h-3.5 text-rose-600" />
                    {itemsWithCostIncrease} con alza de costo
                  </span>
                )}
              </div>
            </div>

            {/* Fast Product Search & Add Panel */}
            <div className="bg-white p-4 rounded-xl border border-neutral-300 space-y-3 shadow-xs">
              {/* Product Search / Selector Bar */}
              <div className="relative">
                <label className="block text-[11px] font-bold text-neutral-700 mb-1 flex items-center justify-between">
                  <span>Buscar y Seleccionar Producto a Ingresar:</span>
                  <span className="text-[10px] text-neutral-400 font-normal">
                    Selecciona o escribe el nombre / SKU
                  </span>
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setIsSearchDropdownOpen(true);
                    }}
                    onFocus={() => setIsSearchDropdownOpen(true)}
                    placeholder={`Buscar entre los ${baseProducts.length} productos del catálogo...`}
                    className="w-full py-2.5 pl-9 pr-3 bg-neutral-50 border border-neutral-300 rounded-xl text-xs font-semibold text-neutral-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
                  />
                </div>

                {/* Search Autocomplete Dropdown */}
                {isSearchDropdownOpen && searchQuery.trim().length > 0 && (
                  <div className="absolute z-30 left-0 right-0 top-full mt-1 bg-white border border-neutral-300 rounded-xl shadow-xl max-h-56 overflow-y-auto divide-y divide-neutral-100">
                    {filteredProducts.length === 0 ? (
                      <div className="p-3 text-xs text-neutral-500 text-center">
                        No se encontró ningún producto con "{searchQuery}"
                      </div>
                    ) : (
                      filteredProducts.map((p) => (
                        <div
                          key={p.id}
                          onClick={() => handleSelectProduct(p)}
                          className="p-2.5 hover:bg-emerald-50 cursor-pointer flex items-center justify-between text-xs transition-colors"
                        >
                          <div>
                            <span className="font-bold text-neutral-900">{p.name}</span>
                            <div className="text-[10px] text-neutral-500 font-mono">
                              SKU: {p.sku} | Stock actual: {p.stock}
                            </div>
                          </div>
                          <div className="text-right font-mono">
                            <span className="text-[10px] text-neutral-500 block">
                              Costo actual: S/ {(p.purchasePrice || 0).toFixed(2)}
                            </span>
                            <span className="font-bold text-emerald-700">
                              Venta: S/ {(p.salePrice || 0).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Product Inputs: Current product info, Qty, Cost & Sale Price */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end pt-2 border-t border-neutral-200">
                <div className="sm:col-span-4">
                  <label className="block text-[10px] font-bold text-neutral-600 mb-1">
                    Producto Seleccionado:
                  </label>
                  <select
                    value={selectedProdId}
                    onChange={(e) => {
                      const prod = products.find((p) => p.id === e.target.value);
                      if (prod) handleSelectProduct(prod);
                    }}
                    className="w-full py-2 px-2.5 bg-neutral-50 border border-neutral-300 rounded-lg text-xs font-bold text-neutral-900 focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    {baseProducts.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.sku}) — Stock: {p.stock}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[10px] font-bold text-neutral-600">
                      Cantidad:
                    </label>
                    <span className="text-[9px] text-neutral-400 font-mono">
                      {currentSelectedProduct?.unit || 'ud'}
                    </span>
                  </div>
                  <input
                    type="number"
                    step="any"
                    min="0.01"
                    value={addQty || ''}
                    onChange={(e) => setAddQty(parseFloat(e.target.value) || 0)}
                    placeholder="10"
                    className="w-full py-2 px-2.5 bg-neutral-50 border border-neutral-300 rounded-lg text-xs font-bold text-neutral-900 text-center font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[10px] font-bold text-neutral-600">
                      Costo Unit. Factura:
                    </label>
                    <span className="text-[9px] text-neutral-400 font-mono">
                      Ant: S/ {prevPurchasePrice.toFixed(2)}
                    </span>
                  </div>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[11px] font-bold text-neutral-400">
                      S/
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={addCost}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        setAddCost(val);
                        if (val > prevPurchasePrice && !updateSalePrice) {
                          setUpdateSalePrice(true);
                        }
                      }}
                      className="w-full py-2 pl-7 pr-2.5 bg-neutral-50 border border-neutral-300 rounded-lg text-xs font-black text-neutral-900 font-mono focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[10px] font-bold text-neutral-700 flex items-center gap-1">
                      <Tag className="w-3 h-3 text-emerald-600" />
                      Precio Venta POS:
                    </label>
                    <span className="text-[9px] text-neutral-400 font-mono">
                      Actual: S/ {currentCatalogPrice.toFixed(2)}
                    </span>
                  </div>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[11px] font-bold text-neutral-400">
                      S/
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={addSalePrice}
                      onChange={(e) => {
                        setAddSalePrice(parseFloat(e.target.value) || 0);
                        setUpdateSalePrice(true);
                      }}
                      className={`w-full py-2 pl-7 pr-2.5 border rounded-lg text-xs font-black font-mono focus:outline-none transition-all ${
                        updateSalePrice
                          ? 'bg-emerald-50/50 border-emerald-500 text-emerald-950 ring-1 ring-emerald-500/30'
                          : 'bg-neutral-50 border-neutral-300 text-neutral-800'
                      }`}
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="w-full py-2 px-3 bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-neutral-950 rounded-lg font-black text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer active:scale-95"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ Agregar Ítem</span>
                  </button>
                </div>
              </div>

              {/* Sack / Fardo Converter Helper for Bulk Products */}
              {(currentSelectedProduct?.isBulk || currentSelectedProduct?.unit === 'kg') && (
                <div className="p-3 bg-cyan-50/60 rounded-xl border border-cyan-200 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-cyan-900 flex items-center gap-1.5 text-[11px]">
                      <Scale className="w-4 h-4 text-cyan-700" />
                      ¿Compraste por Saco / Fardo al proveedor? (Conversor automático a Kilos)
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowSackCalculator(!showSackCalculator)}
                      className="text-[11px] font-black text-cyan-800 hover:underline cursor-pointer"
                    >
                      {showSackCalculator ? 'Ocultar' : 'Abrir calculador de sacos'}
                    </button>
                  </div>

                  {showSackCalculator && (
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 pt-2 border-t border-cyan-200">
                      <div>
                        <label className="block text-[10px] font-bold text-cyan-900 mb-0.5">N° de Sacos:</label>
                        <input
                          type="number"
                          min="1"
                          value={sackCount}
                          onChange={(e) => setSackCount(parseInt(e.target.value) || 1)}
                          className="w-full py-1.5 px-2 bg-white border border-cyan-300 rounded-lg text-xs font-bold font-mono text-center"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-cyan-900 mb-0.5">Kg por saco:</label>
                        <input
                          type="number"
                          min="1"
                          value={sackWeightKg}
                          onChange={(e) => setSackWeightKg(parseFloat(e.target.value) || 50)}
                          className="w-full py-1.5 px-2 bg-white border border-cyan-300 rounded-lg text-xs font-bold font-mono text-center"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-cyan-900 mb-0.5">Costo x Saco (S/):</label>
                        <input
                          type="number"
                          step="0.5"
                          min="1"
                          value={sackCostTotal}
                          onChange={(e) => setSackCostTotal(parseFloat(e.target.value) || 0)}
                          className="w-full py-1.5 px-2 bg-white border border-cyan-300 rounded-lg text-xs font-black font-mono text-center"
                        />
                      </div>
                      <div className="flex items-end">
                        <button
                          type="button"
                          onClick={() => {
                            const totalKg = sackCount * sackWeightKg;
                            const costPerKg = totalKg > 0 ? Math.round(((sackCostTotal * sackCount) / totalKg) * 100) / 100 : 0;
                            setAddQty(totalKg);
                            setAddCost(costPerKg);
                            if (!updateSalePrice) setUpdateSalePrice(true);
                          }}
                          className="w-full py-1.5 px-2 bg-cyan-700 hover:bg-cyan-800 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors shadow-xs"
                        >
                          Aplicar ({sackCount * sackWeightKg} Kg)
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Dynamic Variation & Profit Margin Helper Bar */}
              <div className="p-2.5 bg-neutral-50 rounded-lg border border-neutral-200 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2 flex-wrap">
                  {isCostHigher ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-black px-2 py-0.5 rounded bg-rose-100 text-rose-900 border border-rose-300">
                      <ArrowUpRight className="w-3.5 h-3.5 text-rose-600" />
                      Costo subió +{costChangePercent.toFixed(1)}% (+S/ {costDiff.toFixed(2)})
                    </span>
                  ) : isCostLower ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-300">
                      <ArrowDownRight className="w-3.5 h-3.5 text-emerald-600" />
                      Costo bajó {costChangePercent.toFixed(1)}% (-S/ {Math.abs(costDiff).toFixed(2)})
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded bg-neutral-200 text-neutral-700">
                      Costo igual al anterior
                    </span>
                  )}

                  <span className="text-[11px] text-neutral-600">
                    Margen con precio actual:{' '}
                    <strong className={oldPriceMarginPercent < 20 ? 'text-rose-600' : 'text-neutral-800'}>
                      {oldPriceMarginPercent.toFixed(1)}%
                    </strong>
                  </span>
                </div>

                {/* Quick Presets */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-bold text-neutral-500 uppercase">
                    Margen Sugerido:
                  </span>
                  {[25, 30, 35, 40, 50].map((margin) => {
                    const calculated = Math.round(((addCost || 0) / (1 - margin / 100)) * 10) / 10;
                    return (
                      <button
                        key={margin}
                        type="button"
                        onClick={() => handleApplyQuickMargin(margin)}
                        className="py-0.5 px-2 rounded text-[10px] font-bold bg-white hover:bg-emerald-50 text-neutral-700 hover:text-emerald-700 border border-neutral-300 hover:border-emerald-400 transition-all cursor-pointer"
                      >
                        +{margin}% (S/ {calculated.toFixed(2)})
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* BATCH CONTROLS & TABLE OF ALL PURCHASE ITEMS */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2 px-1">
                <div className="text-xs font-bold text-neutral-700 flex items-center gap-2">
                  <span>Productos en la Factura ({items.length}):</span>
                  <span className="text-neutral-400 text-[11px]">
                    (Puedes modificar cantidades, costos y precios directamente en la tabla)
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {itemsWithCostIncrease > 0 && (
                    <button
                      type="button"
                      onClick={() => handleBulkApplyMargin(30)}
                      className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 px-2.5 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                      title="Aplica 30% de margen a todos los productos cuyo costo subió"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                      Ajustar Margen 30% a todos con alza
                    </button>
                  )}
                  {items.length > 0 && (
                    <button
                      type="button"
                      onClick={handleClearAllItems}
                      className="text-[11px] font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2 py-1 rounded-lg transition-colors cursor-pointer"
                    >
                      Vaciar lista
                    </button>
                  )}
                </div>
              </div>

              {/* Multi-item Table with Direct Inline Editing */}
              <div className="border border-neutral-300 rounded-xl overflow-hidden bg-white max-h-72 overflow-y-auto shadow-xs">
                {items.length === 0 ? (
                  <div className="p-8 text-center text-xs text-neutral-400 space-y-1">
                    <Package className="w-8 h-8 mx-auto text-neutral-300" />
                    <p className="font-bold text-neutral-700 text-sm">
                      Aún no has agregado productos a esta compra
                    </p>
                    <p className="text-[11px] text-neutral-500 max-w-md mx-auto">
                      Usa el buscador superior para agregar todos los productos que vienen en la factura de tu proveedor.
                    </p>
                  </div>
                ) : (
                  <table className="w-full text-left text-xs">
                    <thead className="bg-neutral-100 text-neutral-700 font-bold uppercase text-[10px] sticky top-0 z-10 border-b border-neutral-200">
                      <tr>
                        <th className="py-2.5 px-3">#</th>
                        <th className="py-2.5 px-3">Producto / SKU</th>
                        <th className="py-2.5 px-2 text-center text-emerald-800">Cantidad (Ingreso)</th>
                        <th className="py-2.5 px-3 text-center">Costo Unit. Factura</th>
                        <th className="py-2.5 px-3 text-center">Precio Venta POS</th>
                        <th className="py-2.5 px-2 text-center">Margen %</th>
                        <th className="py-2.5 px-3 text-right">Subtotal Compra</th>
                        <th className="py-2.5 px-2 text-center"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200">
                      {items.map((item, idx) => {
                        const sub = item.quantity * item.unitCost;
                        const hasCostChanged = Math.abs(item.unitCost - item.previousCost) > 0.001;
                        const isMoreExpensive = item.unitCost > item.previousCost;
                        const effectiveSalePrice = item.newSalePrice ?? item.previousSalePrice;
                        const itemMarginPercent =
                          effectiveSalePrice > 0
                            ? ((effectiveSalePrice - item.unitCost) / effectiveSalePrice) * 100
                            : 0;

                        return (
                          <tr key={idx} className="hover:bg-neutral-50/80 transition-colors">
                            <td className="py-2 px-3 text-neutral-400 font-mono text-[11px]">
                              {idx + 1}
                            </td>

                            {/* Product Name & SKU */}
                            <td className="py-2 px-3 font-semibold text-neutral-900">
                              <div className="line-clamp-1">{item.productName}</div>
                              <span className="text-neutral-500 font-mono text-[10px]">{item.sku}</span>
                            </td>

                            {/* Editable Quantity */}
                            <td className="py-2 px-2 text-center">
                              <div className="flex items-center justify-center">
                                <input
                                  type="number"
                                  min="1"
                                  value={item.quantity}
                                  onChange={(e) =>
                                    handleUpdateItemQuantity(idx, parseInt(e.target.value) || 1)
                                  }
                                  className="w-16 py-1 px-1.5 bg-emerald-50/60 border border-emerald-300 font-mono font-black text-xs text-emerald-900 text-center rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                />
                              </div>
                            </td>

                            {/* Editable Unit Cost */}
                            <td className="py-2 px-3 text-center">
                              <div className="flex flex-col items-center">
                                <div className="relative w-24">
                                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-neutral-400">
                                    S/
                                  </span>
                                  <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={item.unitCost}
                                    onChange={(e) =>
                                      handleUpdateItemUnitCost(idx, parseFloat(e.target.value) || 0)
                                    }
                                    className="w-full py-1 pl-6 pr-1.5 bg-white border border-neutral-300 font-mono font-bold text-xs text-neutral-900 text-right rounded-lg focus:outline-none focus:border-emerald-500"
                                  />
                                </div>
                                {hasCostChanged && (
                                  <span
                                    className={`text-[9px] font-bold mt-0.5 ${
                                      isMoreExpensive ? 'text-rose-600' : 'text-emerald-600'
                                    }`}
                                  >
                                    {isMoreExpensive ? '▲ Subió' : '▼ Bajó'} (Ant: S/{item.previousCost.toFixed(2)})
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* Editable Sale Price */}
                            <td className="py-2 px-3 text-center">
                              <div className="flex flex-col items-center">
                                <div className="relative w-24">
                                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-neutral-400">
                                    S/
                                  </span>
                                  <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={
                                      typeof item.newSalePrice === 'number'
                                        ? item.newSalePrice
                                        : (item.previousSalePrice ?? '')
                                    }
                                    onChange={(e) =>
                                      handleUpdateItemSalePrice(idx, parseFloat(e.target.value) || 0)
                                    }
                                    className={`w-full py-1 pl-6 pr-1.5 border font-mono font-black text-xs text-right rounded-lg focus:outline-none ${
                                      item.newSalePrice
                                        ? 'bg-emerald-100/50 border-emerald-500 text-emerald-950'
                                        : 'bg-white border-neutral-300 text-neutral-800'
                                    }`}
                                  />
                                </div>
                                {item.newSalePrice ? (
                                  <span className="text-[9px] text-emerald-700 font-bold mt-0.5">
                                    Nuevo precio en POS
                                  </span>
                                ) : (
                                  <span className="text-[9px] text-neutral-400 mt-0.5">
                                    Precio sin cambio
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* Profit Margin Badge & Quick Preset */}
                            <td className="py-2 px-2 text-center font-mono">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-black ${
                                  itemMarginPercent >= 30
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : itemMarginPercent >= 15
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-rose-100 text-rose-800'
                                }`}
                              >
                                {itemMarginPercent.toFixed(1)}%
                              </span>
                            </td>

                            {/* Subtotal */}
                            <td className="py-2 px-3 text-right font-black text-neutral-950 font-mono">
                              S/ {sub.toFixed(2)}
                            </td>

                            {/* Remove Item */}
                            <td className="py-2 px-2 text-center">
                              <button
                                type="button"
                                onClick={() => handleRemoveItem(idx)}
                                className="text-neutral-400 hover:text-rose-600 cursor-pointer p-1 transition-colors"
                                title="Eliminar producto de la lista"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>

          {/* SECTION 4: CONDICIÓN DE PAGO & CRÉDITO */}
          <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200 space-y-3">
            <label className="text-xs font-black text-neutral-800 uppercase tracking-wider flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-emerald-600" />
              4. Condición y Estado de Pago de la Factura
            </label>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  setPaymentStatus('pagado');
                  setPartialAmountPaid(purchaseTotal);
                }}
                className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                  paymentStatus === 'pagado'
                    ? 'bg-emerald-500 text-neutral-950 border-emerald-600 font-black shadow-sm'
                    : 'bg-white text-neutral-700 border-neutral-300 font-bold hover:bg-neutral-100'
                }`}
              >
                <div className="text-xs flex items-center justify-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  <span>Pagado al Contado</span>
                </div>
                <div className="text-[10px] opacity-80 mt-0.5">Cancelado 100%</div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setPaymentStatus('credito');
                  setPartialAmountPaid(0);
                }}
                className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                  paymentStatus === 'credito'
                    ? 'bg-rose-500 text-white border-rose-600 font-black shadow-sm'
                    : 'bg-white text-neutral-700 border-neutral-300 font-bold hover:bg-neutral-100'
                }`}
              >
                <div className="text-xs flex items-center justify-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>A Crédito (Pendiente)</span>
                </div>
                <div className="text-[10px] opacity-80 mt-0.5">Por pagar al proveedor</div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setPaymentStatus('parcial');
                  if (partialAmountPaid === 0 && purchaseTotal > 0) {
                    setPartialAmountPaid(Math.round((purchaseTotal / 2) * 100) / 100);
                  }
                }}
                className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                  paymentStatus === 'parcial'
                    ? 'bg-amber-400 text-neutral-950 border-amber-500 font-black shadow-sm'
                    : 'bg-white text-neutral-700 border-neutral-300 font-bold hover:bg-neutral-100'
                }`}
              >
                <div className="text-xs flex items-center justify-center gap-1">
                  <Receipt className="w-3.5 h-3.5" />
                  <span>Pago Parcial / Abono</span>
                </div>
                <div className="text-[10px] opacity-80 mt-0.5">Adelanto + Saldo</div>
              </button>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-neutral-300 space-y-3">
              {paymentStatus === 'pagado' && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-neutral-700">Medio de Pago:</span>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value as any)}
                      className="py-1.5 px-3 bg-neutral-50 border border-neutral-300 rounded-lg text-xs font-bold text-neutral-900 focus:outline-none focus:border-emerald-500 cursor-pointer"
                    >
                      <option value="cash">Efectivo</option>
                      <option value="transfer">Transferencia Bancaria (BCP/BBVA/Interbank)</option>
                      <option value="wallet">Yape / Plin</option>
                      <option value="card">Tarjeta de Débito/Crédito</option>
                    </select>
                  </div>

                  <div className="text-right">
                    <span className="text-neutral-500 text-[11px] block">Monto total cancelado:</span>
                    <span className="font-black text-emerald-600 font-mono text-sm">
                      S/ {purchaseTotal.toFixed(2)} (100% Pagado)
                    </span>
                  </div>
                </div>
              )}

              {paymentStatus === 'credito' && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-neutral-700 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-rose-600" />
                      Fecha Límite / Vencimiento del Crédito:
                    </span>
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="py-1.5 px-2.5 bg-neutral-50 border border-neutral-300 rounded-lg text-xs font-mono font-bold text-neutral-900 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="text-right">
                    <span className="text-rose-600 text-[11px] block font-bold">Saldo total por pagar:</span>
                    <span className="font-black text-rose-600 font-mono text-sm">
                      S/ {purchaseTotal.toFixed(2)}
                    </span>
                  </div>
                </div>
              )}

              {paymentStatus === 'parcial' && (
                <div className="space-y-3 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                        Monto Abonado Hoy (S/):
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max={purchaseTotal}
                        value={partialAmountPaid || ''}
                        onChange={(e) => setPartialAmountPaid(parseFloat(e.target.value) || 0)}
                        className="w-full py-2 px-3 bg-neutral-50 border border-neutral-300 rounded-lg text-xs font-black text-neutral-900 font-mono focus:outline-none focus:border-emerald-500"
                        placeholder="0.00"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                        Medio de Pago del Abono:
                      </label>
                      <select
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value as any)}
                        className="w-full py-2 px-3 bg-neutral-50 border border-neutral-300 rounded-lg text-xs font-bold text-neutral-900 focus:outline-none focus:border-emerald-500 cursor-pointer"
                      >
                        <option value="cash">Efectivo</option>
                        <option value="transfer">Transferencia Bancaria</option>
                        <option value="wallet">Yape / Plin</option>
                        <option value="card">Tarjeta</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-neutral-200">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-neutral-700">Vencimiento del Saldo Restante:</span>
                      <input
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        className="py-1 px-2.5 bg-neutral-50 border border-neutral-300 rounded-lg text-xs font-mono font-bold text-neutral-900"
                      />
                    </div>

                    <div className="text-right">
                      <span className="text-neutral-500 text-[11px]">Saldo Pendiente por Liquidar: </span>
                      <span className="font-black text-amber-600 font-mono text-sm">
                        S/ {finalPendingAmount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* SECTION 5: NOTAS */}
          <div>
            <label className="block text-[11px] font-bold text-neutral-700 mb-1">
              Observaciones / Notas Adicionales (Opcional):
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej. Mercadería recibida completa según guía de remisión. Revisado en almacén."
              className="w-full py-2 px-3 bg-neutral-50 border border-neutral-300 rounded-xl text-xs text-neutral-900 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* FINANCIAL & INVENTORY SUMMARY PANEL */}
          <div className="bg-neutral-900 text-white p-4 sm:p-5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider block">
                Resumen de la Orden de Compra
              </span>
              <div className="flex flex-wrap items-center gap-3 text-xs mt-1.5">
                <span className="text-neutral-300">
                  Ítems: <strong>{totalItemsCount} productos ({totalUnitsCount} uds)</strong>
                </span>
                <span className="text-neutral-600">|</span>
                <span className="text-emerald-400">
                  Abonado: <strong>S/ {finalPaidAmount.toFixed(2)}</strong>
                </span>
                <span className="text-neutral-600">|</span>
                <span className={finalPendingAmount > 0 ? 'text-amber-300 font-bold' : 'text-neutral-400'}>
                  Saldo Pendiente: <strong>S/ {finalPendingAmount.toFixed(2)}</strong>
                </span>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-[10px] uppercase font-bold text-neutral-400 block tracking-wider">
                TOTAL DE LA FACTURA
              </span>
              <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono tracking-tight">
                S/ {purchaseTotal.toFixed(2)}
              </div>
            </div>
          </div>

          {/* FOOTER ACTIONS */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-neutral-200">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 bg-neutral-100 hover:bg-neutral-200 active:bg-neutral-300 text-neutral-800 rounded-xl font-bold text-xs transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={items.length === 0}
              className={`py-2.5 px-5 rounded-xl font-black text-xs flex items-center gap-2 transition-all cursor-pointer active:scale-[0.99] ${
                items.length === 0
                  ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed shadow-none'
                  : 'bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-neutral-950 shadow-lg shadow-emerald-500/20'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>Guardar Compra de {totalItemsCount} Producto(s) en Inventario</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
