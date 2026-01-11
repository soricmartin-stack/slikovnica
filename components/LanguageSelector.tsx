
import React from 'react';
import { LANGUAGES } from '../constants';
import { LanguageCode } from '../types';

interface Props {
  onSelect: (code: LanguageCode) => void;
}

const LanguageSelector: React.FC<Props> = ({ onSelect }) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-2 bg-gradient-to-br from-rose-100 via-pink-200 to-amber-100 text-pink-900 relative overflow-hidden h-full w-full select-none">
      {/* Garden Decorations */}
      <div className="absolute top-1 left-2 text-2xl md:text-6xl opacity-20 pointer-events-none animate-pulse">🦋</div>
      <div className="absolute bottom-2 right-2 text-4xl md:text-8xl opacity-20 pointer-events-none animate-bounce">🌻</div>
      <div className="absolute top-1/2 left-4 text-3xl opacity-10 pointer-events-none">🐝</div>

      <div className="text-center mb-2 md:mb-6 relative z-10">
        <h1 className="text-3xl md:text-6xl font-kids text-pink-600 drop-shadow-sm leading-tight">StoryTime</h1>
        <p className="text-[8px] md:text-sm font-kids text-rose-400 uppercase tracking-[0.3em]">The Secret Garden</p>
      </div>
      
      {/* Strictly Non-scrolling Grid of Flags */}
      <div className="grid grid-cols-6 sm:grid-cols-6 md:grid-cols-11 gap-2 md:gap-4 max-w-5xl relative z-10 px-2">
        {LANGUAGES.map((lang) => (
          <button
            key={lang.code}
            onClick={() => onSelect(lang.code)}
            title={lang.name}
            className="w-12 h-12 xs:w-14 xs:h-14 md:w-24 md:h-24 flex items-center justify-center rounded-full bg-white/70 backdrop-blur-sm shadow-md hover:shadow-xl hover:bg-rose-500 transition-all transform hover:scale-110 group border-2 border-white active:scale-90"
          >
            <span className="text-2xl xs:text-3xl md:text-6xl group-hover:scale-110 transition-transform">
              {lang.flag}
            </span>
          </button>
        ))}
      </div>
      
      <div className="mt-2 md:mt-8 text-pink-300 font-bold uppercase tracking-widest text-[8px] md:text-[10px] animate-pulse">
        Choose a flag to enter the garden
      </div>
    </div>
  );
};

export default LanguageSelector;
