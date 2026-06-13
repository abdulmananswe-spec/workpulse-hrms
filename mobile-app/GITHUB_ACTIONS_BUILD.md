# GitHub Actions — Official Android APK Build

This is the **official** build pipeline for WorkPulse HRMS mobile releases. It runs entirely on GitHub Actions and does **not** use EAS Build or Expo cloud build services.

## How it works

```
git push main
  → GitHub Actions runner
  → npm ci
  → write .env from repository secrets
  → expo prebuild (local Android project generation on the runner)
  → ./gradlew assembleRelease
  → upload APK artifact
```

`expo prebuild` only generates native project files on the CI machine. No code is sent to Expo's build cloud.

## Required GitHub secrets

**Settings → Secrets and variables → Actions → New repository secret**

| Secret | Required | Description |
|--------|----------|-------------|
| `EXPO_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL (baked into JS bundle at build time) |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anon/public key |

Pushes to `main` **fail** if these secrets are missing.

## Optional release signing secrets

If not set, the APK is signed with the **debug keystore** — valid for sideload testing on client devices.

| Secret | Description |
|--------|-------------|
| `ANDROID_KEYSTORE_BASE64` | Base64-encoded `.keystore` or `.jks` file |
| `ANDROID_KEYSTORE_PASSWORD` | Keystore password |
| `ANDROID_KEY_ALIAS` | Key alias |
| `ANDROID_KEY_PASSWORD` | Key password |

Generate a keystore locally:

```bash
keytool -genkeypair -v -storetype PKCS12 -keystore release.keystore -alias workpulse-hrms -keyalg RSA -keysize 2048 -validity 10000
base64 -w 0 release.keystore   # Linux
certutil -encode release.keystore release.b64 && type release.b64  # Windows
```

## Triggers

| Event | Builds APK? |
|-------|-------------|
| Push to `main` / `master` | Yes (always) |
| Pull request (mobile-app changes) | Yes (placeholder env if secrets unavailable) |
| Manual: Actions → Android APK → Run workflow | Yes |

## Download the APK

1. Open https://github.com/abdulmananswe-spec/workpulse-hrms/actions
2. Click the latest **Android APK** run
3. Scroll to **Artifacts**
4. Download **workpulse-hrms-apk**
5. Install: `adb install app-release.apk`

## Expected build time

| Run | Duration |
|-----|----------|
| First build (cold cache) | 15–25 min |
| Cached builds | 8–15 min |

## Feature parity with local / EAS APK

The GitHub Actions APK uses the same source code and build steps as a local release build:

- Same `expo prebuild` + `assembleRelease` pipeline
- Same `EXPO_PUBLIC_*` environment injection
- Same Supabase, auth, attendance, leaves, notifications, and profile features

Differences vs EAS Build:

| | GitHub Actions | EAS Build |
|--|----------------|-----------|
| Build location | GitHub runner | Expo cloud |
| Signing (default) | Debug keystore | Expo-managed keystore |
| OTA updates | Disabled (`updates.enabled: false`) | Can use Expo Updates |
| Required account | GitHub only | Expo account |

## EAS Build (optional, not official)

EAS scripts in `package.json` are kept for optional developer use only. Production and client testing releases should use this GitHub Actions workflow.

## Workflow file

`.github/workflows/android-apk.yml`
