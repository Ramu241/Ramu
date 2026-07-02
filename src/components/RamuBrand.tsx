import React from 'react';

interface RamuBrandProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  onAdminTrigger?: () => void;
}

export default function RamuBrand({ className = '', size = 'md', showSubtitle = true, onAdminTrigger }: RamuBrandProps) {
  let sizeClass = 'text-lg';
  let iconSize = 'text-xl';
  
  if (size === 'sm') {
    sizeClass = 'text-sm';
    iconSize = 'text-base';
  } else if (size === 'lg') {
    sizeClass = 'text-2xl md:text-3xl';
    iconSize = 'text-3xl';
  } else if (size === 'xl') {
    sizeClass = 'text-4xl md:text-5xl';
    iconSize = 'text-5xl';
  }

  return (
    <div 
      onClick={onAdminTrigger}
      className={`flex flex-col items-center justify-center text-center select-none ${className} ${onAdminTrigger ? 'cursor-pointer active:scale-95 transition-transform' : ''}`}
    >
      <div className="relative group flex items-center gap-2">
        {/* Glowing Background Glows */}
        <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 rounded-lg blur opacity-40 group-hover:opacity-70 transition duration-1000 group-hover:duration-200"></div>
        
        <div className="relative px-4 py-2 bg-slate-950 border border-amber-500/50 rounded-lg flex items-center justify-center gap-2">
          <span className={`glowing-brand ${sizeClass} tracking-wider font-extrabold bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500 bg-clip-text text-transparent drop-shadow-md`}>
            🎭╰‿╯RAMUㅤᏴᎻᎪᏆ
          </span>
        </div>
      </div>
      
      {showSubtitle && (
        <span className="mt-1 text-[10px] uppercase tracking-[0.25em] text-amber-500/80 font-bold font-gaming">
          ★ EXCLUSIVE PLATINUM ROYAL CLUB ★
        </span>
      )}
    </div>
  );
}
