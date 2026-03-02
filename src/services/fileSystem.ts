/**
 * File System Service for MysterBox (Unified)
 *
 * Supports both Blob (v1 binary) and string (v2 JSON) content.
 * Uses File System Access API with fallback to download.
 */

/**
 * Save a Blob or string to a file.
 * Returns the file handle if available, for future overwrite saves.
 */
export async function saveFile(
  content: Blob | string,
  suggestedName: string = 'my_vault.vlt'
): Promise<boolean> {
  const blob = content instanceof Blob
    ? content
    : new Blob([content], { type: 'application/octet-stream' });

  const downloadFallback = () => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = suggestedName;
    a.click();
    URL.revokeObjectURL(url);
    return true;
  };

  try {
    if ((window as any).showSaveFilePicker) {
      try {
        const handle = await (window as any).showSaveFilePicker({
          suggestedName,
          types: [
            {
              description: 'MysterBox Vault',
              accept: { 'application/octet-stream': ['.vlt'] },
            },
          ],
        });
        const writable = await handle.createWritable();
        await writable.write(blob);
        await writable.close();
        return true;
      } catch (err) {
        console.warn('showSaveFilePicker failed, using fallback', err);
        return downloadFallback();
      }
    } else {
      return downloadFallback();
    }
  } catch (err) {
    console.error('File save cancelled or failed', err);
    return false;
  }
}

/**
 * Open a vault file. Returns { content, handle } where:
 * - content: raw text or ArrayBuffer depending on format
 * - handle: FileSystemFileHandle for overwrite saves (if available)
 *
 * For maximum compatibility, we return the text and optionally the handle.
 */
export interface OpenFileResult {
  content: string;
  handle?: FileSystemFileHandle;
  file?: File;
}

export async function openFile(): Promise<OpenFileResult | null> {
  const inputFallback = (): Promise<OpenFileResult | null> => {
    return new Promise((resolve) => {
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
  };

  try {
    if ((window as any).showOpenFilePicker) {
      try {
        const [handle] = await (window as any).showOpenFilePicker({
          types: [
            {
              description: 'MysterBox Vault',
              accept: { 'application/octet-stream': ['.vlt'] },
            },
          ],
        });
        const file = await handle.getFile();
        const text = await file.text();
        return { content: text, handle, file };
      } catch (err: any) {
        if (err.name === 'AbortError') {
          return null;
        }
        console.warn('showOpenFilePicker failed, using fallback', err);
        return inputFallback();
      }
    } else {
      return inputFallback();
    }
  } catch (err) {
    console.error('File open cancelled or failed', err);
    return null;
  }
}
