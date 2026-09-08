import React from 'react';

interface MariaLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg';
  variant?: 'dark' | 'light'; // dark text for light bg, light text for dark bg
  showByline?: boolean;
  bylineText?: string;
  withLink?: boolean;
  prefix?: string;
  className?: string;
}

export const MariaRocketIcon: React.FC<{ className?: string; size?: number }> = ({
  className = 'w-6 h-6',
  size,
}) => {
  return (
    <svg
      viewBox="0 0 80 84"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={size ? { width: size, height: size } : undefined}
    >
      {/* Left Wing / Fin */}
      <path
        d="M21 44C13 47 11 58 13 63C19 62 23 57 25 51L21 44Z"
        fill="#6D28D9"
      />
      {/* Right Wing / Fin */}
      <path
        d="M59 44C67 47 69 58 67 63C61 62 57 57 55 51L59 44Z"
        fill="#6D28D9"
      />

      {/* Bottom Feet / Thrusters */}
      <rect x="25" y="60" width="8" height="12" rx="4" fill="#6D28D9" />
      <rect x="47" y="60" width="8" height="12" rx="4" fill="#6D28D9" />

      {/* Main Rocket Body (Capsule) */}
      <path
        d="M20 32C20 18 28 8 40 8C52 8 60 18 60 32V52C60 60 52 65 40 65C28 65 20 60 20 52V32Z"
        fill="#7C3AED"
      />

      {/* Top Dome Cap (Pink/Magenta) */}
      <path
        d="M29 18C31 11 49 11 51 18C47 21 33 21 29 18Z"
        fill="#F43F5E"
      />

      {/* Big Visor / Mint Green Belly */}
      <circle cx="40" cy="38" r="14" fill="#34D399" />

      {/* Alien Eye / Pupil (Dark Purple) */}
      <circle cx="40" cy="38" r="7.5" fill="#2E1065" />

      {/* Eye Reflection / Light Shine */}
      <circle cx="37.5" cy="35.5" r="2.4" fill="#FFFFFF" />
    </svg>
  );
};

export const MariaLogo: React.FC<MariaLogoProps> = ({
  size = 'md',
  variant = 'dark',
  showByline = true,
  bylineText = 'by GaorSystem',
  withLink = true,
  prefix = 'Desarrollado por',
  className = '',
}) => {
  const iconSizes = {
    xs: 18,
    sm: 22,
    md: 28,
    lg: 38,
  };

  const textSizes = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl',
  };

  const content = (
    <div className={`inline-flex flex-col items-center group transition-all ${className}`}>
      {prefix && (
        <span
          className={`text-[10px] font-medium tracking-tight mb-0.5 ${
            variant === 'light' ? 'text-neutral-300' : 'text-neutral-500'
          }`}
        >
          {prefix}
        </span>
      )}

      <div className="flex items-center gap-1.5 leading-none">
        {/* Rocket Mascot */}
        <div className="transition-transform group-hover:scale-110 duration-200">
          <MariaRocketIcon size={iconSizes[size]} />
        </div>

        {/* MarIA typography: "Mar" in dark navy / white + "IA" in violet */}
        <div className="flex flex-col text-left">
          <div
            className={`font-black tracking-tight ${textSizes[size]} ${
              variant === 'light' ? 'text-white' : 'text-[#1E1B4B]'
            }`}
          >
            <span>Mar</span>
            <span className="text-[#7C3AED] group-hover:text-[#6D28D9] transition-colors">IA</span>
          </div>

          {showByline && (
            <span
              className={`text-[9px] font-semibold tracking-wide leading-tight mt-0.5 ${
                variant === 'light' ? 'text-emerald-300/90' : 'text-neutral-500'
              }`}
            >
              {bylineText}
            </span>
          )}
        </div>
      </div>
    </div>
  );

  if (withLink) {
    return (
      <a
        href="https://maria-vert.vercel.app/"
        target="_blank"
        rel="noopener noreferrer"
        title="Desarrollado por MarIA by GaorSystem (https://maria-vert.vercel.app/)"
        className="inline-block hover:opacity-90 cursor-pointer"
      >
        {content}
      </a>
    );
  }

  return content;
};
