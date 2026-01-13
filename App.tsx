
import React, { useState, useEffect } from 'react';
import { ViewState, LanguageCode, Book, Auth } from './types';
import { UI_TRANSLATIONS, LANGUAGES } from './constants';
import LanguageSelector from './components/LanguageSelector';
import Login from './components/Login';
import Library from './components/Library';
import Reader from './components/Reader';
import Creator from './components/Creator';
import { GoogleGenAI } from "@google/genai";
import { isFirebaseEnabled } from './firebaseConfig';

/**
 * DATA SERVICE LAYER
 * This section abstracts IndexedDB so it can be replaced by Firebase easily.
 */
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

const DataService = {
  async getAllBooks(): Promise<Book[]> {
    if (isFirebaseEnabled) {
      // Future Firebase logic: return await getDocs(collection(db, "books"));
    }
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  },

  async saveBook(book: Book): Promise<void> {
    if (isFirebaseEnabled) {
      // Future Firebase logic: await setDoc(doc(db, "books", book.id), book);
    }
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(book);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  },

  async deleteBook(id: string): Promise<void> {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  },

  async saveAll(books: Book[]): Promise<void> {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      store.clear();
      books.forEach(book => store.add(book));
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }
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
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [busyMessageKey, setBusyMessageKey] = useState<string>('translatingStories');
  const [lastSync, setLastSync] = useState<number>(Date.now());

  const t = (key: string) => {
    return UI_TRANSLATIONS[key]?.[currentLang] || UI_TRANSLATIONS[key]?.['en'] || key;
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const stored = await DataService.getAllBooks();
        if (stored.length > 0) {
          setMasterBooks(stored);
          setDisplayBooks(stored);
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
          await DataService.saveAll(seedBooks);
          setMasterBooks(seedBooks);
          setDisplayBooks(seedBooks);
        }
      } catch (err) {
        console.error("Database connection failed", err);
      }
    };
    loadData();
  }, []);

  /**
   * AI TRANSLATION ENGINE
   * Optimized for Firebase AI future sync.
   */
  const createSessionView = async (targetLangCode: LanguageCode, sourceBooks: Book[]) => {
    const targetLangName = LANGUAGES.find(l => l.code === targetLangCode)?.name || 'English';
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    setIsBusy(true);
    setBusyMessageKey('translatingStories');
    
    try {
      const translated = await Promise.all(sourceBooks.map(async (book) => {
        if (book.language === targetLangCode) return book;
        try {
          const prompt = `Act as a high-end children's book translator for an Android App. 
          Translate this book into ${targetLangName}. 
          Keep the tone whimsical and appropriate for age ${book.ageGroup}.
          Return ONLY a JSON object with keys "title" and "pages" (an array of strings).
          Book Title: "${book.title}"
          Pages: ${JSON.stringify(book.pages.map(p => p.text))}`;

          const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: { 
              responseMimeType: 'application/json',
              temperature: 0.3 // More deterministic for UI translations
            }
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
        } catch (e) {
          console.warn(`Translation skip for ${book.id}`, e);
          return book;
        }
      }));
      setDisplayBooks(translated);
    } catch (error) {
      console.error("Critical translation failure", error);
      setDisplayBooks(sourceBooks);
    } finally {
      setIsBusy(false);
      setView(auth ? 'library' : 'login');
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

  const handleLogout = () => {
    setAuth(null);
    setView('login');
  };

  const handleSaveBook = async (bookData: Book) => {
    setIsBusy(true);
    setBusyMessageKey('savingCloud');
    
    try {
      const existingInMaster = masterBooks.find(b => b.id === bookData.id);
      const isNew = !existingInMaster;
      
      const bookToSave: Book = {
        ...bookData,
        id: isNew ? generateSafeId() : bookData.id,
        creatorName: isNew ? (auth?.name || 'Explorer') : bookData.creatorName,
        isApproved: auth?.role === 'admin' ? true : false,
        createdAt: isNew ? Date.now() : (existingInMaster?.createdAt || Date.now())
      };

      await DataService.saveBook(bookToSave);
      
      if (isNew) {
        setMasterBooks(prev => [bookToSave, ...prev]);
        setDisplayBooks(prev => [bookToSave, ...prev]);
      } else {
        setMasterBooks(prev => prev.map(b => b.id === bookToSave.id ? bookToSave : b));
        setDisplayBooks(prev => prev.map(b => b.id === bookToSave.id ? bookToSave : b));
      }
      
      setLastSync(Date.now());
      setIsBusy(false);
      setEditingBook(null);
      setView('library');
    } catch (err) {
      console.error("Cloud garden sync failed:", err);
      setIsBusy(false);
      alert("Storage error! Could not sync your story.");
    }
  };

  const handleDeleteBook = async (bookId: string) => {
    if (!window.confirm("Are you sure you want to delete this book?")) return;
    
    setIsBusy(true);
    setBusyMessageKey('savingCloud');
    try {
      await DataService.deleteBook(bookId);
      setMasterBooks(prev => prev.filter(b => b.id !== bookId));
      setDisplayBooks(prev => prev.filter(b => b.id !== bookId));
      setLastSync(Date.now());
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Error deleting book.");
    } finally {
      setIsBusy(false);
    }
  };

  const handleApproveBook = async (bookId: string) => {
    const updatedMaster = masterBooks.map(b => b.id === bookId ? { ...b, isApproved: true } : b);
    setMasterBooks(updatedMaster);
    setDisplayBooks(displayBooks.map(b => b.id === bookId ? { ...b, isApproved: true } : b));
    
    const targetBook = updatedMaster.find(b => b.id === bookId);
    if (targetBook) await DataService.saveBook(targetBook);
  };

  const updateBookRating = async (bookId: string, type: 'personal' | 'universal', newRating: number) => {
    const updateFn = (b: Book) => b.id === bookId ? { ...b, [type === 'personal' ? 'personalRating' : 'universalRating']: newRating } : b;
    setMasterBooks(prev => prev.map(updateFn));
    setDisplayBooks(prev => prev.map(updateFn));

    const targetBook = masterBooks.find(b => b.id === bookId);
    if (targetBook) {
      await DataService.saveBook({ ...targetBook, [type === 'personal' ? 'personalRating' : 'universalRating']: newRating });
    }
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
          <p className="text-3xl font-kids mt-8 animate-pulse drop-shadow-md">{t(busyMessageKey)}</p>
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
      {view === 'language_select' && <LanguageSelector onSelect={handleLanguageSelect} />}
      {view === 'login' && <Login onLogin={handleLogin} t={t} />}
      {view === 'library' && auth && (
        <Library 
          books={displayBooks} 
          currentLang={currentLang}
          auth={auth}
          t={t}
          onOpenBook={(book) => { setSelectedBook(book); setView('reader'); }}
          onEditBook={(book) => { setEditingBook(book); setView('creator'); }}
          onDeleteBook={handleDeleteBook}
          onLogout={handleLogout}
          onCreateClick={() => { setEditingBook(null); setView('creator'); }}
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
          onSave={handleSaveBook} 
          onCancel={() => { setEditingBook(null); setView('library'); }}
          uiLang={currentLang}
          t={t}
          auth={auth}
          initialBook={editingBook || undefined}
        />
      )}
    </div>
  );
};

export default App;
