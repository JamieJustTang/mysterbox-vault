
export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface CustomField {
  id: string;
  label: string;
  value: string;
  type: 'text' | 'hidden' | 'date' | 'file'; // Simplified for UI, logic treats mostly as string
}

export interface Card {
  id: string;
  title: string;
  username?: string;
  password?: string;
  notes: string;
  tags: string[]; // Tag IDs
  fields: CustomField[];
  attachments: string[]; // Base64 strings for MVP simplicity (Mocking the "File in Zip" structure)
  dates: {
    created: number;
    modified: number;
    accessed: number;
  };
  usageCount: number;
}

export interface VaultMeta {
  name: string;
  version: number;
  createdAt: number;
}

export interface VaultData {
  meta: VaultMeta;
  cards: Card[];
  tags: Tag[];
}

export type SortMode = 'recent' | 'frequency';

export type Language = 'en' | 'zh';
export type TranslationFn = (key: keyof typeof import('./utils/i18n').translations['en']) => string;

export interface VaultContextType {
  vault: VaultData | null;
  isLocked: boolean;
  filename: string | null;
  createVault: (name: string, masterPass: string) => Promise<void>;
  unlockVault: (file: File, masterPass: string) => Promise<void>;
  saveVault: () => Promise<void>;
  closeVault: () => void;
  addCard: (card: Card) => void;
  updateCard: (card: Card) => void;
  deleteCard: (id: string) => void;
  updateTag: (tag: Tag) => void;
  deleteTag: (id: string) => void;
  sortMode: SortMode;
  setSortMode: (mode: SortMode) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}
