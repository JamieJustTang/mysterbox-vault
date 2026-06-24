<div align="center">

<img src="src-tauri/icons/icon.png" alt="MysterBox Logo" width="120" />

# MysterBox

### 🔐 Secure, Local, Zero-Knowledge Password Manager

[![MIT License](https://img.shields.io/badge/License-MIT-red.svg)](LICENSE)
[![Version](https://img.shields.io/badge/Version-2.0.0-orange.svg)](#)
[![Platform](https://img.shields.io/badge/Platform-macOS%20%7C%20Web-blue.svg)](#)
[![Encryption](https://img.shields.io/badge/Encryption-AES--256--GCM-green.svg)](#)
[![Download](https://img.shields.io/badge/Download-macOS%20.dmg-EC5A2A.svg)](https://github.com/JamieJustTang/mysterbox-vault/releases/tag/MacOS)

**English** · [中文](README.zh-CN.md)

**MysterBox** is a privacy-first, offline password manager that keeps your credentials safe with military-grade encryption — entirely on your device. No accounts, no cloud, no tracking.

[Download](#-download) · [Highlights](#-highlights) · [Features](#-features) · [Screenshots](#-screenshots) · [Getting Started](#-getting-started) · [Architecture](#-architecture)

</div>

---

## ⬇️ Download

Grab the latest macOS build (Apple Silicon) from the
**[Releases page »](https://github.com/JamieJustTang/mysterbox-vault/releases/tag/MacOS)**:

- **[MysterBox_2.0.0_aarch64.dmg](https://github.com/JamieJustTang/mysterbox-vault/releases/tag/MacOS)** — drag into `Applications` and launch.

> First launch: the app is not notarized, so right-click the app → **Open** to bypass Gatekeeper once.

---

## ⭐ Highlights

| | |
|---|---|
| 🔑 **Built-in Password Generator** | Spin up strong, unguessable passwords in one click — tune length (8–64) and character sets, see a live strength meter, and recall the last ones from history. |
| 🏷️ **Tag-based Organization** | Group accounts with color-coded tags (Personal, API Key, Work…), filter the vault by a single click, and star your most-used logins as Favorites. |
| 🩺 **Password Health Score** | A live vault-health ring scores your overall security and flags weak, reused, aging, or incomplete entries — each with a one-click **Fix**. |
| 🔒 **Zero-Knowledge & Offline** | AES-256-GCM + PBKDF2 (600k iterations). Your master password and data never leave the device — no cloud, no account, no telemetry. |

---

## ✨ Features

### 🛡️ Security First
- **AES-256-GCM encryption** with PBKDF2-SHA256 key derivation (600,000 iterations)
- **Zero-knowledge architecture** — your master password never leaves your device
- **Local-only storage** — vault data is stored as an encrypted `.vlt` file, no cloud sync
- **Auto-lock** on exit to prevent unauthorized access

### 🗂️ Smart Vault Management
- **Card & Table views** — switch between a visual card grid and a compact table layout
- **Tag system** with custom colors — organize entries by category (Personal, API Key, Work, etc.) and filter the vault by tag in one click
- **Favorites & Archive** — quick-access starred items and reversible soft-delete
- **Smart sorting** — by recent usage, frequency, or alphabetical order
- **Instant search** — filter vault entries in real time
- **Auto-save** — every change is written back to the original `.vlt` file automatically (1.5s debounce)

### 🔑 Password Tools
- **Password Generator** — create strong passwords with customizable length (8–64 chars) and character sets (uppercase / lowercase / numbers / symbols), with a live strength indicator, one-click copy/regenerate, and a recent-history panel
- **Security Audit** — scan every entry for **weak passwords**, **reused passwords**, **age > 180 days**, and **incomplete records**, summarized as a **health score** with per-issue one-click **Fix** navigation

### 🎨 Modern UI/UX
- **Clean glassmorphism design** with smooth animations
- **Per-entry detail editor** — name, username, password (show / copy / generate + strength bar), website (with quick-open), tags, notes, and unlimited **custom fields**
- **Favicon auto-fetch** — automatically displays each site's icon
- **Usage metadata** — created/modified dates and a usage counter per entry
- **Bilingual** — full English / 中文 interface

### 📦 Cross-Platform
- **Tauri desktop app** — native macOS `.dmg` distribution
- **Web app** — also runs in any modern browser
- **Electron support** — optional Electron build available

---

## 📸 Screenshots

### 🔓 Landing — Unlock or Create
> A simple, secure entry point: open an existing `.vlt` vault with your master password, or create a new one. Everything stays local.

<div align="center">
<img src="screenshot/landing page.png" alt="Landing Page" width="700" />
</div>

### 🗃️ Dashboard — Card Layout · Tags, Favorites & Sorting
> Visual card grid with site favicons, color-coded **tag badges**, and one-click copy. The sidebar surfaces the vault location with its live auto-save status, **tag filters** (Personal, API Key…), tools, and the **vault-health widget** showing your score and pending issues at a glance.

<div align="center">
<img src="screenshot/main page(card layout)-tags,favorites,sort-bys.png" alt="Dashboard Card Layout" width="800" />
</div>

### 📋 Dashboard — Table Layout
> A compact table view for quick scanning — name, username, and URL side by side, with copy and actions inline. Toggle between card and table at any time.

<div align="center">
<img src="screenshot/main page(table layout).png" alt="Dashboard Table Layout" width="800" />
</div>

### 🔑 Password Generator
> Generate strong passwords instantly. Drag the **length slider** (8–64), toggle uppercase / lowercase / numbers / symbols, and watch the **strength meter** update live. Copy or regenerate in one click, and pull from the **recent-history** panel.

<div align="center">
<img src="screenshot/feature-random code generator.png" alt="Password Generator" width="800" />
</div>

### 🩺 Security Audit — Password Health Score
> A comprehensive health check with a **score ring** (e.g. 65 / Fair). Breakdown cards count **weak passwords**, **reused groups**, **passwords older than 180 days**, and **incomplete entries**. The vulnerable-items list shows each risky login with its strength meter and a one-click **Fix**.

<div align="center">
<img src="screenshot/feature-security audit.png" alt="Security Audit" width="800" />
</div>

### ✏️ Card Editor — Basic Properties
> Edit name, username, password (with show/copy/generate and a strength bar), website (with quick-open), **tags**, notes, and custom fields — plus created/modified timestamps and a usage counter. Star an entry or archive it right from the editor.

<div align="center">
<img src="screenshot/card edit(basic properties).png" alt="Card Edit - Basic" width="500" />
</div>

### 🧩 Card Editor — Custom Fields
> Add unlimited **custom fields** to any entry — perfect for API quotas, security answers, backup codes, recovery emails, or any structured metadata.

<div align="center">
<img src="screenshot/card edit(custom fields).png" alt="Card Edit - Custom Fields" width="500" />
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
npx @tauri-apps/cli build --bundles dmg
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
