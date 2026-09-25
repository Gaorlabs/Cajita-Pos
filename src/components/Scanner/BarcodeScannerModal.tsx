import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import {
  X,
  Camera,
  CameraOff,
  Flashlight,
  FlipHorizontal,
  Upload,
  AlertCircle,
  CheckCircle2,
  Barcode,
  Sparkles,
  RefreshCw,
  ShoppingBag,
  ArrowRight,
  ShieldAlert,
  HelpCircle,
} from 'lucide-react';

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (scannedCode: string) => void;
  title?: string;
  subtitle?: string;
  mode?: 'single' | 'continuous';
  // Optional list of already known products for previewing during continuous scan
  knownProducts?: Array<{ sku: string; barcode?: string; name: string; salePrice: number }>;
}

export const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({
  isOpen,
  onClose,
  onScan,
  title = 'Escanear Código de Barras',
  subtitle = 'Apunta la cámara del celular al código de barras del producto',
  mode = 'single',
  knownProducts = [],
}) => {
  const [cameras, setCameras] = useState<Array<{ id: string; label: string }>>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [isPermissionDenied, setIsPermissionDenied] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [lastScanned, setLastScanned] = useState<{ code: string; name?: string; time: number } | null>(null);
  const [scannedHistory, setScannedHistory] = useState<Array<{ code: string; name?: string; time: number }>>([]);
  const [torchOn, setTorchOn] = useState<boolean>(false);
  const [supportsTorch, setSupportsTorch] = useState<boolean>(false);
  const [isProcessingFile, setIsProcessingFile] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'camera' | 'demo-codes'>('camera');
  const [manualCodeInput, setManualCodeInput] = useState<string>('');

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const lastScanTimestamp = useRef<number>(0);
  const containerId = 'interactive-barcode-reader-view';

  // Sound & Vibration Feedback
  const triggerFeedback = (isSuccess: boolean = true) => {
    // 1. Vibration on mobile devices
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(isSuccess ? [80, 40, 80] : [200]);
      } catch {
        // ignore
      }
    }

    // 2. Audio Beep (Web Audio API)
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = isSuccess ? 'sine' : 'sawtooth';
      osc.frequency.setValueAtTime(isSuccess ? 1200 : 350, ctx.currentTime);
      if (isSuccess) {
        osc.frequency.exponentialRampToValueAtTime(1800, ctx.currentTime + 0.08);
      }

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.13);
    } catch {
      // ignore
    }
  };

  // Helper to handle a detected barcode
  const handleDecodedCode = (decodedText: string) => {
    const cleanCode = decodedText.trim();
    if (!cleanCode) return;

    // Debounce duplicate scans within 1.5 seconds if same code
    const now = Date.now();
    if (lastScanned?.code === cleanCode && now - lastScanTimestamp.current < 1500) {
      return;
    }
    lastScanTimestamp.current = now;

    // Check if it matches a known product
    const matched = knownProducts.find(
      (p) =>
        p.sku.toLowerCase() === cleanCode.toLowerCase() ||
        (p.barcode && p.barcode.toLowerCase() === cleanCode.toLowerCase())
    );

    triggerFeedback(true);
    setLastScanned({ code: cleanCode, name: matched?.name, time: now });
    setScannedHistory((prev) => [{ code: cleanCode, name: matched?.name, time: now }, ...prev.slice(0, 9)]);

    onScan(cleanCode);

    if (mode === 'single') {
      // In single mode, close right away after giving visual feedback
      setTimeout(() => {
        handleStopScanner();
        onClose();
      }, 500);
    }
  };

  // Stop camera stream safely
  const handleStopScanner = async () => {
    if (scannerRef.current) {
      try {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
        await scannerRef.current.clear();
      } catch (err) {
        console.warn('Notice when stopping scanner:', err);
      }
      scannerRef.current = null;
    }
    setIsCameraActive(false);
    setTorchOn(false);
  };

  // Start camera stream with graceful permission check & fallbacks
  const startCamera = async (cameraIdOrFacing?: string) => {
    setErrorMsg(null);
    setIsPermissionDenied(false);

    // Verify browser support for getUserMedia
    if (typeof navigator === 'undefined' || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setErrorMsg('Este navegador no admite captura de video directa. Puedes subir una foto o ingresar el código.');
      setIsCameraActive(false);
      return;
    }

    try {
      await handleStopScanner();

      // Check camera devices safely
      const deviceList = await Html5Qrcode.getCameras().catch((camErr) => {
        console.warn('Notice getting device cameras:', camErr?.name || camErr?.message);
        return [];
      });

      if (deviceList && deviceList.length > 0) {
        setCameras(deviceList);
        if (!selectedCameraId) {
          // Prefer environment/back camera if available
          const backCam = deviceList.find(
            (c) =>
              c.label.toLowerCase().includes('back') ||
              c.label.toLowerCase().includes('trasera') ||
              c.label.toLowerCase().includes('rear') ||
              c.label.toLowerCase().includes('environment')
          );
          setSelectedCameraId(backCam ? backCam.id : deviceList[deviceList.length - 1].id);
        }
      }

      // Initialize Html5Qrcode instance
      const formatsToSupport = [
        Html5QrcodeSupportedFormats.EAN_13,
        Html5QrcodeSupportedFormats.EAN_8,
        Html5QrcodeSupportedFormats.CODE_128,
        Html5QrcodeSupportedFormats.CODE_39,
        Html5QrcodeSupportedFormats.UPC_A,
        Html5QrcodeSupportedFormats.UPC_E,
        Html5QrcodeSupportedFormats.QR_CODE,
        Html5QrcodeSupportedFormats.ITF,
        Html5QrcodeSupportedFormats.CODABAR,
      ];

      const html5QrCode = new Html5Qrcode(containerId, {
        formatsToSupport,
        verbose: false,
      });
      scannerRef.current = html5QrCode;

      const runQrScanner = async (config: any) => {
        return await html5QrCode.start(
          config,
          {
            fps: 15,
            qrbox: (viewWidth, viewHeight) => {
              // Wide rectangular box optimized for linear retail barcodes
              const boxWidth = Math.floor(viewWidth * 0.85);
              const boxHeight = Math.floor(Math.min(viewHeight * 0.45, 180));
              return { width: Math.max(boxWidth, 200), height: Math.max(boxHeight, 120) };
            },
            aspectRatio: 1.333333,
          },
          (decodedText) => {
            handleDecodedCode(decodedText);
          },
          () => {
            // Normal: frame did not contain a recognizable barcode
          }
        );
      };

      try {
        const primaryConfig = cameraIdOrFacing
          ? { deviceId: { exact: cameraIdOrFacing } }
          : { facingMode: 'environment' };
        await runQrScanner(primaryConfig);
      } catch (primaryErr: any) {
        const isNotAllowed =
          primaryErr?.name === 'NotAllowedError' ||
          primaryErr?.name === 'PermissionDeniedError' ||
          `${primaryErr?.message}`.toLowerCase().includes('permission') ||
          `${primaryErr?.message}`.toLowerCase().includes('notallowed') ||
          `${primaryErr?.message}`.toLowerCase().includes('denied');

        if (isNotAllowed) {
          // Do not retry with another camera if user or system denied permission
          throw primaryErr;
        }

        // If environment camera failed due to unsupported constraints (e.g. desktop webcam without environment mode)
        if (!cameraIdOrFacing) {
          console.warn('Falling back to user facing camera or default device');
          await runQrScanner({ facingMode: 'user' });
        } else {
          throw primaryErr;
        }
      }

      setIsCameraActive(true);

      // Check torch capabilities
      try {
        const capabilities = html5QrCode.getRunningTrackCapabilities();
        if (capabilities && (capabilities as any).torch) {
          setSupportsTorch(true);
        }
      } catch {
        setSupportsTorch(false);
      }
    } catch (err: any) {
      // Use console.warn instead of console.error to avoid triggering unhandled runtime error alerts
      console.warn('Notice when initializing camera:', err?.name || err?.message || 'Access restricted');
      setIsCameraActive(false);

      const isDenied =
        err?.name === 'NotAllowedError' ||
        err?.name === 'PermissionDeniedError' ||
        `${err?.message}`.toLowerCase().includes('permission') ||
        `${err?.message}`.toLowerCase().includes('notallowed') ||
        `${err?.message}`.toLowerCase().includes('denied');

      if (isDenied) {
        setIsPermissionDenied(true);
        setErrorMsg('El acceso a la cámara no fue concedido o fue bloqueado en el navegador.');
      } else if (err?.name === 'NotFoundError' || err?.name === 'DevicesNotFoundError') {
        setErrorMsg('No se encontró ninguna cámara conectada en este dispositivo.');
      } else if (err?.name === 'NotReadableError' || err?.name === 'TrackStartError') {
        setErrorMsg('La cámara está en uso por otra aplicación o pestaña.');
      } else {
        setErrorMsg(err?.message || 'No se pudo iniciar la cámara en este navegador.');
      }
    }
  };

  // Toggle Torch
  const toggleTorch = async () => {
    if (!scannerRef.current || !isCameraActive) return;
    try {
      const nextState = !torchOn;
      await scannerRef.current.applyVideoConstraints({
        advanced: [{ torch: nextState } as any],
      });
      setTorchOn(nextState);
    } catch (err) {
      console.warn('Torch toggle notice:', err);
    }
  };

  // Switch between cameras
  const handleSwitchCamera = async () => {
    if (cameras.length <= 1) return;
    const currentIndex = cameras.findIndex((c) => c.id === selectedCameraId);
    const nextIndex = (currentIndex + 1) % cameras.length;
    const nextCamera = cameras[nextIndex];
    setSelectedCameraId(nextCamera.id);
    await startCamera(nextCamera.id);
  };

  // Scan from photo / gallery
  const handleFileScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsProcessingFile(true);
    setErrorMsg(null);

    try {
      let scanner = scannerRef.current;
      if (!scanner) {
        scanner = new Html5Qrcode(containerId, {
          formatsToSupport: [
            Html5QrcodeSupportedFormats.EAN_13,
            Html5QrcodeSupportedFormats.EAN_8,
            Html5QrcodeSupportedFormats.CODE_128,
            Html5QrcodeSupportedFormats.CODE_39,
            Html5QrcodeSupportedFormats.UPC_A,
            Html5QrcodeSupportedFormats.UPC_E,
            Html5QrcodeSupportedFormats.QR_CODE,
          ],
          verbose: false,
        });
      }

      if (scanner.isScanning) {
        await scanner.stop();
      }

      const decodedText = await scanner.scanFile(file, true);
      setIsProcessingFile(false);
      handleDecodedCode(decodedText);
    } catch {
      setIsProcessingFile(false);
      setErrorMsg('No se detectó un código de barras nítido en la imagen. Intenta enfocar más cerca con buena iluminación.');
    }
  };

  // Lifecycle
  useEffect(() => {
    if (isOpen) {
      setActiveTab('camera');
      setManualCodeInput('');
      const timer = setTimeout(() => {
        startCamera();
      }, 200);
      return () => {
        clearTimeout(timer);
        handleStopScanner();
      };
    } else {
      handleStopScanner();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Real world sample barcodes (EAN-13, etc.) for testing & simulation
  const SAMPLE_BARCODES = [
    { code: '7750106001221', name: 'Gaseosa Inca Kola 1.5L', category: 'Bebidas' },
    { code: '7750151000108', name: 'Leche Gloria Entera 400g', category: 'Lácteos' },
    { code: '7750243000504', name: 'Galletas Soda San Jorge', category: 'Snacks' },
    { code: '7751234567890', name: 'Paracetamol 500mg (Caja x 100)', category: 'Farmacia' },
    { code: 'SKU-1002', name: 'Aceite Vegetal Olaya 900ml', category: 'Abarrotes' },
    { code: 'SKU-1001', name: 'Arroz Extra Superior a Granel', category: 'Abarrotes' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[94vh] animate-in fade-in zoom-in-95 duration-150 text-white">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shadow-inner">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-white">{title}</h3>
                {mode === 'continuous' && (
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500 text-neutral-950">
                    Modo Rápido / Caja
                  </span>
                )}
              </div>
              <p className="text-xs text-neutral-400 line-clamp-1">{subtitle}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              handleStopScanner();
              onClose();
            }}
            className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-xl transition-colors cursor-pointer"
            title="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher: Cámara vs Códigos de Demostración */}
        <div className="flex border-b border-neutral-800 bg-neutral-950 px-4 pt-2 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('camera')}
            className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'camera'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Cámara del Dispositivo</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('demo-codes')}
            className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'demo-codes'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Códigos Reales de Prueba</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          
          {activeTab === 'camera' && (
            <>
              {/* Live Scanner Viewport */}
              <div className="relative rounded-2xl overflow-hidden bg-black border-2 border-neutral-800 aspect-4/3 flex items-center justify-center shadow-2xl">
                
                {/* HTML5 QR Container */}
                <div
                  id={containerId}
                  className="w-full h-full object-cover [&>video]:w-full [&>video]:h-full [&>video]:object-cover"
                />

                {/* Laser Overlay Guide when camera is active */}
                {isCameraActive && (
                  <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-6">
                    {/* Reticle Target */}
                    <div className="relative w-4/5 h-36 border-2 border-emerald-500/70 rounded-2xl shadow-[0_0_20px_rgba(16,185,129,0.3)] flex items-center justify-center overflow-hidden">
                      {/* Reticle Corners */}
                      <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-emerald-400 rounded-tl-lg" />
                      <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-emerald-400 rounded-tr-lg" />
                      <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-emerald-400 rounded-bl-lg" />
                      <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-emerald-400 rounded-br-lg" />

                      {/* Animated Emerald Laser Line */}
                      <div className="absolute left-0 right-0 h-0.5 bg-emerald-400 shadow-[0_0_12px_#10b981] animate-bounce duration-1000" />
                    </div>

                    <p className="mt-3 text-[11px] font-medium text-emerald-300/90 bg-neutral-900/80 backdrop-blur-xs px-3 py-1 rounded-full border border-emerald-500/30">
                      Centra el código de barras en el marco
                    </p>
                  </div>
                )}

                {/* Scanner Camera Inactive / Loading / Permission Denied Overlay */}
                {!isCameraActive && (
                  <div className="absolute inset-0 bg-neutral-950 flex flex-col items-center justify-center p-5 text-center space-y-3 overflow-y-auto">
                    {errorMsg ? (
                      <div className="max-w-sm flex flex-col items-center space-y-2.5">
                        <div
                          className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner ${
                            isPermissionDenied
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              : 'bg-red-500/10 text-red-400 border border-red-500/20'
                          }`}
                        >
                          {isPermissionDenied ? (
                            <CameraOff className="w-6 h-6" />
                          ) : (
                            <AlertCircle className="w-6 h-6" />
                          )}
                        </div>

                        <div>
                          <h4 className="font-bold text-xs sm:text-sm text-white">
                            {isPermissionDenied ? 'Permiso de Cámara Bloqueado o Denegado' : 'Cámara No Disponible'}
                          </h4>
                          <p className="text-[11px] text-neutral-300 mt-1 leading-relaxed">
                            {errorMsg}
                          </p>
                        </div>

                        {/* Instructions when permission is denied */}
                        {isPermissionDenied && (
                          <div className="bg-neutral-900/90 border border-neutral-800 rounded-xl p-3 text-left text-[11px] text-neutral-300 w-full space-y-1.5 shadow-sm">
                            <p className="font-semibold text-amber-400 flex items-center gap-1.5">
                              <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                              ¿Cómo otorgar el permiso?
                            </p>
                            <ol className="list-decimal list-inside space-y-1 text-neutral-400 text-[10px] leading-tight">
                              <li>Haz clic en el ícono de <span className="text-white font-medium">candado 🔒 o cámara</span> en la barra de URL del navegador.</li>
                              <li>En <span className="text-white font-medium">Cámara</span>, cambia la opción a <span className="text-emerald-400 font-bold">Permitir</span>.</li>
                              <li>Toca el botón <span className="text-white font-semibold">Reintentar cámara</span>.</li>
                            </ol>
                          </div>
                        )}

                        <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => {
                              setIsPermissionDenied(false);
                              setErrorMsg(null);
                              startCamera(selectedCameraId);
                            }}
                            className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                            <span>Reintentar cámara</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <Upload className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Subir Foto</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setActiveTab('demo-codes')}
                            className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-amber-300 border border-neutral-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                            <span>Códigos de Muestra</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <RefreshCw className="w-7 h-7 text-emerald-400 animate-spin" />
                        <p className="text-xs text-neutral-400">Iniciando cámara del dispositivo...</p>
                      </>
                    )}
                  </div>
                )}

                {/* Top Quick Actions (Torch, Flip Camera) */}
                {isCameraActive && (
                  <div className="absolute top-3 right-3 flex items-center gap-2">
                    {supportsTorch && (
                      <button
                        type="button"
                        onClick={toggleTorch}
                        className={`p-2.5 rounded-xl backdrop-blur-md transition-all cursor-pointer ${
                          torchOn
                            ? 'bg-amber-400 text-neutral-950 shadow-lg'
                            : 'bg-black/60 text-white hover:bg-black/80'
                        }`}
                        title="Linterna / Flash"
                      >
                        <Flashlight className="w-4 h-4" />
                      </button>
                    )}
                    {cameras.length > 1 && (
                      <button
                        type="button"
                        onClick={handleSwitchCamera}
                        className="p-2.5 rounded-xl bg-black/60 text-white hover:bg-black/80 backdrop-blur-md transition-all cursor-pointer"
                        title="Cambiar Cámara"
                      >
                        <FlipHorizontal className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Upload photo fallback & tips */}
              <div className="flex items-center justify-between gap-2 text-xs">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileScan}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isProcessingFile}
                  className="px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 flex items-center gap-2 font-medium transition-colors cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{isProcessingFile ? 'Leyendo imagen...' : 'Subir o tomar foto de código'}</span>
                </button>

                <span className="text-[11px] text-neutral-400">
                  Formatos: EAN-13, EAN-8, CODE-128, QR
                </span>
              </div>
            </>
          )}

          {/* Quick Manual Barcode Input Fallback - Always available */}
          <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-2xl space-y-2">
            <div className="flex items-center justify-between text-[11px] text-neutral-400">
              <span className="flex items-center gap-1.5 font-medium text-neutral-300">
                <Barcode className="w-3.5 h-3.5 text-emerald-400" />
                Ingreso Rápido por Teclado / Pistola USB:
              </span>
              <span className="text-[10px] text-neutral-500">¿Sin cámara? Escribe directo</span>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (manualCodeInput.trim()) {
                  handleDecodedCode(manualCodeInput.trim());
                  setManualCodeInput('');
                }
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={manualCodeInput}
                onChange={(e) => setManualCodeInput(e.target.value)}
                placeholder="Escribe el código de barras o SKU (ej. 7750106001221)"
                className="flex-1 px-3 py-2 bg-neutral-900 border border-neutral-700 focus:border-emerald-500 rounded-xl text-xs text-white placeholder-neutral-500 outline-hidden font-mono"
              />
              <button
                type="submit"
                disabled={!manualCodeInput.trim()}
                className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:hover:bg-neutral-800 text-neutral-950 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <span>Usar</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

          {/* Tab 2: Códigos Reales de Prueba (Simulador interactivo) */}
          {activeTab === 'demo-codes' && (
            <div className="space-y-3">
              <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-2xl">
                <p className="text-xs text-neutral-300">
                  <span className="font-bold text-amber-400">¿No tienes un producto físico a mano o la cámara está bloqueada?</span> Haz clic en cualquiera de estos códigos reales para simular la lectura inmediata como si hubieras apuntado con la cámara:
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {SAMPLE_BARCODES.map((item) => (
                  <button
                    key={item.code}
                    type="button"
                    onClick={() => handleDecodedCode(item.code)}
                    className="p-3 rounded-2xl bg-neutral-800/80 hover:bg-neutral-700/80 border border-neutral-700 hover:border-emerald-500/50 transition-all text-left flex items-start justify-between group cursor-pointer"
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <Barcode className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="font-mono font-bold text-xs text-emerald-300">{item.code}</span>
                      </div>
                      <div className="font-medium text-xs text-white mt-1 group-hover:text-emerald-300 transition-colors">
                        {item.name}
                      </div>
                      <div className="text-[10px] text-neutral-400">{item.category}</div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-neutral-900 text-neutral-300 group-hover:bg-emerald-500 group-hover:text-neutral-950 transition-all">
                      Probar
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Last Scanned Feedback Banner */}
          {lastScanned && (
            <div className="p-3.5 rounded-2xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-200 flex items-center justify-between animate-in fade-in duration-200">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-xl bg-emerald-500 text-neutral-950 flex items-center justify-center font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>Código detectado:</span>
                    <span className="font-mono text-emerald-400">{lastScanned.code}</span>
                  </div>
                  <div className="text-[11px] text-emerald-300">
                    {lastScanned.name ? `Producto: ${lastScanned.name}` : 'Enviado al sistema con éxito'}
                  </div>
                </div>
              </div>
              <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-900/60 px-2 py-1 rounded-lg">
                Leído
              </span>
            </div>
          )}

          {/* Continuous Mode Scanned History */}
          {mode === 'continuous' && scannedHistory.length > 0 && (
            <div className="p-3 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-neutral-300">
                <span className="flex items-center gap-1.5">
                  <ShoppingBag className="w-3.5 h-3.5 text-emerald-400" />
                  Artículos escaneados en esta sesión ({scannedHistory.length})
                </span>
                <span className="text-[10px] text-neutral-500">Últimos</span>
              </div>
              <div className="space-y-1 max-h-24 overflow-y-auto">
                {scannedHistory.map((h, idx) => (
                  <div
                    key={`${h.code}-${h.time}-${idx}`}
                    className="flex items-center justify-between text-[11px] py-1 px-2 rounded-lg bg-neutral-900 border border-neutral-800"
                  >
                    <span className="font-mono text-emerald-400 font-bold">{h.code}</span>
                    <span className="text-neutral-300 truncate max-w-[160px]">
                      {h.name || 'Producto detectado'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-neutral-800 bg-neutral-950 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              handleStopScanner();
              onClose();
            }}
            className="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-bold text-neutral-300 transition-colors cursor-pointer"
          >
            Cerrar
          </button>

          {mode === 'continuous' && (
            <button
              type="button"
              onClick={() => {
                handleStopScanner();
                onClose();
              }}
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-black text-xs transition-all shadow-lg flex items-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Finalizar y Ver Venta ({scannedHistory.length})</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
