/**
 * Crypto Service for MysterBox (Unified)
 *
 * Supports two vault file formats:
 * - v1 Binary:  Magic("MBOX") + Salt(16) + IV(12) + Ciphertext  → Blob
 * - v2 JSON:    { salt: Base64, iv: Base64, data: Base64 }       → string
 *
 * Uses Web Crypto API: PBKDF2-SHA256 (600k iterations) + AES-256-GCM
 */

// --- Constants ---
const PBKDF2_ITERATIONS = 600000;
const SALT_LENGTH = 16;
const IV_LENGTH = 12;
const KEY_ALGO = 'AES-GCM';
const HASH_ALGO = 'SHA-256';
const MAGIC_BYTES = new Uint8Array([0x4D, 0x42, 0x4F, 0x58]); // "MBOX"

const enc = new TextEncoder();
const dec = new TextDecoder();

// --- Helpers ---

export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

export function generateId(): string {
  return crypto.getRandomValues(new Uint32Array(1))[0].toString(16);
}

// --- Key Derivation ---

async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  // Copy salt to a fresh ArrayBuffer to avoid TS SharedArrayBuffer ambiguity
  const saltBuffer = new ArrayBuffer(salt.byteLength);
  new Uint8Array(saltBuffer).set(salt);

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: saltBuffer,
      iterations: PBKDF2_ITERATIONS,
      hash: HASH_ALGO,
    },
    keyMaterial,
    { name: KEY_ALGO, length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

// --- Encrypt ---

/**
 * Encrypts VaultData into a binary Blob (v1 format: MBOX + Salt + IV + Ciphertext).
 * This is the canonical format for new vaults.
 */
export async function encryptVault(data: object, password: string): Promise<Blob> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const key = await deriveKey(password, salt);

  const encodedData = enc.encode(JSON.stringify(data));
  const ciphertext = await crypto.subtle.encrypt(
    { name: KEY_ALGO, iv },
    key,
    encodedData
  );

  // Combine: Magic(4) + Salt(16) + IV(12) + Ciphertext
  const totalLength = MAGIC_BYTES.length + salt.byteLength + iv.byteLength + ciphertext.byteLength;
  const resultBuffer = new Uint8Array(totalLength);

  let offset = 0;
  resultBuffer.set(MAGIC_BYTES, offset); offset += MAGIC_BYTES.length;
  resultBuffer.set(salt, offset); offset += salt.byteLength;
  resultBuffer.set(iv, offset); offset += iv.byteLength;
  resultBuffer.set(new Uint8Array(ciphertext), offset);

  return new Blob([resultBuffer], { type: 'application/octet-stream' });
}

// --- Decrypt ---

/**
 * Auto-detects vault format and decrypts:
 * - If input starts with valid JSON '{', treats as v2 JSON format
 * - Otherwise treats as v1 binary format (with or without MBOX magic bytes)
 *
 * For v1 binary: pass raw file content as string (will be re-read as binary)
 * For v2 JSON: pass the JSON string directly
 *
 * The `fileContent` parameter can be:
 * - A string (for both formats, from FileReader.readAsText or file.text())
 * - We also accept a File/Blob for v1 binary format via decryptVaultFromFile
 */
export async function decryptVault(fileContent: string, password: string): Promise<any> {
  // Try JSON format first (v2)
  const trimmed = fileContent.trim();
  if (trimmed.startsWith('{')) {
    try {
      const parsed = JSON.parse(trimmed);
      if (parsed.salt && parsed.iv && parsed.data) {
        return await decryptVaultFromJson(parsed, password);
      }
    } catch {
      // Not valid JSON, try binary
    }
  }

  // Try binary format (v1) - content was read as text but is actually binary
  // For this case, we need raw binary data. Re-encode as binary.
  const binaryData = new Uint8Array(fileContent.length);
  for (let i = 0; i < fileContent.length; i++) {
    binaryData[i] = fileContent.charCodeAt(i);
  }
  return await decryptVaultFromBinary(binaryData, password);
}

/**
 * Decrypt from a File/Blob object directly (preferred for v1 binary format).
 */
export async function decryptVaultFromFile(file: File, password: string): Promise<any> {
  const buffer = await file.arrayBuffer();
  const arr = new Uint8Array(buffer);

  // Check if it's JSON format
  const firstByte = arr[0];
  if (firstByte === 0x7B) { // '{' character
    const text = dec.decode(arr);
    try {
      const parsed = JSON.parse(text);
      if (parsed.salt && parsed.iv && parsed.data) {
        return await decryptVaultFromJson(parsed, password);
      }
    } catch {
      // Not JSON, continue with binary
    }
  }

  return await decryptVaultFromBinary(arr, password);
}

// --- Internal decryption helpers ---

async function decryptVaultFromJson(
  encrypted: { salt: string; iv: string; data: string },
  password: string
): Promise<any> {
  try {
    const salt = new Uint8Array(base64ToArrayBuffer(encrypted.salt));
    const iv = new Uint8Array(base64ToArrayBuffer(encrypted.iv));
    const dataBuffer = base64ToArrayBuffer(encrypted.data);

    const key = await deriveKey(password, salt);

    const decryptedContent = await crypto.subtle.decrypt(
      { name: KEY_ALGO, iv },
      key,
      dataBuffer
    );

    return JSON.parse(dec.decode(decryptedContent));
  } catch (e) {
    console.error('Decryption failed:', e);
    throw new Error('Decryption failed. Wrong password or corrupted file.');
  }
}

async function decryptVaultFromBinary(arr: Uint8Array, password: string): Promise<any> {
  if (arr.length < SALT_LENGTH + IV_LENGTH + 16) {
    throw new Error('File is too small to be a valid vault.');
  }

  // Check for Magic Bytes "MBOX"
  let hasMagic = true;
  for (let i = 0; i < MAGIC_BYTES.length; i++) {
    if (arr[i] !== MAGIC_BYTES[i]) {
      hasMagic = false;
      break;
    }
  }

  let offset = hasMagic ? MAGIC_BYTES.length : 0;

  const salt = arr.slice(offset, offset + SALT_LENGTH);
  const iv = arr.slice(offset + SALT_LENGTH, offset + SALT_LENGTH + IV_LENGTH);
  const ciphertext = arr.slice(offset + SALT_LENGTH + IV_LENGTH);

  try {
    const key = await deriveKey(password, salt);

    const decryptedBuffer = await crypto.subtle.decrypt(
      { name: KEY_ALGO, iv },
      key,
      ciphertext
    );

    return JSON.parse(dec.decode(decryptedBuffer));
  } catch (e) {
    throw new Error('Decryption failed. Wrong password or corrupted file.');
  }
}
