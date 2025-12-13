# MysterBox 🔐

**English** | [简体中文](./README_CN.md)

**MysterBox** is a modern, privacy-focused, local-first password manager that runs entirely in your browser. It provides robust encryption within a clean, responsive user interface.

> **Zero Knowledge. Local Only. No Servers.**

Your data never leaves your device unencrypted. There is no backend, no cloud sync, and no tracking. You own your data file (`.vlt`) and decide where to store it.

![MysterBox Preview](./myster_box_page.png)

## ✨ Key Features

*   **🛡️ Strong Encryption**: Implements **AES-256-GCM** for data encryption and **PBKDF2-SHA256** (600,000 iterations) for key derivation.
*   **📂 Local-First Architecture**: Vaults are stored as single encrypted files (`.vlt`) or JSON. Supports the File System Access API for direct file saving.
*   **🎨 Modern UI/UX**:
    *   Responsive Masonry (Grid) & Timeline views.
    *   Dark Mode support.
    *   Interactive 3D card effects.
    *   Fluid animations.
*   **🏷️ Organization**:
    *   Tag management with custom colors.
    *   Search and filtering capabilities.
    *   Custom fields (hidden/visible) for specific data needs.
*   **🌍 Internationalization**: Native support for **English** and **Chinese (Simplified)**.
*   **📱 Mobile Friendly**: Responsive design with a dedicated mobile menu and touch optimizations.
*   **🖥️ Desktop App**: Native support for macOS, Windows, and Linux via Electron.

## 🚀 Getting Started

### Prerequisites

*   Node.js (v16 or higher)
*   npm or yarn

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/JamieJustTang/mysterbox-vault.git
    cd mysterbox-vault
    ```

2.  **Install dependencies**
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Start the development server**
    ```bash
    npm run dev
    ```

    The app will open at `http://localhost:5173` (Vite default).

## 📦 Builds & Releases

### Web (browser-only)
```bash
npm run build
```
Outputs static assets in `dist/`, suitable for local/static hosting.

### macOS (Tauri, arm64)
```bash
npm run tauri:build
```
Output: `src-tauri/target/release/bundle/dmg/MysterBox_1.0.0_aarch64.dmg` (~1.3 MB, unsigned). Right-click “Open” on first launch to bypass Gatekeeper.

### Android (APK/AAB, arm64)
```bash
export JAVA_HOME=/opt/homebrew/opt/openjdk@17
export ANDROID_HOME=$HOME/Library/Android/sdk
export ANDROID_SDK_ROOT=$ANDROID_HOME
npx tauri android build --target aarch64
```
Outputs (unsigned):
* APK: `src-tauri/gen/android/app/build/outputs/apk/universal/release/app-universal-release-unsigned.apk`
* AAB: `src-tauri/gen/android/app/build/outputs/bundle/universalRelease/app-universal-release.aab`

Sign the APK/AAB with your keystore before distribution.

### (Optional) Electron build
```bash
npm run electron:build
```
Output: `release/MysterBox-1.0.0-arm64.dmg` (unsigned, larger footprint).

## 🔒 Security Architecture

MysterBox prioritizes data privacy and security:

1.  **Encryption**: Data is encrypted using `AES-GCM` with a 256-bit key.
2.  **Integrity**: GCM mode provides authenticated encryption to detect tampering.
3.  **Key Derivation**: The master password is never stored. The encryption key is derived on-the-fly using `PBKDF2` with a random 16-byte salt and **600,000 iterations**.
4.  **Memory**: Sensitive data exists only in the browser's volatile memory and is cleared upon reload or exit.

## 🛠️ Tech Stack

*   **Frontend**: React 18, TypeScript, Vite
*   **Styling**: Tailwind CSS
*   **Icons**: Lucide React
*   **Desktop Wrapper**: Electron
*   **Cryptography**: Web Crypto API (Native Browser Standard)

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

Created by [Jamie Tang](https://github.com/JamieJustTang)
