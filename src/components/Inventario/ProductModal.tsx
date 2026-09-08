import React, { useState, useMemo } from 'react';
import { Product, Category, ComboComponent, ProductVariant } from '../../types';
import { usePos } from '../../context/PosContext';
import { X, Check, Package, Layers, Plus, Trash2, Gift, Sparkles, AlertCircle, Scale, Shirt, Pill, Tag } from 'lucide-react';
import { getEffectiveStock } from '../../utils/comboUtils';

interface ProductModalProps {
  product?: Product | null;
  categories: Category[];
  allProducts?: Product[];
  onSave: (productData: any) => void;
  onClose: () => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  product,
  categories,
  allProducts = [],
  onSave,
  onClose,
}) => {
  const { sectorConfig } = usePos();

  const [productType, setProductType] = useState<'standard' | 'combo'>(product?.type || 'standard');
  const [sku, setSku] = useState(
    product?.sku || (productType === 'combo' ? `PACK-${Math.floor(100 + Math.random() * 900)}` : `SKU-${Math.floor(1000 + Math.random() * 9000)}`)
  );
  const [name, setName] = useState(product?.name || '');
  const [categoryId, setCategoryId] = useState(product?.categoryId || categories?.[0]?.id || '');
  const [purchasePrice, setPurchasePrice] = useState<number | ''>(product?.purchasePrice ?? '');
  const [salePrice, setSalePrice] = useState<number | ''>(product?.salePrice ?? '');
  const [stock, setStock] = useState<number | ''>(product?.stock ?? 10);
  const [minStock, setMinStock] = useState<number | ''>(product?.minStock ?? 5);
  const [unit, setUnit] = useState(
    product?.unit || (productType === 'combo' ? 'pack' : (sectorConfig.features.enableBulkSales ? 'kg' : 'unidad'))
  );

  // Bulk (Granel / Balanza) state
  const [isBulk, setIsBulk] = useState<boolean>(product?.isBulk || false);
  const [packageKg, setPackageKg] = useState<number | ''>(product?.packageKg ?? 50);

  // Variant specific state (Tallas, Colores, Calzado)
  const [hasVariants, setHasVariants] = useState<boolean>(product?.hasVariants || false);
  const [variants, setVariants] = useState<ProductVariant[]>(product?.variants || []);
  const [newVariantName, setNewVariantName] = useState<string>('');
  const [newVariantStock, setNewVariantStock] = useState<number>(10);

  const addPresetVariants = (presetType: 'apparel' | 'shoes' | 'colors') => {
    let presetList: string[] = [];
    if (presetType === 'apparel') {
      presetList = ['Talla S', 'Talla M', 'Talla L', 'Talla XL'];
    } else if (presetType === 'shoes') {
      presetList = ['Talla 37', 'Talla 38', 'Talla 39', 'Talla 40', 'Talla 41', 'Talla 42'];
    } else if (presetType === 'colors') {
      presetList = ['Negro', 'Blanco', 'Rojo', 'Azul', 'Verde'];
    }

    setHasVariants(true);
    setVariants((prev) => {
      const existingNames = new Set(prev.map((v) => v.name.toLowerCase()));
      const newItems: ProductVariant[] = presetList
        .filter((name) => !existingNames.has(name.toLowerCase()))
        .map((name, idx) => ({
          id: `var-${Date.now()}-${idx}`,
          name,
          stock: 10,
          sku: sku ? `${sku}-${name.replace(/\s+/g, '').toUpperCase()}` : undefined,
        }));
      return [...prev, ...newItems];
    });
  };

  const handleAddCustomVariant = () => {
    if (!newVariantName.trim()) return;
    setHasVariants(true);
    const newVar: ProductVariant = {
      id: `var-${Date.now()}`,
      name: newVariantName.trim(),
      stock: Number(newVariantStock) || 0,
      sku: sku ? `${sku}-${newVariantName.trim().replace(/\s+/g, '').toUpperCase()}` : undefined,
    };
    setVariants((prev) => [...prev, newVar]);
    setNewVariantName('');
    setNewVariantStock(10);
  };

  const handleRemoveVariant = (variantId: string) => {
    const updated = variants.filter((v) => v.id !== variantId);
    setVariants(updated);
    if (updated.length === 0) {
      setHasVariants(false);
    }
  };

  const handleUpdateVariant = (variantId: string, fields: Partial<ProductVariant>) => {
    setVariants((prev) =>
      prev.map((v) => (v.id === variantId ? { ...v, ...fields } : v))
    );
  };

  // Combo specific state
  const [comboItems, setComboItems] = useState<ComboComponent[]>(
    product?.comboItems || []
  );
  const [selectedCompId, setSelectedCompId] = useState<string>('');
  const [selectedCompQty, setSelectedCompQty] = useState<number>(1);

  // Filter available standard products to add as components
  const availableStandards = useMemo(() => {
    return allProducts.filter((p) => p.type !== 'combo' && (!product || p.id !== product.id));
  }, [allProducts, product]);

  // Calculations for combo
  const comboMetrics = useMemo(() => {
    let regularSum = 0;
    let costSum = 0;
    const itemsDetails = comboItems.map((ci) => {
      const p = allProducts.find((item) => item.id === ci.productId);
      const subtotal = p ? p.salePrice * ci.quantity : 0;
      const costSubtotal = p ? p.purchasePrice * ci.quantity : 0;
      regularSum += subtotal;
      costSum += costSubtotal;
      return {
        ...ci,
        product: p,
        unitPrice: p?.salePrice || 0,
        subtotal,
        costSubtotal,
        currentStock: p ? p.stock : 0,
      };
    });

    const calculatedStock = getEffectiveStock({ type: 'combo', comboItems } as Product, allProducts);
    const regularTotal = regularSum;
    const currentPrice = typeof salePrice === 'number' ? salePrice : 0;
    const savings = regularTotal > currentPrice && currentPrice > 0 ? regularTotal - currentPrice : 0;
    const savingsPercent = regularTotal > 0 && savings > 0 ? Math.round((savings / regularTotal) * 100) : 0;

    return {
      itemsDetails,
      regularSum,
      costSum,
      calculatedStock,
      savings,
      savingsPercent,
    };
  }, [comboItems, allProducts, salePrice]);

  const handleAddComboItem = () => {
    if (!selectedCompId || selectedCompQty <= 0) return;
    const existingIndex = comboItems.findIndex((ci) => ci.productId === selectedCompId);
    if (existingIndex !== -1) {
      const updated = [...comboItems];
      updated[existingIndex].quantity += selectedCompQty;
      setComboItems(updated);
    } else {
      setComboItems([...comboItems, { productId: selectedCompId, quantity: selectedCompQty }]);
    }
    setSelectedCompId('');
    setSelectedCompQty(1);
  };

  const handleRemoveComboItem = (productId: string) => {
    setComboItems(comboItems.filter((ci) => ci.productId !== productId));
  };

  const handleUpdateComboItemQty = (productId: string, qty: number) => {
    if (qty <= 0) {
      handleRemoveComboItem(productId);
      return;
    }
    setComboItems(
      comboItems.map((ci) => (ci.productId === productId ? { ...ci, quantity: qty } : ci))
    );
  };

  const applySuggestedComboCosts = () => {
    if (comboMetrics.costSum > 0) {
      setPurchasePrice(Math.round(comboMetrics.costSum * 100) / 100);
    }
    if (comboMetrics.regularSum > 0 && (!salePrice || salePrice === '')) {
      const suggestedOffer = Math.round(comboMetrics.regularSum * 0.85 * 10) / 10;
      setSalePrice(suggestedOffer);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) return alert('Por favor ingresa el nombre del producto.');
    if (!sku.trim()) return alert('Por favor ingresa un SKU o código.');
    if (purchasePrice === '' || purchasePrice < 0) return alert('Por favor ingresa un costo de compra válido.');
    if (salePrice === '' || salePrice <= 0) return alert('Por favor ingresa un precio de venta mayor a cero.');

    if (productType === 'combo' && comboItems.length === 0) {
      return alert('Debes agregar al menos un producto componente al combo.');
    }

    const calculatedTotalStock =
      productType === 'combo'
        ? comboMetrics.calculatedStock
        : hasVariants && variants.length > 0
        ? variants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0)
        : Number(stock) || 0;

    onSave({
      ...(product ? { id: product.id } : {}),
      sku: sku.trim(),
      name: name.trim(),
      categoryId,
      purchasePrice: Number(purchasePrice),
      salePrice: Number(salePrice),
      stock: calculatedTotalStock,
      minStock: Number(minStock) || 0,
      unit: unit.trim() || (productType === 'combo' ? 'pack' : 'unidad'),
      isBulk: productType === 'standard' ? isBulk : false,
      packageKg: productType === 'standard' && isBulk && packageKg !== '' ? Number(packageKg) : undefined,
      type: productType,
      comboItems: productType === 'combo' ? comboItems : undefined,
      hasVariants: productType === 'standard' ? (hasVariants && variants.length > 0) : false,
      variants: productType === 'standard' && hasVariants && variants.length > 0 ? variants : undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden my-8 border border-neutral-800">
        {/* Modal Header */}
        <div className="bg-neutral-900 text-white p-5 flex items-center justify-between border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold ${
              productType === 'combo' ? 'bg-amber-400 text-neutral-950' : 'bg-white text-black'
            }`}>
              {productType === 'combo' ? <Gift className="w-5 h-5" /> : <Package className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-base font-black uppercase tracking-tight flex items-center gap-2">
                {product ? (productType === 'combo' ? 'Editar Combo / Pack' : 'Editar Producto') : (productType === 'combo' ? 'Nuevo Combo Promocional' : 'Nuevo Producto en Inventario')}
                {productType === 'combo' && (
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-400 text-neutral-950">
                    Packs & Ofertas
                  </span>
                )}
              </h2>
              <p className="text-xs text-neutral-400">
                {productType === 'combo'
                  ? 'Paquete con explosión automática de inventario por componentes'
                  : `Configurado para el rubro: ${sectorConfig.name}`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Product Type Switcher */}
        {sectorConfig.features.enableCombos && (
          <div className="p-3 bg-neutral-100 border-b border-neutral-200 flex gap-2">
            <button
              type="button"
              onClick={() => {
                setProductType('standard');
                if (!product) setUnit(sectorConfig.features.enableBulkSales ? 'kg' : 'unidad');
              }}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                productType === 'standard'
                  ? 'bg-white text-neutral-900 shadow-xs border border-neutral-300'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Producto Estándar</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setProductType('combo');
                if (!product) {
                  setUnit('pack');
                  if (sku.startsWith('SKU-')) setSku(`PACK-${Math.floor(100 + Math.random() * 900)}`);
                }
              }}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                productType === 'combo'
                  ? 'bg-amber-400 text-neutral-950 shadow-xs border border-amber-500'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <Gift className="w-4 h-4" />
              <span>Combo / Pack Promocional</span>
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                {productType === 'combo' ? 'Código de Pack' : 'SKU / Código'}
              </label>
              <input
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder={productType === 'combo' ? 'PACK-101' : 'SKU-1001'}
                className="w-full py-2 px-3 bg-neutral-50 border border-neutral-300 rounded-xl text-xs font-medium text-neutral-900 focus:outline-none focus:border-black focus:ring-1 focus:ring-black font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                Categoría
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full py-2 px-3 bg-neutral-50 border border-neutral-300 rounded-xl text-xs font-medium text-neutral-900 focus:outline-none focus:border-black"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
              {productType === 'combo' ? 'Nombre del Combo / Oferta' : 'Nombre del Producto'}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={
                productType === 'combo'
                  ? 'Ej. Pack Desayuno: Leche + Galletas + Azúcar'
                  : sectorConfig.features.enableApparelVariants
                  ? 'Ej. Polo Pima Cuello Redondo - Talla M (Negro)'
                  : sectorConfig.features.enablePharmaExpiry
                  ? 'Ej. Paracetamol 500mg Caja x 100 Tabletas'
                  : 'Ej. Arroz Extra Superior (a Granel)'
              }
              className="w-full py-2 px-3 bg-neutral-50 border border-neutral-300 rounded-xl text-xs font-medium text-neutral-900 focus:outline-none focus:border-black focus:ring-1 focus:ring-black"
              required
            />
          </div>

          {/* VARIANTES (TALLAS, COLORES, CALZADO) FOR STANDARD PRODUCTS */}
          {productType === 'standard' && (
            <div className="p-3.5 bg-neutral-50 rounded-2xl border border-neutral-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shirt className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-black uppercase tracking-wider text-neutral-900">
                    Variantes del Producto (Tallas, Calzado, Colores)
                  </span>
                </div>
                {variants.length > 0 && (
                  <span className="text-[10px] font-black bg-emerald-100 text-emerald-900 border border-emerald-300 px-2 py-0.5 rounded-full">
                    {variants.length} variantes
                  </span>
                )}
              </div>

              {/* 1-Tap Preset Quick Buttons for Mobile & Tablet */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-neutral-600 block">
                  Generadores rápidos de 1-clic para emprendedores:
                </span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    type="button"
                    onClick={() => addPresetVariants('apparel')}
                    className="px-2.5 py-1.5 bg-white hover:bg-neutral-200 border border-neutral-300 text-neutral-900 rounded-xl text-xs font-bold flex items-center gap-1 active:scale-95 transition-all cursor-pointer shadow-xs"
                  >
                    <span>👕</span>
                    <span>+ Tallas Ropa (S, M, L, XL)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => addPresetVariants('shoes')}
                    className="px-2.5 py-1.5 bg-white hover:bg-neutral-200 border border-neutral-300 text-neutral-900 rounded-xl text-xs font-bold flex items-center gap-1 active:scale-95 transition-all cursor-pointer shadow-xs"
                  >
                    <span>👟</span>
                    <span>+ Calzado (37 a 42)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => addPresetVariants('colors')}
                    className="px-2.5 py-1.5 bg-white hover:bg-neutral-200 border border-neutral-300 text-neutral-900 rounded-xl text-xs font-bold flex items-center gap-1 active:scale-95 transition-all cursor-pointer shadow-xs"
                  >
                    <span>🎨</span>
                    <span>+ Colores</span>
                  </button>
                </div>
              </div>

              {/* Manual Custom Variant Adder Input */}
              <div className="flex items-center gap-2 pt-2 border-t border-neutral-200">
                <input
                  type="text"
                  value={newVariantName}
                  onChange={(e) => setNewVariantName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCustomVariant();
                    }
                  }}
                  placeholder="Ej. Talla XL, Rojo / M, 43..."
                  className="flex-1 py-1.5 px-2.5 bg-white border border-neutral-300 rounded-xl text-xs font-bold text-neutral-900 focus:outline-none focus:border-black"
                />
                <input
                  type="number"
                  min="0"
                  value={newVariantStock}
                  onChange={(e) => setNewVariantStock(parseInt(e.target.value) || 0)}
                  placeholder="Stock"
                  className="w-16 py-1.5 px-2 bg-white border border-neutral-300 rounded-xl text-xs font-black font-mono text-center focus:outline-none focus:border-black"
                  title="Stock inicial de esta variante"
                />
                <button
                  type="button"
                  onClick={handleAddCustomVariant}
                  className="py-1.5 px-3 bg-neutral-950 hover:bg-black text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer shrink-0 active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Agregar</span>
                </button>
              </div>

              {/* List of Added Variants */}
              {variants.length > 0 && (
                <div className="space-y-1.5 pt-2 border-t border-neutral-200 max-h-48 overflow-y-auto pr-1">
                  {variants.map((v) => (
                    <div
                      key={v.id}
                      className="p-2 bg-white rounded-xl border border-neutral-300 flex items-center justify-between gap-2 shadow-xs"
                    >
                      <div className="flex-1 min-w-0 flex items-center gap-2">
                        <span className="font-bold text-xs text-neutral-900 truncate min-w-[80px]">
                          {v.name}
                        </span>
                        <input
                          type="text"
                          value={v.sku || ''}
                          onChange={(e) => handleUpdateVariant(v.id, { sku: e.target.value })}
                          placeholder="SKU variante"
                          className="w-24 py-1 px-2 bg-neutral-50 border border-neutral-200 rounded-lg text-[10px] font-mono text-neutral-700"
                        />
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <div className="flex items-center gap-1 text-[11px] font-bold text-neutral-600">
                          <span>Stock:</span>
                          <input
                            type="number"
                            min="0"
                            value={v.stock ?? 0}
                            onChange={(e) =>
                              handleUpdateVariant(v.id, { stock: parseInt(e.target.value) || 0 })
                            }
                            className="w-14 py-1 px-1 bg-neutral-50 border border-neutral-300 rounded-lg text-xs font-black font-mono text-center text-neutral-950"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveVariant(v.id)}
                          className="p-1 text-neutral-400 hover:text-rose-600 hover:bg-neutral-100 rounded-lg cursor-pointer"
                          title="Eliminar variante"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}

                  <div className="p-2 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between text-xs text-emerald-950 font-bold">
                    <span>Stock Total Sumado de Variantes:</span>
                    <span className="font-mono text-sm font-black">
                      {variants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0)} unidades
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* BULK / GRANEL TOGGLE FOR STANDARD PRODUCTS - only if sector enables bulk */}
          {productType === 'standard' && sectorConfig.features.enableBulkSales && (
            <div
              className={`p-3.5 rounded-2xl border transition-all ${
                isBulk
                  ? 'bg-cyan-50/80 border-cyan-300 text-cyan-950 shadow-xs'
                  : 'bg-neutral-50 border-neutral-200 text-neutral-800'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <label className="flex items-start gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isBulk}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setIsBulk(checked);
                      if (checked && unit === 'unidad') {
                        setUnit('kg');
                      }
                    }}
                    className="w-4 h-4 mt-0.5 rounded text-cyan-600 focus:ring-cyan-500 cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-black uppercase tracking-wider block text-neutral-900 flex items-center gap-1.5">
                      <Scale className="w-3.5 h-3.5 text-cyan-700" />
                      Venta a Granel / Balanza (Fraccionable por Kilos y Soles)
                    </span>
                    <span className="text-[11px] text-neutral-500 block leading-tight mt-0.5">
                      Permite vender en caja tanto por peso (ej. 250g, 1/2 kg) como por dinero en Soles (ej. "3 soles de arroz").
                    </span>
                  </div>
                </label>
                {isBulk && (
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-cyan-200 text-cyan-950 shrink-0">
                    Granel Activo
                  </span>
                )}
              </div>

              {isBulk && (
                <div className="mt-3 pt-2.5 border-t border-cyan-200 grid grid-cols-2 gap-3 items-center">
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                      Unidad de Medida Base:
                    </label>
                    <select
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                      className="w-full py-1.5 px-2.5 bg-white border border-cyan-300 rounded-xl text-xs font-bold text-neutral-900 cursor-pointer"
                    >
                      <option value="kg">Kilogramo (kg)</option>
                      <option value="g">Gramo (g)</option>
                      <option value="lt">Litro (lt)</option>
                      <option value="unidad">Unidad / Pieza</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                      Presentación Mayorista (Saco/Bulto):
                    </label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min="1"
                        value={packageKg}
                        onChange={(e) => setPackageKg(parseFloat(e.target.value) || '')}
                        placeholder="50"
                        className="w-full py-1.5 px-2 bg-white border border-cyan-300 rounded-xl text-xs font-bold font-mono text-neutral-900 text-center"
                      />
                      <span className="text-xs font-bold text-neutral-500 shrink-0">kg/saco</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* COMBO BUILDER SECTION */}
          {productType === 'combo' && (
            <div className="bg-amber-50/60 border border-amber-200 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span className="text-xs font-black uppercase text-amber-900 tracking-wider">
                    Componentes del Pack (Explosión de Inventario)
                  </span>
                </div>
                {comboItems.length > 0 && (
                  <button
                    type="button"
                    onClick={applySuggestedComboCosts}
                    className="text-[11px] text-amber-800 font-bold hover:underline cursor-pointer"
                  >
                    Calcular precios sugeridos
                  </button>
                )}
              </div>

              {/* Add item control */}
              <div className="flex items-center gap-2">
                <select
                  value={selectedCompId}
                  onChange={(e) => setSelectedCompId(e.target.value)}
                  className="flex-1 py-1.5 px-2.5 bg-white border border-amber-300 rounded-xl text-xs font-medium text-neutral-900 focus:outline-none"
                >
                  <option value="">-- Seleccionar producto para agregar al combo --</option>
                  {availableStandards.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Stock: {p.stock} | Precio: S/ {p.salePrice.toFixed(2)})
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={selectedCompQty}
                  onChange={(e) => setSelectedCompQty(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-16 py-1.5 px-2 bg-white border border-amber-300 rounded-xl text-xs font-bold text-center text-neutral-900"
                  title="Cantidad de unidades en este combo"
                />
                <button
                  type="button"
                  onClick={handleAddComboItem}
                  disabled={!selectedCompId}
                  className="py-1.5 px-3 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-neutral-950 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Agregar</span>
                </button>
              </div>

              {/* List of included items */}
              {comboItems.length === 0 ? (
                <div className="py-3 px-3 bg-white/70 border border-dashed border-amber-300 rounded-xl text-center text-xs text-amber-800">
                  Aún no has agregado productos a este combo. Selecciona uno arriba.
                </div>
              ) : (
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {comboMetrics.itemsDetails.map((item) => (
                    <div
                      key={item.productId}
                      className="flex items-center justify-between p-2 bg-white rounded-xl border border-amber-200 text-xs"
                    >
                      <div className="flex-1 min-w-0 pr-2">
                        <span className="font-bold text-neutral-900 truncate block">
                          {item.product?.name || 'Producto no encontrado'}
                        </span>
                        <div className="flex items-center gap-2 text-[11px] text-neutral-500">
                          <span>Unit: S/ {item.unitPrice.toFixed(2)}</span>
                          <span>•</span>
                          <span className={`${item.currentStock < item.quantity ? 'text-rose-600 font-bold' : ''}`}>
                            Stock inv: {item.currentStock}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[11px] font-mono font-bold text-amber-900">
                          S/ {item.subtotal.toFixed(2)}
                        </span>
                        <div className="flex items-center border border-neutral-200 rounded-lg overflow-hidden">
                          <button
                            type="button"
                            onClick={() => handleUpdateComboItemQty(item.productId, item.quantity - 1)}
                            className="px-2 py-0.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold"
                          >
                            -
                          </button>
                          <span className="px-2 py-0.5 text-xs font-mono font-bold bg-white min-w-[24px] text-center">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleUpdateComboItemQty(item.productId, item.quantity + 1)}
                            className="px-2 py-0.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold"
                          >
                            +
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveComboItem(item.productId)}
                          className="p-1 text-neutral-400 hover:text-rose-600 rounded transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Summary / Calculation info */}
              {comboItems.length > 0 && (
                <div className="pt-2 border-t border-amber-200 text-xs space-y-1">
                  <div className="flex justify-between text-neutral-600">
                    <span>Suma individual regular:</span>
                    <span className="font-mono font-bold text-neutral-900">
                      S/ {comboMetrics.regularSum.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-neutral-600">
                    <span>Costo acumulado de compra:</span>
                    <span className="font-mono font-bold text-neutral-700">
                      S/ {comboMetrics.costSum.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-amber-900 font-bold">
                    <span>Packs posibles armables con stock actual:</span>
                    <span className="font-mono bg-amber-200 text-amber-950 px-2 py-0.5 rounded-full text-xs">
                      {comboMetrics.calculatedStock} packs
                    </span>
                  </div>
                  {comboMetrics.savings > 0 && (
                    <div className="flex justify-between text-emerald-700 font-bold pt-1">
                      <span>Ahorro Promocional para el Cliente:</span>
                      <span className="font-mono bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">
                        -S/ {comboMetrics.savings.toFixed(2)} ({comboMetrics.savingsPercent}%)
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Pricing inputs */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                {productType === 'combo' ? 'Costo Base Combo (S/)' : 'Precio de Compra (S/)'}
              </label>
              <input
                type="number"
                step="0.10"
                min="0"
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(parseFloat(e.target.value) || '')}
                placeholder="0.00"
                className="w-full py-2 px-3 bg-neutral-50 border border-neutral-300 rounded-xl text-xs font-bold text-neutral-900 font-mono focus:outline-none focus:border-black"
                required
              />
              {productType === 'combo' && comboMetrics.costSum > 0 && (
                <p className="text-[10px] text-neutral-500 mt-1">
                  Suma componentes: S/ {comboMetrics.costSum.toFixed(2)}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                {productType === 'combo' ? 'Precio Oferta Pack (S/)' : 'Precio de Venta (S/)'}
              </label>
              <input
                type="number"
                step="0.10"
                min="0"
                value={salePrice}
                onChange={(e) => setSalePrice(parseFloat(e.target.value) || '')}
                placeholder="0.00"
                className={`w-full py-2 px-3 rounded-xl text-xs font-bold font-mono focus:outline-none ${
                  productType === 'combo'
                    ? 'bg-amber-50 border border-amber-400 text-neutral-950 ring-1 ring-amber-300'
                    : 'bg-neutral-50 border border-neutral-300 text-black focus:border-black'
                }`}
                required
              />
              {productType === 'combo' && comboMetrics.regularSum > 0 && (
                <p className="text-[10px] text-neutral-500 mt-1">
                  Precio regular individual: S/ {comboMetrics.regularSum.toFixed(2)}
                </p>
              )}
            </div>
          </div>

          {/* Stock details */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                {productType === 'combo' ? 'Stock Dinámico' : 'Stock Actual'}
              </label>
              <input
                type="number"
                min="0"
                value={productType === 'combo' ? comboMetrics.calculatedStock : stock}
                onChange={(e) => setStock(parseInt(e.target.value) || 0)}
                disabled={productType === 'combo'}
                placeholder="10"
                className={`w-full py-2 px-3 border rounded-xl text-xs font-bold font-mono focus:outline-none ${
                  productType === 'combo'
                    ? 'bg-neutral-100 text-neutral-600 border-neutral-200 cursor-not-allowed'
                    : 'bg-neutral-50 border-neutral-300 text-neutral-900 focus:border-black'
                }`}
              />
              {productType === 'combo' && (
                <p className="text-[9px] text-neutral-500 mt-0.5">Calculado por componentes</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                Stock Mínimo
              </label>
              <input
                type="number"
                min="0"
                value={minStock}
                onChange={(e) => setMinStock(parseInt(e.target.value) || 0)}
                placeholder="5"
                className="w-full py-2 px-3 bg-neutral-50 border border-neutral-300 rounded-xl text-xs font-bold text-neutral-700 font-mono focus:outline-none focus:border-black"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                Unidad
              </label>
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder={productType === 'combo' ? 'pack / combo' : 'unidad / kg'}
                className="w-full py-2 px-3 bg-neutral-50 border border-neutral-300 rounded-xl text-xs font-medium text-neutral-900 focus:outline-none focus:border-black"
              />
            </div>
          </div>

          <div className="pt-3 flex items-center justify-end gap-3 border-t border-neutral-200">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-xl font-bold text-xs transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={`py-2.5 px-4 rounded-xl font-black text-xs flex items-center gap-2 transition-all cursor-pointer active:scale-[0.99] ${
                productType === 'combo'
                  ? 'bg-amber-400 hover:bg-amber-300 active:bg-amber-500 text-neutral-950 shadow-md shadow-amber-400/20'
                  : 'bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-neutral-950 shadow-md shadow-emerald-500/20'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>{productType === 'combo' ? 'Guardar Combo' : 'Guardar Producto'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
