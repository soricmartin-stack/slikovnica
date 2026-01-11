
import React, { useState, useEffect } from 'react';
import { ViewState, LanguageCode, Book, Auth } from './types';
import { UI_TRANSLATIONS, LANGUAGES } from './constants';
import LanguageSelector from './components/LanguageSelector';
import Login from './components/Login';
import Library from './components/Library';
import Reader from './components/Reader';
import Creator from './components/Creator';
import { GoogleGenAI } from "@google/genai";

// Simple IndexedDB wrapper for large data storage
const DB_NAME = 'StoryTimeDB';
const STORE_NAME = 'books';
const DB_VERSION = 1;

const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

const getAllBooksFromDB = async (): Promise<Book[]> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
};

const saveBookToDB = async (book: Book): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(book);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

const saveAllBooksToDB = async (books: Book[]): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    store.clear();
    books.forEach(book => store.add(book));
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
};

const generateSafeId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'book-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
};

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('language_select');
  const [currentLang, setCurrentLang] = useState<LanguageCode>('en');
  const [auth, setAuth] = useState<Auth | null>(null);
  
  const [masterBooks, setMasterBooks] = useState<Book[]>([]);
  const [displayBooks, setDisplayBooks] = useState<Book[]>([]);
  
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [busyMessage, setBusyMessage] = useState('');
  const [lastSync, setLastSync] = useState<number>(Date.now());

  // Initialize from IndexedDB (Garden Cloud)
  useEffect(() => {
    const loadData = async () => {
      try {
        const stored = await getAllBooksFromDB();
        if (stored.length > 0) {
          setMasterBooks(stored);
        } else {
          const seedBooks: Book[] = [
            {
              id: 'seed-1',
              title: 'The Brave Little Lion',
              author: 'Alex J.',
              creatorName: 'System',
              isApproved: true,
              coverImage: 'https://picsum.photos/seed/lion/800/450',
              language: 'en',
              ageGroup: 3,
              backgroundColor: '#fffbeb',
              createdAt: Date.now() - 86400000,
              universalRating: 4.8,
              personalRating: 0,
              publishStatus: 'universal',
              pages: [
                { id: 'p1', imageUrl: 'https://picsum.photos/seed/lion1/800/450', text: 'Once upon a time, there was a little lion named Leo.' },
                { id: 'p2', imageUrl: 'https://picsum.photos/seed/lion2/800/450', text: 'Leo was very small, but he had a very big roar!' }
              ]
            }
          ];
          await saveAllBooksToDB(seedBooks);
          setMasterBooks(seedBooks);
        }
      } catch (err) {
        console.error("Failed to load from IndexedDB", err);
      }
    };
    loadData();
  }, []);

  const createSessionView = async (targetLangCode: LanguageCode, sourceBooks: Book[]) => {
    const targetLangName = LANGUAGES.find(l => l.code === targetLangCode)?.name || 'English';
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    setIsBusy(true);
    setBusyMessage(`Fairies are gathering stories in ${targetLangName}...`);
    
    try {
      const translated = await Promise.all(sourceBooks.map(async (book) => {
        if (book.language === targetLangCode) return book;

        const prompt = `Translate this children's book into ${targetLangName}. 
        Return ONLY a JSON object with keys "title" and "pages" (an array of strings).
        Original Language: ${book.language}
        Book Title: "${book.title}"
        Pages: ${JSON.stringify(book.pages.map(p => p.text))}`;

        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: prompt,
          config: { responseMimeType: 'application/json' }
        });

        const data = JSON.parse(response.text || '{}');
        return {
          ...book,
          title: data.title || book.title,
          language: targetLangCode,
          pages: book.pages.map((p, idx) => ({
            ...p,
            text: data.pages?.[idx] || p.text
          }))
        };
      }));

      setDisplayBooks(translated);
    } catch (error) {
      console.error("Session translation failed", error);
      setDisplayBooks(sourceBooks);
    } finally {
      setIsBusy(false);
      setView('login');
    }
  };

  const handleLanguageSelect = (code: LanguageCode) => {
    setCurrentLang(code);
    createSessionView(code, masterBooks);
  };

  const handleLogin = (userAuth: Auth) => {
    setAuth(userAuth);
    setView('library');
  };

  const handleCreateBook = async (newBook: Book) => {
    setIsBusy(true);
    setBusyMessage('Planting your story in the Eternal Garden...');
    
    try {
      const bookWithMeta: Book = {
        ...newBook,
        id: generateSafeId(),
        creatorName: auth?.name || 'Explorer',
        isApproved: auth?.role === 'admin'
      };

      // Save to persistent storage (IndexedDB handles large files)
      await saveBookToDB(bookWithMeta);
      
      const updatedMaster = [bookWithMeta, ...masterBooks];
      setMasterBooks(updatedMaster);
      setDisplayBooks([bookWithMeta, ...displayBooks]);
      setLastSync(Date.now());

      setIsBusy(false);
      setView('library');
    } catch (err) {
      console.error("Save failed:", err);
      setIsBusy(false);
      alert("The garden soil is too full! Could not save the story. (Storage Error)");
    }
  };

  const handleApproveBook = async (bookId: string) => {
    const updatedMaster = masterBooks.map(b => b.id === bookId ? { ...b, isApproved: true } : b);
    setMasterBooks(updatedMaster);
    setDisplayBooks(displayBooks.map(b => b.id === bookId ? { ...b, isApproved: true } : b));
    
    const targetBook = updatedMaster.find(b => b.id === bookId);
    if (targetBook) await saveBookToDB(targetBook);
  };

  const updateBookRating = async (bookId: string, type: 'personal' | 'universal', newRating: number) => {
    const updatedMaster = masterBooks.map(b => {
      if (b.id === bookId) {
        return { ...b, [type === 'personal' ? 'personalRating' : 'universalRating']: newRating };
      }
      return b;
    });
    setMasterBooks(updatedMaster);
    setDisplayBooks(displayBooks.map(b => {
      if (b.id === bookId) {
        return { ...b, [type === 'personal' ? 'personalRating' : 'universalRating']: newRating };
      }
      return b;
    }));

    const targetBook = updatedMaster.find(b => b.id === bookId);
    if (targetBook) await saveBookToDB(targetBook);
  };

  const openBook = (book: Book) => {
    setSelectedBook(book);
    setView('reader');
  };

  const t = (key: string) => {
    return UI_TRANSLATIONS[key]?.[currentLang] || UI_TRANSLATIONS[key]?.['en'] || key;
  };

  if (isBusy) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-rose-400 to-pink-600 flex flex-col items-center justify-center text-white p-10 text-center relative overflow-hidden">
        <div className="relative mb-20 flex flex-col items-center">
          <div className="relative w-40 h-40">
            <div className="absolute left-1/2 -bottom-2 w-2 bg-green-500 rounded-full origin-bottom animate-[grow-stem_2s_ease-in-out_infinite]" style={{ height: '60px', marginLeft: '-4px' }}></div>
            <div className="absolute left-1/2 top-4 w-16 h-16 origin-center animate-[bloom_2s_ease-in-out_infinite]" style={{ marginLeft: '-32px' }}>
              <div className="absolute inset-0 bg-yellow-400 rounded-full scale-50"></div>
              {[0, 60, 120, 180, 240, 300].map(deg => (
                <div key={deg} className="absolute inset-0 bg-pink-300 rounded-full opacity-80" style={{ transform: `rotate(${deg}deg) translateY(-20px)`, width: '32px', height: '48px', left: '16px' }}></div>
              ))}
            </div>
          </div>
          <p className="text-3xl font-kids mt-8 animate-pulse drop-shadow-md">{busyMessage}</p>
        </div>
        <style>{`
          @keyframes grow-stem { 0% { transform: scaleY(0.1); } 50% { transform: scaleY(1); } 100% { transform: scaleY(0.1); } }
          @keyframes bloom { 0% { transform: scale(0.2) rotate(0deg); opacity: 0; } 50% { transform: scale(1.2) rotate(180deg); opacity: 1; } 100% { transform: scale(0.2) rotate(360deg); opacity: 0; } }
        `}</style>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full overflow-hidden flex flex-col">
      {view === 'language_select' && (
        <LanguageSelector onSelect={handleLanguageSelect} />
      )}

      {view === 'login' && (
        <Login onLogin={handleLogin} t={t} />
      )}

      {view === 'library' && auth && (
        <Library 
          books={displayBooks} 
          currentLang={currentLang}
          auth={auth}
          t={t}
          onOpenBook={openBook}
          onCreateClick={() => setView('creator')}
          onResetLang={() => setView('language_select')}
          onRate={updateBookRating}
          onApprove={handleApproveBook}
          lastSync={lastSync}
        />
      )}

      {view === 'reader' && selectedBook && (
        <Reader 
          book={selectedBook} 
          onClose={() => setView('library')} 
          t={t}
          onRate={updateBookRating}
        />
      )}

      {view === 'creator' && auth && (
        <Creator 
          onSave={handleCreateBook} 
          onCancel={() => setView('library')}
          uiLang={currentLang}
          t={t}
          auth={auth}
        />
      )}
    </div>
  );
};

export default App;
