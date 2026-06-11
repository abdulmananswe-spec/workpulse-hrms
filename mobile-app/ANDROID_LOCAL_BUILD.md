# WorkPulse HRMS — Local Android APK Build Guide

## Prerequisites

| Requirement | Version |
|-------------|---------|
| Android Studio | **Ladybug (2024.2.1)** or newer |
| JDK | **17** (bundled with Android Studio JBR) |
| Android SDK | **API 35** (Android 15) |
| Build Tools | **35.0.0** |
| Node.js | **20 LTS** or later |

Set environment variables (Windows):

```powershell
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
$env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"
$env:Path += ";$env:ANDROID_HOME\platform-tools;$env:JAVA_HOME\bin"
```

## One-time setup

```bash
cd mobile-app
npm install
npm run prebuild:android
```

Ensure `.env` contains:

```
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Debug APK (installable, no keystore required)

```bash
cd mobile-app
npm run android:assembleDebug
```

**Output:**

```
mobile-app/android/app/build/outputs/apk/debug/app-debug.apk
```

Install on device:

```bash
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

## Release APK (signed)

### 1. Generate keystore (once)

```bash
keytool -genkeypair -v -storetype PKCS12 -keystore android/release.keystore -alias workpulse-hrms -keyalg RSA -keysize 2048 -validity 10000
```

### 2. Create signing config

```bash
copy keystore.properties.example android\keystore.properties
```

Edit `android/keystore.properties`:

```properties
storeFile=release.keystore
storePassword=your-store-password
keyAlias=workpulse-hrms
keyPassword=your-key-password
```

Place `release.keystore` in the `android/` folder.

### 3. Build release APK

```bash
cd mobile-app
npm run android:assembleRelease
```

**Output:**

```
mobile-app/android/app/build/outputs/apk/release/app-release.apk
```

## Android Studio

1. Open `mobile-app/android` in Android Studio.
2. Wait for Gradle sync.
3. **Build → Build Bundle(s) / APK(s) → Build APK(s)**.
4. Select **debug** or **release** variant.

## Expected build time

| Build | First run | Subsequent |
|-------|-----------|------------|
| Debug APK | 8–15 min | 2–5 min |
| Release APK | 10–20 min | 3–7 min |

## Regenerate native project

After changing `app.json` plugins:

```bash
npm run prebuild:android
```
