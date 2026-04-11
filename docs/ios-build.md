# VendoorX iOS Build Guide

## Prerequisites

- A Mac computer running macOS 13+ (Ventura or later)
- Xcode 15+ installed (download free from Mac App Store)
- An Apple Developer account ($99/year for App Store distribution)
- Node.js 18+ and npm installed
- The VendoorX codebase cloned locally

## Step 1 — Install dependencies

```bash
npm install
```

## Step 2 — Add the iOS platform

From the project root:

```bash
npx cap add ios
```

This generates the `ios/` folder containing the native Xcode project.

## Step 3 — Sync web assets

```bash
npm run cap:sync
```

This copies the latest web build into the native project.

## Step 4 — Open in Xcode

```bash
npm run cap:open:ios
# or directly:
npx cap open ios
```

## Step 5 — Configure signing in Xcode

1. In Xcode, click on the **VendoorX** project in the left sidebar
2. Select the **App** target
3. Go to **Signing & Capabilities**
4. Check **Automatically manage signing**
5. Select your **Team** (your Apple Developer account)
6. Xcode will generate a provisioning profile automatically

## Step 6 — Configure Push Notifications capability

1. In Xcode, go to **Signing & Capabilities**
2. Click **+ Capability**
3. Add **Push Notifications**
4. Also add **Background Modes** and check **Remote notifications**

## Step 7 — Run on a device or simulator

- **Simulator:** Select a simulator from the device picker and press ▶ Run
- **Physical device:** Connect your iPhone via USB, select it from the picker, press ▶ Run

> Note: Push notifications do NOT work on the iOS Simulator — you must use a physical iPhone to test them.

## Step 8 — Build for App Store (TestFlight / Production)

1. In Xcode, set the scheme to **Release** (Product → Scheme → Edit Scheme → Run → Build Configuration → Release)
2. Go to **Product → Archive**
3. Once archiving completes, the Organizer window opens
4. Click **Distribute App**
5. Choose **App Store Connect**
6. Follow the prompts to upload to App Store Connect
7. In App Store Connect (appstoreconnect.apple.com), create a new TestFlight build or submit for review

## Environment variables for native push (APNs)

For iOS push notifications to work in production, you need APNs credentials:

1. In your Apple Developer account, go to **Certificates, Identifiers & Profiles**
2. Under **Keys**, create a new key with **Apple Push Notifications service (APNs)** checked
3. Download the `.p8` key file
4. Note your **Key ID** and **Team ID**
5. Add these to your backend environment:
   ```
   APNS_KEY_PATH=/path/to/AuthKey_XXXXXXXX.p8
   APNS_KEY_ID=XXXXXXXX
   APNS_TEAM_ID=XXXXXXXXXX
   APNS_BUNDLE_ID=com.vendoorx.app
   ```

## Useful commands

```bash
# Sync web content to native projects
npm run cap:sync

# Open Android Studio
npm run cap:open:android

# Open Xcode
npm run cap:open:ios

# Run on Android
npm run cap:android

# Run on iOS (requires Mac + Xcode)
npm run cap:ios
```

## Troubleshooting

**"No provisioning profile" error:**
→ Make sure you're signed into Xcode with your Apple ID (Xcode → Settings → Accounts)

**Build fails with signing error:**
→ Check that your App ID (`com.vendoorx.app`) is registered in your Apple Developer account under Identifiers

**Push notifications not received:**
→ Push notifications require a physical device and a valid APNs certificate/key
→ Make sure the Push Notifications capability is added in Xcode

**White screen on launch:**
→ Confirm `server.url` in `capacitor.config.ts` points to your live deployed URL
→ The app loads vendoorx.ng inside the native shell — make sure the site is live
