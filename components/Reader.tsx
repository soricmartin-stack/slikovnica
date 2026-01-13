
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
  const [isUIVisible, setIsUIVisible] = useState(true);
  
  const totalPages = book.pages.length;
  const currentPage = book.pages[currentPageIndex];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goBack();
      if (e.key === 'Escape') setShowExitConfirm(true);
      if (e.key === ' ') setIsUIVisible(prev => !prev);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPageIndex]);

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

  const toggleUI = (e: React.MouseEvent) => {
    const x = e.clientX;
    const width = window.innerWidth;
    const sideBuffer = width * 0.2; 

    if (x > sideBuffer && x < width - sideBuffer) {
      setIsUIVisible(!isUIVisible);
    }
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col text-white select-none overflow-hidden">
      
      {/* Immersive Background Image */}
      <div 
        className="absolute inset-0 z-0 flex items-center justify-center transition-colors duration-700"
        style={{ backgroundColor: book.backgroundColor || '#000000' }}
        onClick={toggleUI}
      >
        <img 
          src={currentPage.imageUrl} 
          alt={`Page ${currentPageIndex + 1}`} 
          className="w-full h-full object-contain pointer-events-none"
        />
      </div>

      {/* Floating UI Elements Wrapper */}
      <div className={`transition-opacity duration-500 z-10 ${isUIVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        
        {/* Back Sign */}
        <div className="absolute top-4 left-4">
          <button 
            onClick={() => setShowExitConfirm(true)}
            className="flex items-center justify-center px-4 py-2 bg-black/50 hover:bg-rose-600 transition-all rounded-lg font-black uppercase text-[10px] tracking-widest border border-white/20 backdrop-blur-md shadow-lg"
          >
            {t('back')}
          </button>
        </div>

        {/* Page Indicator Sign */}
        <div className="absolute top-4 right-4 px-4 py-2 bg-black/50 rounded-lg text-[10px] font-black text-white/90 tracking-widest backdrop-blur-md uppercase border border-white/20">
          {currentPageIndex + 1} / {totalPages}
        </div>

        {/* Story Text Sign - Lowest possible position */}
        <div className="absolute bottom-0 left-0 right-0 z-20">
          <div className="bg-black/60 backdrop-blur-md p-4 md:p-6 border-t border-white/10 flex items-center justify-center">
            <p className="text-lg md:text-2xl lg:text-3xl text-white font-kids leading-relaxed text-center drop-shadow-md max-w-6xl">
              {currentPage.text || "..."}
            </p>
          </div>
        </div>

        {/* Navigation Signs */}
        <button 
          onClick={(e) => { e.stopPropagation(); goBack(); }}
          disabled={currentPageIndex === 0}
          className={`absolute left-0 top-0 bottom-0 w-[15%] flex items-center justify-center group transition-all ${currentPageIndex === 0 ? 'opacity-0 pointer-events-none' : 'hover:bg-white/5'}`}
        >
          <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-black/40 flex items-center justify-center border border-white/10 group-hover:scale-125 transition-transform text-white font-black text-2xl md:text-4xl">
             {"<"}
          </div>
        </button>

        <button 
          onClick={(e) => { e.stopPropagation(); goNext(); }}
          disabled={currentPageIndex === totalPages - 1}
          className={`absolute right-0 top-0 bottom-0 w-[15%] flex items-center justify-center group transition-all ${currentPageIndex === totalPages - 1 ? 'opacity-0 pointer-events-none' : 'hover:bg-white/5'}`}
        >
          <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-black/40 flex items-center justify-center border border-white/10 group-hover:scale-125 transition-transform text-white font-black text-2xl md:text-4xl">
             {">"}
          </div>
        </button>
      </div>

      {/* Exit Confirmation Dialog */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-[100] bg-slate-900/95 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] p-8 md:p-16 max-w-lg w-full text-center shadow-2xl border-[8px] md:border-[12px] border-rose-100 transform animate-in zoom-in duration-300">
            <h3 className="text-2xl md:text-4xl font-kids text-rose-950 mb-6 md:mb-10">
              {t('closeBookConfirm')}
            </h3>
            <div className="flex flex-col gap-4">
              <button 
                onClick={onClose}
                className="w-full py-4 bg-rose-600 text-white rounded-2xl font-black uppercase text-base md:text-xl shadow-xl hover:bg-rose-700 transition-colors"
              >
                {t('returnToLibrary')}
              </button>
              <button 
                onClick={() => setShowExitConfirm(false)}
                className="w-full py-4 bg-rose-50 text-rose-800 rounded-2xl font-black uppercase text-base md:text-xl hover:bg-rose-100 transition-colors"
              >
                {t('keepReading')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reader;
