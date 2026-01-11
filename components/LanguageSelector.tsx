
import React from 'react';
import { LANGUAGES } from '../constants';
import { LanguageCode } from '../types';

interface Props {
  onSelect: (code: LanguageCode) => void;
}

const LanguageSelector: React.FC<Props> = ({ onSelect }) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 bg-gradient-to-br from-rose-100 via-pink-200 to-amber-100 text-pink-900 relative overflow-hidden h-full w-full select-none">
      {/* Garden Decorations */}
      <div className="absolute top-1 left-2 text-2xl md:text-6xl opacity-20 pointer-events-none animate-pulse">🦋</div>
      <div className="absolute bottom-2 right-2 text-4xl md:text-8xl opacity-20 pointer-events-none animate-bounce">🌻</div>
      <div className="absolute top-1/2 left-4 text-3xl opacity-10 pointer-events-none">🐝</div>

      <div className="text-center mb-4 md:mb-8 relative z-10">
        <h1 className="text-4xl md:text-7xl font-kids text-pink-600 drop-shadow-sm leading-tight">StoryTime</h1>
        <p className="text-[10px] md:text-base font-kids text-rose-400 uppercase tracking-[0.3em]">The Secret Garden</p>
      </div>
      
      {/* Scrollable grid for mobile if needed, but flex-wrap preferred for visibility */}
      <div className="flex flex-wrap items-center justify-center gap-3 md:gap-6 max-w-6xl relative z-10 px-4">
        {LANGUAGES.map((lang) => (
          <button
            key={lang.code}
            type="button"
            onClick={() => onSelect(lang.code)}
            title={lang.name}
            className="w-16 h-16 xs:w-20 xs:h-20 md:w-32 md:h-32 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-sm shadow-md hover:shadow-xl hover:bg-rose-500 hover:text-white transition-all transform hover:scale-110 active:scale-90 group border-4 border-white cursor-pointer"
          >
            <span className="text-3xl xs:text-4xl md:text-7xl group-hover:scale-110 transition-transform">
              {lang.flag}
            </span>
          </button>
        ))}
      </div>
      
      <div className="mt-6 md:mt-12 text-pink-500 font-black uppercase tracking-widest text-[10px] md:text-xs animate-pulse bg-white/30 px-6 py-2 rounded-full backdrop-blur-sm">
        Choose a flag to enter
      </div>
    </div>
  );
};

export default LanguageSelector;
