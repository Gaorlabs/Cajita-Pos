import React from 'react';
import {
  X,
  Barcode,
  Camera,
  PackagePlus,
  ShoppingCart,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  ScanLine,
  Zap,
  HelpCircle,
} from 'lucide-react';
import { Product } from '../../types';

interface BarcodeWorkflowGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenRegisterProduct: () => void;
  onOpenLiveScanner: () => void;
  onSimulateCode: (code: string) => void;
  products: Product[];
}

export const BarcodeWorkflowGuideModal: React.FC<BarcodeWorkflowGuideModalProps> = ({
  isOpen,
  onClose,
  onOpenRegisterProduct,
  onOpenLiveScanner,
  onSimulateCode,
  products,
}) => {
  if (!isOpen) return null;

  // Find a product that already has a barcode or SKU to test finding it
  const sampleRegisteredProduct = products.find((p) => p.sku || p.barcode) || products[0];

  // A realistic barcode for testing an unregistered product (e.g. standard Peruvian retail EAN-13)
  const testUnregisteredCode = '7750106001221';

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border border-neutral-200 flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-neutral-900 via-neutral-900 to-neutral-800 text-white flex items-start justify-between">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0 shadow-inner">
              <Barcode className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-lg text-white">¿Cómo funciona el Código de Barras?</h3>
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500 text-neutral-950">
                  Prueba Real
                </span>
              </div>
              <p className="text-xs text-neutral-300 mt-1 leading-relaxed">
                Flujo completo en 2 pasos: cómo registrar un producto físico y cómo llamarlo al vender.
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

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-neutral-800">
          
          {/* Paso 1: Registro */}
          <div className="p-4 sm:p-5 rounded-2xl border-2 border-neutral-200 bg-neutral-50/60 hover:border-emerald-500/50 transition-all space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-500 text-neutral-950 font-black text-sm flex items-center justify-center shrink-0">
                  1
                </div>
                <div>
                  <h4 className="font-black text-sm text-neutral-900 flex items-center gap-2">
                    <span>Registrar el producto con su código de barras</span>
                    <PackagePlus className="w-4 h-4 text-emerald-600" />
                  </h4>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Se hace una sola vez cuando entra mercadería nueva al negocio.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenRegisterProduct();
                }}
                className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-neutral-950 font-black text-xs shadow-sm flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
              >
                <span>Probar Registro</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-neutral-200 text-xs text-neutral-600 space-y-2">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <p>
                  <strong>En el formulario de producto:</strong> El campo <em>"Código de Barras / SKU"</em> tiene un botón de cámara 📷.
                </p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <p>
                  <strong>Apunta con tu celular:</strong> Al escanear el empaque físico (o tipear el número del código), el código se autocompleta al instante. Le pones nombre, precio y stock, y guardas.
                </p>
              </div>
            </div>
          </div>

          {/* Paso 2: Ubicar y Vender */}
          <div className="p-4 sm:p-5 rounded-2xl border-2 border-neutral-200 bg-neutral-50/60 hover:border-emerald-500/50 transition-all space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-neutral-900 text-white font-black text-sm flex items-center justify-center shrink-0">
                  2
                </div>
                <div>
                  <h4 className="font-black text-sm text-neutral-900 flex items-center gap-2">
                    <span>Ubicar y llamar el producto al momento de vender</span>
                    <ShoppingCart className="w-4 h-4 text-emerald-600" />
                  </h4>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    El cajero atiende en segundos sin tener que buscar el producto con el mouse.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenLiveScanner();
                }}
                className="px-3.5 py-2 rounded-xl bg-neutral-900 hover:bg-black active:scale-95 text-white font-black text-xs shadow-sm flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
              >
                <Camera className="w-3.5 h-3.5 text-emerald-400" />
                <span>Abrir Escáner de Venta</span>
              </button>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-neutral-200 text-xs text-neutral-600 space-y-2">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <p>
                  <strong>Con cámara del celular o laptop:</strong> Toca el botón <em>"Cámara"</em> en el punto de venta. Enfocas el código y el sistema hace un <em>"bip"</em> sonoro y lo suma inmediatamente al carrito de venta.
                </p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <p>
                  <strong>Con lector / pistola USB o buscador:</strong> Si usas una pistola láser USB o escribes el código en el buscador y das Enter, el producto se agrega a la venta automáticamente.
                </p>
              </div>
            </div>

            {/* Test finding an already registered product */}
            {sampleRegisteredProduct && (
              <div className="pt-1 flex items-center justify-between bg-emerald-50/80 border border-emerald-200 rounded-xl p-3">
                <div className="text-xs">
                  <span className="font-bold text-emerald-950">Prueba rápida con producto ya registrado:</span>
                  <div className="text-[11px] text-emerald-800 font-medium">
                    {sampleRegisteredProduct.name} (Código: <span className="font-mono font-bold">{sampleRegisteredProduct.barcode || sampleRegisteredProduct.sku}</span>)
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onSimulateCode(sampleRegisteredProduct.barcode || sampleRegisteredProduct.sku);
                  }}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
                >
                  Probar Ubicarlo
                </button>
              </div>
            )}
          </div>

          {/* Caso Especial: ¿Qué pasa si el producto NO estaba registrado? */}
          <div className="p-4 sm:p-5 rounded-2xl border-2 border-amber-200 bg-amber-50/60 space-y-2.5">
            <div className="flex items-center gap-2 text-amber-950 font-black text-xs sm:text-sm">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>¿Y si escaneas un código nuevo que nunca registraste? (Registro Exprés)</span>
            </div>
            <p className="text-xs text-amber-900 leading-relaxed">
              El sistema no arroja error ni borra la venta. Reconoce que es un código nuevo y muestra un aviso: 
              <strong className="block mt-1 font-mono text-[11px] bg-white p-2 rounded-lg border border-amber-300">
                "Código no registrado: 7750106001221. ¿Deseas registrar este producto nuevo?"
              </strong>
              Al pulsar <strong>"Registrar Producto"</strong>, el código ya viene escrito. Rellenas el nombre y precio, y al guardar <strong>se agrega automáticamente a la venta en curso</strong> para no hacer esperar al cliente.
            </p>
            <div className="pt-1">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onSimulateCode(testUnregisteredCode);
                }}
                className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold rounded-xl text-xs transition-all shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Simular escaneo de código no registrado ({testUnregisteredCode})</span>
              </button>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-200 bg-neutral-50 flex items-center justify-between">
          <p className="text-[11px] text-neutral-500">
            Compatible con lectores USB, Bluetooth y cámaras móviles (EAN-13, CODE-128, etc.)
          </p>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-black text-white text-xs font-bold transition-colors cursor-pointer"
          >
            Entendido
          </button>
        </div>

      </div>
    </div>
  );
};
