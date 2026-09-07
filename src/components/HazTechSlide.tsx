import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Share2, 
  Copy, 
  Check, 
  Calendar, 
  Download, 
  ExternalLink,
  Edit3,
  RefreshCw,
  Sliders,
  ChevronRight,
  Tv,
  Zap,
  Info
} from 'lucide-react';

interface HazTechSlideProps {
  onClose?: () => void;
}

export const HazTechSlide: React.FC<HazTechSlideProps> = ({ onClose }) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'preview' | 'editor'>('preview');
  const [aspectRatio, setAspectRatio] = useState<'square' | 'portrait' | 'landscape'>('portrait');
  const [themeMode, setThemeMode] = useState<'warm' | 'dark' | 'clean'>('warm');

  // Editable fields for live tuning
  const [headline, setHeadline] = useState('Por eso la IA te hace perder tiempo');
  const [subheadline, setSubheadline] = useState('A un practicante nuevo le das todo lo que necesita. A la IA no le das nada.');
  
  const [humanPoints, setHumanPoints] = useState([
    'Usuario y contraseñas',
    'Cómo se hacen las cosas acá',
    'Los formatos de la empresa',
    'Un rato de tu tiempo'
  ]);

  const [aiPointMain, setAiPointMain] = useState('Una ventana en blanco');
  const [aiPointSub, setAiPointSub] = useState('y le pediste que adivinara');

  const [statPercent, setStatPercent] = useState('37%');
  const [statText, setStatText] = useState('del tiempo que la IA te ahorra se va corrigiendo lo que hizo mal');
  const [statSource, setStatSource] = useState('Workday, encuesta a 3.200 empleados');

  const [eventDate, setEventDate] = useState('LUNES 7 · 7:30 PM (COL)');
  const [eventTitle, setEventTitle] = useState('Clase gratis en vivo');
  const [eventSubtitle, setEventSubtitle] = useState('Esto podría explicar por qué la IA no te está ahorrando el tiempo que esperabas.');

  // Countdown simulation
  const [timeLeft, setTimeLeft] = useState({ hours: 4, minutes: 28, seconds: 15 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleCopyText = () => {
    const fullText = `${headline}\n\n${subheadline}\n\nAl practicante le diste:\n${humanPoints.map(p => `• ${p}`).join('\n')}\n\nA la IA le diste:\n• ${aiPointMain} ${aiPointSub}\n\n${statPercent} ${statText} (${statSource})\n\n${eventTitle}: ${eventDate}`;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Theme styling configurations
  const getThemeBg = () => {
    if (themeMode === 'dark') return 'bg-[#0E1110] text-[#F1EFE8]';
    if (themeMode === 'clean') return 'bg-[#FFFFFF] text-[#0A0A0A]';
    return 'bg-[#F7F5EF] text-[#0A0A0A]'; // Warm Cream (matches original image)
  };

  const getContainerSize = () => {
    if (aspectRatio === 'square') return 'max-w-[620px] aspect-square';
    if (aspectRatio === 'landscape') return 'max-w-[840px] aspect-[16/10]';
    return 'max-w-[680px]'; // Portrait natural
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col items-center justify-start p-3 sm:p-6 overflow-y-auto font-sans selection:bg-[#2E7D5B] selection:text-white">
      
      {/* Top Toolbar */}
      <div className="w-full max-w-[680px] mb-4 bg-[#1C1C1A] border border-[#333330] rounded-2xl p-2.5 px-4 flex flex-wrap items-center justify-between gap-3 text-white shadow-xl">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#2E7D5B] flex items-center justify-center shrink-0">
            <Zap className="w-4 h-4 text-[#EAF3EC]" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-[#F1EFE8] leading-tight">Haz Tech • Visual Studio</h3>
            <p className="text-[10px] text-[#B4B2A9]">Modo presentación interactiva</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Theme toggles */}
          <div className="bg-[#262624] p-1 rounded-xl flex items-center gap-1 border border-[#383835]">
            <button
              onClick={() => setThemeMode('warm')}
              className={`px-2 py-1 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                themeMode === 'warm' ? 'bg-[#F7F5EF] text-black shadow-xs' : 'text-[#B4B2A9] hover:text-white'
              }`}
              title="Fondo Crema Cálido"
            >
              Crema
            </button>
            <button
              onClick={() => setThemeMode('dark')}
              className={`px-2 py-1 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                themeMode === 'dark' ? 'bg-[#2E7D5B] text-white shadow-xs' : 'text-[#B4B2A9] hover:text-white'
              }`}
              title="Fondo Oscuro Premium"
            >
              Oscuro
            </button>
            <button
              onClick={() => setThemeMode('clean')}
              className={`px-2 py-1 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                themeMode === 'clean' ? 'bg-white text-black shadow-xs' : 'text-[#B4B2A9] hover:text-white'
              }`}
              title="Fondo Blanco Puro"
            >
              Blanco
            </button>
          </div>

          <button
            onClick={handleCopyText}
            className="px-3 py-1.5 bg-[#2E7D5B] hover:bg-[#235F45] text-[#FAF6F0] text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? '¡Copiado!' : 'Copiar Texto'}</span>
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 text-[#888880] hover:text-white hover:bg-[#262624] rounded-xl transition-colors cursor-pointer"
            >
              <XCircle className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Rendered Graphic Card Container */}
      <div className={`w-full ${getContainerSize()} ${getThemeBg()} rounded-3xl p-6 sm:p-8 shadow-2xl transition-all duration-300 relative border border-neutral-300/40 flex flex-col justify-between my-auto`}>
        
        {/* Card Header: Brand & Live Tag */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <span className="text-xl sm:text-2xl font-black tracking-tight text-[#0A0A0A] font-sans">
              Haz Tech
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-[#BBF7D0] text-[#14532D] text-[11px] font-bold flex items-center gap-1.5 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse" />
              en vivo
            </span>
          </div>

          <div className="flex items-center gap-1.5 font-bold text-sm tracking-tight text-[#262626]">
            <span className="lowercase font-serif italic text-base">aztec</span>
            <Sparkles className="w-3.5 h-3.5 text-[#16A34A]" />
          </div>
        </div>

        {/* Main Title & Subtitle Section */}
        <div className="mb-6 space-y-2">
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-[#0A0A0A] leading-[1.15]">
            {headline}
          </h1>
          <p className="text-sm sm:text-base text-[#404040] font-medium leading-relaxed max-w-xl">
            {subheadline}
          </p>
        </div>

        {/* Comparison Grid (Practicante vs IA) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {/* Left Card: Al practicante le diste */}
          <div className="bg-white/90 border border-neutral-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between transition-all hover:shadow-md">
            <div>
              <h3 className="text-sm font-bold text-[#0A0A0A] mb-3 flex items-center gap-1.5">
                Al practicante le diste
              </h3>
              <ul className="space-y-2 text-xs sm:text-sm font-semibold text-[#262626]">
                {humanPoints.map((pt, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-[#16A34A] font-black shrink-0">•</span>
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right Card: A la IA le diste */}
          <div className="bg-[#1C2B24] border border-[#235F45] text-[#FAF6F0] rounded-2xl p-5 shadow-md flex flex-col justify-between transition-all hover:bg-[#14211B]">
            <div>
              <h3 className="text-sm font-bold text-[#FAF6F0] mb-3">
                A la IA le diste
              </h3>
              <div className="mt-2 space-y-1">
                <p className="text-lg sm:text-xl font-bold text-white leading-snug">
                  {aiPointMain}
                </p>
                <p className="text-xs sm:text-sm text-[#EAF3EC] font-medium italic">
                  {aiPointSub}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Metric / Stat Highlight Banner */}
        <div className="bg-[#A3E635] text-[#0A0A0A] rounded-2xl p-4 sm:p-5 flex items-center gap-4 shadow-sm mb-6 transition-all hover:scale-[1.01]">
          <div className="text-3xl sm:text-5xl font-black font-sans shrink-0 tracking-tight text-[#0B2D23]">
            {statPercent}
          </div>
          <div className="space-y-0.5 min-w-0">
            <p className="text-xs sm:text-sm font-bold leading-snug text-[#0B2D23]">
              {statText}
            </p>
            <p className="text-[10px] sm:text-xs text-[#1E523A] font-medium">
              {statSource}
            </p>
          </div>
        </div>

        {/* Footer Section: Event Date & Live Class Info */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2">
          {/* Left Date Pill */}
          <div className="px-3.5 py-2 bg-[#0B2D23] text-white rounded-xl text-xs font-bold font-mono tracking-wider shadow-xs flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-[#A7F3D0] animate-spin" style={{ animationDuration: '8s' }} />
            <span>{eventDate}</span>
          </div>

          {/* Right Class Promo Tag */}
          <div className="text-left sm:text-right">
            <span className="text-xs font-bold text-[#0A0A0A] block">
              {eventTitle}
            </span>
            <span className="text-[10px] text-[#525252] font-medium block truncate max-w-xs">
              {eventSubtitle}
            </span>
          </div>
        </div>

      </div>

      {/* Live Countdown & Interactive Tip Banner below graphic */}
      <div className="w-full max-w-[680px] mt-4 bg-[#181816] border border-[#2E2E2A] rounded-2xl p-4 text-[#F1EFE8] flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#2E7D5B]/20 border border-[#2E7D5B]/40 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5 text-[#2E7D5B]" />
          </div>
          <div>
            <span className="text-xs font-bold text-[#F1EFE8] block">Inicia en vivo en:</span>
            <div className="flex items-center gap-1.5 text-sm font-bold font-mono text-[#2E7D5B]">
              <span>{String(timeLeft.hours).padStart(2, '0')}h</span>
              <span>:</span>
              <span>{String(timeLeft.minutes).padStart(2, '0')}m</span>
              <span>:</span>
              <span>{String(timeLeft.seconds).padStart(2, '0')}s</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyText}
            className="px-3.5 py-2 bg-[#2E7D5B] hover:bg-[#235F45] text-[#FAF6F0] rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Compartir Placa</span>
          </button>
        </div>
      </div>

    </div>
  );
};
