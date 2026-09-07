import React from 'react';

interface CajitaLogoProps {
  className?: string;
  size?: number;
  variant?: 'filled' | 'light' | 'iconOnly';
  bgHex?: string;
  lidHex?: string;
  checkHex?: string;
}

export const CajitaLogo: React.FC<CajitaLogoProps> = ({
  className = '',
  size = 36,
  variant = 'filled',
  bgHex,
  lidHex,
  checkHex,
}) => {
  // Determine color scheme based on variant if custom hexes not supplied
  let bg = bgHex ?? '#2E7D5B';
  let boxFill = lidHex ?? '#EAF3EC';
  let checkColor = checkHex ?? '#2E7D5B';

  if (variant === 'light') {
    bg = bgHex ?? '#FAF6F0';
    boxFill = lidHex ?? '#2E7D5B';
    checkColor = checkHex ?? '#FAF6F0';
  } else if (variant === 'iconOnly') {
    boxFill = lidHex ?? '#2E7D5B';
    checkColor = checkHex ?? '#FFFFFF';
  }

  const svgElement = (
    <svg
      width={variant === 'iconOnly' ? size : Math.round(size * 0.58)}
      height={variant === 'iconOnly' ? size : Math.round(size * 0.58)}
      viewBox="0 0 34 34"
      fill="none"
    >
      <rect x="4" y="12" width="26" height="18" rx="3" fill={boxFill} />
      <path
        d="M4 12 L17 4 L30 12"
        stroke={boxFill}
        strokeWidth="2.5"
        fill="none"
        strokeLinejoin="round"
      />
      <path
        d="M12 19 L15.5 23 L23 14"
        stroke={checkColor}
        strokeWidth="2.8"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  if (variant === 'iconOnly') {
    return <div className={`inline-flex items-center justify-center ${className}`}>{svgElement}</div>;
  }

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: Math.round(size * 0.25),
        backgroundColor: bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
      className={className}
    >
      {svgElement}
    </div>
  );
};

