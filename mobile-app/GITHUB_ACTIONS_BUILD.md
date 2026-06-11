# GitHub Actions — Android APK Build

Build a debug APK in the cloud. No Android Studio required on your machine.

## One-time GitHub setup

In your repository: **Settings → Secrets and variables → Actions → New repository secret**

| Secret | Description |
|--------|-------------|
| `EXPO_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key |

If secrets are missing, the workflow still builds an APK using placeholder values (app will not connect to Supabase until real secrets are set).

## Trigger a build

The workflow runs automatically on:

- Push to `main` or `master` (when `mobile-app/` changes)
- Pull requests that change `mobile-app/`
- Manual run: **Actions → Android APK → Run workflow**

## Push code to GitHub

```bash
git add .
git commit -m "Add GitHub Actions Android APK workflow"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

## Download the APK

1. Open your repo on GitHub.
2. Go to **Actions**.
3. Click the latest **Android APK** workflow run.
4. Scroll to **Artifacts**.
5. Download **workpulse-hrms-debug-apk**.
6. Unzip if needed — file: `app-debug.apk`.

Install on a device:

```bash
adb install app-debug.apk
```

## Expected build time

| Run | Duration |
|-----|----------|
| First build (cold cache) | **15–25 minutes** |
| Cached builds | **8–15 minutes** |

## Workflow file

`.github/workflows/android-apk.yml`

Steps: checkout → Node 20 → JDK 17 → Android SDK 35 → `npm ci` → `expo prebuild` → `./gradlew assembleDebug` → upload artifact.
