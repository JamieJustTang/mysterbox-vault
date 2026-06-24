<div align="center">

<img src="src-tauri/icons/icon.png" alt="MysterBox Logo" width="120" />

# MysterBox

### 🔐 安全 · 本地 · 零知识的密码管理器

[![MIT License](https://img.shields.io/badge/License-MIT-red.svg)](LICENSE)
[![Version](https://img.shields.io/badge/Version-2.0.0-orange.svg)](#)
[![Platform](https://img.shields.io/badge/Platform-macOS%20%7C%20Web-blue.svg)](#)
[![Encryption](https://img.shields.io/badge/Encryption-AES--256--GCM-green.svg)](#)
[![Download](https://img.shields.io/badge/Download-macOS%20.dmg-EC5A2A.svg)](https://github.com/JamieJustTang/mysterbox-vault/releases/tag/MacOS)

[English](README.md) · **中文**

**MysterBox** 是一款隐私优先、完全离线的密码管理器，用军用级加密把你的账号凭据安全地保存在**你自己的设备上**。无需注册、不上云、零追踪。

[下载](#-下载) · [核心亮点](#-核心亮点) · [功能特性](#-功能特性) · [界面截图](#-界面截图) · [快速开始](#-快速开始) · [项目架构](#-项目架构)

</div>

---

## ⬇️ 下载

从 **[Releases 页面 »](https://github.com/JamieJustTang/mysterbox-vault/releases/tag/MacOS)** 获取最新的 macOS 版本（Apple Silicon）：

- **[MysterBox_2.0.0_aarch64.dmg](https://github.com/JamieJustTang/mysterbox-vault/releases/tag/MacOS)** —— 拖入「应用程序」即可运行。

> 首次打开：应用未做公证，右键应用 →「打开」即可绕过一次 Gatekeeper 提示。

---

## ⭐ 核心亮点

| | |
|---|---|
| 🔑 **内置随机密码生成器** | 一键生成又强又难猜的密码——自由调节长度（8–64）和字符组合，实时显示强度，还能从历史记录里随时取回上几次生成的结果。 |
| 🏷️ **标签分类管理** | 用带颜色的标签给账号分组（个人 / API 密钥 / 工作……），单击即可按标签筛选保险库，常用账号还能一键「收藏」置顶。 |
| 🩺 **密码健康度评分** | 实时计算保险库整体安全评分，自动揪出弱密码、重复密码、过期密码和信息不全的条目——每一项都能一键「修复」。 |
| 🔒 **零知识 · 全离线** | AES-256-GCM + PBKDF2（60 万次迭代）。主密码和数据从不离开本机——不上云、不要账号、无任何遥测。 |

---

## ✨ 功能特性

### 🛡️ 安全优先
- **AES-256-GCM 加密**，配合 PBKDF2-SHA256 密钥派生（600,000 次迭代）
- **零知识架构** —— 你的主密码永远不离开本机
- **纯本地存储** —— 保险库以加密的 `.vlt` 文件保存，不做任何云同步
- **退出自动上锁**，防止未授权访问

### 🗂️ 智能保险库管理
- **卡片视图 / 表格视图** —— 在直观的卡片网格和紧凑的表格之间随意切换
- **自定义颜色标签** —— 按类别（个人、API 密钥、工作等）整理条目，单击标签即可筛选
- **收藏与归档** —— 收藏置顶常用项，归档为可恢复的软删除
- **智能排序** —— 按最近使用、使用频率或字母顺序排列
- **即时搜索** —— 实时过滤保险库条目
- **自动保存** —— 每次改动都会自动写回原 `.vlt` 文件（1.5 秒防抖）

### 🔑 密码工具
- **随机密码生成器** —— 自定义长度（8–64 位）和字符集（大写 / 小写 / 数字 / 符号），带实时强度指示、一键复制/重新生成，以及最近生成历史面板
- **安全审计** —— 扫描每个条目，检测**弱密码**、**重复密码**、**超过 180 天未更新**、**信息不完整**，汇总为一个**健康评分**，每个问题都支持一键**修复**跳转

### 🎨 现代化界面体验
- **清爽的玻璃拟态设计**，配合流畅动效
- **逐条目详情编辑** —— 名称、用户名、密码（显示 / 复制 / 生成 + 强度条）、网址（一键打开）、标签、备注，以及不限数量的**自定义字段**
- **网站图标自动获取** —— 自动显示每个站点的 favicon
- **使用元数据** —— 每个条目记录创建/修改时间和使用次数
- **中英双语** —— 完整的 English / 中文 界面

### 📦 跨平台
- **Tauri 桌面应用** —— 原生 macOS `.dmg` 分发
- **Web 应用** —— 也可在任意现代浏览器中运行
- **Electron 支持** —— 可选的 Electron 构建

---

## 📸 界面截图

### 🔓 启动页 —— 解锁或新建
> 简洁而安全的入口：用主密码打开已有的 `.vlt` 保险库，或新建一个。所有数据都留在本地。

<div align="center">
<img src="screenshot/landing page.png" alt="启动页" width="700" />
</div>

### 🗃️ 主界面 —— 卡片视图 · 标签、收藏与排序
> 直观的卡片网格，带网站图标、**彩色标签徽章**和一键复制。左侧栏展示保险库位置与实时自动保存状态、**标签筛选**（个人、API 密钥……）、工具入口，以及底部的**健康度小组件**——评分和待处理问题一目了然。

<div align="center">
<img src="screenshot/main page(card layout)-tags,favorites,sort-bys.png" alt="卡片视图" width="800" />
</div>

### 📋 主界面 —— 表格视图
> 紧凑的表格视图，便于快速浏览——名称、用户名、网址并排展示，复制和操作就在行内。卡片与表格随时一键切换。

<div align="center">
<img src="screenshot/main page(table layout).png" alt="表格视图" width="800" />
</div>

### 🔑 随机密码生成器
> 即时生成强密码。拖动**长度滑块**（8–64），切换大写 / 小写 / 数字 / 符号开关，**强度指示**实时更新。一键复制或重新生成，并可从**历史记录**面板取回。

<div align="center">
<img src="screenshot/feature-random code generator.png" alt="随机密码生成器" width="800" />
</div>

### 🩺 安全审计 —— 密码健康度评分
> 全面的健康检查，配一个**评分环**（如 65 / 一般）。统计卡分别给出**弱密码**、**重复密码组**、**超过 180 天的密码**和**不完整条目**的数量。下方风险列表逐条展示问题账号、强度条与一键**修复**。

<div align="center">
<img src="screenshot/feature-security audit.png" alt="安全审计" width="800" />
</div>

### ✏️ 条目编辑器 —— 基础属性
> 编辑名称、用户名、密码（带显示/复制/生成和强度条）、网址（一键打开）、**标签**、备注和自定义字段——还会显示创建/修改时间和使用次数。在编辑器里即可收藏或归档。

<div align="center">
<img src="screenshot/card edit(basic properties).png" alt="条目编辑 - 基础" width="500" />
</div>

### 🧩 条目编辑器 —— 自定义字段
> 为任意条目添加不限数量的**自定义字段**——非常适合存放 API 配额、密保答案、备份码、找回邮箱等任何结构化信息。

<div align="center">
<img src="screenshot/card edit(custom fields).png" alt="条目编辑 - 自定义字段" width="500" />
</div>

---

## 🚀 快速开始

### 环境要求

- [Node.js](https://nodejs.org/) >= 18
- [Rust 工具链](https://rustup.rs/)（用于 Tauri 桌面构建）

### 安装并运行（Web 开发）

```bash
git clone https://github.com/JamieJustTang/mysterbox-vault.git
cd mysterbox-vault
npm install
npm run dev
```

在浏览器中打开 `http://localhost:14131`。

### 构建桌面应用（macOS）

```bash
npx @tauri-apps/cli build --bundles dmg
```

生成的 `.dmg` 安装包位于：
```
src-tauri/target/release/bundle/dmg/MysterBox_2.0.0_aarch64.dmg
```

---

## 🏗️ 项目架构

```
mysterbox-v2/
├── src/                        # 前端（React + TypeScript）
│   ├── components/             # UI 组件
│   │   ├── UnlockScreen.tsx    # 启动页与保险库解锁
│   │   ├── Dashboard.tsx       # 主界面（卡片/表格）
│   │   ├── CardModal.tsx       # 条目编辑弹窗
│   │   ├── Generator.tsx       # 密码生成器
│   │   ├── SecurityAudit.tsx   # 保险库健康分析
│   │   ├── Sidebar.tsx         # 侧边导航栏
│   │   └── ui/                 # 可复用 UI 基础组件
│   ├── context/
│   │   └── VaultContext.tsx    # 全局状态与自动保存逻辑
│   ├── services/
│   │   ├── crypto.ts          # AES-256-GCM 加解密
│   │   └── fileSystem.ts      # 文件 I/O（Tauri 原生 + Web API）
│   ├── i18n.ts                # 中英文翻译
│   └── types.ts               # TypeScript 类型定义
├── src-tauri/                  # Tauri 后端（Rust）
│   ├── src/lib.rs             # 插件注册
│   ├── tauri.conf.json        # 应用配置、图标、权限
│   └── icons/                 # 全平台应用图标
└── package.json
```

### 加密流程

```
主密码
  │
  ▼
PBKDF2-SHA256（60 万次迭代）+ 随机盐（16 字节）
  │
  ▼
AES-256-GCM 密钥
  │
  ├─ 加密 ──▶  MBOX + 盐 + IV + 密文  ──▶  .vlt 文件
  │
  └─ 解密 ◀──  .vlt 文件  ──▶  VaultData JSON
```

### 技术栈

| 层 | 技术 |
|---|---|
| 前端 | React 19、TypeScript、Vite 6 |
| 样式 | TailwindCSS 4、Radix UI、Motion |
| 加密 | Web Crypto API（AES-256-GCM、PBKDF2） |
| 桌面端 | Tauri 2（Rust 后端） |
| 文件 I/O | tauri-plugin-dialog + tauri-plugin-fs |

---

## 📄 许可协议

本项目基于 [MIT License](LICENSE) 开源。

---

<div align="center">

**本地优先 · 零知识 · 安全可靠**

由 [Jamie Tang](https://github.com/JamieJustTang) 用 ❤️ 打造

</div>
