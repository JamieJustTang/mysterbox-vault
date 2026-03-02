import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { VaultData, VaultCard, Tag, Theme, Language, SortMode } from '../types';
import { encryptVault, decryptVault, decryptVaultFromFile } from '../services/crypto';
import { saveFile } from '../services/fileSystem';
import { v4 as uuidv4 } from 'uuid';

interface VaultContextType {
  vault: VaultData | null;
  isLocked: boolean;
  theme: Theme;
  language: Language;
  sortMode: SortMode;
  fileHandle: FileSystemFileHandle | null;
  isSaving: boolean;
  setTheme: (theme: Theme) => void;
  setLanguage: (lang: Language) => void;
  setSortMode: (mode: SortMode) => void;
  unlockVault: (password: string, fileContent: string, handle?: FileSystemFileHandle, file?: File) => Promise<boolean>;
  createVault: (password: string, name: string) => Promise<void>;
  lockVault: () => void;
  saveVault: () => Promise<boolean>;
  saveVaultAs: () => Promise<boolean>;
  addCard: (card: Partial<VaultCard>) => void;
  updateCard: (card: VaultCard) => void;
  deleteCard: (id: string) => void;
  addTag: (tag: Tag) => void;
  updateTag: (tag: Tag) => void;
  deleteTag: (id: string) => void;
  currentPassword: string | null;
}

const VaultContext = createContext<VaultContextType | undefined>(undefined);

