# MysterBox

> 🔐 A local-first, privacy-focused password manager with AES-256-GCM encryption.

**MysterBox** 是一款零知识本地密码管理器。所有数据使用 AES-256-GCM 加密并存储在本地 `.vlt` 文件中，密码永远不会离开你的设备。

---

## ✨ 功能特性

- **🔒 AES-256-GCM 加密** — 使用 PBKDF2-SHA256 (600k 次迭代) 派生密钥
- **🏠 本地优先** — 零服务器、零网络、零追踪
- **🏷️ 智能标签** — 带颜色的分类标签，可视化管理
- **🔑 密码生成器** — 内置可定制的安全密码生成
- **🛡️ 安全审计** — 检测弱密码和重复密码
- **📁 多格式兼容** — 支持 v1 二进制和 v2 JSON 加密格式
- **🌍 国际化** — 中文 / English
- **🖥️ 跨平台** — Web + Tauri (macOS/Linux/Windows) + Electron

## 🚀 快速开始

### Web 版本

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

在浏览器中打开 `http://localhost:3000`。

### Tauri 桌面版

需要预先安装 [Rust](https://www.rust-lang.org/tools/install) 和 Tauri 依赖。

```bash
npm run tauri:dev    # 开发模式
npm run tauri:build  # 构建 DMG
```

### Electron 桌面版

```bash
npm run electron:dev    # 开发模式
npm run electron:build  # 构建安装包
```

## 📁 项目结构

```
mysterbox-v2/
├── src/
│   ├── components/       # React 组件
│   │   ├── Dashboard.tsx      # 主面板
│   │   ├── CardModal.tsx      # 卡片编辑弹窗
│   │   ├── UnlockScreen.tsx   # 解锁/创建页
│   │   ├── Sidebar.tsx        # 侧边栏导航
│   │   ├── Generator.tsx      # 密码生成器
│   │   ├── SecurityAudit.tsx  # 安全审计
│   │   ├── ExitModal.tsx      # 退出确认弹窗
│   │   ├── TagBadge.tsx       # 标签徽章
│   │   ├── TagManagerModal.tsx # 标签管理
│   │   └── TagFilterModal.tsx # 标签筛选
│   ├── context/
│   │   └── VaultContext.tsx   # 全局状态管理
│   ├── services/
│   │   ├── crypto.ts          # 加密/解密服务
│   │   └── fileSystem.ts      # 文件系统服务
│   ├── types.ts               # TypeScript 类型定义
│   ├── i18n.ts                # 国际化翻译
│   └── App.tsx                # 入口组件
├── src-tauri/                 # Tauri 桌面端配置
├── electron/                  # Electron 桌面端配置
└── package.json
```

## 🔐 安全架构

| 层级 | 技术 |
|------|------|
| 密钥派生 | PBKDF2-SHA256, 600,000 次迭代 |
| 对称加密 | AES-256-GCM |
| 随机数 | Web Crypto API (`getRandomValues`) |
| 文件格式 | 二进制 Blob: `MBOX` Magic + Salt(32B) + IV(12B) + Ciphertext |
| 密钥存储 | 仅在内存中，锁定时清除 |

## 📦 技术栈

- **前端**: React 19, TypeScript, Vite
- **样式**: Tailwind CSS v4, Radix UI
- **动画**: Framer Motion
- **加密**: Web Crypto API
- **桌面**: Tauri 2 / Electron

## 📝 许可证

MIT License
