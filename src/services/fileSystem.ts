/**
 * File System Service for MysterBox (Unified)
 *
 * On Tauri (desktop): uses tauri-plugin-dialog + tauri-plugin-fs for
 *   native file pickers and direct path-based read/write (supports overwrite).
 * On browser (Web): uses File System Access API with fallback to download.
 */

// ---- Tauri environment detection ----
function isTauri(): boolean {
  return typeof (window as any).__TAURI_INTERNALS__ !== 'undefined';
}

// Lazy import Tauri APIs only when inside Tauri (tree-shaken in browser builds)
async function getTauriDialog() {
  const m = await import('@tauri-apps/plugin-dialog');
  return m;
}
async function getTauriFs() {
  const m = await import('@tauri-apps/plugin-fs');
  return m;
}

// ---- Types ----
export interface OpenFileResult {
  content: string;
  /** Tauri: absolute file path for overwrite saves */
  filePath?: string;
  /** Browser: FileSystemFileHandle for overwrite saves */
  handle?: FileSystemFileHandle;
  /** Browser fallback: original File object */
  file?: File;
}

// ============================================================
// openFile
// ============================================================
export async function openFile(): Promise<OpenFileResult | null> {
  if (isTauri()) {
    return openFileTauri();
  }
  return openFileBrowser();
}

async function openFileTauri(): Promise<OpenFileResult | null> {
  try {
    const { open } = await getTauriDialog();
    const selected = await open({
      multiple: false,
      filters: [{ name: 'MysterBox Vault', extensions: ['vlt'] }],
    });
    if (!selected || typeof selected !== 'string') return null;

    const { readFile } = await getTauriFs();
    const bytes = await readFile(selected);
    const content = new TextDecoder().decode(bytes);
    return { content, filePath: selected };
  } catch (err: any) {
    if (err?.toString().includes('cancelled') || err?.toString().includes('AbortError')) return null;
    console.error('Tauri openFile failed', err);
    return null;
  }
}

async function openFileBrowser(): Promise<OpenFileResult | null> {
  const inputFallback = (): Promise<OpenFileResult | null> =>
    new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.vlt';
      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          const text = await file.text();
          resolve({ content: text, file });
        } else {
          resolve(null);
        }
      };
      input.click();
    });

  try {
    if ((window as any).showOpenFilePicker) {
      try {
        const [handle] = await (window as any).showOpenFilePicker({
          types: [{ description: 'MysterBox Vault', accept: { 'application/octet-stream': ['.vlt'] } }],
        });
        const file = await handle.getFile();
        const text = await file.text();
        return { content: text, handle, file };
      } catch (err: any) {
        if (err.name === 'AbortError') return null;
        console.warn('showOpenFilePicker failed, using fallback', err);
        return inputFallback();
      }
    }
    return inputFallback();
  } catch (err) {
    console.error('File open cancelled or failed', err);
    return null;
  }
}

// ============================================================
// saveFile — overwrite an existing path (Tauri) or a handle (browser)
// ============================================================
export async function saveToPath(
  content: Blob | string,
  filePath: string
): Promise<boolean> {
  try {
    const { writeFile } = await getTauriFs();
    const bytes =
      content instanceof Blob
        ? new Uint8Array(await content.arrayBuffer())
        : new TextEncoder().encode(content);
    await writeFile(filePath, bytes);
    return true;
  } catch (err) {
    console.error('Tauri saveToPath failed', err);
    return false;
  }
}

// ============================================================
// saveFile — prompt user for location (Save As / first-time save)
// ============================================================
export async function saveFile(
  content: Blob | string,
  suggestedName: string = 'my_vault.vlt'
): Promise<{ success: boolean; filePath?: string }> {
  const blob =
    content instanceof Blob ? content : new Blob([content], { type: 'application/octet-stream' });

  if (isTauri()) {
    return saveFileTauri(blob, suggestedName);
  }
  return saveFileBrowser(blob, suggestedName);
}

async function saveFileTauri(
  blob: Blob,
  suggestedName: string
): Promise<{ success: boolean; filePath?: string }> {
  try {
    const { save } = await getTauriDialog();
    const savePath = await save({
      defaultPath: suggestedName,
      filters: [{ name: 'MysterBox Vault', extensions: ['vlt'] }],
    });
    if (!savePath) return { success: false };

    const { writeFile } = await getTauriFs();
    const bytes = new Uint8Array(await blob.arrayBuffer());
    await writeFile(savePath, bytes);
    return { success: true, filePath: savePath };
  } catch (err: any) {
    if (err?.toString().includes('cancelled')) return { success: false };
    console.error('Tauri saveFile failed', err);
    return { success: false };
  }
}

async function saveFileBrowser(
  blob: Blob,
  suggestedName: string
): Promise<{ success: boolean; filePath?: string }> {
  const downloadFallback = () => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = suggestedName;
    a.click();
    URL.revokeObjectURL(url);
    return { success: true };
  };

  try {
    if ((window as any).showSaveFilePicker) {
      try {
        const handle = await (window as any).showSaveFilePicker({
          suggestedName,
          types: [{ description: 'MysterBox Vault', accept: { 'application/octet-stream': ['.vlt'] } }],
        });
        const writable = await handle.createWritable();
        await writable.write(blob);
        await writable.close();
        return { success: true };
      } catch (err: any) {
        if (err.name === 'AbortError') return { success: false };
        console.warn('showSaveFilePicker failed, using fallback', err);
        return downloadFallback();
      }
    }
    return downloadFallback();
  } catch (err) {
    console.error('File save cancelled or failed', err);
    return { success: false };
  }
}
