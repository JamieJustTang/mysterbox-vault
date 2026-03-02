export type Language = 'en' | 'zh';

export type Theme = 'light' | 'dark';

export type SortMode = 'recent' | 'frequency';

// --- Tag Model (restored from v1, supports color) ---

export interface Tag {
  id: string;
  name: string;
  color: string;
}

// --- Custom Field ---

export interface CustomField {
  id: string;
  label: string;
  value: string;
  type: 'text' | 'hidden' | 'url' | 'date';
}

// --- Vault Card (merged v1 + v2) ---

export interface VaultCard {
  id: string;
  title: string;
  username?: string;
  password?: string;
  url?: string;
  notes?: string;
  totp?: string;
  tags: string[];              // Tag IDs (references Tag.id)
  customFields: CustomField[];
  attachments: string[];       // Base64 strings (restored from v1)
  createdAt: number;
  updatedAt: number;
  lastUsed?: number;
  usageCount: number;
  favorite: boolean;
  archived?: boolean;
}

// --- Vault Data ---

export interface VaultMeta {
  name: string;
  version: number;
  createdAt: number;
  updatedAt: number;
}

export interface VaultData {
  meta: VaultMeta;
  cards: VaultCard[];
  tags: Tag[];                 // Tag objects (restored from v1)
}

// --- File Structure (for JSON format, used by v2) ---

export interface VaultFileStructure {
  salt: string;   // Base64
  iv: string;     // Base64
  data: string;   // Base64 (Encrypted VaultData JSON)
}
