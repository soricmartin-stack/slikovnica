import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  FacebookAuthProvider,
  GithubAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where,
  orderBy,
  deleteDoc,
  serverTimestamp,
  updateDoc
} from 'firebase/firestore';
import { 
  getStorage, 
  ref, 
  uploadBytes, 
  getDownloadURL 
} from 'firebase/storage';

// Firebase configuration - Replace with your actual config from Firebase Console
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "YOUR_API_KEY",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "YOUR_PROJECT.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "YOUR_PROJECT_ID",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "YOUR_PROJECT.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "YOUR_SENDER_ID",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "YOUR_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Auth Providers
const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();
const githubProvider = new GithubAuthProvider();

// Configure providers
googleProvider.setCustomParameters({ prompt: 'select_account' });
facebookProvider.setCustomParameters({ display: 'popup' });
githubProvider.addScope('read:user');

// Auth helper functions
export const authHelpers = {
  // Email/Password Sign Up
  async signUp(email: string, password: string, displayName: string) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update profile with display name
      await updateProfile(userCredential.user, { displayName });
      
      // Create user document in Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        email,
        displayName,
        photoURL: null,
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
        role: 'user'
      });
      
      return { success: true, user: userCredential.user };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  // Email/Password Sign In
  async signIn(email: string, password: string) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Update last login
      const userDoc = doc(db, 'users', userCredential.user.uid);
      await updateDoc(userDoc, { lastLogin: serverTimestamp() });
      
      return { success: true, user: userCredential.user };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  // Google Sign In
  async signInWithGoogle() {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Check if user document exists, create if not
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists()) {
        await setDoc(doc(db, 'users', user.uid), {
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          createdAt: serverTimestamp(),
          lastLogin: serverTimestamp(),
          role: 'user'
        });
      } else {
        await updateDoc(doc(db, 'users', user.uid), { lastLogin: serverTimestamp() });
      }
      
      return { success: true, user };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  // Facebook Sign In
  async signInWithFacebook() {
    try {
      const result = await signInWithPopup(auth, facebookProvider);
      const user = result.user;
      
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists()) {
        await setDoc(doc(db, 'users', user.uid), {
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          createdAt: serverTimestamp(),
          lastLogin: serverTimestamp(),
          role: 'user'
        });
      } else {
        await updateDoc(doc(db, 'users', user.uid), { lastLogin: serverTimestamp() });
      }
      
      return { success: true, user };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  // GitHub Sign In
  async signInWithGithub() {
    try {
      const result = await signInWithPopup(auth, githubProvider);
      const user = result.user;
      
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists()) {
        await setDoc(doc(db, 'users', user.uid), {
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          createdAt: serverTimestamp(),
          lastLogin: serverTimestamp(),
          role: 'user'
        });
      } else {
        await updateDoc(doc(db, 'users', user.uid), { lastLogin: serverTimestamp() });
      }
      
      return { success: true, user };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  // Sign Out
  async logout() {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  // Password Reset
  async resetPassword(email: string) {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  // Get current user
  getCurrentUser() {
    return auth.currentUser;
  },

  // Listen to auth state changes
  onAuthStateChange(callback: (user: FirebaseUser | null) => void) {
    return onAuthStateChanged(auth, callback);
  }
};

// Firestore helper functions for books
export const bookHelpers = {
  // Save a book to user's collection
  async saveBook(userId: string, book: any) {
    const bookData = {
      ...book,
      userId,
      updatedAt: serverTimestamp()
    };
    
    if (!book.id) {
      bookData.createdAt = serverTimestamp();
      bookData.id = crypto.randomUUID();
    }
    
    await setDoc(doc(db, 'users', userId, 'books', bookData.id), bookData);
    return bookData;
  },

  // Get all books for a user
  async getUserBooks(userId: string) {
    const q = query(
      collection(db, 'users', userId, 'books'),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  // Get public/universal books
  async getPublicBooks() {
    const q = query(
      collection(db, 'books'),
      where('publishStatus', '==', 'universal'),
      where('isApproved', '==', true),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  // Delete a book
  async deleteBook(userId: string, bookId: string) {
    await deleteDoc(doc(db, 'users', userId, 'books', bookId));
  },

  // Publish book to universal collection
  async publishBook(userId: string, book: any) {
    const publishedBook = {
      ...book,
      userId,
      publishedAt: serverTimestamp(),
      isApproved: true,
      publishStatus: 'universal'
    };
    await setDoc(doc(db, 'books', book.id), publishedBook);
    return publishedBook;
  }
};

// Storage helper functions
export const storageHelpers = {
  async uploadImage(userId: string, file: File): Promise<string> {
    const imageRef = ref(storage, `users/${userId}/images/${crypto.randomUUID()}-${file.name}`);
    await uploadBytes(imageRef, file);
    return getDownloadURL(imageRef);
  }
};

export { auth, db, storage };
export type { FirebaseUser };
