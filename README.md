<div align="center">

<img src="src-tauri/icons/icon.png" alt="MysterBox Logo" width="120" />

# MysterBox

### 🔐 Secure, Local, Zero-Knowledge Password Manager

[![MIT License](https://img.shields.io/badge/License-MIT-red.svg)](LICENSE)
[![Version](https://img.shields.io/badge/Version-2.0.0-orange.svg)](#)
[![Platform](https://img.shields.io/badge/Platform-macOS%20%7C%20Web-blue.svg)](#)
[![Encryption](https://img.shields.io/badge/Encryption-AES--256--GCM-green.svg)](#)

**MysterBox** is a privacy-first, offline password manager that keeps your credentials safe with military-grade encryption — entirely on your device. No accounts, no cloud, no tracking.

[Features](#-features) · [Screenshots](#-screenshots) · [Getting Started](#-getting-started) · [Architecture](#-architecture) · [License](#-license)

</div>

---

## ✨ Features

### 🛡️ Security First
- **AES-256-GCM encryption** with PBKDF2-SHA256 key derivation (600,000 iterations)
- **Zero-knowledge architecture** — your master password never leaves your device
- **Local-only storage** — vault data is stored as an encrypted `.vlt` file, no cloud sync
- **Auto-lock** on exit to prevent unauthorized access

### 🗂️ Smart Vault Management
- **Card & Table views** — switch between visual card grid and compact table layout
- **Tag system** with custom colors — organize entries by category (Personal, API Key, Work, etc.)
- **Favorites & Archive** — quick-access starred items and soft-delete support
- **Smart sorting** — by recent usage, frequency, or alphabetical order
- **Instant search** — filter vault entries in real-time
- **Auto-save** — changes are automatically saved to the original file (1.5s debounce)

### 🔑 Password Tools
- **Password Generator** — create strong passwords with customizable length (8–64 chars), uppercase/lowercase, numbers, and symbols, with strength indicator and generation history
- **Security Audit** — analyze all vault entries for weak passwords, reused passwords, password age > 180 days, and incomplete entries, with a health score and one-click fix

### 🎨 Modern UI/UX
- **Clean glassmorphism design** with smooth animations
- **Responsive layout** with sidebar navigation
- **Favicon auto-fetch** — automatically displays website icons for each entry
- **Custom fields** — store any extra data (security questions, PINs, backup codes, etc.)
- **Bilingual** — full English / 中文 interface support

### 📦 Cross-Platform
- **Tauri desktop app** — native macOS `.dmg` packaged distribution
- **Web app** — also runs in any modern browser
- **Electron support** — optional Electron build available

---

## 📸 Screenshots

### Landing Page
> Unlock an existing vault or create a new one — simple and secure entry point.

<div align="center">
<img src="screenshot/landing page.png" alt="Landing Page" width="700" />
</div>

### Dashboard — Card Layout
> Visual card grid with tag badges, favorites, and sorting options. Sidebar shows vault location, tag filters, tools, and vault health score.

<div align="center">
<img src="screenshot/main page(card layout)-tags,favorites,sort-bys.png" alt="Dashboard Card Layout" width="800" />
</div>

### Dashboard — Table Layout
> Compact table view for quick scanning — see name, username, URL, and copy passwords at a glance.

<div align="center">
<img src="screenshot/main page(table layout).png" alt="Dashboard Table Layout" width="800" />
</div>

### Card Editor — Basic Properties
> Edit entry name, username, password (with strength bar), website URL, tags, notes, and custom fields. Supports password visibility toggle, one-click copy, and random generation.

<div align="center">
<img src="screenshot/card edit(basic properties).png" alt="Card Edit - Basic" width="500" />
</div>

### Card Editor — Custom Fields
> Add unlimited custom fields to any entry — perfect for API quotas, security answers, backup codes, or any structured metadata.

<div align="center">
<img src="screenshot/card edit(custom fields).png" alt="Card Edit - Custom Fields" width="500" />
</div>

### Password Generator
> Generate strong passwords instantly with customizable rules. Visual strength indicator and recent history panel for easy recall.

<div align="center">
<img src="screenshot/feature-random code generator.png" alt="Password Generator" width="800" />
</div>

### Security Audit
> Comprehensive security analysis with health score ring chart. Detects weak passwords, reused credentials, aged passwords (>180 days), and incomplete entries. One-click "Fix" navigation.

<div align="center">
<img src="screenshot/feature-security audit.png" alt="Security Audit" width="800" />
</div>

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) >= 18
- [Rust toolchain](https://rustup.rs/) (for Tauri desktop build)

### Install & Run (Web Dev)

```bash
git clone https://github.com/JamieJustTang/mysterbox-vault.git
cd mysterbox-vault
npm install
npm run dev
```

Open `http://localhost:14131` in your browser.

### Build Desktop App (macOS)

```bash
npm run tauri:build
```

The `.dmg` installer will be generated at:
```
src-tauri/target/release/bundle/dmg/MysterBox_2.0.0_aarch64.dmg
```

---

## 🏗️ Architecture

```
mysterbox-v2/
├── src/                        # Frontend (React + TypeScript)
│   ├── components/             # UI Components
│   │   ├── UnlockScreen.tsx    # Landing & vault unlock
│   │   ├── Dashboard.tsx       # Main vault view (card/table)
│   │   ├── CardModal.tsx       # Entry editor dialog
│   │   ├── Generator.tsx       # Password generator tool
│   │   ├── SecurityAudit.tsx   # Vault health analysis
│   │   ├── Sidebar.tsx         # Navigation sidebar
│   │   └── ui/                 # Reusable UI primitives
│   ├── context/
│   │   └── VaultContext.tsx    # Global state & auto-save logic
│   ├── services/
│   │   ├── crypto.ts          # AES-256-GCM encrypt/decrypt
│   │   └── fileSystem.ts      # File I/O (Tauri native + Web API)
│   ├── i18n.ts                # EN/ZH translations
│   └── types.ts               # TypeScript interfaces
├── src-tauri/                  # Tauri backend (Rust)
│   ├── src/lib.rs             # Plugin registration
│   ├── tauri.conf.json        # App config, icons, permissions
│   └── icons/                 # App icons (all platforms)
└── package.json
```

### Encryption Flow

```
Master Password
      │
      ▼
   PBKDF2-SHA256 (600k iterations) + Random Salt (16 bytes)
      │
      ▼
   AES-256-GCM Key
      │
      ├─ Encrypt ──▶  MBOX + Salt + IV + Ciphertext  ──▶  .vlt file
      │
      └─ Decrypt ◀──  .vlt file  ──▶  VaultData JSON
```

### Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Vite 6 |
| Styling | TailwindCSS 4, Radix UI, Motion |
| Encryption | Web Crypto API (AES-256-GCM, PBKDF2) |
| Desktop | Tauri 2 (Rust backend) |
| File I/O | tauri-plugin-dialog + tauri-plugin-fs |

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

<div align="center">

**Local-First · Zero-Knowledge · Secure**

Made with ❤️ by [Jamie Tang](https://github.com/JamieJustTang)

</div>
