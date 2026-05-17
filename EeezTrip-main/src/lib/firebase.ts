import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  onAuthStateChanged as fbOnAuthStateChanged
} from 'firebase/auth';
import { getFirestore, collection, addDoc, query, where, getDocs, orderBy, serverTimestamp, Timestamp } from 'firebase/firestore';

const firebaseConfig = {
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  firestoreDatabaseId: import.meta.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

let app;
let db: any;
let auth: any;
const googleProvider = new GoogleAuthProvider();

const isPlaceholder = (key?: string) => !key || key.startsWith('your_') || key === 'undefined';

try {
  if (isPlaceholder(firebaseConfig.apiKey)) {
    throw new Error('Firebase API Key is missing or is a placeholder');
  }
  app = initializeApp(firebaseConfig);
  db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
  auth = getAuth(app);
} catch (e) {
  console.warn('Firebase initialization failed. Auth and Database features will be disabled.', e);
  // Mock Firebase objects to prevent crashes
  app = {};
  db = { 
    collection: () => ({ addDoc: () => Promise.resolve() }),
    firestoreDatabaseId: 'mock'
  };
  auth = {
    onAuthStateChanged: (cb: any) => {
      // Simulate a signed-in mock user for testing if needed, or keep it null
      cb({
        uid: 'mock-user-123',
        displayName: 'Demo Traveler',
        email: 'demo@eeeztrip.ai',
        photoURL: 'https://ui-avatars.com/api/?name=Demo+Traveler'
      });
      return () => {};
    },
    currentUser: {
      uid: 'mock-user-123',
      displayName: 'Demo Traveler',
      email: 'demo@eeeztrip.ai'
    },
    signOut: () => Promise.resolve(),
  };
}

export { app, db, auth, googleProvider, signInWithEmailAndPassword, createUserWithEmailAndPassword };

export const onAuthStateChanged = (authInstance: any, cb: any) => {
  if (authInstance && typeof authInstance.onAuthStateChanged === 'function') {
    return authInstance.onAuthStateChanged(cb);
  }
  // Mock behavior
  cb(null);
  return () => {};
};

export const signInWithPopupMock = async (authInstance: any, provider: any) => {
  if (authInstance && authInstance.app && authInstance.app.options) {
    return signInWithPopup(authInstance, provider);
  }
  alert("Authentication is disabled because Firebase keys are missing.");
  return null;
};

export const signInWithEmailMock = async (authInstance: any, email: string, pass: string) => {
  if (authInstance && authInstance.app && authInstance.app.options) {
    return signInWithEmailAndPassword(authInstance, email, pass);
  }
  alert("Email Sign-in is disabled because Firebase keys are missing.");
  return null;
};

export const signUpWithEmailMock = async (authInstance: any, email: string, pass: string) => {
  if (authInstance && authInstance.app && authInstance.app.options) {
    return createUserWithEmailAndPassword(authInstance, email, pass);
  }
  alert("Email Sign-up is disabled because Firebase keys are missing.");
  return null;
};

export const signOutMock = async (authInstance: any) => {
  if (authInstance && typeof authInstance.signOut === 'function') {
    return authInstance.signOut();
  }
  return Promise.resolve();
};

export { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  serverTimestamp, 
  Timestamp,
};

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}
