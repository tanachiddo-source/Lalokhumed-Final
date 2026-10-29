import { initializeApp } from 'firebase/app';
import { 
  initializeAuth, 
  browserLocalPersistence, 
  browserSessionPersistence, 
  inMemoryPersistence,
  getAuth
} from 'firebase/auth';
import { 
  getFirestore, 
  initializeFirestore, 
  doc, 
  getDocFromServer 
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);

// Pre-check storage access to avoid SecurityError in restricted iframes before initializing Auth
function checkStorageSupport(): boolean {
  try {
    const testKey = '__storage_test__';
    localStorage.setItem(testKey, testKey);
    localStorage.removeItem(testKey);
    sessionStorage.setItem(testKey, testKey);
    sessionStorage.removeItem(testKey);
    return true;
  } catch (error) {
    return false;
  }
}

const isStorageSupported = checkStorageSupport();

// Safe Auth initialization
let authInstance: any;

try {
  // If there's an already initialized instance, retrieve it
  authInstance = getAuth(app);
} catch (error) {
  // If not yet initialized (or if getAuth throws), we try initializing safely
  const isStorageSupported = checkStorageSupport();
  try {
    if (isStorageSupported) {
      authInstance = initializeAuth(app, {
        persistence: [browserLocalPersistence, browserSessionPersistence, inMemoryPersistence]
      });
    } else {
      console.warn("Firebase Auth: Storage accesses (localStorage/sessionStorage) are blocked in this iframe. Initialising with inMemoryPersistence only.");
      authInstance = initializeAuth(app, {
        persistence: [inMemoryPersistence]
      });
    }
  } catch (initError: any) {
    console.error("Firebase Auth explicit initialisation failed. Attempting final recovery:", initError);
    try {
      authInstance = getAuth(app);
    } catch (finalError) {
      console.error("Firebase Auth: Ultimate safety fallback failed.", finalError);
    }
  }
}

// Global safety net to ensure authInstance is NEVER undefined
if (!authInstance) {
  console.warn("Firebase Auth: Safety net triggered (standard getAuth).");
  try {
    authInstance = getAuth(app);
  } catch (err) {
    console.error("Firebase Auth critical: default getAuth(app) failed.", err);
  }
}

export const auth = authInstance;

// Safe Firestore Database initialization with ignoreUndefinedProperties
let dbInstance: any;

try {
  // Using initializeFirestore with ignoreUndefinedProperties prevents crashes from missing optional fields
  dbInstance = initializeFirestore(app, {
    ignoreUndefinedProperties: true
  }, firebaseConfig.firestoreDatabaseId);
} catch (error) {
  console.warn("Firebase Firestore: initializeFirestore custom DB failed, trying getFirestore with custom DB:", error);
  try {
    dbInstance = getFirestore(app, firebaseConfig.firestoreDatabaseId);
  } catch (secondaryError) {
    console.warn("Firebase Firestore: Falling back to default DB initialization:", secondaryError);
    try {
      dbInstance = initializeFirestore(app, {
        ignoreUndefinedProperties: true
      });
    } catch (finalErr) {
      dbInstance = getFirestore(app);
    }
  }
}

export const db = dbInstance;

// Test connection
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log("Firebase connection successful");
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration.");
    }
  }
}
testConnection();

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

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null = null) {
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
