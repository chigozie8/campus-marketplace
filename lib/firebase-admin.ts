import admin from 'firebase-admin'

let initialized = false

export function getFirebaseAdmin(): admin.app.App | null {
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON
  if (!serviceAccountJson) {
    return null
  }

  if (!initialized) {
    try {
      const serviceAccount = JSON.parse(serviceAccountJson)
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      })
      initialized = true
    } catch (err) {
      console.error('[firebase-admin] Failed to initialise:', err)
      return null
    }
  }

  return admin.app()
}

export async function sendFcmNotification(
  fcmToken: string,
  payload: { title: string; body: string; icon?: string; url?: string }
): Promise<'sent' | 'invalid' | 'error'> {
  const app = getFirebaseAdmin()
  if (!app) {
    console.warn('[firebase-admin] FIREBASE_SERVICE_ACCOUNT_JSON not set — skipping FCM delivery')
    return 'error'
  }

  try {
    await admin.messaging(app).send({
      token: fcmToken,
      notification: {
        title: payload.title,
        body: payload.body,
        imageUrl: payload.icon,
      },
      data: payload.url ? { url: payload.url } : undefined,
      android: {
        notification: {
          icon: 'ic_notification',
          color: '#6D28D9',
          clickAction: 'FLUTTER_NOTIFICATION_CLICK',
        },
        priority: 'high',
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
            badge: 1,
          },
        },
        headers: {
          'apns-priority': '10',
        },
      },
    })
    return 'sent'
  } catch (err: unknown) {
    const code = (err as { code?: string })?.code ?? ''
    if (
      code === 'messaging/registration-token-not-registered' ||
      code === 'messaging/invalid-registration-token'
    ) {
      return 'invalid'
    }
    console.error('[firebase-admin] FCM send error:', err)
    return 'error'
  }
}
