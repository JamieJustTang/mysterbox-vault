
import React, { useState, useEffect } from 'react';
import { VaultHandler } from './components/VaultHandler';
import { Dashboard } from './components/Dashboard';
import { CardModal } from './components/CardModal';
import { TagManagerModal } from './components/TagManagerModal';
import { ExitModal } from './components/ExitModal';
import { VaultData, Card, Tag, SortMode, Language, TranslationFn } from './types';
import { encryptVault, decryptVault } from './utils/cryptoUtils';
import { translations } from './utils/i18n';

const App: React.FC = () => {
  const [vault, setVault] = useState<VaultData | null>(null);
  const [masterKey, setMasterKey] = useState<string | null>(null);
  const [fileHandle, setFileHandle] = useState<any>(null);
  
  const [editingCard, setEditingCard] = useState<Card | null>(null);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [isTagManagerOpen, setIsTagManagerOpen] = useState(false);
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);
  
  const [sortMode, setSortMode] = useState<SortMode>('recent');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [lang, setLang] = useState<Language>('en');

  // Load theme and language preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
      if (savedTheme === 'dark') document.documentElement.classList.add('dark');
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark');
      document.documentElement.classList.add('dark');
    }

    // Language detection
    const savedLang = localStorage.getItem('lang') as Language | null;
    if (savedLang) {
      setLang(savedLang);
    } else {
      const browserLang = navigator.language.startsWith('zh') ? 'zh' : 'en';
      setLang(browserLang);
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const toggleLang = () => {
    const newLang = lang === 'en' ? 'zh' : 'en';
    setLang(newLang);
    localStorage.setItem('lang', newLang);
  };

  const t: TranslationFn = (key) => {
    return translations[lang][key] || key;
  };

  const createVault = async (name: string, pass: string) => {
    const newVault: VaultData = {
      meta: { name, version: 1, createdAt: Date.now() },
      cards: [],
      tags: []
    };
    setVault(newVault);
    setMasterKey(pass);
    setFileHandle(null);
  };

  const openVault = async (file: File, pass: string, handle?: any) => {
    try {
      const jsonStr = await decryptVault(file, pass);
      const data = JSON.parse(jsonStr) as VaultData;
      
      // Basic validation
      if (!data.meta || !Array.isArray(data.cards)) throw new Error("Invalid vault format");
      
      // Migration: Ensure tags array exists
      if (!data.tags) data.tags = [];

      setVault(data);
      setMasterKey(pass);
      setFileHandle(handle || null);
    } catch (e: any) {
      console.error(e);
      if (e.message && e.message.includes("Decryption failed")) {
        throw new Error("Incorrect password or corrupted file.");
      }
      throw new Error("Failed to open vault: " + (e.message || "Unknown error"));
    }
  };

  // Helper to generate the Blob
  const prepareVaultBlob = async (): Promise<Blob | null> => {
    if (!vault || !masterKey) return null;
    const jsonStr = JSON.stringify(vault);
    return await encryptVault(jsonStr, masterKey);
  };

  // Logic 1: Save using existing handle (Overwrite)
  const saveVaultToDisk = async (): Promise<boolean> => {
    if (!fileHandle) return false;
    try {
      const blob = await prepareVaultBlob();
      if (!blob) return false;
      
      // Create a writable stream to the file
      const writable = await fileHandle.createWritable();
      await writable.write(blob);
      await writable.close();
      return true;
    } catch (e) {
      console.error("Failed to write to file handle", e);
      alert("Failed to overwrite file. Please use 'Save As' instead.");
      return false;
    }
  };

  // Logic 2: Save as new file (Download)
  const saveVaultAs = async (): Promise<boolean> => {
    if (!vault) return false;
    try {
      const blob = await prepareVaultBlob();
      if (!blob) return false;

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${vault.meta.name.replace(/\s+/g, '_')}_${Date.now()}.vlt`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      return true;
    } catch (e) {
      alert("Failed to generate save file.");
      return false;
    }
  };

  const handleLogoutClick = () => {
    setIsExitModalOpen(true);
  };

  const performExit = () => {
    setVault(null);
    setMasterKey(null);
    setFileHandle(null);
    setIsExitModalOpen(false);
  };

  const handleSaveAndExit = async () => {
    const success = await saveVaultToDisk();
    if (success) performExit();
  };

  const handleSaveAsAndExit = async () => {
    const success = await saveVaultAs();
    if (success) performExit();
  };

  // Card Operations
  const handleSaveCard = (card: Card) => {
    if (!vault) return;
    setVault(prev => {
      if (!prev) return null;
      const existingIdx = prev.cards.findIndex(c => c.id === card.id);
      let newCards = [...prev.cards];
      if (existingIdx >= 0) {
        newCards[existingIdx] = card;
      } else {
        newCards.push(card);
      }
      return { ...prev, cards: newCards };
    });
  };

  const handleDeleteCard = (id: string) => {
    if (!vault || !confirm("Delete this card permanently?")) return;
    setVault(prev => prev ? { ...prev, cards: prev.cards.filter(c => c.id !== id) } : null);
    setIsCardModalOpen(false);
  };

  // Tag Operations
  const handleSaveTag = (tag: Tag) => {
    if (!vault) return;
    setVault(prev => prev ? { ...prev, tags: [...(prev.tags || []), tag] } : null);
  };

  const handleUpdateTag = (updatedTag: Tag) => {
    if (!vault) return;
    setVault(prev => prev ? {
      ...prev,
      tags: prev.tags.map(t => t.id === updatedTag.id ? updatedTag : t)
    } : null);
  };

  const handleDeleteTag = (id: string) => {
    if (!vault) return;
    setVault(prev => prev ? {
      ...prev,
      tags: prev.tags.filter(t => t.id !== id),
      cards: prev.cards.map(c => ({
        ...c,
        tags: c.tags.filter(tid => tid !== id)
      }))
    } : null);
  };

  if (!vault) {
    return (
      <VaultHandler 
        onCreate={createVault} 
        onUnlock={openVault} 
        lang={lang} 
        toggleLang={toggleLang} 
        t={t} 
      />
    );
  }

  return (
    <>
      <Dashboard 
        vault={vault}
        onLogout={handleLogoutClick}
        onSave={saveVaultAs}
        onAddCard={() => { setEditingCard(null); setIsCardModalOpen(true); }}
        onOpenCard={(c) => { setEditingCard(c); setIsCardModalOpen(true); }}
        tags={vault.tags || []}
        onManageTags={() => setIsTagManagerOpen(true)}
        sortMode={sortMode}
        setSortMode={setSortMode}
        theme={theme}
        toggleTheme={toggleTheme}
        lang={lang}
        toggleLang={toggleLang}
        t={t}
      />

      <CardModal 
        isOpen={isCardModalOpen}
        onClose={() => setIsCardModalOpen(false)}
        card={editingCard}
        onSave={handleSaveCard}
        onDelete={handleDeleteCard}
        allTags={vault.tags || []}
        onCreateTag={handleSaveTag}
        t={t}
      />

      <TagManagerModal 
        isOpen={isTagManagerOpen}
        onClose={() => setIsTagManagerOpen(false)}
        tags={vault.tags || []}
        onAdd={handleSaveTag}
        onUpdate={handleUpdateTag}
        onDelete={handleDeleteTag}
        t={t}
      />
      
      <ExitModal 
        isOpen={isExitModalOpen}
        onClose={() => setIsExitModalOpen(false)}
        hasFileHandle={!!fileHandle}
        vaultName={vault.meta.name}
        onSaveAndExit={handleSaveAndExit}
        onSaveAsAndExit={handleSaveAsAndExit}
        onExitWithoutSave={performExit}
        t={t}
      />
    </>
  );
};

export default App;
