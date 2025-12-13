# MysterBox 🔐

[English](./README.md) | **简体中文**

**MysterBox** 是一款现代、隐私优先、完全本地运行的密码管理器。它在浏览器中运行，结合了高强度的加密标准与简洁的用户界面。

> **零知识。仅限本地。无服务器。**

您的数据在未加密的情况下绝不会离开您的设备。没有后端，没有云同步，也没有追踪。您完全拥有您的数据文件（`.vlt`），并由您决定将其存储在哪里。

![MysterBox 预览](./myster_box_page.png)

## ✨ 核心功能

*   **🛡️ 高强度加密**: 使用 **AES-256-GCM** 进行数据加密，并使用 **PBKDF2-SHA256**（600,000 次迭代）进行密钥派生。
*   **📂 本地优先架构**: 密码库存储为单个加密文件（`.vlt`）。支持文件系统访问 API (File System Access API) 以实现直接保存。
*   **🎨 现代 UI/UX**:
    *   响应式瀑布流 (Grid) & 时间轴 (Timeline) 视图。
    *   支持深色模式。
    *   卡片 3D 交互效果。
    *   流畅的动画体验。
*   **🏷️ 数据组织**:
    *   自定义颜色的标签管理。
    *   搜索与筛选功能。
    *   支持自定义字段（隐藏/显示），满足不同数据存储需求。
*   **🌍 国际化支持**: 原生支持 **简体中文** 和 **英语**。
*   **📱 移动端适配**: 响应式设计，配备移动端专属菜单及触控优化。

## 🚀 快速开始

### 前置要求

*   Node.js (v16 或更高版本)
*   npm 或 yarn

### 安装步骤

1.  **克隆仓库**
    ```bash
    git clone https://github.com/JamieJustTang/mysterbox-vault.git
    cd mysterbox-vault
    ```

2.  **安装依赖**
    ```bash
    npm install
    # 或者
    yarn install
    ```

3.  **启动开发服务器**
    ```bash
    npm run dev
    # 或者
    yarn dev
    ```

    应用默认运行在 `http://localhost:5173`。

## 📦 构建与发布

### Web（浏览器版）
```bash
npm run build
```
输出静态资源在 `dist/`，可用于本地或任意静态站点部署。

### macOS（Tauri，arm64）
```bash
npm run tauri:build
```
生成的 DMG：`src-tauri/target/release/bundle/dmg/MysterBox_1.0.0_aarch64.dmg`（约 1.3 MB，未签名）。首次打开可右键“打开”绕过 Gatekeeper。

### Android（APK/AAB，arm64）
```bash
export JAVA_HOME=/opt/homebrew/opt/openjdk@17
export ANDROID_HOME=$HOME/Library/Android/sdk
export ANDROID_SDK_ROOT=$ANDROID_HOME
npx tauri android build --target aarch64
```
输出（未签名）：
- APK：`src-tauri/gen/android/app/build/outputs/apk/universal/release/app-universal-release-unsigned.apk`
- AAB：`src-tauri/gen/android/app/build/outputs/bundle/universalRelease/app-universal-release.aab`

发布前请使用自己的 keystore 签名。

### （可选）Electron 版本
```bash
npm run electron:build
```
输出：`release/MysterBox-1.0.0-arm64.dmg`（未签名，体积较大）。

## 🔒 安全架构

MysterBox 的设计注重数据隐私与安全：

1.  **加密**: 数据使用 256 位密钥的 `AES-GCM` 算法加密。
2.  **完整性**: GCM 模式提供认证加密，确保数据未被篡改。
3.  **密钥派生**: 主密码从不存储。加密密钥是使用 `PBKDF2` 算法、随机 16 字节盐值和 **600,000 次迭代** 实时派生的。
4.  **内存安全**: 敏感数据仅存在于浏览器标签页的易失性内存中，并在刷新或退出时清除。

## 🛠️ 技术栈

*   **前端**: React 18, TypeScript
*   **样式**: Tailwind CSS
*   **图标**: Lucide React
*   **密码学**: Web Crypto API (浏览器原生标准)

## 📄 许可证

本项目采用 **MIT 许可证** - 详情请参阅 [LICENSE](LICENSE) 文件。

---

由 [Jamie Tang](https://github.com/JamieJustTang) 创建
