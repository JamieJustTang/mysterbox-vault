import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

// Ensure we run in a secure context (required for Web Crypto & File System Access).
if (!window.isSecureContext || window.location.protocol === 'file:') {
  rootElement.innerHTML = `
    <div style="
      font-family: system-ui, -apple-system, sans-serif;
      max-width: 720px;
      margin: 64px auto;
      padding: 24px;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      background: #fff7f7;
      color: #111;
      line-height: 1.5;
    ">
      <h2 style="margin-top: 0; font-size: 20px;">请通过本地服务器打开</h2>
      <p style="margin: 8px 0;">浏览器在 <code>file://</code> 下会禁用 Web Crypto 和文件系统权限，页面会空白。</p>
      <p style="margin: 8px 0;">在项目根目录运行任一命令后，用浏览器访问 <code>http://localhost:4173</code>（或命令输出的端口）：</p>
      <pre style="background:#f3f4f6;padding:12px;border-radius:8px;border:1px solid #e5e7eb;overflow:auto;">npm run preview\n# 或\nnpx serve dist\n# 或\npython -m http.server 4173 --directory dist</pre>
      <p style="margin: 8px 0;">然后再打开 MysterBox。</p>
    </div>
  `;
  throw new Error("Insecure context: please open via a local HTTP server");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
