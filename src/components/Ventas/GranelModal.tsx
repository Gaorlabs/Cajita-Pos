import React, { useState, useEffect } from 'react';
import { Product } from '../../types';
import {
  X,
  Scale,
  Coins,
  Check,
  Calculator,
  ArrowRight,
  Info,
  Sparkles,
  Percent,
} from 'lucide-react';

interface GranelModalProps {
  product: Product;
  initialQuantity?: number;
  initialMode?: 'money' | 'weight';
  onConfirm: (product: Product, quantityKg: number, totalSoles: number) => void;
  onClose: () => void;
}

export const GranelModal: React.FC<GranelModalProps> = ({
  product,
  initialQuantity = 1,
  initialMode = 'money',
  onConfirm,
  onClose,
}) => {
  const [mode, setMode] = useState<'money' | 'weight'>(initialMode);
  const [weightUnit, setWeightUnit] = useState<'kg' | 'g'>('kg');

  // Values in string for smooth keypad input
  const initialSoles = Math.round(initialQuantity * product.salePrice * 100) / 100;
  const [moneyStr, setMoneyStr] = useState<string>(
    initialMode === 'money' ? initialSoles.toFixed(2) : '3.00'
  );
  const [weightStr, setWeightStr] = useState<string>(
    initialQuantity.toString()
  );

  const pricePerKg = product.salePrice > 0 ? product.salePrice : 1;

  // Numeric calculated values
  const moneyValue = parseFloat(moneyStr) || 0;
  const rawWeightValue = parseFloat(weightStr) || 0;
  const weightInKg = weightUnit === 'g' ? rawWeightValue / 1000 : rawWeightValue;

  // Real-time bidirectional resolution
  let calculatedKg = 0;
  let calculatedTotalSoles = 0;

  if (mode === 'money') {
    // Client asks: "Dame S/ 3.00 de arroz"
    // Quantity in kg = Money / (Price/kg)
    calculatedTotalSoles = moneyValue;
    calculatedKg = moneyValue > 0 ? Math.round((moneyValue / pricePerKg) * 1000) / 1000 : 0;
  } else {
    // Client asks: "Dame 750 gramos" or "1.5 kg"
    // Total in Soles = Weight in kg * Price/kg
    calculatedKg = Math.round(weightInKg * 1000) / 1000;
    calculatedTotalSoles = Math.round(calculatedKg * pricePerKg * 100) / 100;
  }

  const calculatedGrams = Math.round(calculatedKg * 1000);

  // Quick preset handlers
  const handleSelectMoneyPreset = (soles: number) => {
    setMode('money');
    setMoneyStr(soles.toFixed(2));
  };

  const handleSelectWeightPreset = (kg: number) => {
    setMode('weight');
    setWeightUnit('kg');
    setWeightStr(kg.toString());
  };

  // Keypad actions
  const handleKeypadPress = (val: string) => {
    if (mode === 'money') {
      if (val === 'C') {
        setMoneyStr('0');
      } else if (val === 'DEL') {
        setMoneyStr((prev) => (prev.length > 1 ? prev.slice(0, -1) : '0'));
      } else if (val === '.') {
        if (!moneyStr.includes('.')) {
          setMoneyStr((prev) => prev + '.');
        }
      } else {
        if (moneyStr === '0' || moneyStr === '0.00') {
          setMoneyStr(val);
        } else {
          // Limit to 2 decimals
          const parts = moneyStr.split('.');
          if (parts[1] && parts[1].length >= 2) return;
          setMoneyStr((prev) => prev + val);
        }
      }
    } else {
      if (val === 'C') {
        setWeightStr('0');
      } else if (val === 'DEL') {
        setWeightStr((prev) => (prev.length > 1 ? prev.slice(0, -1) : '0'));
      } else if (val === '.') {
        if (!weightStr.includes('.')) {
          setWeightStr((prev) => prev + '.');
        }
      } else {
        if (weightStr === '0') {
          setWeightStr(val);
        } else {
          // Limit to 3 decimals
          const parts = weightStr.split('.');
          if (parts[1] && parts[1].length >= 3) return;
          setWeightStr((prev) => prev + val);
        }
      }
    }
  };

  const handleConfirm = () => {
    if (calculatedKg <= 0 || calculatedTotalSoles <= 0) return;
    onConfirm(product, calculatedKg, calculatedTotalSoles);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-neutral-300 flex flex-col my-auto max-h-[95vh]">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-neutral-950 text-white flex items-center justify-between border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-neutral-950 flex items-center justify-center font-black shadow-md">
              <Scale className="w-5 h-5 text-neutral-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500 text-neutral-950">
                  Venta a Granel / Balanza
                </span>
                <span className="text-neutral-400 font-mono text-[11px]">
                  {product.sku}
                </span>
              </div>
              <h3 className="font-black text-sm sm:text-base text-white leading-tight mt-0.5 truncate max-w-[260px] sm:max-w-xs">
                {product.name}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-xl transition-colors cursor-pointer"
            aria-label="Cerrar modal de granel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Product Price & Stock Banner */}
        <div className="bg-emerald-50 px-4 py-2.5 border-b border-emerald-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-emerald-950 font-bold">
            <span>Precio Base:</span>
            <span className="font-mono text-sm text-emerald-800 font-black">
              S/ {pricePerKg.toFixed(2)} / kg
            </span>
          </div>
          <div className="text-neutral-600 font-mono text-[11px]">
            Stock en almacén: <strong className="text-neutral-900 font-bold">{product.stock} kg</strong>
          </div>
        </div>

        {/* Mode Switcher Tabs: Soles vs Peso */}
        <div className="p-3 bg-neutral-100 border-b border-neutral-200 flex gap-2">
          <button
            type="button"
            onClick={() => setMode('money')}
            className={`flex-1 min-h-[44px] py-2.5 px-3 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
              mode === 'money'
                ? 'bg-neutral-950 text-white shadow-md'
                : 'bg-white text-neutral-700 hover:text-black border border-neutral-200'
            }`}
          >
            <Coins className={`w-4 h-4 ${mode === 'money' ? 'text-emerald-400' : 'text-neutral-500'}`} />
            <span>1. Venta por Dinero (Soles S/)</span>
          </button>

          <button
            type="button"
            onClick={() => setMode('weight')}
            className={`flex-1 min-h-[44px] py-2.5 px-3 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
              mode === 'weight'
                ? 'bg-neutral-950 text-white shadow-md'
                : 'bg-white text-neutral-700 hover:text-black border border-neutral-200'
            }`}
          >
            <Scale className={`w-4 h-4 ${mode === 'weight' ? 'text-emerald-400' : 'text-neutral-500'}`} />
            <span>2. Venta por Peso (Kg / g)</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {mode === 'money' ? (
            /* MODO 1: POR MONEDA (EJ. "DAME 3 SOLES DE ARROZ") */
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black uppercase tracking-wider text-neutral-700 flex items-center gap-1.5">
                  <Coins className="w-4 h-4 text-emerald-600" />
                  Importe que pide el cliente (S/):
                </label>
                <span className="text-[11px] text-neutral-500 italic">
                  Ej: "Dame 3 soles de {product.name.split(' ')[0]}"
                </span>
              </div>

              {/* Big Currency Display Box */}
              <div className="bg-neutral-950 rounded-2xl p-3 sm:p-4 text-center border border-neutral-800 shadow-inner">
                <span className="text-xs text-neutral-400 font-bold uppercase tracking-widest block mb-1">
                  Monto a Cobrar
                </span>
                <div className="flex items-center justify-center gap-1.5 font-mono text-3xl sm:text-4xl font-black text-emerald-400 tracking-tight">
                  <span className="text-xl sm:text-2xl text-emerald-500 font-sans">S/</span>
                  <input
                    type="number"
                    step="0.10"
                    min="0"
                    value={moneyStr}
                    onChange={(e) => setMoneyStr(e.target.value)}
                    className="w-40 sm:w-48 bg-transparent text-center text-emerald-400 font-mono font-black focus:outline-none border-b-2 border-emerald-500/50 pb-0.5"
                    autoFocus
                  />
                </div>
              </div>

              {/* Quick Money Shortcut Pills (Common Peruvian denominations) */}
              <div>
                <label className="block text-[11px] font-bold text-neutral-500 mb-1.5">
                  Botones Rápidos en Soles:
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
                  {[1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10, 15, 20, 50].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => handleSelectMoneyPreset(amt)}
                      className={`py-2 px-1.5 rounded-xl font-mono text-xs font-black transition-all cursor-pointer text-center ${
                        moneyValue === amt
                          ? 'bg-emerald-500 text-neutral-950 shadow-sm ring-2 ring-emerald-600'
                          : 'bg-neutral-100 hover:bg-emerald-100 text-neutral-800 border border-neutral-200'
                      }`}
                    >
                      S/ {amt % 1 === 0 ? amt : amt.toFixed(2)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* MODO 2: POR PESO (KG / GRAMOS - BALANZA) */
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black uppercase tracking-wider text-neutral-700 flex items-center gap-1.5">
                  <Scale className="w-4 h-4 text-emerald-600" />
                  Peso a Despachar (Balanza Digital):
                </label>
                <div className="flex items-center bg-neutral-200 p-0.5 rounded-xl text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setWeightUnit('kg')}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                      weightUnit === 'kg' ? 'bg-neutral-950 text-white shadow-xs' : 'text-neutral-700'
                    }`}
                  >
                    Kilogramos (kg)
                  </button>
                  <button
                    type="button"
                    onClick={() => setWeightUnit('g')}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                      weightUnit === 'g' ? 'bg-neutral-950 text-white shadow-xs' : 'text-neutral-700'
                    }`}
                  >
                    Gramos (g)
                  </button>
                </div>
              </div>

              {/* Big Weight Display Box */}
              <div className="bg-neutral-950 rounded-2xl p-3 sm:p-4 text-center border border-neutral-800 shadow-inner">
                <span className="text-xs text-neutral-400 font-bold uppercase tracking-widest block mb-1">
                  Lectura de Balanza / Peso
                </span>
                <div className="flex items-center justify-center gap-2 font-mono text-3xl sm:text-4xl font-black text-cyan-400 tracking-tight">
                  <input
                    type="number"
                    step={weightUnit === 'kg' ? '0.001' : '1'}
                    min="0"
                    value={weightStr}
                    onChange={(e) => setWeightStr(e.target.value)}
                    className="w-40 sm:w-48 bg-transparent text-center text-cyan-400 font-mono font-black focus:outline-none border-b-2 border-cyan-500/50 pb-0.5"
                    autoFocus
                  />
                  <span className="text-xl sm:text-2xl text-cyan-500 font-sans font-black">
                    {weightUnit}
                  </span>
                </div>
              </div>

              {/* Quick Weight Fraction Pills */}
              <div>
                <label className="block text-[11px] font-bold text-neutral-500 mb-1.5">
                  Fracciones Populares de Peso:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {[
                    { label: '1/8 kg (125g)', kg: 0.125 },
                    { label: '1/4 kg (250g)', kg: 0.25 },
                    { label: '1/2 kg (500g)', kg: 0.5 },
                    { label: '3/4 kg (750g)', kg: 0.75 },
                    { label: '1.0 kg (1000g)', kg: 1.0 },
                    { label: '1.5 kg', kg: 1.5 },
                    { label: '2.0 kg', kg: 2.0 },
                    { label: '5.0 kg', kg: 5.0 },
                  ].map((preset) => (
                    <button
                      key={preset.kg}
                      type="button"
                      onClick={() => handleSelectWeightPreset(preset.kg)}
                      className={`py-2 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${
                        Math.abs(calculatedKg - preset.kg) < 0.001
                          ? 'bg-cyan-500 text-neutral-950 font-black shadow-sm ring-2 ring-cyan-600'
                          : 'bg-neutral-100 hover:bg-cyan-50 text-neutral-800 border border-neutral-200'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* DYNAMIC EQUIVALENCE CARD (THE "PERUVIAN GRANEL CONVERTER") */}
          <div className="bg-gradient-to-br from-neutral-900 to-neutral-950 text-white rounded-2xl p-4 border border-neutral-800 space-y-3 shadow-lg">
            <div className="flex items-center justify-between text-xs border-b border-neutral-800 pb-2">
              <span className="font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Resultado de Conversión Automática
              </span>
              <span className="text-[11px] text-neutral-400 font-mono">
                P.U.: S/ {pricePerKg.toFixed(2)}/kg
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 items-center">
              {/* Box 1: Peso a Despachar */}
              <div className="bg-neutral-800/80 p-3 rounded-xl border border-neutral-700">
                <span className="text-[10px] uppercase font-bold text-neutral-400 block">
                  ⚖️ Peso a Pesar/Servir:
                </span>
                <div className="text-xl sm:text-2xl font-mono font-black text-white mt-0.5">
                  {calculatedKg.toFixed(3)} <span className="text-xs font-sans text-neutral-400">kg</span>
                </div>
                <div className="text-[11px] text-emerald-400 font-mono font-bold mt-0.5">
                  ({calculatedGrams} gramos)
                </div>
              </div>

              {/* Box 2: Total en Soles */}
              <div className="bg-emerald-950/50 p-3 rounded-xl border border-emerald-800">
                <span className="text-[10px] uppercase font-bold text-emerald-300 block">
                  💰 Total a Cobrar en POS:
                </span>
                <div className="text-xl sm:text-2xl font-mono font-black text-emerald-400 mt-0.5">
                  S/ {calculatedTotalSoles.toFixed(2)}
                </div>
                <div className="text-[11px] text-neutral-400 font-mono mt-0.5">
                  Exacto para el cliente
                </div>
              </div>
            </div>

            <p className="text-[11px] text-neutral-400 bg-neutral-900/90 p-2 rounded-lg border border-neutral-800 text-center font-medium">
              💡 {mode === 'money'
                ? `Por S/ ${calculatedTotalSoles.toFixed(2)}, debes despachar exactamente ${calculatedKg.toFixed(3)} kg (${calculatedGrams}g) de ${product.name}.`
                : `Por ${calculatedKg.toFixed(3)} kg (${calculatedGrams}g), el importe a cobrar es exactamente S/ ${calculatedTotalSoles.toFixed(2)}.`}
            </p>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 bg-neutral-100 border-t border-neutral-200 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="py-3 px-4 bg-white hover:bg-neutral-200 text-neutral-800 rounded-xl font-bold text-xs border border-neutral-300 transition-colors cursor-pointer"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={calculatedKg <= 0 || calculatedTotalSoles <= 0}
            className="flex-1 py-3 px-4 bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 disabled:opacity-50 text-neutral-950 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer active:scale-[0.99]"
          >
            <Check className="w-5 h-5" />
            <span>
              Agregar al Carrito ({calculatedKg.toFixed(3)} kg = S/ {calculatedTotalSoles.toFixed(2)})
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
