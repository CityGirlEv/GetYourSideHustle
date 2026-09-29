import React from 'react';

interface LogoProps {
  variant?: 'horizontal' | 'seal-only' | 'stacked';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ variant = 'horizontal', size = 'md', className = '' }) => {
  const sealSizes = {
    sm: 'w-8 h-8 sm:w-11 sm:h-11',
    md: 'w-12 h-12 sm:w-20 sm:h-20',
    lg: 'w-16 h-16 sm:w-32 sm:h-32',
    xl: 'w-12 h-12 sm:w-28 sm:h-28 md:w-36 md:h-36 lg:w-44 lg:h-44',
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-xl sm:text-2xl',
    lg: 'text-2xl sm:text-3xl',
    xl: 'text-4xl sm:text-5xl',
  };

  if (variant === 'seal-only') {
    return (
      <img
        src="/images/official_logo_seal.png"
        alt="MY PLAN, NOT MY MOOD — Official Brand Logo Seal"
        className={`${sealSizes[size]} object-contain drop-shadow-md transition-transform hover:scale-105 ${className}`}
      />
    );
  }

  if (variant === 'stacked') {
    return (
      <div className={`flex flex-col items-center text-center ${className}`}>
        <img
          src="/images/official_logo_seal.png"
          alt="MY PLAN, NOT MY MOOD — Official Brand Logo Seal"
          className={`${sealSizes[size]} object-contain drop-shadow-xl mb-3 bg-transparent mix-blend-multiply`}
        />
        <div className="font-serif font-black tracking-tight text-current uppercase">
          MY PLAN, <span className="italic font-extrabold">NOT MY MOOD</span>
        </div>
        <div className="text-xs tracking-widest uppercase font-mono mt-1 opacity-80 font-semibold">
          Focus • Discipline • Freedom
        </div>
      </div>
    );
  }

  // Default: Horizontal Header Logo (Logo Seal on the Side)
  return (
    <div className={`flex items-center gap-3 sm:gap-4 ${className}`}>
      <img
        src="/images/official_logo_seal.png"
        alt="MY PLAN, NOT MY MOOD — Official Brand Logo Seal"
        className={`${sealSizes[size]} object-contain drop-shadow-md bg-transparent mix-blend-multiply shrink-0`}
      />
      <div>
        <div className={`font-black tracking-tight uppercase leading-none font-sans ${textSizes[size]}`}>
          MY PLAN, <span className="italic">NOT MY MOOD</span>
        </div>
        <div className="text-xs tracking-widest uppercase font-mono mt-1 font-semibold opacity-75">
          Focus • Discipline • Freedom
        </div>
      </div>
    </div>
  );
};

export default Logo;
