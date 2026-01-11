
import React, { useState, useEffect, useCallback } from 'react';
import { ViewState, LanguageCode, Book, Auth } from '../types';
import { UI_TRANSLATIONS, LANGUAGES } from '../constants';
import LanguageSelector from './components/LanguageSelector';
import Login from './components/Login';
import Library from './components/Library';
import Reader from './components/Reader';
import Creator from './components/Creator';
import { GoogleGenAI } from "@google/genai";
import { authHelpers, bookHelpers } from './firebase';

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
  const [busyMessage, setBusyMessage] = useState('');
  const [lastSync, setLastSync] = useState<number>(Date.now());

  // Check for existing Firebase session on mount
  useEffect(() => {
    const unsubscribe = authHelpers.onAuthStateChange(async (firebaseUser) => {
      if (firebaseUser) {
        // User is already logged in from previous session
        console.log('Existing Firebase session found:', firebaseUser.uid);
      }
    });

    return () => unsubscribe();
  }, []);

  // Load seed data if needed
  useEffect(() => {
    const loadData = async () => {
      try {
        const stored = await getAllBooksFromDB();
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
          await saveBookToDB(seedBooks[0]);
          setMasterBooks(seedBooks);
          setDisplayBooks(seedBooks);
        }
      } catch (err) {
        console.error("Failed to load from IndexedDB", err);
      }
    };
    loadData();
  }, []);

  // Load user's books from Firebase when logged in
  const loadUserBooks = useCallback(async (userId: string) => {
    try {
      setIsBusy(true);
      setBusyMessage(t('syncing'));

      const firebaseBooks = await bookHelpers.getUserBooks(userId);
      
      if (firebaseBooks.length > 0) {
        // Merge Firebase books with local books
        const localBooks = await getAllBooksFromDB();
        const existingIds = new Set(localBooks.map(b => b.id));
        
        // Add new books from Firebase that don't exist locally
        const newBooks = firebaseBooks.filter(b => !existingIds.has(b.id));
        
        if (newBooks.length > 0) {
          for (const book of newBooks) {
            await saveBookToDB(book);
          }
          const allBooks = [...localBooks, ...newBooks];
          setMasterBooks(allBooks);
          setDisplayBooks(allBooks);
        }
      }
      
      setLastSync(Date.now());
    } catch (err) {
      console.error('Failed to load books from Firebase', err);
    } finally {
      setIsBusy(false);
    }
  }, []);

  const createSessionView = async (targetLangCode: LanguageCode, sourceBooks: Book[]) => {
    const targetLangName = LANGUAGES.find(l => l.code === targetLangCode)?.name || 'English';
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    setIsBusy(true);
    setBusyMessage(`Magical forces are translating stories...`);
    
    try {
      const translated = await Promise.all(sourceBooks.map(async (book) => {
        if (book.language === targetLangCode) return book;
        try {
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
        } catch (e) {
          console.warn(`Could not translate book ${book.id}, keeping original.`, e);
          return book;
        }
      }));
      setDisplayBooks(translated);
    } catch (error) {
      console.error("Session translation process failed", error);
      setDisplayBooks(sourceBooks);
    } finally {
      setIsBusy(false);
      if (auth) {
        setView('library');
      } else {
        setView('login');
      }
    }
  };

  const handleLanguageSelect = (code: LanguageCode) => {
    setCurrentLang(code);
    createSessionView(code, masterBooks);
  };

  const handleLanguageChange = async (code: LanguageCode) => {
    if (code === currentLang) return;
    setCurrentLang(code);
    await translateAllBooks(code);
  };

  const translateAllBooks = async (targetLangCode: LanguageCode) => {
    const targetLangName = LANGUAGES.find(l => l.code === targetLangCode)?.name || 'English';

    setIsBusy(true);
    setBusyMessage(t('translating'));

    try {
      const translated = await Promise.all(displayBooks.map(async (book) => {
        if (book.language === targetLangCode) return book;
        try {
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
        } catch (e) {
          console.warn(`Could not translate book ${book.id}, keeping original.`, e);
          return book;
        }
      }));
      setDisplayBooks(translated);
    } catch (error) {
      console.error("Translation process failed", error);
    } finally {
      setIsBusy(false);
    }
  };

  const handleLogin = async (userAuth: Auth) => {
    setAuth(userAuth);

    // For guest users, skip Firebase sync and use only local IndexedDB
    // Firebase is only used for admin accounts
    if (userAuth.role === 'admin') {
      await loadUserBooks(userAuth.uid);
    }

    setView('library');
  };

  const handleLogout = async () => {
    await authHelpers.logout();
    setAuth(null);
    setView('login');
  };

  const handleSaveBook = async (bookData: Book) => {
    setIsBusy(true);
    setBusyMessage(t('saving'));

    try {
      const existingInMaster = masterBooks.find(b => b.id === bookData.id);
      const isNew = !existingInMaster;

      const bookToSave: Book = {
        ...bookData,
        id: isNew ? generateSafeId() : bookData.id,
        creatorName: isNew ? (auth?.name || 'Explorer') : bookData.creatorName,
        isApproved: auth?.role === 'admin' ? true : bookData.isApproved,
        createdAt: isNew ? Date.now() : (existingInMaster?.createdAt || Date.now())
      };

      // Save to IndexedDB first (always works - offline support)
      await saveBookToDB(bookToSave);

      // Try to save to Firebase (optional - don't fail if Firebase is unavailable)
      let firebaseSuccess = false;
      if (auth && auth.uid !== 'admin') {
        try {
          await bookHelpers.saveBook(auth.uid, bookToSave);
          firebaseSuccess = true;
        } catch (firebaseError) {
          console.warn('Firebase sync failed, but book saved locally:', firebaseError);
          // Book is still saved locally, so we don't show an error
          firebaseSuccess = false;
        }
      }

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
      console.error("Save failed:", err);
      setIsBusy(false);
      alert("Storage error! Could not save your story.");
    }
  };

  const handleApproveBook = async (bookId: string) => {
    const updatedMaster = masterBooks.map(b => b.id === bookId ? { ...b, isApproved: true } : b);
    setMasterBooks(updatedMaster);
    setDisplayBooks(displayBooks.map(b => b.id === bookId ? { ...b, isApproved: true } : b));
    
    const targetBook = updatedMaster.find(b => b.id === bookId);
    if (targetBook) {
      await saveBookToDB(targetBook);
      // Also publish to universal collection if it's approved
      if (auth && auth.uid !== 'admin') {
        await bookHelpers.publishBook(auth.uid, targetBook);
      }
    }
  };

  const updateBookRating = async (bookId: string, type: 'personal' | 'universal', newRating: number) => {
    const updateFn = (b: Book) => b.id === bookId ? { ...b, [type === 'personal' ? 'personalRating' : 'universalRating']: newRating } : b;
    setMasterBooks(prev => prev.map(updateFn));
    setDisplayBooks(prev => prev.map(updateFn));

    const targetBook = masterBooks.find(b => b.id === bookId);
    if (targetBook) {
      await saveBookToDB({ ...targetBook, [type === 'personal' ? 'personalRating' : 'universalRating']: newRating });
    }
  };

  const openBook = (book: Book) => {
    setSelectedBook(book);
    setView('reader');
  };

  const startEditing = (book: Book) => {
    setEditingBook(book);
    setView('creator');
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
      {view === 'language_select' && <LanguageSelector onSelect={handleLanguageSelect} />}
      {view === 'login' && <Login onLogin={handleLogin} t={t} />}
      {view === 'library' && auth && (
        <Library
          books={displayBooks}
          currentLang={currentLang}
          auth={auth}
          t={t}
          onOpenBook={openBook}
          onEditBook={startEditing}
          onCreateClick={() => { setEditingBook(null); setView('creator'); }}
          onResetLang={() => setView('language_select')}
          onRate={updateBookRating}
          onApprove={handleApproveBook}
          lastSync={lastSync}
          onLogout={handleLogout}
          onChangeLanguage={handleLanguageChange}
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
