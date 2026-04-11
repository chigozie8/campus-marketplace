# Building VendoorX Native Apps (Android APK / iOS IPA)

VendoorX is a PWA-first app. The web app IS the app — fully installable on Android and
iPhone directly from the browser. No app store needed.

For distributing through Google Play / Apple App Store, follow these steps on your
**local machine** (not Replit — Replit cannot compile native binaries):

---

## Prerequisites

| Tool | Android | iOS |
|------|---------|-----|
| Node.js 18+ | ✅ | ✅ |
| Android Studio + SDK | ✅ | ❌ |
| Mac + Xcode 15+ | ❌ | ✅ |

---

## Setup (one-time)

```bash
# 1. Install Capacitor CLI and core
npm install @capacitor/cli @capacitor/core @capacitor/android @capacitor/ios

# 2. Build the Next.js static export
#    (update next.config.ts: add output: 'export')
npm run build

# 3. Add native platforms
npx cap add android
npx cap add ios

# 4. Copy web build into native projects
npx cap sync
```

---

## Build Android APK

```bash
# Open in Android Studio and build from there, OR:
cd android
./gradlew assembleRelease

# Signed APK output:
# android/app/build/outputs/apk/release/app-release.apk
```

For Play Store: use `./gradlew bundleRelease` to get an `.aab` file.

---

## Build iOS IPA (Mac only)

```bash
# Open in Xcode
npx cap open ios

# In Xcode:
# Product → Archive → Distribute App → App Store Connect / Ad Hoc
```

---

## Important Notes

- The `capacitor.config.ts` at the project root points the WebView to `https://vendoorx.ng`
  so native shells always serve the live web app — no static export needed for the shell.
- To change the app icon: replace icons in `android/app/src/main/res/` and `ios/App/App/Assets.xcassets/`
- For push notifications, add `@capacitor/push-notifications` and configure FCM (Android) / APNS (iOS)
- Splash screen: add `@capacitor/splash-screen` and update `capacitor.config.ts`

---

## PWA Install (No native build needed)

Users can install VendoorX directly from the browser:
- **Android Chrome**: tap "Add to Home Screen" from the install banner
- **iPhone Safari**: tap Share → "Add to Home Screen"

This gives a native-feeling full-screen app with an icon on the home screen, instant launch,
and offline support — without any app store submission.
