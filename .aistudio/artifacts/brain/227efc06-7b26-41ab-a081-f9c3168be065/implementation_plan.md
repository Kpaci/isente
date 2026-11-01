# Isente Native Android APK Automated Cloud Build & Delivery Plan

Automate the generation of a ready-to-install Android APK file using a free GitHub Actions cloud CI/CD workflow, allowing users to compile the Capacitor project without installing multi-gigabyte Android SDKs locally, and deliver the APK seamlessly through Google Drive for 1-tap in-app downloads.

## User Review & Critical Decisions

> [!IMPORTANT]
> The web environment runs in a container without local Java/Android SDK toolchains. Building via GitHub Actions provides an automated, free cloud builder with Java 17, Android SDK 34, and Gradle that generates real `.apk` binaries directly from the repository.

- **Confirmed Compilation Method**: Automated GitHub Actions Cloud Build (`.github/workflows/build-apk.yml`). Triggers automatically on push or on-demand with a manual "Run workflow" button.
- **Confirmed Delivery & Installation**: Upload compiled APK to Google Drive, with direct download and admin link publishing integrated seamlessly inside the Isente app.
- **APK Signing**: Automatically sign the APK with a standard Android debug keystore during the GitHub Action workflow so it can be sideloaded directly on any Android device without Google Play Store verification.

---

## 1. Overview & Core Concept

- **What It Does**: Provides a complete, automated pipeline that takes the existing Capacitor Android codebase (`/android`) and compiles it into a standalone Android APK file (`Isente-v1.0.0.apk`) in the cloud. Once built, the administrator copies the file link to Google Drive and pastes it into Isente's built-in APK publisher.
- **Target Audience**: Mobile money users in Uganda/Rwanda who want to install Isente directly onto their Android phones to automatically detect MoMo SMS transactions without going through Google Play.
- **Key Value**: Zero software installation required on the user's PC (no Android Studio or JDK needed); reproducible, 1-click APK generation in under 2 minutes.

---

## 2. User Experience & Visual Design

### Key User Flows

```
┌─────────────────────────────────┐
│  Developer / Admin              │
│  Pushes code or clicks          │
│  "Run workflow" in GitHub       │
└────────────────┬────────────────┘
                 │
                 ▼
┌─────────────────────────────────┐
│  GitHub Actions Cloud Runner    │
│  • Compiles Vite web assets     │
│  • Syncs to Capacitor Android   │
│  • Compiles APK via Gradle      │
│  • Artifacts: Isente.apk        │
└────────────────┬────────────────┘
                 │
                 ▼
┌─────────────────────────────────┐
│  Google Drive Hosting           │
│  • Upload Isente.apk            │
│  • Set link to "Anyone with link│
└────────────────┬────────────────┘
                 │
                 ▼
┌─────────────────────────────────┐
│  Isente App (In-App Modal)      │
│  • Admin pastes Drive link once │
│  • Users click "Download APK"   │
│  • Instant download & install   │
└─────────────────────────────────┘
```

### Visual Identity & Theme
- **In-App Modal (`AndroidAPKModal`)**: Retains the obsidian midnight background (`#080c14`) and electric mint accents (`#05F292`).
- **Admin Workflow Helper**: A collapsible guidance accordion inside the admin settings of `AndroidAPKModal` detailing the exact 3 steps to trigger the GitHub Action and fetch the `.apk`.
- **Download Action**: High-contrast, glowing mint "Download Isente APK" button with progress indicator and download trigger confirmation toast.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: GitHub Actions vs Local Android Studio**
  - *Chosen Approach*: GitHub Actions workflow (`build-apk.yml`).
  - *Why*: The developer container does not have 15GB+ Android SDK and Java installed. A GitHub Action executes in an official `ubuntu-latest` runner with pre-installed Android SDK 34, build-tools, and Java 17, taking only 2 minutes to produce a signed APK without taxing local storage.
  - *Alternative Considered*: Local Android Studio export guide. Kept as an optional fallback in documentation, but GitHub Actions is faster and requires no local setup.

- **Decision 2: Universal Debug-Signed APK**
  - *Chosen Approach*: Configure Gradle to output a signed installable APK (`assembleDebug`).
  - *Why*: Debug-signed APKs bypass the complex Google Play Developer Console requirements, can be installed on any Android phone (with "Install from unknown sources" allowed), and have full access to native Android SMS permissions.

- **Decision 3: Seamless Google Drive Direct Link Converter**
  - *Chosen Approach*: Enhance `driveUtils.ts` to automatically detect Google Drive sharing links (e.g. `drive.google.com/file/d/XYZ/view?usp=sharing`) and transform them into direct instant-download URLs (`drive.google.com/uc?export=download&id=XYZ`).
  - *Why*: Eliminates the confusing Google Drive preview screen and directly triggers the `.apk` download in Android browsers.

---

## 4. Technical Architecture & File Strategy

```
┌───────────────────────────────────────────────────────────┐
│                   GitHub Repository                       │
│                                                           │
│  .github/workflows/build-apk.yml                          │
│  ├── Step 1: Checkout repository                          │
│  ├── Step 2: Set up Java 17 (Eclipse Temurin)             │
│  ├── Step 3: Set up Node.js 20 & install dependencies      │
│  ├── Step 4: Run 'npm run build'                          │
│  ├── Step 5: Run 'npx cap sync android'                   │
│  ├── Step 6: Chmod +x ./android/gradlew                   │
│  ├── Step 7: Build APK via './gradlew assembleDebug'      │
│  └── Step 8: Upload artifact 'Isente-v1.0.0.apk'          │
└───────────────────────────────────────────────────────────┘
```

### Execution Steps
1. **Create GitHub Actions Workflow (`/.github/workflows/build-apk.yml`)**:
   - Define automated build pipeline with `workflow_dispatch` (manual trigger button) and push triggers.
   - Cache Gradle dependencies for sub-minute builds.
   - Output renamed `Isente-v1.0.0.apk` directly to GitHub artifacts and releases.
2. **Add Convenience Script (`package.json`)**:
   - Add `"build:apk": "vite build && cap sync android"` for standard synchronization.
3. **Enhance In-App Admin Modal (`src/components/AndroidAPKModal.tsx`)**:
   - Include a concise "How to Build APK" accordion for the admin with a quick-copy command and step-by-step guidance.
   - Retain the clean one-click user download button and real-time Firestore persistence.
4. **Verification**:
   - Run linter and TypeScript compiler.
   - Verify Gradle wrapper permissions and configuration syntax.
