
import React, { useState, useEffect } from 'react';
import { Book } from '../types';

interface Props {
  book: Book;
  onClose: () => void;
  t: (key: string) => string;
  onRate: (id: string, type: 'personal' | 'universal', rating: number) => void;
}

const Reader: React.FC<Props> = ({ book, onClose, t }) => {
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  
  const totalPages = book.pages.length;
  const currentPage = book.pages[currentPageIndex];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goBack();
      if (e.key === 'Escape') {
        if (showExitConfirm) setShowExitConfirm(false);
        else setShowExitConfirm(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPageIndex, showExitConfirm]);

  const goNext = () => {
    if (currentPageIndex < totalPages - 1) {
      setCurrentPageIndex(prev => prev + 1);
    }
  };

  const goBack = () => {
    if (currentPageIndex > 0) {
      setCurrentPageIndex(prev => prev - 1);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900 z-50 flex flex-col text-white select-none overflow-hidden">
      
      {/* Little Transparent Back Sign - Always Visible but faint */}
      <div className="absolute top-4 left-4 z-[70]">
        <button 
          onClick={() => setShowExitConfirm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-rose-600 transition-all rounded-full font-black uppercase text-[10px] md:text-xs tracking-widest border border-white/20 hover:border-white/40 opacity-30 hover:opacity-100 backdrop-blur-sm shadow-sm"
        >
          <span className="text-lg">🌸</span> {t('back')}
        </button>
      </div>

      {showExitConfirm && (
        <div className="fixed inset-0 z-[100] bg-slate-900/95 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] p-8 md:p-16 max-w-lg w-full text-center shadow-2xl border-[8px] md:border-[16px] border-rose-100 transform animate-in zoom-in duration-300 relative overflow-hidden">
            <h3 className="text-3xl md:text-5xl font-kids text-rose-950 mb-6 md:mb-10 leading-tight">
              Leave garden?
            </h3>
            <div className="flex flex-col gap-4 md:gap-6">
              <button 
                onClick={onClose}
                className="w-full py-4 md:py-6 bg-rose-600 text-white rounded-[2rem] md:rounded-[3rem] font-black uppercase text-lg md:text-2xl shadow-xl"
              >
                Yes, Go Back
              </button>
              <button 
                onClick={() => setShowExitConfirm(false)}
                className="w-full py-4 md:py-6 bg-rose-50 text-rose-800 rounded-[2rem] md:rounded-[3rem] font-black uppercase text-lg md:text-2xl shadow-sm"
              >
                Keep Reading
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 relative flex items-center justify-center bg-white" style={{ backgroundColor: book.backgroundColor || '#ffffff' }}>
        <div 
          onClick={goBack}
          className={`absolute left-0 top-0 bottom-0 w-[15%] z-20 cursor-pointer flex items-center justify-start pl-4 md:pl-12 group ${currentPageIndex === 0 ? 'pointer-events-none' : ''}`}
        >
          <div className={`w-12 h-12 md:w-24 md:h-24 rounded-full bg-black/5 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 ${currentPageIndex === 0 ? 'hidden' : 'hover:scale-110'}`}>
             <span className="text-3xl md:text-6xl rotate-180">🦋</span>
          </div>
        </div>

        <div 
          onClick={goNext}
          className={`absolute right-0 top-0 bottom-0 w-[15%] z-20 cursor-pointer flex items-center justify-end pr-4 md:pr-12 group ${currentPageIndex === totalPages - 1 ? 'pointer-events-none' : ''}`}
        >
          <div className={`w-12 h-12 md:w-24 md:h-24 rounded-full bg-black/5 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 ${currentPageIndex === totalPages - 1 ? 'hidden' : 'hover:scale-110'}`}>
             <span className="text-3xl md:text-6xl">🦋</span>
          </div>
        </div>

        <div className="flex w-full h-full flex-col md:flex-row">
          <div className="flex-[5] md:flex-[4] relative overflow-hidden flex items-center justify-center p-4">
            <img 
              src={currentPage.imageUrl} 
              alt={`Page ${currentPageIndex + 1}`} 
              className="max-w-full max-h-full object-contain pointer-events-none rounded-xl md:rounded-[2rem] shadow-sm"
            />
            <div className="absolute bottom-4 left-4 md:bottom-12 md:left-12 px-4 py-1.5 md:px-8 md:py-3 bg-white/40 rounded-full text-[8px] md:text-xs font-black text-rose-900 tracking-[0.2em] md:tracking-[0.5em] backdrop-blur-md uppercase border border-white/50">
              {currentPageIndex + 1} / {totalPages}
            </div>
          </div>
          
          <div className="flex-[3] p-6 md:p-32 flex flex-col justify-center relative overflow-hidden bg-black/5 md:bg-transparent">
             <div className="hidden xs:block absolute top-4 right-4 text-4xl opacity-5 select-none text-rose-300">🌸</div>
             <p className="text-xl md:text-4xl lg:text-6xl leading-tight font-medium text-slate-800 italic relative z-10 font-kids drop-shadow-sm line-clamp-8 md:line-clamp-none overflow-y-auto no-scrollbar">
               {currentPage.text || "..."}
             </p>
          </div>
        </div>
      </div>

      <div className="h-1.5 md:h-4 w-full bg-slate-800 overflow-hidden relative shadow-inner">
        <div 
          className="h-full bg-gradient-to-r from-rose-400 via-amber-400 to-rose-300 transition-all duration-1000 ease-in-out" 
          style={{ width: `${((currentPageIndex + 1) / totalPages) * 100}%` }}
        />
      </div>
    </div>
  );
};

export default Reader;
