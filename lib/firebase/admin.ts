import { initializeApp, getApps, cert, type App } from 'firebase-admin/app'
import { getFirestore, type Firestore } from 'firebase-admin/firestore'

let app: App | undefined
let db: Firestore | undefined

function getFirebaseAdmin() {
  if (!app) {
    const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
    
    if (!serviceAccountKey) {
      throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set')
    }

    try {
      const serviceAccount = JSON.parse(serviceAccountKey)
      
      if (getApps().length === 0) {
        app = initializeApp({
          credential: cert(serviceAccount),
        })
      } else {
        app = getApps()[0]
      }
    } catch (e) {
      throw new Error(`Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY: ${e instanceof Error ? e.message : 'Unknown error'}`)
    }
  }

  if (!db) {
    db = getFirestore(app)
  }

  return { app, db }
}

export { getFirebaseAdmin }
