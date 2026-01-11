
import React, { useState, useRef, useEffect } from 'react';
import { Book, Page, LanguageCode, Auth } from '../../types';
import { LANGUAGES, AGE_GROUPS, GARDEN_COLORS } from '../../constants';
import { GoogleGenAI } from "@google/genai";

interface Props {
  onSave: (book: Book) => void;
  onCancel: () => void;
  uiLang: LanguageCode;
  t: (key: string) => string;
  auth: Auth;
  initialBook?: Book;
}

const Creator: React.FC<Props> = ({ onSave, onCancel, uiLang, t, auth, initialBook }) => {
  const [title, setTitle] = useState(initialBook?.title || '');
  const [author, setAuthor] = useState(initialBook?.author || '');
  const [bookLang, setBookLang] = useState<LanguageCode>(initialBook?.language || uiLang);
  const [publishStatus, setPublishStatus] = useState<'local' | 'universal'>(initialBook?.publishStatus || 'local');
  const [ageGroup, setAgeGroup] = useState(initialBook?.ageGroup || 3);
  const [backgroundColor, setBackgroundColor] = useState(initialBook?.backgroundColor || GARDEN_COLORS[0].value);
  const [pages, setPages] = useState<Page[]>(initialBook?.pages || [
    { id: '1', imageUrl: 'https://picsum.photos/seed/cover/800/450', text: '' }
  ]);
  const [activePageIndex, setActivePageIndex] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const isAdmin = auth.role === 'admin';

  const compressImage = async (base64Str: string, maxSizeInBytes: number): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const estimatedSize = base64Str.length * 0.75;
        if (estimatedSize <= maxSizeInBytes) {
          resolve(base64Str);
          return;
        }
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(base64Str);
          return;
        }
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        let quality = 0.85;
        let result = canvas.toDataURL('image/jpeg', quality);
        while (result.length * 0.75 > maxSizeInBytes && quality > 0.1) {
          quality -= 0.1;
          result = canvas.toDataURL('image/jpeg', quality);
        }
        while (result.length * 0.75 > maxSizeInBytes && (width > 200 || height > 200)) {
          width *= 0.9;
          height *= 0.9;
          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);
          result = canvas.toDataURL('image/jpeg', 0.6);
        }
        resolve(result);
      };
      img.onerror = () => resolve(base64Str);
      img.src = base64Str;
    });
  };

  const addPage = () => {
    if (pages.length >= 100) return;
    const newPage: Page = {
      id: Date.now().toString(),
      imageUrl: 'https://picsum.photos/seed/' + Math.random() + '/800/450',
      text: ''
    };
    setPages([...pages, newPage]);
    setActivePageIndex(pages.length);
  };

  const updatePage = (index: number, updates: Partial<Page>) => {
    const newPages = [...pages];
    newPages[index] = { ...newPages[index], ...updates };
    setPages(newPages);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const limit = 2 * 1024 * 1024;
      if (!isAdmin && file.size > limit) {
        alert("Little Explorer, this photo is too heavy for our garden! Please pick a smaller one (under 2MB).");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        updatePage(activePageIndex, { imageUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const generateAIIllustration = async () => {
    if (!isAdmin || isGenerating) return;
    const pageText = pages[activePageIndex].text.trim();
    if (!pageText) {
      alert("Garden Keeper, please write the story text for this page first so the magic knows what to draw!");
      return;
    }
    setIsGenerating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `A whimsical, high-quality children's book illustration for the following scene: "${pageText}". Style: Vibrant colors, friendly characters, soft textures, professional digital painting, no text inside the image.`;
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: prompt }] },
        config: { imageConfig: { aspectRatio: "16:9" } }
      });
      if (!response.candidates?.[0]?.content?.parts) throw new Error("No image generated.");
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          const rawBase64 = part.inlineData.data;
          const mimeType = part.inlineData.mimeType || 'image/png';
          const fullBase64 = `data:${mimeType};base64,${rawBase64}`;
          const compressedUrl = await compressImage(fullBase64, 2 * 1024 * 1024);
          updatePage(activePageIndex, { imageUrl: compressedUrl });
          break;
        }
      }
    } catch (error) {
      console.error("AI Generation Error:", error);
      alert("Magic wand failure! Try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFinish = () => {
    if (isGenerating || isSaving) return;
    if (!title.trim()) {
      alert("Please enter a title!");
      return;
    }
    setIsSaving(true);
    const bookToSave: Book = {
      id: initialBook?.id || 'book-' + Date.now(),
      title: title.trim(),
      author: author.trim() || 'Garden Scribe',
      creatorName: initialBook?.creatorName || '', 
      isApproved: isAdmin ? true : (initialBook?.isApproved || false), 
      coverImage: pages[0].imageUrl,
      language: bookLang,
      ageGroup,
      backgroundColor,
      pages: pages.map(p => ({ ...p, text: p.text.trim() })),
      createdAt: initialBook?.createdAt || Date.now(),
      universalRating: initialBook?.universalRating || 0,
      personalRating: initialBook?.personalRating || 0,
      publishStatus: publishStatus
    };
    onSave(bookToSave);
  };

  return (
    <div className="fixed inset-0 bg-[#fff5f7] z-50 flex flex-col overflow-hidden">
      <header className="bg-rose-600 p-2 md:p-3 flex items-center justify-between shadow-lg text-white z-20">
        <div className="flex items-center gap-2 md:gap-4">
          <button onClick={onCancel} className="text-rose-100 font-black uppercase px-4 md:px-6 py-1 md:py-2 rounded-full bg-white/10 hover:bg-rose-800 transition-all border border-white/20 text-[8px] md:text-sm">
            {t('back')}
          </button>
          <div className="hidden sm:block">
            <h2 className="text-sm md:text-xl font-kids text-rose-50">Garden Atelier</h2>
          </div>
        </div>

        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center gap-2 bg-white/10 p-1 rounded-full border border-white/20 px-3 overflow-x-auto no-scrollbar max-w-[50vw]">
            {LANGUAGES.map(l => (
              <button
                key={l.code}
                type="button"
                onClick={() => setBookLang(l.code)}
                className={`w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-full transition-all flex-shrink-0 ${
                  bookLang === l.code ? 'bg-amber-400 scale-110 shadow-md ring-2 ring-white' : 'opacity-50 grayscale hover:opacity-100 hover:grayscale-0'
                }`}
              >
                <span className="text-xl md:text-2xl">{l.flag}</span>
              </button>
            ))}
          </div>
          <span className="text-[7px] md:text-[9px] font-black uppercase opacity-60 tracking-widest">Story Language</span>
        </div>
        
        <button 
          onClick={handleFinish}
          disabled={isGenerating || isSaving}
          className={`px-4 md:px-10 py-1 md:py-2 rounded-full font-black uppercase text-[10px] md:text-base shadow-xl transition-all flex items-center gap-2 border-b-2 md:border-b-4 ${
            isGenerating || isSaving
              ? 'bg-gray-400 border-gray-600 cursor-not-allowed' 
              : 'bg-amber-400 text-rose-950 hover:bg-amber-300 active:scale-95 border-amber-600 active:border-b-0'
          }`}
        >
          {isGenerating ? 'WAND MAGIC...' : (isSaving ? 'PLANTING...' : t('finish'))}
        </button>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <aside className="w-20 md:w-56 bg-rose-50 border-r border-rose-100 flex flex-col overflow-y-auto no-scrollbar shadow-inner p-2 md:p-4">
          <div className="grid gap-2 md:gap-6">
            <div className="text-[8px] md:text-[10px] font-black text-rose-300 uppercase tracking-widest text-center">
              {pages.length} / 100
            </div>
            {pages.map((page, idx) => (
              <div 
                key={page.id}
                onClick={() => setActivePageIndex(idx)}
                className={`relative group cursor-pointer rounded-xl md:rounded-[2rem] overflow-hidden border-2 md:border-4 transition-all transform ${
                  activePageIndex === idx ? 'border-amber-400 scale-105 shadow-md z-10' : 'border-white hover:border-rose-200'
                }`}
              >
                <img src={page.imageUrl} alt={`P${idx+1}`} className="w-full h-12 md:h-24 object-cover" />
                <div className="absolute inset-0 bg-rose-900/10 flex items-center justify-center text-white font-black text-[10px] md:text-xl">
                  {idx + 1}
                </div>
              </div>
            ))}
            {pages.length < 100 && (
              <button 
                onClick={addPage}
                className="h-12 md:h-24 border-2 border-dashed border-rose-200 rounded-xl md:rounded-[2rem] text-rose-300 flex items-center justify-center bg-white/50 hover:bg-white"
              >
                <span className="text-xl md:text-3xl">🌸</span>
              </button>
            )}
          </div>
        </aside>

        <main className="flex-1 p-2 md:p-6 overflow-y-auto bg-gradient-to-br from-white to-pink-50 flex flex-col items-center">
          <div className="w-full max-w-5xl space-y-3 md:space-y-6">
            
            <div className="bg-white p-3 md:p-6 rounded-2xl md:rounded-3xl shadow-sm border border-rose-100 grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[7px] md:text-[10px] font-black text-rose-300 uppercase px-1">{t('titlePrompt')}</label>
                <input 
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Title..."
                  className="w-full text-xs md:text-2xl font-kids border-none focus:ring-0 outline-none p-2 md:p-3 bg-rose-50/50 rounded-lg text-rose-950"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[7px] md:text-[10px] font-black text-rose-300 uppercase px-1">Storyteller</label>
                <input 
                  type="text" 
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="Author..."
                  className="w-full text-xs md:text-xl font-kids border-none focus:ring-0 outline-none p-2 md:p-3 bg-rose-50/50 rounded-lg text-rose-950"
                />
              </div>

              <div className="space-y-1">
                  <label className="text-[7px] md:text-[10px] font-black text-rose-300 uppercase px-1">Publish Destination</label>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setPublishStatus('local')}
                      className={`flex-1 py-1 md:py-2 rounded-full text-[8px] md:text-xs font-black uppercase transition-all ${publishStatus === 'local' ? 'bg-rose-500 text-white shadow-sm' : 'bg-rose-50 text-rose-300'}`}
                    >
                      {t('publishLocal')}
                    </button>
                    <button 
                      onClick={() => setPublishStatus('universal')}
                      className={`flex-1 py-1 md:py-2 rounded-full text-[8px] md:text-xs font-black uppercase transition-all ${publishStatus === 'universal' ? 'bg-emerald-500 text-white shadow-sm' : 'bg-rose-50 text-rose-300'}`}
                    >
                      {t('publishUniversal')}
                    </button>
                  </div>
              </div>

              <div className="space-y-1">
                  <label className="text-[7px] md:text-[10px] font-black text-rose-300 uppercase px-1">Age Group</label>
                  <div className="flex gap-1 md:gap-3 p-1 overflow-x-auto no-scrollbar">
                    {AGE_GROUPS.map(age => (
                      <button
                        key={age}
                        onClick={() => setAgeGroup(age)}
                        className={`px-3 md:px-8 py-1 md:py-2 rounded-full text-[8px] md:text-xs font-black uppercase transition-all ${
                          ageGroup === age ? 'bg-rose-500 text-white shadow-sm scale-105' : 'bg-rose-50 text-rose-300'
                        }`}
                      >
                        {age}+
                      </button>
                    ))}
                  </div>
              </div>

              <div className="col-span-2 space-y-1 pt-2">
                  <label className="text-[7px] md:text-[10px] font-black text-rose-300 uppercase px-1">Background Color</label>
                  <div className="flex gap-3 p-1 overflow-x-auto no-scrollbar">
                    {GARDEN_COLORS.map(color => (
                      <button
                        key={color.value}
                        onClick={() => setBackgroundColor(color.value)}
                        className={`w-10 h-10 md:w-12 md:h-12 rounded-full border-4 transition-all transform hover:scale-110 shadow-sm ${
                          backgroundColor === color.value ? 'border-amber-400 scale-125 shadow-md' : 'border-white'
                        }`}
                        style={{ backgroundColor: color.value }}
                        title={color.name}
                      />
                    ))}
                  </div>
              </div>
            </div>

            <div className="bg-white rounded-[2rem] md:rounded-[3rem] shadow-lg overflow-hidden flex flex-col lg:flex-row h-auto min-h-[300px] border-4 md:border-8 border-white relative group" style={{ backgroundColor }}>
              <div className="flex-[3] relative bg-white/30 backdrop-blur-sm overflow-hidden min-h-[200px] flex items-center justify-center">
                {isGenerating ? (
                  <div className="flex flex-col items-center gap-4 animate-pulse p-8 text-center">
                    <span className="text-5xl md:text-7xl">🪄✨</span>
                    <span className="text-[10px] md:text-base font-black text-rose-600 uppercase tracking-widest">Wand is spinning...</span>
                  </div>
                ) : (
                  <>
                    <img 
                      src={pages[activePageIndex].imageUrl} 
                      alt="Current Page" 
                      className="w-full h-full object-contain"
                    />
                    <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-all bg-rose-900/40 flex flex-col items-center justify-center gap-4 p-4 text-center backdrop-blur-[2px]">
                      <div className="flex flex-wrap items-center justify-center gap-3">
                        <button 
                          onClick={() => fileInputRef.current?.click()}
                          className="bg-white text-rose-950 px-8 py-3 rounded-full font-black uppercase text-[10px] md:text-xs shadow-lg hover:bg-amber-100 transition-colors"
                        >
                          {t('selectImage')}
                        </button>
                        
                        {isAdmin && (
                          <button 
                            onClick={generateAIIllustration}
                            className="bg-amber-400 text-rose-950 px-8 py-3 rounded-full font-black uppercase text-[10px] md:text-xs shadow-lg flex items-center gap-2 hover:bg-amber-300 transition-colors"
                          >
                            🪄 Magic Wand
                          </button>
                        )}
                      </div>
                      
                      <div className="bg-black/60 backdrop-blur-sm rounded-2xl p-4 max-w-[85%] border border-white/30">
                        <p className="text-white font-black text-[10px] uppercase tracking-tighter mb-1">Garden Tip</p>
                        <p className="text-white/90 text-[9px] md:text-[11px] font-bold leading-tight">
                          16:9 ratio is perfect for Smartphones!<br/>
                          4:3 is lovely for Tablets and iPads!
                        </p>
                        {!isAdmin && (
                          <span className="mt-2 inline-block text-amber-300 font-black text-[9px] uppercase tracking-tighter bg-black/40 px-3 py-1 rounded-full border border-white/10">Max 2MB per photo</span>
                        )}
                      </div>
                    </div>
                  </>
                )}
                <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
              </div>
              
              <div className="flex-[2] p-4 md:p-8 flex flex-col justify-between" style={{ backgroundColor: `${backgroundColor}dd` }}>
                <div>
                  <span className="text-[10px] md:text-[12px] font-black text-rose-400 tracking-widest uppercase mb-1 block">Petal {activePageIndex + 1}</span>
                  <textarea 
                    value={pages[activePageIndex].text}
                    onChange={(e) => updatePage(activePageIndex, { text: e.target.value })}
                    placeholder={t('pageText')}
                    className="w-full text-sm md:text-xl font-medium text-rose-950 outline-none resize-none border-none placeholder:text-rose-200 italic leading-relaxed min-h-[100px] md:min-h-[200px] font-kids bg-transparent"
                  />
                </div>
                
                <div className="flex gap-2 mt-4">
                  <button 
                    onClick={() => setActivePageIndex(Math.max(0, activePageIndex - 1))}
                    disabled={activePageIndex === 0}
                    className="flex-1 py-3 rounded-full font-black uppercase text-[10px] md:text-xs bg-white/50 text-rose-400 disabled:opacity-30"
                  >
                    {t('back')}
                  </button>
                  {activePageIndex < pages.length - 1 ? (
                    <button 
                      onClick={() => setActivePageIndex(activePageIndex + 1)}
                      className="flex-1 bg-rose-500 text-white py-3 rounded-full font-black uppercase text-[10px] md:text-xs shadow-sm"
                    >
                      {t('next')}
                    </button>
                  ) : (
                    <button 
                      onClick={addPage}
                      className="flex-1 bg-amber-400 text-rose-950 py-3 rounded-full font-black uppercase text-[10px] md:text-xs shadow-md"
                    >
                      + Page
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Creator;
