# Firebase Configuration Guide

Your Firebase image sharing feature is now set up! Here's what you need to do:

## 1. Get Your Firebase Project Credentials

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Project Settings** (gear icon)
4. Find the **Service Account** tab
5. Click **Generate New Private Key** - this will download a JSON file
6. Go to **Web App** settings to get your public config

## 2. Add Environment Variables

Add these to your Vercel project settings (Settings → Environment Variables):

### Public Variables (visible to client):
- `NEXT_PUBLIC_FIREBASE_API_KEY` - From Web App config
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` - From Web App config
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID` - From Web App config
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` - From Web App config (e.g., `your-project.appspot.com`)
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` - From Web App config
- `NEXT_PUBLIC_FIREBASE_APP_ID` - From Web App config

### Secret Variables (server-only):
- `FIREBASE_SERVICE_ACCOUNT_JSON` - Contents of the JSON file from step 5 (should be a minified JSON string)

## 3. Enable Firebase Storage

1. In Firebase Console, go to **Build → Storage**
2. Click **Create Bucket**
3. Choose a region (e.g., `us-east1`)
4. Allow public read access for this bucket (needed for image sharing)
5. Note the bucket name for reference

## 4. Set Storage Permissions

Add this rule to your Firebase Storage Rules (in Console):

```rules
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Allow authenticated users to read/write their own files
    match /{userId}/{allPaths=**} {
      allow read, write: if request.auth.uid == userId;
    }
  }
}
```

## 5. Test It Out

1. Go to your dashboard
2. Find the "Share store image" button
3. Click it - it should generate your store preview and offer to share

## Features Now Available:

- ✅ Generate store preview images (OG image)
- ✅ Upload store images to Firebase Storage
- ✅ Public URLs for sharing to WhatsApp
- ✅ Fallback download if native sharing not supported
- ✅ Clipboard copy of store URL

## Troubleshooting

If sharing isn't working:

1. Check browser console for errors (F12 → Console)
2. Verify Firebase env vars are set in Vercel
3. Make sure Firebase Storage is enabled in your project
4. Check Firebase Storage Rules allow public access
5. Verify the API responses with Network tab (F12 → Network)
