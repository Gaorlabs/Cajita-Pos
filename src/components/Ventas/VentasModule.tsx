import React, { useState, useMemo, useRef, useEffect } from 'react';
import { usePos } from '../../context/PosContext';
import { Product, Sale, CashShift } from '../../types';
import { CategoryIcon } from '../CategoryIcon';
import { PaymentModal } from './PaymentModal';
import { ReceiptModal } from './ReceiptModal';
import { OpenShiftModal } from './OpenShiftModal';
import { CloseShiftModal } from './CloseShiftModal';
import { ShiftSummaryModal } from './ShiftSummaryModal';
import { GranelModal } from './GranelModal';
import { SelectVariantModal } from './SelectVariantModal';
import { getEffectiveStock, getComboDetails } from '../../utils/comboUtils';
import {
  Search,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Tag,
  AlertTriangle,
  Sparkles,
  Gift,
  CreditCard,
  Percent,
  Check,
  LayoutGrid,
  List,
  Lock,
  Unlock,
  Receipt,
  TrendingUp,
  Banknote,
  Activity,
  ArrowUpRight,
  Clock,
  ShieldCheck,
  ScanBarcode,
  Barcode,
  User,
  Keyboard,
  Volume2,
  CheckCircle2,
  X,
  Scale,
  Coins,
  Shirt,
  ChevronDown,
} from 'lucide-react';

const getCategoryStyling = (catName: string = '') => {
  const name = catName.toLowerCase();
  if (name.includes('polo') || name.includes('camiseta') || name.includes('comida') || name.includes('bebida') || name.includes('abarrotes')) {
    return {
      bg: 'bg-[#EAF3EC]',
      text: 'text-[#085041]',
      border: 'border-[#085041]/20',
      pillBg: 'bg-[#EAF3EC] text-[#085041] hover:bg-[#d1e9d8]',
    };
  }
  if (name.includes('pantalon') || name.includes('pantalón') || name.includes('jean') || name.includes('pack') || name.includes('combo') || name.includes('bolso')) {
    return {
      bg: 'bg-[#FAEEDA]',
      text: 'text-[#633806]',
      border: 'border-[#EF9F27]/30',
      pillBg: 'bg-[#FAEEDA] text-[#633806] hover:bg-[#f5e3c6]',
    };
  }
  if (name.includes('vestido') || name.includes('dama') || name.includes('femenin') || name.includes('fald')) {
    return {
      bg: 'bg-[#FBEAF0]',
      text: 'text-[#72243E]',
      border: 'border-[#72243E]/20',
      pillBg: 'bg-[#FBEAF0] text-[#72243E] hover:bg-[#f5d7e3]',
    };
  }
  if (name.includes('saco') || name.includes('casaca') || name.includes('chompa') || name.includes('abrigo') || name.includes('salud')) {
    return {
      bg: 'bg-purple-100',
      text: 'text-purple-900',
      border: 'border-purple-200',
      pillBg: 'bg-purple-100 text-purple-900 hover:bg-purple-200',
    };
  }
  if (name.includes('zapato') || name.includes('calzado') || name.includes('zapatilla')) {
    return {
      bg: 'bg-blue-100',
      text: 'text-blue-900',
      border: 'border-blue-200',
      pillBg: 'bg-blue-100 text-blue-900 hover:bg-blue-200',
    };
  }
  return {
    bg: 'bg-[#EAF3DE]',
    text: 'text-[#27500A]',
    border: 'border-[#639922]/20',
    pillBg: 'bg-[#F8F7F4] text-[#2C2C2A] hover:bg-[#EFECE6]',
  };
};

