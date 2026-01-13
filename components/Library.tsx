
import React, { useState, useMemo } from 'react';
import { Book, LanguageCode, Auth } from '../types';
import { LANGUAGES, AGE_GROUPS } from '../constants';

interface Props {
  books: Book[];
  currentLang: LanguageCode;
  auth: Auth;
  t: (key: string) => string;
  onOpenBook: (book: Book) => void;
  onEditBook: (book: Book) => void;
  onDeleteBook: (id: string) => void;
  onLogout: () => void;
  onCreateClick: () => void;
  onResetLang: () => void;
  onRate: (id: string, type: 'personal' | 'universal', rating: number) => void;
  onApprove: (id: string) => void;
  lastSync: number;
}

const Library: React.FC<Props> = ({ books, currentLang, auth, t, onOpenBook, onEditBook, onDeleteBook, onLogout, onCreateClick, onResetLang, onRate, onApprove, lastSync }) => {
  const [selectedAge, setSelectedAge] = useState<number | null>(null);
  const [sortMethod, setSortMethod] = useState<'newest' | 'rating'>('newest');
  const [zoomLevel, setZoomLevel] = useState<number>(1.0);

  const filteredBooks = useMemo(() => {
    let result = books.filter(book => {
      if (auth.role === 'admin') return selectedAge === null || book.ageGroup === selectedAge;
      const canSee = book.isApproved || book.creatorName === auth.name;
      const ageMatch = selectedAge === null || book.ageGroup === selectedAge;
      return canSee && ageMatch;
    });

    if (sortMethod === 'rating') {
      result.sort((a, b) => b.universalRating - a.universalRating);
    } else {
      result.sort((a, b) => b.createdAt - a.createdAt);
    }

    return result;
  }, [books, selectedAge, sortMethod, auth]);

  const currentFlag = LANGUAGES.find(l => l.code === currentLang)?.flag || '🌍';

  const StarRating = ({ rating, id, type, scale }: { rating: number, id: string, type: 'personal' | 'universal', scale: number }) => (
    <div className="flex flex-col gap-0.5" onClick={(e) => e.stopPropagation()}>
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            onClick={() => onRate(id, type, star)}
            className={`transition-transform hover:scale-125 ${
              star <= Math.floor(rating) 
                ? (type === 'universal' ? 'text-yellow-400' : 'text-rose-400') 
                : 'text-gray-200'
            }`}
            style={{ fontSize: `${1 * scale}rem` }}
          >
            {type === 'universal' ? '★' : '♥'}
          </button>
        ))}
      </div>
      <span className="text-[6px] md:text-[8px] font-black uppercase opacity-60 tracking-tighter" style={{ fontSize: `${7 * scale}px` }}>
        {t(type === 'universal' ? 'worldScore' : 'myLove')}
      </span>
    </div>
  );

  const handleZoom = (delta: number) => {
    setZoomLevel(prev => Math.min(1.5, Math.max(0.6, prev + delta)));
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#fdf2f8] relative overflow-hidden">
      <header className="bg-gradient-to-r from-rose-500 to-pink-600 px-4 md:px-8 py-2 md:py-4 flex items-center justify-between shadow-xl sticky top-0 z-20 text-white">
        <div className="flex items-center gap-3 md:gap-6">
          <button 
            onClick={onResetLang}
            className="w-10 h-10 md:w-14 md:h-14 rounded-full bg-white/20 flex items-center justify-center hover:bg-amber-400 transition-all border border-white/20 shadow-inner"
          >
            <span className="text-xl md:text-3xl group-hover:scale-125 transition-transform">{currentFlag}</span>
          </button>
          <div className="flex flex-col">
            <h1 className="text-xl md:text-3xl font-kids text-white drop-shadow-md leading-none">StoryTime</h1>
            <div className="flex items-center gap-2 mt-1">
               <span className="text-[7px] md:text-[10px] font-black opacity-90 tracking-widest uppercase">
                 {t(auth.role === 'admin' ? 'keeper' : 'explorer')}: {auth.name}
               </span>
               <button 
                 onClick={onLogout}
                 className="text-[6px] md:text-[8px] font-black uppercase text-rose-200 hover:text-white underline tracking-tighter"
               >
                 {t('logout')}
               </button>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4 flex-1 justify-center max-w-[40%]">
          <div className="flex items-center bg-black/10 rounded-full border border-white/20 p-1">
            <button onClick={() => handleZoom(-0.1)} className="w-6 h-6 md:w-8 md:h-8 flex items-center justify-center rounded-full hover:bg-white/20 text-lg md:text-xl font-bold">-</button>
            <span className="px-1 text-[8px] md:text-[10px] font-black uppercase tracking-tighter w-8 md:w-10 text-center">{Math.round(zoomLevel * 100)}%</span>
            <button onClick={() => handleZoom(0.1)} className="w-6 h-6 md:w-8 md:h-8 flex items-center justify-center rounded-full hover:bg-white/20 text-lg md:text-xl font-bold">+</button>
          </div>

          <div className="flex gap-1 md:gap-2 bg-black/10 p-1 rounded-full overflow-x-auto no-scrollbar border border-white/20">
            <button
              onClick={() => setSelectedAge(null)}
              className={`px-3 md:px-6 py-1 md:py-2 rounded-full text-[8px] md:text-xs font-black uppercase tracking-widest transition-all ${
                selectedAge === null ? 'bg-amber-400 text-rose-900 shadow-md scale-105' : 'text-rose-50 hover:bg-white/10'
              }`}
            >
              {t('allAges')}
            </button>
            {AGE_GROUPS.map(age => (
              <button
                key={age}
                onClick={() => setSelectedAge(age)}
                className={`px-3 md:px-6 py-1 md:py-2 rounded-full text-[8px] md:text-xs font-black uppercase tracking-widest transition-all ${
                  selectedAge === age ? 'bg-amber-400 text-rose-900 shadow-md scale-105' : 'text-rose-50 hover:bg-white/10'
                }`}
              >
                {age}+
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <select 
            value={sortMethod}
            onChange={(e) => setSortMethod(e.target.value as any)}
            className="hidden lg:block bg-black/20 text-white text-[8px] md:text-xs font-black uppercase tracking-widest rounded-full px-4 py-2 border border-white/20 outline-none"
          >
            <option value="newest">{t('newest')}</option>
            <option value="rating">{t('sortByRating')}</option>
          </select>

          <button 
            onClick={onCreateClick}
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 md:px-10 py-1.5 md:py-3 rounded-full font-black uppercase tracking-widest shadow-lg transform active:translate-y-1 transition-all flex items-center gap-2 border-b-2 md:border-b-4 border-emerald-700 active:border-b-0 text-[10px] md:text-base"
          >
            <span className="text-lg md:text-2xl">🌱</span>
            <span className="hidden xs:inline">{t('createBook')}</span>
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-x-auto p-6 md:p-12 flex gap-6 md:gap-10 items-start relative z-10 no-scrollbar">
        {filteredBooks.length > 0 ? (
          filteredBooks.map((book) => (
            <div 
              key={book.id}
              onClick={() => onOpenBook(book)}
              className="flex-shrink-0 bg-white rounded-[30px] md:rounded-[50px] shadow-lg hover:shadow-2xl transition-all cursor-pointer transform hover:-translate-y-2 flex flex-col overflow-hidden border-white group"
              style={{ 
                width: `${320 * zoomLevel}px`, 
                height: `${520 * zoomLevel}px`,
                borderWidth: `${12 * zoomLevel}px`
              }}
            >
              <div className="relative overflow-hidden bg-rose-50" style={{ height: `${280 * zoomLevel}px` }}>
                <img 
                  src={book.coverImage} 
                  alt={book.title} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                
                {auth.role === 'admin' && (
                  <div className="absolute inset-0 bg-rose-950/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3 p-4">
                    {!book.isApproved && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); onApprove(book.id); }}
                        className="w-full bg-emerald-500 text-white py-2 rounded-full font-black uppercase text-[10px] shadow-xl hover:scale-105 transition-transform"
                      >
                        {t('approve')}
                      </button>
                    )}
                    <button 
                      onClick={(e) => { e.stopPropagation(); onEditBook(book); }}
                      className="w-full bg-amber-400 text-rose-950 py-2 rounded-full font-black uppercase text-[10px] shadow-xl hover:scale-105 transition-transform"
                    >
                      ✏️ {t('editBook')}
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); onDeleteBook(book.id); }}
                      className="w-full bg-rose-600 text-white py-2 rounded-full font-black uppercase text-[10px] shadow-xl hover:scale-105 transition-transform"
                    >
                      🗑️ {t('deleteBook')}
                    </button>
                  </div>
                )}

                <div className="absolute top-2 left-2 flex flex-col gap-1">
                   {book.isApproved ? (
                     <span className="bg-emerald-500 text-white px-2 py-0.5 rounded-full font-black uppercase border border-white" style={{ fontSize: `${9 * zoomLevel}px` }}>{t('approved')}</span>
                   ) : (
                     <span className="bg-amber-500 text-white px-2 py-0.5 rounded-full font-black uppercase border border-white" style={{ fontSize: `${9 * zoomLevel}px` }}>{t('pendingApproval')}</span>
                   )}
                   <span className="bg-rose-400 text-white px-2 py-0.5 rounded-full font-black uppercase border border-white" style={{ fontSize: `${9 * zoomLevel}px` }}>
                     {t(book.publishStatus === 'universal' ? 'publishUniversal' : 'publishLocal')}
                   </span>
                </div>
                <div className="absolute top-2 right-2 bg-amber-400 text-rose-900 px-2 py-1 rounded-full font-black uppercase shadow-lg border border-white flex items-center gap-1" style={{ fontSize: `${10 * zoomLevel}px` }}>
                  <span>{LANGUAGES.find(l => l.code === book.language)?.flag}</span>
                  <span>{book.ageGroup}+</span>
                </div>
                
                <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-md px-3 py-2 rounded-[1.5rem] shadow-xl flex flex-col gap-2">
                  <StarRating rating={book.universalRating} id={book.id} type="universal" scale={zoomLevel} />
                  <div className="w-full h-px bg-rose-100 opacity-50"></div>
                  <StarRating rating={book.personalRating} id={book.id} type="personal" scale={zoomLevel} />
                </div>
              </div>

              <div className="p-3 md:p-6 flex flex-col justify-between flex-1 bg-gradient-to-b from-white to-rose-50/40">
                <h3 className="font-kids text-rose-950 leading-tight line-clamp-2" style={{ fontSize: `${1.25 * zoomLevel}rem` }}>{book.title}</h3>
                <div className="flex items-center justify-between border-t border-rose-100 pt-2 md:pt-4">
                    <div>
                      <p className="font-bold uppercase tracking-wider italic text-rose-400" style={{ fontSize: `${10 * zoomLevel}px` }}>{t('by')} {book.author}</p>
                      <p className="font-black uppercase text-rose-300" style={{ fontSize: `${8 * zoomLevel}px` }}>{t('creator')}: {book.creatorName}</p>
                    </div>
                    <span className="opacity-40 group-hover:opacity-100" style={{ fontSize: `${1.5 * zoomLevel}rem` }}>🌸</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-rose-200 py-20 min-w-full">
            <span className="text-6xl md:text-9xl mb-4 md:mb-8 opacity-30 animate-pulse">🥀</span>
            <p className="text-xl md:text-3xl font-kids text-rose-800/30 tracking-widest uppercase">{t('noBooks')}</p>
          </div>
        )}
      </main>

      <div className="fixed bottom-2 right-4 flex items-center gap-2 opacity-40 z-0 select-none">
          <span className="text-[10px] md:text-xs font-black uppercase text-rose-900">{t('safeInCloud')}</span>
          <span className="text-xl">☁️</span>
      </div>
    </div>
  );
};

export default Library;
