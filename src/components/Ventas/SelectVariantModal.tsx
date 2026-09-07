import React, { useState } from 'react';
import { Product, ProductVariant } from '../../types';
import { X, Check, ShoppingCart, Plus, Minus, Tag, Shirt, AlertCircle } from 'lucide-react';

interface SelectVariantModalProps {
  product: Product;
  onSelectVariant: (variant: ProductVariant, quantity: number) => void;
  onClose: () => void;
}

export const SelectVariantModal: React.FC<SelectVariantModalProps> = ({
  product,
  onSelectVariant,
  onClose,
}) => {
  const variants = product.variants || [];
  
  // Default to first available variant (or first if all out of stock)
  const defaultVariant = variants.find((v) => v.stock > 0) || variants[0] || null;
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(defaultVariant);
  const [quantity, setQuantity] = useState<number>(1);

  const isSelectedOutOfStock = !selectedVariant || selectedVariant.stock <= 0;
  const currentPrice = selectedVariant?.salePrice ?? product.salePrice;
  const subtotal = currentPrice * quantity;

  const handleConfirm = () => {
    if (!selectedVariant || isSelectedOutOfStock) return;
    onSelectVariant(selectedVariant, quantity);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden my-auto border border-neutral-800 animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="bg-neutral-950 text-white p-4 sm:p-5 flex items-center justify-between border-b border-neutral-800">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-neutral-950 flex items-center justify-center shrink-0 font-bold shadow-md shadow-emerald-500/20">
              <Shirt className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-400 text-neutral-950 inline-block mb-0.5">
                Selección de Variante / Talla
              </span>
              <h2 className="text-sm sm:text-base font-black truncate text-white leading-snug">
                {product.name}
              </h2>
              <p className="text-xs text-neutral-400 font-mono">SKU: {product.sku}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-xl transition-colors cursor-pointer shrink-0 ml-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 space-y-5">
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-black uppercase tracking-wider text-neutral-800 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-emerald-600" />
                <span>Elija Talla o Color (Toca para seleccionar):</span>
              </label>
              <span className="text-[11px] text-neutral-500 font-medium">
                {variants.length} variantes disponibles
              </span>
            </div>

            {/* Touch-Friendly Grid of Variant Tiles */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-60 overflow-y-auto pr-1">
              {variants.map((variant) => {
                const isSelected = selectedVariant?.id === variant.id;
                const isOut = variant.stock <= 0;
                const vPrice = variant.salePrice ?? product.salePrice;

                return (
                  <button
                    key={variant.id}
                    type="button"
                    onClick={() => {
                      if (!isOut) {
                        setSelectedVariant(variant);
                        if (quantity > variant.stock) setQuantity(variant.stock);
                      }
                    }}
                    disabled={isOut}
                    className={`p-3 rounded-2xl border text-left transition-all relative flex flex-col justify-between cursor-pointer select-none active:scale-[0.98] ${
                      isSelected
                        ? 'bg-neutral-950 text-white border-neutral-950 shadow-md ring-2 ring-emerald-500/50'
                        : isOut
                        ? 'bg-neutral-100/70 border-neutral-200 text-neutral-400 opacity-60 cursor-not-allowed'
                        : 'bg-neutral-50 hover:bg-white border-neutral-300 text-neutral-900 hover:border-black shadow-xs'
                    }`}
                  >
                    {/* Selected Checkmark Badge */}
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-emerald-500 text-neutral-950 flex items-center justify-center font-bold">
                        <Check className="w-3 h-3" />
                      </div>
                    )}

                    <div>
                      <span className={`text-xs font-black block tracking-tight pr-5 ${isSelected ? 'text-white' : 'text-neutral-950'}`}>
                        {variant.name}
                      </span>
                      {variant.sku && (
                        <span className={`text-[10px] font-mono block ${isSelected ? 'text-neutral-400' : 'text-neutral-500'}`}>
                          {variant.sku}
                        </span>
                      )}
                    </div>

                    <div className="mt-3 pt-2 border-t border-current/10 flex items-center justify-between gap-1">
                      <span className={`text-xs font-black font-mono ${isSelected ? 'text-emerald-400' : 'text-neutral-900'}`}>
                        S/ {vPrice.toFixed(2)}
                      </span>
                      {isOut ? (
                        <span className="text-[9px] font-bold text-rose-600 bg-rose-100 px-1.5 py-0.5 rounded uppercase">
                          Agotado
                        </span>
                      ) : (
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            isSelected
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : variant.stock <= 3
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          }`}
                        >
                          {variant.stock} disp.
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Variant Summary & Quantity Stepper */}
          {selectedVariant && (
            <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-200 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider block">Variante Seleccionada:</span>
                  <span className="text-sm font-black text-neutral-950">{selectedVariant.name}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider block">Precio Unitario:</span>
                  <span className="text-sm font-black font-mono text-emerald-700">S/ {currentPrice.toFixed(2)}</span>
                </div>
              </div>

              {/* Large Quantity Stepper for touch/tablet */}
              <div className="flex items-center justify-between pt-2 border-t border-neutral-200">
                <span className="text-xs font-bold text-neutral-700">Cantidad a vender:</span>
                <div className="flex items-center bg-white border border-neutral-300 rounded-xl p-1 shadow-xs">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className="w-10 h-10 rounded-lg flex items-center justify-center bg-neutral-100 hover:bg-neutral-200 disabled:opacity-40 text-neutral-800 font-bold active:scale-95 transition-all cursor-pointer"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center text-sm font-black font-mono text-neutral-900">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.min(selectedVariant.stock, quantity + 1))}
                    disabled={quantity >= selectedVariant.stock}
                    className="w-10 h-10 rounded-lg flex items-center justify-center bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-neutral-950 font-bold active:scale-95 transition-all cursor-pointer shadow-xs"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Out of stock alert if selected is out of stock */}
          {isSelectedOutOfStock && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2 text-xs font-bold text-rose-800">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>Esta variante no tiene stock disponible en inventario.</span>
            </div>
          )}
        </div>

        {/* Footer Buttons */}
        <div className="p-4 bg-neutral-100 border-t border-neutral-200 flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="py-3 px-4 bg-white hover:bg-neutral-200 border border-neutral-300 text-neutral-800 rounded-2xl font-bold text-xs transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isSelectedOutOfStock}
            className="flex-1 py-3 px-4 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-neutral-950 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.99] shadow-md shadow-emerald-500/20 cursor-pointer"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Agregar al Carrito — S/ {subtotal.toFixed(2)}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
