import { initializeApp, getApps, cert, type App } from 'firebase-admin/app'
import { getFirestore, type Firestore } from 'firebase-admin/firestore'

let app: App | undefined
let db: Firestore | undefined

// FALLBACK SERVICE ACCOUNT - REMOVE THIS AND USE ENV VARS IN PRODUCTION!
const FALLBACK_SERVICE_ACCOUNT = {
  type: "service_account",
  project_id: "ebsumsa-f3120",
  private_key_id: "c83614b1621c487818ea0d16bc372eb80c264bb1",
  private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQDKGJNOD8uO2/ZG\nD/aouhWQejvqMyjiA8EkNN4KerMbLDY+59WICvf2OWKUrAAmPPEcLvHBt597Cr/P\nWGBbg7FUM9ZqOEzrQtt7IG4AORRg7vSQrGetSju+Vs/Ghp423Qnm0yX9YMn0KrUp\nrkl8ONTminbWCeckSxuh6FYWqBSr1twrMs4niNWOJ8LwT/eSPsdGGkfO744EkuNW\nl5IoUn4WvzdLdXFOEr44VzfiY9DcVoQXu+SNPpc9lKLCjATEZ85OZZ2g+92fu/PS\nEQFnbYfHNP8acezkjYCCBZPW1HrOFKI9oMLsfJP8ff27TKe3QAJymbsg/phFZ/E7\ng87AudERAgMBAAECggEADhdHkg5M4aGZmsn7J0mOPlwfeFVn2NZtLZKYFr/2ZAMh\npyIwA8PMBTl8E6SogAIIx6/IQHsGniQiOplNYqQchaP1o8NYLaEkP4ID2XUhZB7V\nI485zV3bK4rPAucY+fdQfO0k/XU1r5YYupbB3ezyfz6RSZw4JxIrk47pDbxbcJ2z\nU3O93tFx1W+ibCZMc4wRaTzajj6Yowhse2lUE2WqjZ8Ct0L9NUZl5XpG3JbKS3bi\ne4hhHByRI5IP7P2MHgFZ+up7XVgrBOsRlmh2cqVXpDawmVgfOnRAAMQikEjTiOsp\n/ITU0zEEzdPscQFDccb/6U+EUu3DRb96SPtgyaUiKQKBgQDoOLHU/dSNwuPGwigo\nlB5pgkko+UfxSpfNkSeED3xZtbIZ9vabSSXGSMT2Pko1r1XLEGfBGq80LW/qIO5m\n/2kRwMVUzRd/vAM7G5mzcT5EFqPwY732uFnstuGAHL0BqAXw2uAiC8sMl/H1zWcj\nm4kJ7MYE15JmT6HY6d3usw9LBQKBgQDeyjDlv1NhChHhPrnicQeiWUXpzX6qY5bG\nHWfK0/hKkjVZQpWcfwXyCESd3QofQ+gMHcYcThQtTPlNmF+QZ6lUTmfTMBO+DJ0o\nV1XIT6qHQEbWLxXb3YR6VHJ2snqIfERBv5gFIXcuNjPkBarHMbwyzEfemU63J9hN\nAuz0P6TDnQKBgGaiMA6HxPqGiS8ePqt4k1xkZbtDOYWuRxtmrQVT5syrXjTVjrah\nBJ33KX3/l8LUZGGkNYcGKSsxbcYXmeZRuflLrqtFHb7ptO/Zyfuh8DgdnYUwQBQb\n9DqHtXBuwyZJQZ7qzaaeebZuLVVK2+vD4TROvlIDiMPJLCn3aswFvZuVAoGAeCur\nkGFRAijCWDLTZTb+nS12LpSvXAz3yMkXsSoA5YhTyl/F/3HsrQ6UpGoUCaVBRzfQ\nInhjHcRFPPuRoHyps1XPXvSx0XNQWfAxzyhZnTaofuNK8RtdV/aw/yFqQrB0yNol\nj67rcDvAZaBA680B7IyPv5wF/3k4jOGlGmIx52kCgYARqGd8uOfKGUM31bCPZo4A\nUG3ZmMP+QZRwS1GbQOEJJ8xYiH6XuteLrEZvZCdUMfbZhDO6XK3XHIaiMX1HGd8Y\nWk/BkdxfOEBbOIOfjIvgMCMx58nNxzD65sUdBg3G1rzR+CpjRZ3eIj4mk3E0d3C2\n85efQ2uY1MFjS/6yA1BHUg==\n-----END PRIVATE KEY-----\n",
  client_email: "firebase-adminsdk-fbsvc@ebsumsa-f3120.iam.gserviceaccount.com",
  client_id: "118168158457563910775",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40ebsumsa-f3120.iam.gserviceaccount.com",
  universe_domain: "googleapis.com"
}

function getFirebaseAdmin() {
  if (!app) {
    const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
    
    let serviceAccount
    if (serviceAccountKey) {
      try {
        serviceAccount = JSON.parse(serviceAccountKey)
      } catch (e) {
        console.warn('Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY, using fallback')
        serviceAccount = FALLBACK_SERVICE_ACCOUNT
      }
    } else {
      console.warn('FIREBASE_SERVICE_ACCOUNT_KEY not set, using fallback')
      serviceAccount = FALLBACK_SERVICE_ACCOUNT
    }

    try {
      
      if (getApps().length === 0) {
        app = initializeApp({
          credential: cert(serviceAccount),
        })
      } else {
        app = getApps()[0]
      }
    } catch (e) {
      throw new Error(`Failed to initialize Firebase Admin: ${e instanceof Error ? e.message : 'Unknown error'}`)
    }
  }

  if (!db) {
    db = getFirestore(app)
  }

  return { app, db }
}

export { getFirebaseAdmin }
