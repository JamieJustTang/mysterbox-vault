// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Add specific Node.js APIs here if needed in the future
  // For now, MysterBox uses standard Web Crypto API which is available in the renderer
});