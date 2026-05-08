import { initializeApp } from 'firebase/app'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

let app: ReturnType<typeof initializeApp> | null = null
let storage: ReturnType<typeof getStorage> | null = null

export function initializeFirebase() {
  if (app) return app
  
  try {
    app = initializeApp(firebaseConfig)
    storage = getStorage(app)
  } catch (err) {
    console.error('[firebase] Initialization error:', err)
  }
  
  return app
}

export function getFirebaseStorage() {
  if (!storage) {
    initializeFirebase()
  }
  return storage
}