export const VaultProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [vault, setVault] = useState<VaultData | null>(null);
  const [currentPassword, setCurrentPassword] = useState<string | null>(null);
  const [theme, setTheme] = useState<Theme>('dark');
  const [language, setLanguage] = useState<Language>('en');
  const [sortMode, setSortMode] = useState<SortMode>('recent');
  const [fileHandle, setFileHandle] = useState<FileSystemFileHandle | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const vaultVersionRef = useRef(0);

  // Load preferences
  useEffect(() => {
    const savedTheme = localStorage.getItem('mysterbox_theme') as Theme;
    const savedLang = localStorage.getItem('mysterbox_lang') as Language;
    const savedSort = localStorage.getItem('mysterbox_sort') as SortMode;
    if (savedTheme) setTheme(savedTheme);
    if (savedLang) setLanguage(savedLang);
    if (savedSort) setSortMode(savedSort);
  }, []);

  // Apply theme
  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
    localStorage.setItem('mysterbox_theme', theme);
  }, [theme]);

  // Save language
  useEffect(() => {
    localStorage.setItem('mysterbox_lang', language);
  }, [language]);

  // Save sort mode
  useEffect(() => {
    localStorage.setItem('mysterbox_sort', sortMode);
  }, [sortMode]);

  const unlockVault = async (password: string, fileContent: string, handle?: FileSystemFileHandle, file?: File) => {
    try {
      // Prefer binary-safe decryption via File object (fixes v1 binary format corruption)
      const decryptedVault = file
        ? await decryptVaultFromFile(file, password)
        : await decryptVault(fileContent, password);

      // Migration: handle old v2 format where tags were string[]
      if (decryptedVault.tags && decryptedVault.tags.length > 0 && typeof decryptedVault.tags[0] === 'string') {
        decryptedVault.tags = (decryptedVault.tags as unknown as string[]).map((name: string, i: number) => ({
          id: uuidv4(),
          name,
          color: ['#ef4444', '#3b82f6', '#22c55e', '#eab308', '#a855f7', '#ec4899'][i % 6],
        }));
      }

      // Migration: ensure cards have attachments array
      if (decryptedVault.cards) {
        decryptedVault.cards = decryptedVault.cards.map((card: any) => ({
          ...card,
          attachments: card.attachments || [],
          usageCount: card.usageCount || 0,
          favorite: card.favorite ?? false,
          customFields: card.customFields || card.fields || [],
        }));
      }

      setVault(decryptedVault);
      setCurrentPassword(password);
      if (handle) setFileHandle(handle);
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  const createVault = async (password: string, name: string) => {
    const newVault: VaultData = {
      meta: {
        version: 2,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        name: name,
      },
      cards: [],
      tags: [],
    };
    setVault(newVault);
    setCurrentPassword(password);
  };

  const lockVault = () => {
    setVault(null);
    setCurrentPassword(null);
    setFileHandle(null);
  };

  // Save to current file (auto-save target)
  const saveVault = useCallback(async () => {
    if (!vault || !currentPassword) return false;
    setIsSaving(true);
    try {
      const updatedVault = { ...vault, meta: { ...vault.meta, updatedAt: Date.now() } };
      const encrypted = await encryptVault(updatedVault, currentPassword);

      // If we have a file handle, overwrite directly
      if (fileHandle) {
        try {
          const writable = await fileHandle.createWritable();
          await writable.write(encrypted);
          await writable.close();
          return true;
        } catch (e) {
          console.warn('File handle write failed, falling back to save dialog', e);
        }
      }

      // No handle (new vault) — ask user to pick location, then store handle
      try {
        if ((window as any).showSaveFilePicker) {
          const handle = await (window as any).showSaveFilePicker({
            suggestedName: `${vault.meta.name.replace(/\s+/g, '_')}.vlt`,
            types: [{ description: 'MysterBox Vault', accept: { 'application/octet-stream': ['.vlt'] } }],
          });
          const writable = await handle.createWritable();
          await writable.write(encrypted);
          await writable.close();
          setFileHandle(handle); // Remember for future auto-saves
          return true;
        }
      } catch (e: any) {
        if (e.name === 'AbortError') return false;
        console.warn('showSaveFilePicker failed', e);
      }

      // Ultimate fallback: download
      return await saveFile(encrypted, `${vault.meta.name.replace(/\s+/g, '_')}.vlt`);
    } finally {
      setIsSaving(false);
    }
  }, [vault, currentPassword, fileHandle]);

  // Save As / Export — always prompt for new location
  const saveVaultAs = useCallback(async () => {
    if (!vault || !currentPassword) return false;
    setIsSaving(true);
    try {
      const updatedVault = { ...vault, meta: { ...vault.meta, updatedAt: Date.now() } };
      const encrypted = await encryptVault(updatedVault, currentPassword);
      return await saveFile(encrypted, `${vault.meta.name.replace(/\s+/g, '_')}.vlt`);
    } finally {
      setIsSaving(false);
    }
  }, [vault, currentPassword]);

  // Auto-save: debounce 1.5s after vault data changes
  useEffect(() => {
    if (!vault || !currentPassword) return;
    // Skip initial load (version 0 → 1 is the first unlock, not a user edit)
    vaultVersionRef.current += 1;
    if (vaultVersionRef.current <= 1) return;

    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    autoSaveTimerRef.current = setTimeout(() => {
      saveVault();
    }, 1500);

    return () => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    };
  }, [vault]); // eslint-disable-line react-hooks/exhaustive-deps

  // --- Card Operations ---

  const addCard = (cardData: Partial<VaultCard>) => {
    if (!vault) return;
    const newCard: VaultCard = {
      id: uuidv4(),
      title: cardData.title || '',
      username: cardData.username,
      password: cardData.password,
      url: cardData.url,
      notes: cardData.notes,
      totp: cardData.totp,
      tags: cardData.tags || [],
      customFields: cardData.customFields || [],
      attachments: cardData.attachments || [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      usageCount: 0,
      favorite: cardData.favorite ?? false,
      archived: cardData.archived ?? false,
    };
    setVault({ ...vault, cards: [...vault.cards, newCard] });
  };

  const updateCard = (cardData: VaultCard) => {
    if (!vault) return;
    const updatedCards = vault.cards.map((c) =>
      c.id === cardData.id ? { ...cardData, updatedAt: Date.now() } : c
    );
    setVault({ ...vault, cards: updatedCards });
  };

  const deleteCard = (id: string) => {
    if (!vault) return;
    setVault({ ...vault, cards: vault.cards.filter((c) => c.id !== id) });
  };

  // --- Tag Operations (restored from v1) ---

  const addTag = (tag: Tag) => {
    if (!vault) return;
    setVault({ ...vault, tags: [...vault.tags, tag] });
  };

  const updateTag = (updatedTag: Tag) => {
    if (!vault) return;
    const updatedTags = vault.tags.map((t) =>
      t.id === updatedTag.id ? updatedTag : t
    );
    // Also clean up card references if tag was deleted
    setVault({ ...vault, tags: updatedTags });
  };

  const deleteTag = (id: string) => {
    if (!vault) return;
    const updatedTags = vault.tags.filter((t) => t.id !== id);
    // Remove tag from all cards
    const updatedCards = vault.cards.map((card) => ({
      ...card,
      tags: card.tags.filter((tagId) => tagId !== id),
    }));
    setVault({ ...vault, tags: updatedTags, cards: updatedCards });
  };

  return (
    <VaultContext.Provider
      value={{
        vault,
        isLocked: !vault,
        theme,
        language,
        sortMode,
        fileHandle,
        isSaving,
        setTheme,
        setLanguage,
        setSortMode,
        unlockVault,
        createVault,
        lockVault,
        saveVault,
        saveVaultAs,
        addCard,
        updateCard,
        deleteCard,
        addTag,
        updateTag,
        deleteTag,
        currentPassword,
      }}
    >
      {children}
    </VaultContext.Provider>
  );
};

export const useVault = () => {
  const context = useContext(VaultContext);
  if (context === undefined) {
    throw new Error('useVault must be used within a VaultProvider');
  }
  return context;
};