export const VentasModule: React.FC = () => {
  const {
    products,
    categories,
    cart,
    addToCart,
    updateCartQty,
    updateCartDiscount,
    removeFromCart,
    clearCart,
    completeSale,
    currentUser,
    activeShift,
    shifts,
    sales,
    setActiveModule,
    isDemoTour,
    setIsDemoTour,
    storeProfile,
    sectorConfig,
  } = usePos();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [completedSale, setCompletedSale] = useState<Sale | null>(null);
  const [mobileView, setMobileView] = useState<'catalog' | 'cart'>('catalog');

  // Customer in cart
  const [cartCustomer, setCartCustomer] = useState('Cliente General');
  const [isEditingCustomer, setIsEditingCustomer] = useState(false);
  const [tempCustomerName, setTempCustomerName] = useState('');

  // Search input & Barcode scanner ref
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [showBarcodeDemo, setShowBarcodeDemo] = useState(false);
  const [scannerFlash, setScannerFlash] = useState(false);

  // Audio feedback for POS scanner beep (Web Audio API native, zero external dependencies)
  const playBeep = () => {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1760, ctx.currentTime);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch {
      // Audio might be ignored if restricted
    }
  };

  // Cash shift & daily sales modals state
  const [showOpenShiftModal, setShowOpenShiftModal] = useState(false);
  const [showCloseShiftModal, setShowCloseShiftModal] = useState(false);
  const [showShiftSummaryModal, setShowShiftSummaryModal] = useState(false);
  const [showDailySummaryModal, setShowDailySummaryModal] = useState(false);
  const [showShiftDropdown, setShowShiftDropdown] = useState(false);

  // Bulk / Granel Modal state (Sale by weight or by Soles)
  const [bulkModalProduct, setBulkModalProduct] = useState<{
    product: Product;
    initialQty?: number;
    initialMode?: 'money' | 'weight';
  } | null>(null);

  // Variant Modal state (Size / Color / Calzado selection)
  const [variantModalProduct, setVariantModalProduct] = useState<Product | null>(null);

  const handleProductSelect = (product: Product, defaultQty = 1) => {
    const effectiveStock = getEffectiveStock(product, products);
    if (effectiveStock <= 0) return;

    if (product.hasVariants && product.variants && product.variants.length > 0) {
      setVariantModalProduct(product);
    } else if (product.isBulk) {
      const inCartItem = cart.find((i) => i.product.id === product.id);
      handleOpenBulkModal(product, 'money', inCartItem?.quantity || defaultQty);
    } else {
      addToCart(product, defaultQty);
      playBeep();
    }
  };

  const handleOpenBulkModal = (
    product: Product,
    initialMode: 'money' | 'weight' = 'money',
    initialQty = 1
  ) => {
    setBulkModalProduct({ product, initialMode, initialQty });
  };

  const handleConfirmBulkModal = (product: Product, quantityKg: number, totalSoles: number) => {
    const existingInCart = cart.find((i) => i.product.id === product.id);
    if (existingInCart) {
      updateCartQty(product.id, quantityKg);
    } else {
      addToCart(product, quantityKg);
    }
    playBeep();
    setBulkModalProduct(null);
  };

  // Helper to test if a sale happened today
  const isToday = (isoDate: string) => {
    const d = new Date(isoDate);
    const now = new Date();
    return (
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate()
    );
  };

  // Real-time today's sales
  const todaySales = useMemo(() => {
    return sales.filter((s) => isToday(s.date));
  }, [sales]);

  const todayTotal = useMemo(() => {
    return todaySales.reduce((sum, s) => sum + s.total, 0);
  }, [todaySales]);

  // Active shift sales
  const shiftSales = useMemo(() => {
    if (!activeShift) return [];
    return sales.filter((s) => s.shiftId === activeShift.id);
  }, [sales, activeShift]);

  const shiftTotal = useMemo(() => {
    return shiftSales.reduce((sum, s) => sum + s.total, 0);
  }, [shiftSales]);

  const shiftCashTotal = useMemo(() => {
    return shiftSales.reduce((sum, s) => {
      const cashPayments = s.payments.filter((p) => p.method === 'cash');
      return sum + cashPayments.reduce((pSum, p) => pSum + p.amount, 0);
    }, 0);
  }, [shiftSales]);

  const initialShiftCash = activeShift?.initialCash || 0;
  const expectedDrawerCash = initialShiftCash + shiftCashTotal;

  // View mode: Grid vs List (defaults to stored user preference or 'grid')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(() => {
    return (localStorage.getItem('pos_catalog_view_mode') as 'grid' | 'list') || 'grid';
  });

  const handleViewModeChange = (mode: 'grid' | 'list') => {
    setViewMode(mode);
    localStorage.setItem('pos_catalog_view_mode', mode);
  };

  // Discount editor popover per item
  const [editingDiscountId, setEditingDiscountId] = useState<string | null>(null);

  // Count available combos
  const comboCount = useMemo(() => products.filter((p) => p.type === 'combo').length, [products]);

  // Filter products by search & category
  const filteredProducts = products.filter((p) => {
    const matchesCategory =
      selectedCategory === 'all'
        ? true
        : selectedCategory === 'combos'
        ? p.type === 'combo'
        : p.categoryId === selectedCategory;
    const term = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !term || p.name.toLowerCase().includes(term) || p.sku.toLowerCase().includes(term);
    return matchesCategory && matchesSearch;
  });

  // Cart calculations
  const subtotal = cart.reduce((acc, item) => acc + item.product.salePrice * item.quantity, 0);
  const totalDiscount = cart.reduce((acc, item) => acc + item.discount, 0);
  const finalTotal = Math.max(0, subtotal - totalDiscount);
  const totalItemCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  // Customer name handlers
  const handleSaveCustomer = () => {
    if (tempCustomerName.trim()) {
      setCartCustomer(tempCustomerName.trim());
    }
    setIsEditingCustomer(false);
  };

  // Barcode / SKU auto-scanner trigger
  const handleSimulateScan = (skuToScan: string) => {
    const targetProduct = products.find(
      (p) => p.sku.toLowerCase() === skuToScan.toLowerCase() || p.id === skuToScan
    );
    if (targetProduct) {
      const effStock = getEffectiveStock(targetProduct, products);
      if (effStock > 0) {
        addToCart(targetProduct);
        playBeep();
        setScannerFlash(true);
        setTimeout(() => setScannerFlash(false), 500);
        setSearchQuery('');
      }
    }
  };

  // Keyboard shortcut listener (F2: Search, F4: Cobrar, Esc: clear search)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if inside an open modal
      if (
        showPaymentModal ||
        showOpenShiftModal ||
        showCloseShiftModal ||
        showShiftSummaryModal ||
        showDailySummaryModal ||
        completedSale
      ) {
        return;
      }

      if (e.key === 'F2') {
        e.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
      } else if (e.key === 'F4') {
        e.preventDefault();
        if (cart.length > 0) {
          if (!activeShift) {
            setShowOpenShiftModal(true);
          } else {
            setShowPaymentModal(true);
          }
        }
      } else if (e.key === 'Escape' && document.activeElement === searchInputRef.current) {
        setSearchQuery('');
        searchInputRef.current?.blur();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    cart.length,
    activeShift,
    showPaymentModal,
    showOpenShiftModal,
    showCloseShiftModal,
    showShiftSummaryModal,
    showDailySummaryModal,
    completedSale,
  ]);

  // Handle Enter key in Search input (Quick scanner/SKU auto-add)
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const term = searchQuery.trim().toLowerCase();
      if (!term) return;

      // Exact match by SKU or exact name first
      const exactMatch = products.find(
        (p) => p.sku.toLowerCase() === term || p.name.toLowerCase() === term
      );
      if (exactMatch) {
        const effStock = getEffectiveStock(exactMatch, products);
        if (effStock > 0) {
          addToCart(exactMatch);
          playBeep();
          setScannerFlash(true);
          setTimeout(() => setScannerFlash(false), 500);
          setSearchQuery('');
          return;
        }
      }

      // If only 1 product matches current filtered list
      if (filteredProducts.length === 1) {
        const product = filteredProducts[0];
        const effStock = getEffectiveStock(product, products);
        if (effStock > 0) {
          addToCart(product);
          playBeep();
          setScannerFlash(true);
          setTimeout(() => setScannerFlash(false), 500);
          setSearchQuery('');
        }
      }
    }
  };

  const handleSaleConfirm = (payments: any, customerName?: string, actualCashGiven?: number) => {
    const finalCustomer = customerName || cartCustomer;
    const sale = completeSale(payments, finalCustomer, actualCashGiven);
    setShowPaymentModal(false);
    if (sale) {
      setCompletedSale(sale);
      setMobileView('catalog');
      setCartCustomer('Cliente General');
    }
  };

  const handleCheckoutClick = () => {
    if (cart.length === 0) return;
    if (!activeShift) {
      setShowOpenShiftModal(true);
      return;
    }
    setShowPaymentModal(true);
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col md:flex-row overflow-hidden bg-[#FAF6F0]">
      {/* LEFT SECTION: PRODUCT CATALOG (60-65% width on desktop, full width on mobile/tablet) */}
      <div
        className={`flex-1 flex flex-col h-full overflow-hidden p-3 sm:p-4 md:p-4 lg:p-6 space-y-3 sm:space-y-4 ${
          mobileView === 'catalog' ? 'flex' : 'hidden md:flex'
        }`}
      >
        {/* Mobile / Tablet Segmented Switcher (< md) */}
        <div className="md:hidden flex items-center bg-white p-1 rounded-2xl border border-neutral-200 shadow-xs shrink-0">
          <button
            onClick={() => setMobileView('catalog')}
            className={`flex-1 min-h-[42px] py-2 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              mobileView === 'catalog'
                ? 'bg-neutral-950 text-white shadow-xs'
                : 'text-neutral-600 hover:text-black'
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            <span>Catálogo ({filteredProducts.length})</span>
          </button>
          <button
            onClick={() => setMobileView('cart')}
            className={`flex-1 min-h-[42px] py-2 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              mobileView === 'cart'
                ? 'bg-emerald-500 text-neutral-950 shadow-xs'
                : 'text-neutral-600 hover:text-black'
            }`}
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>Carrito ({totalItemCount})</span>
            {totalItemCount > 0 && (
              <span className="font-mono text-[10px] bg-neutral-950 text-white px-1.5 py-0.5 rounded font-black">
                S/ {finalTotal.toFixed(2)}
              </span>
            )}
          </button>
        </div>

        {isDemoTour && (
          <div className="bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/20 rounded-2xl p-4 relative overflow-hidden shrink-0 shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
            <button
              onClick={() => setIsDemoTour(false)}
              className="absolute top-3 right-3 p-1 rounded-lg text-emerald-800 hover:bg-emerald-500/10 transition-all cursor-pointer"
              title="Cerrar Tour"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex gap-3">
              <div className="p-2.5 bg-white rounded-xl shadow-xs border border-emerald-500/10 shrink-0 text-[#2E7D5B] hidden sm:block">
                <Sparkles className="w-5 h-5 animate-pulse" />
              </div>
              <div className="space-y-1 pr-6">
                <h3 className="font-marketing font-extrabold text-sm text-emerald-950 flex items-center gap-1.5">
                  <span>🎉 ¡Modo Demo Personalizado de <strong>{storeProfile.name}</strong> activado!</span>
                </h3>
                <p className="text-[11px] text-neutral-600 leading-relaxed">
                  Hemos cargado un catálogo inteligente del rubro <strong>{sectorConfig.shortName}</strong>. 
                  Prueba a <strong>hacer clic en un producto</strong> para agregarlo al carrito, luego dale al botón <strong>Cobrar</strong> para simular tu primera venta. ¡Siente la rapidez y orden de Cajita POS!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Search & Category Filter Header - Clean & Simple */}
        <div className={`bg-white p-3 sm:p-3.5 rounded-2xl border transition-all space-y-2.5 shrink-0 shadow-xs ${
          scannerFlash ? 'ring-2 ring-emerald-500 border-emerald-500 bg-emerald-50/30' : 'border-neutral-200'
        }`}>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                placeholder="Buscar producto por nombre o código..."
                className="w-full pl-10 pr-10 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-medium text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-neutral-400 hover:text-black bg-neutral-200 rounded-full w-5 h-5 flex items-center justify-center cursor-pointer"
                  title="Limpiar búsqueda"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Quick Barcode Scanner Toggle */}
            <button
              type="button"
              onClick={() => setShowBarcodeDemo(!showBarcodeDemo)}
              className={`h-10 px-3 rounded-xl border flex items-center gap-1.5 text-xs font-bold transition-all cursor-pointer ${
                showBarcodeDemo
                  ? 'bg-emerald-500 border-emerald-600 text-neutral-950 shadow-xs'
                  : 'bg-neutral-50 hover:bg-neutral-100 text-neutral-700 border-neutral-200'
              }`}
              title="Lector de código de barras"
            >
              <ScanBarcode className="w-4 h-4" />
              <span className="hidden md:inline">Escanear</span>
            </button>

            {/* View Mode Toggle: Grid vs List */}
            <div className="flex items-center bg-neutral-100 p-0.5 rounded-xl border border-neutral-200 shrink-0">
              <button
                type="button"
                onClick={() => handleViewModeChange('grid')}
                className={`h-9 px-2.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 text-xs font-bold ${
                  viewMode === 'grid'
                    ? 'bg-white text-neutral-950 shadow-xs'
                    : 'text-neutral-500 hover:text-neutral-950'
                }`}
                title="Vista Cuadrícula"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => handleViewModeChange('list')}
                className={`h-9 px-2.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 text-xs font-bold ${
                  viewMode === 'list'
                    ? 'bg-white text-neutral-950 shadow-xs'
                    : 'text-neutral-500 hover:text-neutral-950'
                }`}
                title="Vista Lista"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Barcode Quick-Simulate Bar / Drawer */}
          {showBarcodeDemo && (
            <div className="p-3 bg-neutral-900 text-white rounded-xl space-y-2 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                  <Barcode className="w-4 h-4" />
                  <span>Modo Lector de Código de Barras</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowBarcodeDemo(false)}
                  className="text-neutral-400 hover:text-white p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-[11px] text-neutral-400">
                Toca cualquier producto para simular el escaneo con pistola:
              </p>
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                {products.slice(0, 10).map((p) => {
                  const effStock = getEffectiveStock(p, products);
                  const isOut = effStock <= 0;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      disabled={isOut}
                      onClick={() => handleSimulateScan(p.sku)}
                      className={`text-[11px] font-mono px-2 py-1 rounded-lg border flex items-center gap-1.5 transition-all cursor-pointer ${
                        isOut
                          ? 'bg-neutral-950 text-neutral-600 border-neutral-800 cursor-not-allowed'
                          : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border-neutral-700'
                      }`}
                    >
                      <ScanBarcode className="w-3 h-3 text-emerald-400" />
                      <span className="font-bold">{p.sku}:</span>
                      <span className="truncate max-w-[120px]">{p.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Category Pills Slider - Simple & Clean with tinting per rubro */}
          <div className="flex items-center gap-2 overflow-x-auto pb-0.5 scrollbar-none">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-xl text-xs transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-[#141412] text-[#F1EFE8] font-bold shadow-xs'
                  : 'bg-[#F8F7F4] text-[#2C2C2A] font-medium hover:bg-[#EFECE6]'
              }`}
            >
              <span>Todos</span>
            </button>

            {comboCount > 0 && (
              <button
                onClick={() => setSelectedCategory('combos')}
                className={`px-3 py-1.5 rounded-xl text-xs transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                  selectedCategory === 'combos'
                    ? 'bg-[#141412] text-[#F1EFE8] font-bold shadow-xs'
                    : 'bg-[#FAEEDA] text-[#633806] border border-[#EF9F27]/30 font-medium hover:bg-[#F3E2BD]'
                }`}
              >
                <Gift className="w-3.5 h-3.5 text-[#633806]" />
                <span>Packs / Combos</span>
              </button>
            )}

            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              const catStyling = getCategoryStyling(cat.name);
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? 'bg-[#141412] text-[#F1EFE8] font-bold shadow-xs'
                      : `${catStyling.pillBg} font-medium`
                  }`}
                >
                  <CategoryIcon name={cat.icon} className="w-3.5 h-3.5" />
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Product Catalog Display: Grid vs List View */}
        <div className="flex-1 overflow-y-auto pr-1">
          {filteredProducts.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center bg-white rounded-2xl border border-neutral-200 text-neutral-400 p-6 text-center">
              <Tag className="w-10 h-10 mb-2 text-neutral-300" />
              <p className="font-bold text-sm text-neutral-700">No se encontraron productos</p>
              <p className="text-xs text-neutral-400 mt-1">Prueba cambiando la búsqueda o categoría</p>
            </div>
          ) : viewMode === 'list' ? (
            /* LIST VIEW MODE (High-density, fast-scanning for entrepreneurs) */
            <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden divide-y divide-neutral-200 shadow-xs">
              {filteredProducts.map((product) => {
                const category = categories.find((c) => c.id === product.categoryId);
                const catStyling = getCategoryStyling(category?.name);
                const isCombo = product.type === 'combo';
                const isBulk = Boolean(product.isBulk || product.unit === 'kg' || product.unit === 'g');
                const effectiveStock = getEffectiveStock(product, products);
                const isLowStock = effectiveStock > 0 && effectiveStock <= product.minStock;
                const isOutOfStock = effectiveStock <= 0;
                const inCartItem = cart.find((i) => i.product.id === product.id);
                const comboInfo = isCombo ? getComboDetails(product, products) : null;

                const handleRowClick = () => {
                  if (isOutOfStock) return;
                  handleProductSelect(product);
                };

                return (
                  <div
                    key={product.id}
                    onClick={handleRowClick}
                    className={`p-3 sm:p-3.5 flex items-center justify-between gap-3 transition-all cursor-pointer select-none group ${
                      isOutOfStock
                        ? 'opacity-50 bg-neutral-50/80 cursor-not-allowed'
                        : inCartItem
                        ? 'bg-[#EAF3EC]/40 hover:bg-[#EAF3EC]/70 border-l-4 border-l-[#2E7D5B]'
                        : isCombo
                        ? 'bg-[#FAEEDA]/30 hover:bg-[#FAEEDA]/70 border-l-4 border-l-[#EF9F27]'
                        : isBulk
                        ? 'bg-cyan-50/20 hover:bg-cyan-50/60 border-l-4 border-l-cyan-400'
                        : 'hover:bg-neutral-50 active:bg-neutral-100'
                    }`}
                  >
                    {/* Left: Category Icon with Tint per Rubro, SKU, Name & Stock */}
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                          isOutOfStock
                            ? 'bg-neutral-200 text-neutral-400'
                            : inCartItem
                            ? 'bg-[#2E7D5B] text-[#FAF6F0] shadow-xs'
                            : isCombo
                            ? 'bg-[#FAEEDA] text-[#633806]'
                            : isBulk
                            ? 'bg-cyan-100 text-cyan-800'
                            : `${catStyling.bg} ${catStyling.text}`
                        }`}
                      >
                        {isCombo ? (
                          <Gift className="w-4 h-4" />
                        ) : isBulk ? (
                          <Scale className="w-4 h-4 text-cyan-700" />
                        ) : (
                          <CategoryIcon name={category?.icon || 'Tag'} className="w-4 h-4" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        {/* SKU, Category & Stock in REGULAR weight per typography guidelines */}
                        <div className="flex items-center gap-1.5 flex-wrap text-[11px] text-[#5F5E5A] font-normal">
                          <span className="font-mono text-[#5F5E5A]">
                            {product.sku}
                          </span>
                          <span>·</span>
                          <span>{category?.name}</span>
                          <span>·</span>
                          {/* Stock Indicator */}
                          {isOutOfStock ? (
                            <span className="text-rose-600 font-bold">
                              Agotado
                            </span>
                          ) : isLowStock ? (
                            <span className="text-[#633806] font-medium">
                              Stock bajo: {effectiveStock}
                            </span>
                          ) : (
                            <span>stock: {effectiveStock}</span>
                          )}
                        </div>
                        {/* Principal Data: Product Name (font-semibold, #141412) */}
                        <h3 className="font-semibold text-xs sm:text-sm text-[#141412] truncate leading-snug mt-0.5">
                          {product.name}
                        </h3>
                      </div>
                    </div>

                    {/* Right: Price & In-Cart Stepper / Quick Add Button */}
                    <div
                      className="flex items-center gap-2.5 sm:gap-3.5 shrink-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="text-right">
                        {isCombo && comboInfo && comboInfo.regularTotal > product.salePrice && (
                          <span className="text-[10px] line-through text-neutral-400 block font-mono">
                            S/ {comboInfo.regularTotal.toFixed(2)}
                          </span>
                        )}
                        <span className="text-[10px] text-neutral-400 block font-normal">
                          {isBulk ? `Precio / ${product.unit || 'kg'}` : 'Precio'}
                        </span>
                        {/* BOLD Price */}
                        <span className="text-sm sm:text-base font-bold text-[#141412] font-mono tracking-tight">
                          S/ {product.salePrice.toFixed(2)}
                        </span>
                      </div>

                      {inCartItem ? (
                        <div className="flex items-center bg-white border border-[#2E7D5B] rounded-xl p-0.5 shadow-xs gap-1">
                          {isBulk ? (
                            <button
                              type="button"
                              onClick={() => handleOpenBulkModal(product, 'money', inCartItem.quantity)}
                              className="px-2.5 py-1.5 bg-cyan-100 hover:bg-cyan-200 text-cyan-900 rounded-lg text-xs font-black flex items-center gap-1 cursor-pointer transition-colors"
                              title="Editar cantidad por Soles o Kilos"
                            >
                              <Scale className="w-3.5 h-3.5 text-cyan-700" />
                              <span>{inCartItem.quantity % 1 === 0 ? inCartItem.quantity : inCartItem.quantity.toFixed(3).replace(/\.?0+$/, '')} {product.unit || 'kg'}</span>
                            </button>
                          ) : (
                            <>
                              <button
                                type="button"
                                onClick={() => updateCartQty(product.id, inCartItem.quantity - 1)}
                                className="w-8 h-8 flex items-center justify-center text-neutral-700 hover:bg-neutral-100 active:bg-neutral-200 rounded-lg transition-colors cursor-pointer"
                                title="Disminuir 1"
                                aria-label="Disminuir cantidad"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="w-7 sm:w-8 text-center font-bold text-xs text-neutral-900 font-mono">
                                {inCartItem.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  addToCart(product);
                                  playBeep();
                                }}
                                className="w-8 h-8 flex items-center justify-center bg-[#2E7D5B] text-[#FAF6F0] hover:bg-[#235F45] active:scale-95 rounded-lg transition-colors cursor-pointer shadow-xs"
                                title="Aumentar 1"
                                aria-label="Aumentar cantidad"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          {isBulk ? (
                            <button
                              type="button"
                              disabled={isOutOfStock}
                              onClick={() => handleOpenBulkModal(product, 'money', 1)}
                              className="min-h-[36px] px-3 sm:px-3.5 rounded-xl flex items-center gap-1.5 font-bold text-xs bg-cyan-600 hover:bg-cyan-500 text-white active:scale-95 shadow-xs cursor-pointer"
                              title="Vender por Soles o por Peso (Balanza)"
                            >
                              <Coins className="w-3.5 h-3.5" />
                              <span>Vender x Soles / Kg</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              disabled={isOutOfStock}
                              onClick={handleRowClick}
                              className={`min-h-[36px] px-3.5 sm:px-4 rounded-xl flex items-center gap-1.5 font-bold text-xs transition-all cursor-pointer ${
                                isOutOfStock
                                  ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                                  : isCombo
                                  ? 'bg-[#EF9F27] text-[#141412] hover:bg-amber-400 active:scale-95 shadow-xs'
                                  : 'bg-[#2E7D5B] text-[#FAF6F0] hover:bg-[#235F45] active:scale-95 shadow-xs'
                              }`}
                              title={isOutOfStock ? 'Producto sin existencias' : 'Clic para agregar al carrito'}
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Agregar</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* GRID VIEW MODE (Clean, intuitive, uncluttered cards) */
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {filteredProducts.map((product) => {
                const category = categories.find((c) => c.id === product.categoryId);
                const catStyling = getCategoryStyling(category?.name);
                const isCombo = product.type === 'combo';
                const isBulk = Boolean(product.isBulk || product.unit === 'kg' || product.unit === 'g');
                const effectiveStock = getEffectiveStock(product, products);
                const isLowStock = effectiveStock > 0 && effectiveStock <= product.minStock;
                const isOutOfStock = effectiveStock <= 0;
                const inCartItem = cart.find((i) => i.product.id === product.id);

                const handleCardClick = () => {
                  if (isOutOfStock) return;
                  handleProductSelect(product);
                };

                return (
                  <button
                    key={product.id}
                    onClick={handleCardClick}
                    disabled={isOutOfStock}
                    className={`bg-white rounded-2xl p-3.5 sm:p-4 border text-left flex flex-col justify-between transition-all duration-150 relative group cursor-pointer ${
                      isOutOfStock
                        ? 'opacity-50 border-neutral-200 bg-neutral-50 cursor-not-allowed'
                        : inCartItem
                        ? 'border-[#2E7D5B] ring-2 ring-[#2E7D5B]/15 shadow-xs bg-[#EAF3EC]/20'
                        : 'border-neutral-200 hover:border-[#2E7D5B] hover:shadow-xs'
                    }`}
                  >
                    {/* Badge Indicator for Cart quantity */}
                    {inCartItem && (
                      <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-[#2E7D5B] text-[#FAF6F0] font-bold text-xs shadow-xs">
                        {inCartItem.quantity % 1 === 0 ? inCartItem.quantity : inCartItem.quantity.toFixed(2)} {isBulk ? product.unit || 'kg' : ''}
                      </div>
                    )}

                    <div className="space-y-2">
                      {/* Top Row: Icon + SKU */}
                      <div className="flex items-center justify-between gap-2">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                            isCombo
                              ? 'bg-[#FAEEDA] text-[#633806]'
                              : isBulk
                              ? 'bg-cyan-100 text-cyan-800'
                              : `${catStyling.bg} ${catStyling.text}`
                          }`}
                        >
                          {isCombo ? (
                            <Gift className="w-4 h-4" />
                          ) : isBulk ? (
                            <Scale className="w-4 h-4" />
                          ) : (
                            <CategoryIcon name={category?.icon || 'Tag'} className="w-4 h-4" />
                          )}
                        </div>
                        <span className="font-mono text-[10px] font-normal text-neutral-400 bg-neutral-100 px-1.5 py-0.5 rounded">
                          {product.sku}
                        </span>
                      </div>

                      {/* Product Title */}
                      <div>
                        <h3 className="font-bold text-xs sm:text-sm text-[#141412] line-clamp-2 leading-snug">
                          {product.name}
                        </h3>

                        {/* Optional Single Clean Tag */}
                        {isCombo ? (
                          <span className="inline-block mt-1 text-[10px] font-bold text-[#633806] bg-[#FAEEDA] px-2 py-0.5 rounded-md border border-[#EF9F27]/30">
                            Combo Pack
                          </span>
                        ) : isBulk ? (
                          <span className="inline-block mt-1 text-[10px] font-bold text-cyan-800 bg-cyan-50 px-2 py-0.5 rounded-md border border-cyan-200">
                            Venta a Granel
                          </span>
                        ) : product.hasVariants && product.variants && product.variants.length > 0 ? (
                          <span className="inline-block mt-1 text-[10px] font-bold text-[#2E7D5B] bg-[#EAF3EC] px-2 py-0.5 rounded-md border border-[#2E7D5B]/20">
                            {product.variants.length} Variantes
                          </span>
                        ) : null}
                      </div>
                    </div>

                    {/* Bottom Row: Price + Stock + Add Action */}
                    <div className="pt-3 mt-3 border-t border-neutral-100 flex items-center justify-between gap-2">
                      <div>
                        <div className="text-base sm:text-lg font-bold text-[#141412] font-mono tracking-tight leading-none">
                          S/ {product.salePrice.toFixed(2)}
                          {isBulk && <span className="text-[10px] font-normal text-neutral-400">/{product.unit || 'kg'}</span>}
                        </div>
                        <div className="mt-1 text-[10px] font-normal text-neutral-500">
                          {isOutOfStock ? (
                            <span className="font-bold text-rose-600">Agotado</span>
                          ) : isLowStock ? (
                            <span className="font-semibold text-amber-700">Stock bajo: {effectiveStock}</span>
                          ) : (
                            <span>• {effectiveStock} disp.</span>
                          )}
                        </div>
                      </div>

                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs transition-all ${
                          isOutOfStock
                            ? 'bg-neutral-100 text-neutral-300'
                            : inCartItem
                            ? 'bg-[#2E7D5B] text-[#FAF6F0] shadow-xs'
                            : isCombo
                            ? 'bg-[#EF9F27] text-[#141412] hover:bg-amber-400'
                            : isBulk
                            ? 'bg-cyan-600 text-white group-hover:bg-cyan-500'
                            : 'bg-neutral-100 text-neutral-800 group-hover:bg-[#2E7D5B] group-hover:text-[#FAF6F0]'
                        }`}
                      >
                        {isBulk ? <Scale className="w-4 h-4 font-bold" /> : <Plus className="w-4 h-4 font-bold" />}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Mobile & Tablet Sticky Quick Cart Floating Bar */}
        {cart.length > 0 && (
          <div className="md:hidden shrink-0 pt-1">
            <button
              onClick={() => setMobileView('cart')}
              className="w-full bg-neutral-950 text-white p-3 sm:p-3.5 rounded-2xl shadow-xl border border-neutral-800 flex items-center justify-between active:scale-[0.99] transition-all cursor-pointer hover:border-emerald-500"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500 text-neutral-950 flex items-center justify-center font-black shadow-md">
                  <ShoppingCart className="w-4 h-4 text-neutral-950" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold text-neutral-300">
                    {totalItemCount} {totalItemCount === 1 ? 'producto' : 'productos'} en carrito
                  </p>
                  <p className="text-sm font-black text-emerald-400 font-mono">
                    S/ {finalTotal.toFixed(2)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 bg-emerald-500 text-neutral-950 font-black text-xs px-3.5 py-2 rounded-xl shadow-xs">
                <span>Ver Carrito / Cobrar</span>
                <span>→</span>
              </div>
            </button>
          </div>
        )}
      </div>

      {/* RIGHT SECTION: CART & CHECKOUT PANEL (35-40% width on desktop, full screen on mobile/tablet) */}
      <div
        className={`w-full md:w-[360px] lg:w-[400px] xl:w-[440px] bg-white border-l border-neutral-200 flex flex-col h-full shadow-lg shrink-0 ${
          mobileView === 'cart' ? 'flex' : 'hidden md:flex'
        }`}
      >
        {/* Cart Header */}
        <div className="p-3.5 sm:p-4 border-b border-neutral-800 flex items-center justify-between bg-black text-white">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMobileView('catalog')}
              className="md:hidden text-neutral-300 hover:text-white px-2.5 py-1.5 rounded-lg bg-neutral-800 border border-neutral-700 cursor-pointer text-xs font-bold flex items-center gap-1 active:scale-95"
              title="Volver a los productos"
            >
              ← Volver
            </button>
            <div className="w-8 h-8 rounded-lg bg-emerald-500 text-neutral-950 flex items-center justify-center font-black shadow-xs">
              <ShoppingCart className="w-4 h-4 text-neutral-950" />
            </div>
            <div>
              <h2 className="font-bold text-sm leading-tight">Carrito de Venta</h2>
              <p className="text-[11px] text-neutral-400">
                {totalItemCount} {totalItemCount === 1 ? 'producto' : 'productos'} seleccionados
              </p>
            </div>
          </div>

          {cart.length > 0 && (
            <button
              onClick={clearCart}
              className="text-xs text-neutral-400 hover:text-white flex items-center gap-1 font-semibold transition-colors cursor-pointer"
              title="Vaciar carrito"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Vaciar</span>
            </button>
          )}
        </div>

        {/* Customer Bar Ribbon (Retail POS Standard: General / DNI / RUC) */}
        <div className="bg-neutral-900 px-3.5 py-2 border-b border-neutral-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <User className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            {isEditingCustomer ? (
              <div className="flex items-center gap-1 flex-1 pr-2">
                <input
                  type="text"
                  value={tempCustomerName}
                  onChange={(e) => setTempCustomerName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveCustomer();
                    if (e.key === 'Escape') setIsEditingCustomer(false);
                  }}
                  placeholder="Nombre, DNI o RUC del cliente..."
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-2 py-1 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-emerald-500"
                  autoFocus
                />
                <button
                  onClick={handleSaveCustomer}
                  className="p-1 bg-emerald-500 text-neutral-950 rounded hover:bg-emerald-400 cursor-pointer"
                >
                  <Check className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 truncate">
                <span className="text-neutral-400 text-[11px]">Cliente:</span>
                <span className="font-bold text-neutral-100 truncate">{cartCustomer}</span>
              </div>
            )}
          </div>

          {!isEditingCustomer && (
            <button
              onClick={() => {
                setTempCustomerName(cartCustomer === 'Cliente General' ? '' : cartCustomer);
                setIsEditingCustomer(true);
              }}
              className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 underline cursor-pointer shrink-0 ml-2"
            >
              {cartCustomer === 'Cliente General' ? '+ Asignar' : 'Cambiar'}
            </button>
          )}
        </div>

        {/* Cart Item List - Clean & Focused */}
        <div className="flex-1 overflow-y-auto p-3.5 space-y-2.5">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-neutral-400 p-6 text-center space-y-2">
              <div className="w-14 h-14 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400 border border-neutral-200">
                <ShoppingCart className="w-7 h-7" />
              </div>
              <div>
                <p className="font-bold text-neutral-800 text-sm">Ticket vacío</p>
                <p className="text-xs text-neutral-400 mt-0.5 max-w-[180px] mx-auto">
                  Toca productos del catálogo para agregar
                </p>
              </div>
            </div>
          ) : (
            cart.map((item) => {
              const itemKey = `${item.product.id}-${item.selectedVariant?.id || 'base'}`;
              const unitPrice = item.selectedVariant?.salePrice ?? item.product.salePrice;
              const itemTotal = unitPrice * item.quantity - item.discount;
              const isEditingDiscount = editingDiscountId === itemKey;
              const isBulk = Boolean(item.product.isBulk || item.product.unit === 'kg' || item.product.unit === 'g' || item.quantity % 1 !== 0);

              return (
                <div
                  key={itemKey}
                  className="bg-white border border-neutral-200 rounded-xl p-3 space-y-2 transition-all hover:border-neutral-300 shadow-2xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-xs text-neutral-900 truncate">{item.product.name}</h4>
                      <p className="text-[11px] text-neutral-500 font-mono mt-0.5">
                        S/ {unitPrice.toFixed(2)} {item.product.unit ? `/${item.product.unit}` : 'c/u'}
                        {item.selectedVariant && (
                          <span className="ml-1.5 font-sans font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded">
                            {item.selectedVariant.name}
                          </span>
                        )}
                      </p>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.product.id, item.selectedVariant?.id)}
                      className="p-1.5 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer shrink-0"
                      title="Eliminar producto"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-1.5 border-t border-neutral-100 gap-2">
                    {/* Quantity controls */}
                    <div className="flex items-center gap-1.5">
                      <div className="flex items-center bg-neutral-50 border border-neutral-200 rounded-lg p-0.5">
                        <button
                          onClick={() => {
                            const step = isBulk ? 0.25 : 1;
                            const nextVal = Math.max(0.05, Math.round((item.quantity - step) * 1000) / 1000);
                            updateCartQty(item.product.id, nextVal, item.selectedVariant?.id);
                          }}
                          className="w-7 h-7 flex items-center justify-center text-neutral-700 hover:bg-white active:bg-neutral-200 rounded-md transition-colors cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <input
                          type="number"
                          step={isBulk ? '0.05' : '1'}
                          min="0.01"
                          value={item.quantity}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value);
                            if (!isNaN(val) && val > 0) {
                              updateCartQty(item.product.id, val, item.selectedVariant?.id);
                            }
                          }}
                          className="w-12 text-center font-bold font-mono text-xs text-neutral-900 focus:outline-none bg-transparent"
                        />
                        <button
                          onClick={() => {
                            const step = isBulk ? 0.25 : 1;
                            const nextVal = Math.round((item.quantity + step) * 1000) / 1000;
                            updateCartQty(item.product.id, nextVal, item.selectedVariant?.id);
                          }}
                          className="w-7 h-7 flex items-center justify-center text-neutral-700 hover:bg-white active:bg-neutral-200 rounded-md transition-colors cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {isBulk && (
                        <button
                          type="button"
                          onClick={() => handleOpenBulkModal(item.product, 'money', item.quantity)}
                          className="px-2 py-1 bg-cyan-50 hover:bg-cyan-100 text-cyan-800 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors border border-cyan-200"
                          title="Ajustar por Soles o Kilos exactos"
                        >
                          <Coins className="w-3 h-3 text-cyan-600" />
                          <span>Monto/Kg</span>
                        </button>
                      )}
                    </div>

                    {/* Subtotal & Discount toggle */}
                    <div className="text-right">
                      <div className="font-black text-neutral-950 font-mono text-sm">
                        S/ {Math.max(0, itemTotal).toFixed(2)}
                      </div>
                      <button
                        onClick={() => setEditingDiscountId(isEditingDiscount ? null : itemKey)}
                        className="text-[10px] font-bold text-neutral-400 hover:text-emerald-700 cursor-pointer"
                      >
                        {item.discount > 0 ? `-S/ ${item.discount.toFixed(2)}` : '+ Descuento'}
                      </button>
                    </div>
                  </div>

                  {/* Inline Discount Editor Input */}
                  {isEditingDiscount && (
                    <div className="bg-neutral-50 p-2 rounded-lg border border-neutral-300 flex items-center justify-between gap-2 animate-in fade-in duration-150">
                      <span className="text-[11px] font-bold text-neutral-600">Descuento (S/):</span>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          step="0.5"
                          min="0"
                          max={unitPrice * item.quantity}
                          value={item.discount || ''}
                          onChange={(e) =>
                            updateCartDiscount(item.product.id, parseFloat(e.target.value) || 0, item.selectedVariant?.id)
                          }
                          placeholder="0.00"
                          className="w-20 py-1 px-2 text-right border border-neutral-300 bg-white rounded font-bold text-xs text-neutral-900"
                        />
                        <button
                          onClick={() => setEditingDiscountId(null)}
                          className="p-1 bg-black text-white rounded hover:bg-neutral-800 cursor-pointer"
                        >
                          <Check className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Cart Summary & Checkout Footer */}
        <div className="p-4 border-t border-neutral-200 bg-neutral-50 space-y-3">
          <div className="space-y-1.5 text-xs text-neutral-600">
            <div className="flex justify-between font-mono">
              <span>Subtotal:</span>
              <span className="font-bold text-neutral-900">S/ {subtotal.toFixed(2)}</span>
            </div>
            {totalDiscount > 0 && (
              <div className="flex justify-between text-neutral-900 font-bold font-mono">
                <span>Descuento Total:</span>
                <span className="text-emerald-700 font-bold">-S/ {totalDiscount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between items-baseline text-base font-black text-neutral-950 pt-2 border-t border-neutral-200 font-mono">
              <span className="font-sans font-bold">TOTAL A COBRAR:</span>
              <span className="text-2xl font-black text-emerald-600 tracking-tight">
                S/ {finalTotal.toFixed(2)}
              </span>
            </div>
          </div>

          {!activeShift && (
            <div className="p-3 bg-rose-600 text-white rounded-xl text-xs flex items-center justify-between shadow-md gap-2 animate-pulse">
              <div className="flex items-center gap-2 font-bold text-xs">
                <Lock className="w-4 h-4 text-rose-100 shrink-0" />
                <span>Caja Cerrada: Se requiere apertura para cobrar</span>
              </div>
              <button
                type="button"
                onClick={() => setShowOpenShiftModal(true)}
                className="px-3 py-1.5 bg-white text-rose-700 hover:bg-rose-50 font-black text-xs rounded-lg shadow-xs cursor-pointer shrink-0 transition-transform active:scale-95"
              >
                🔓 Abrir Caja Ahora
              </button>
            </div>
          )}

          <button
            onClick={handleCheckoutClick}
            disabled={cart.length === 0}
            className={`w-full py-4 px-4 rounded-xl font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer ${
              cart.length === 0
                ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed shadow-none'
                : !activeShift
                ? 'bg-[#1C2B24] hover:bg-[#235F45] text-[#FAF6F0] shadow-md'
                : 'bg-[#2E7D5B] hover:bg-[#235F45] active:bg-[#235F45] text-white shadow-lg shadow-[#2E7D5B]/25 active:scale-[0.99]'
            }`}
          >
            {!activeShift ? (
              <>
                <Unlock className="w-5 h-5 text-[#2E7D5B]" />
                <span>ABRIR CAJA Y COBRAR (S/ {finalTotal.toFixed(2)})</span>
              </>
            ) : (
              <>
                <CreditCard className="w-5 h-5" />
                <span className="font-brand uppercase tracking-wider">COBRAR (S/ {finalTotal.toFixed(2)})</span>
                <span className="ml-1 text-[10px] bg-[#EAF3EC]/20 text-[#EAF3EC] px-1.5 py-0.5 rounded font-mono font-bold">
                  F4
                </span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <PaymentModal
          total={finalTotal}
          initialCustomerName={cartCustomer}
          onConfirm={handleSaleConfirm}
          onClose={() => setShowPaymentModal(false)}
        />
      )}

      {/* Receipt Modal */}
      {completedSale && (
        <ReceiptModal sale={completedSale} onClose={() => setCompletedSale(null)} />
      )}

      {/* Open Shift Modal */}
      {showOpenShiftModal && (
        <OpenShiftModal
          onClose={() => setShowOpenShiftModal(false)}
          onSuccess={() => {
            // If user has cart items ready, open payment directly
            if (cart.length > 0) {
              setShowPaymentModal(true);
            }
          }}
        />
      )}

      {/* Close Shift Modal */}
      {showCloseShiftModal && activeShift && (
        <CloseShiftModal
          shift={activeShift}
          sales={sales}
          onClose={() => setShowCloseShiftModal(false)}
          onSuccess={(closed) => {
            setShowCloseShiftModal(false);
            setShowShiftSummaryModal(true);
          }}
        />
      )}

      {/* Shift Summary (Corte X/Z) Modal */}
      {showShiftSummaryModal && activeShift && (
        <ShiftSummaryModal
          shift={activeShift}
          sales={shiftSales}
          onClose={() => setShowShiftSummaryModal(false)}
        />
      )}

      {/* Real-time Daily Sales Modal */}
      {showDailySummaryModal && (
        <ShiftSummaryModal
          shift={null}
          sales={todaySales}
          customTitle="Reporte de Ventas del Día (Tiempo Real)"
          subtitle={`Total vendido hoy: S/ ${todayTotal.toFixed(2)} (${todaySales.length} comprobantes emitidos)`}
          onClose={() => setShowDailySummaryModal(false)}
        />
      )}

      {/* Bulk (Granel) Weight / Soles Modal */}
      {bulkModalProduct && (
        <GranelModal
          product={bulkModalProduct.product}
          initialMode={bulkModalProduct.initialMode}
          initialQuantity={bulkModalProduct.initialQty}
          onClose={() => setBulkModalProduct(null)}
          onConfirm={handleConfirmBulkModal}
        />
      )}

      {/* Select Variant Modal (Size / Color / Footwear) */}
      {variantModalProduct && (
        <SelectVariantModal
          product={variantModalProduct}
          onSelectVariant={(variant, qty) => {
            addToCart(variantModalProduct, qty, variant);
            playBeep();
            setVariantModalProduct(null);
          }}
          onClose={() => setVariantModalProduct(null)}
        />
      )}
    </div>
  );
};
