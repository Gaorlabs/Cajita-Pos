import React, { useState, useMemo } from 'react';
import {
  X,
  Barcode,
  PackagePlus,
  Link2,
  Search,
  Check,
  Package,
  Sparkles,
  ArrowRight,
  Store,
} from 'lucide-react';
import { Product } from '../../types';

interface LinkBarcodeModalProps {
  isOpen: boolean;
  barcode: string | null;
  products: Product[];
  onClose: () => void;
  onRegisterNew: (barcode: string) => void;
  onLinkToExisting: (productId: string, barcode: string) => void;
}

export const LinkBarcodeModal: React.FC<LinkBarcodeModalProps> = ({
  isOpen,
  barcode,
  products,
  onClose,
  onRegisterNew,
  onLinkToExisting,
}) => {
  const [activeView, setActiveView] = useState<'options' | 'search-existing'>('options');
  const [searchTerm, setSearchTerm] = useState('');

  // Reset state when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setActiveView('options');
      setSearchTerm('');
    }
  }, [isOpen, barcode]);

  const filteredProducts = useMemo(() => {
    if (!searchTerm.trim()) {
      return products.slice(0, 8);
    }
    const lower = searchTerm.toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(lower) ||
        p.sku.toLowerCase().includes(lower) ||
        (p.barcode && p.barcode.toLowerCase().includes(lower))
    );
  }, [products, searchTerm]);

  if (!isOpen || !barcode) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden border border-neutral-200 flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-neutral-900 via-neutral-900 to-neutral-800 text-white flex items-start justify-between">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-amber-400/20 border border-amber-400/40 text-amber-300 flex items-center justify-center shrink-0 shadow-inner">
              <Barcode className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-400 text-neutral-950">
                  Código No Registrado
                </span>
              </div>
              <h3 className="font-mono font-black text-lg text-emerald-400 mt-1">
                {barcode}
              </h3>
              <p className="text-xs text-neutral-300 mt-0.5 leading-relaxed">
                Este código de barras no coincide con ningún producto actual. ¿Qué deseas hacer?
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-xl transition-colors cursor-pointer"
            title="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-neutral-800 flex-1">
          
          {activeView === 'options' ? (
            <div className="space-y-3.5">
              {/* Option 1: Create New Product */}
              <button
                type="button"
                onClick={() => {
                  onRegisterNew(barcode);
                  onClose();
                }}
                className="w-full p-4 rounded-2xl border-2 border-emerald-500/40 bg-emerald-50/50 hover:bg-emerald-100/60 hover:border-emerald-600 transition-all text-left flex items-start justify-between group cursor-pointer"
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500 text-neutral-950 font-black flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                    <PackagePlus className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-black text-sm text-neutral-900 group-hover:text-emerald-950 flex items-center gap-1.5">
                      <span>Registrar como Producto Nuevo</span>
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    </h4>
                    <p className="text-xs text-neutral-600 mt-0.5 leading-relaxed">
                      Crea un artículo nuevo en inventario con este código de barras asignado automáticamente.
                    </p>
                    <span className="inline-block mt-2 text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                      Código precargado: {barcode}
                    </span>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-emerald-600 shrink-0 self-center group-hover:translate-x-1 transition-transform" />
              </button>

              {/* Option 2: Link to Existing Product */}
              <button
                type="button"
                onClick={() => setActiveView('search-existing')}
                className="w-full p-4 rounded-2xl border-2 border-neutral-200 bg-neutral-50/70 hover:bg-neutral-100 hover:border-neutral-400 transition-all text-left flex items-start justify-between group cursor-pointer"
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-neutral-900 text-white font-black flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                    <Link2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-black text-sm text-neutral-900 group-hover:text-neutral-950 flex items-center gap-1.5">
                      <span>Asignar a un Producto Existente</span>
                    </h4>
                    <p className="text-xs text-neutral-600 mt-0.5 leading-relaxed">
                      El producto ya existe en tu catálogo, pero le faltaba su código de barras físico. Búscalo y vincúlalo.
                    </p>
                    <span className="inline-block mt-2 text-[11px] font-bold text-neutral-700 bg-neutral-200 px-2 py-0.5 rounded-md">
                      Actualiza el código del producto seleccionado
                    </span>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-neutral-700 shrink-0 self-center group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          ) : (
            /* View 2: Search and Select Existing Product */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-700">
                  Selecciona el producto al que asignarás <span className="font-mono font-bold text-emerald-700">{barcode}</span>:
                </span>
                <button
                  type="button"
                  onClick={() => setActiveView('options')}
                  className="text-xs font-bold text-neutral-500 hover:text-neutral-900 cursor-pointer underline"
                >
                  Volver a opciones
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar producto por nombre o SKU..."
                  autoFocus
                  className="w-full pl-9 pr-3 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-xs font-medium text-neutral-900 focus:outline-none focus:border-black focus:ring-1 focus:ring-black"
                />
              </div>

              {/* Product List */}
              <div className="space-y-2 max-h-60 overflow-y-auto divide-y divide-neutral-100 border border-neutral-200 rounded-2xl p-1 bg-neutral-50/50">
                {filteredProducts.length === 0 ? (
                  <div className="p-6 text-center text-xs text-neutral-400">
                    No se encontró ningún producto con "{searchTerm}".
                  </div>
                ) : (
                  filteredProducts.map((p) => (
                    <div
                      key={p.id}
                      className="p-3 bg-white hover:bg-emerald-50/60 rounded-xl flex items-center justify-between gap-3 transition-colors"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] font-bold bg-neutral-100 text-neutral-700 px-1.5 py-0.5 rounded border border-neutral-200">
                            {p.sku}
                          </span>
                          {p.barcode ? (
                            <span className="text-[10px] font-mono text-neutral-500">
                              Barra: {p.barcode}
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded">
                              Sin código
                            </span>
                          )}
                        </div>
                        <h5 className="font-bold text-xs text-neutral-900 truncate mt-1">
                          {p.name}
                        </h5>
                        <p className="text-[11px] text-emerald-600 font-bold font-mono">
                          Precio: S/ {Number(p.salePrice).toFixed(2)} &middot; Stock: {p.stock}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          onLinkToExisting(p.id, barcode);
                          onClose();
                        }}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1 transition-all shrink-0 cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Vincular</span>
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-200 bg-neutral-50 flex items-center justify-between">
          <p className="text-[11px] text-neutral-500">
            {activeView === 'options'
              ? 'Puedes crear un producto nuevo o vincular el código al inventario existente.'
              : `Total productos en catálogo: ${products.length}`}
          </p>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-neutral-200 hover:bg-neutral-300 text-neutral-800 text-xs font-bold transition-colors cursor-pointer"
          >
            Cancelar
          </button>
        </div>

      </div>
    </div>
  );
};
