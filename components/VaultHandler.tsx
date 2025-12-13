
import React, { useState, useRef } from 'react';
import { Lock, Unlock, Upload, Save, Shield, AlertCircle, FileText, Globe } from 'lucide-react';
import { Button } from './Button';
import { Language, TranslationFn } from '../types';

interface VaultHandlerProps {
  onCreate: (name: string, pass: string) => Promise<void>;
  onUnlock: (file: File, pass: string, handle?: any) => Promise<void>;
  lang: Language;
  toggleLang: () => void;
  t: TranslationFn;
}

export const VaultHandler: React.FC<VaultHandlerProps> = ({ onCreate, onUnlock, lang, toggleLang, t }) => {
  const [mode, setMode] = useState<'welcome' | 'create' | 'open'>('welcome');
  const [vaultName, setVaultName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // New state to manage file selection internally to support both Input and FS API
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedHandle, setSelectedHandle] = useState<any>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const clearState = () => {
    setVaultName('');
    setPassword('');
    setError(null);
    setLoading(false);
    setSelectedFile(null);
    setSelectedHandle(null);
    setIsDragging(false);
  };

  const handleModeChange = (newMode: 'welcome' | 'create' | 'open') => {
    clearState();
    setMode(newMode);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!vaultName || !password) return;
    setLoading(true);
    
    setTimeout(async () => {
      try {
        await onCreate(vaultName, password);
      } catch (err: any) {
        setError(err.message || 'Failed to create vault.');
        setLoading(false);
      }
    }, 50);
  };

  const processFile = (file: File) => {
    if (file.size > 100 * 1024 * 1024) {
      setError(t('fileTooLarge'));
      return;
    }

    setSelectedFile(file);
    setSelectedHandle(null); 
    setVaultName(file.name);
    setError(null);
  };

  const handleFileClick = async () => {
    if ('showOpenFilePicker' in window) {
      try {
        const [handle] = await (window as any).showOpenFilePicker({
          types: [{
            description: 'MysterBox Vault',
            accept: { 'application/octet-stream': ['.vlt', '.bin'], 'application/json': ['.json'] }
          }],
          multiple: false
        });
        const file = await handle.getFile();
        setSelectedHandle(handle);
        processFile(file);
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.warn("FS API Error, falling back:", err);
          fileInputRef.current?.click();
        }
      }
    } else {
      fileInputRef.current?.click();
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!selectedFile || !password) {
      setError("Please select a file and enter password");
      return;
    }
    
    setLoading(true);
    
    setTimeout(async () => {
      try {
        await onUnlock(selectedFile, password, selectedHandle);
      } catch (err: any) {
        console.error(err);
        setError(err.message || t('unlockFailed'));
        setLoading(false);
      }
    }, 100);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-100 dark:bg-black transition-colors relative">
      
      {/* Language Switcher */}
      <div className="absolute top-4 right-4 flex flex-col items-end">
        <button 
          onClick={toggleLang}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 hover:border-primary/50 text-sm font-medium text-gray-700 dark:text-gray-300 transition-all shadow-sm"
        >
          <Globe size={16} className="text-primary" />
          <span>{lang === 'en' ? '中文' : 'English'}</span>
        </button>
      </div>

      <div className="w-full max-w-md bg-white dark:bg-dark-surface p-8 rounded-2xl shadow-xl border border-gray-200 dark:border-dark-border">
        
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 text-primary">
            {mode === 'open' ? <Unlock size={32} /> : <Shield size={32} />}
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">{t('appName')}</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 text-center text-sm">
            {t('appDesc')}
          </p>
        </div>

        {mode === 'welcome' && (
          <div className="space-y-4">
            <Button className="w-full py-4 text-lg" onClick={() => handleModeChange('create')}>
              {t('createNewVault')}
            </Button>
            <Button variant="secondary" className="w-full py-4 text-lg" onClick={() => handleModeChange('open')}>
              {t('openExistingVault')}
            </Button>
            <div className="mt-6 text-xs text-center text-gray-400">
              <p>{t('securityInfo')}</p>
            </div>
          </div>
        )}

        {mode === 'create' && (
          <form onSubmit={handleCreate} className="space-y-4 animate-fade-in">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-3 rounded-r-md flex items-start">
                <AlertCircle className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700 dark:text-red-200">{error}</p>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('vaultName')}</label>
              <input 
                type="text" 
                className="w-full p-3 rounded-lg border border-gray-300 dark:border-dark-border bg-gray-50 dark:bg-[#121212] dark:text-white focus:ring-2 focus:ring-primary outline-none"
                value={vaultName}
                onChange={e => setVaultName(e.target.value)}
                placeholder="My Secure Vault"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('masterPassword')}</label>
              <input 
                type="password" 
                className="w-full p-3 rounded-lg border border-gray-300 dark:border-dark-border bg-gray-50 dark:bg-[#121212] dark:text-white focus:ring-2 focus:ring-primary outline-none"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
              />
              <p className="text-xs text-red-500 mt-1">{t('passwordWarning')}</p>
            </div>
            <div className="pt-2 flex gap-3">
              <Button type="button" variant="ghost" onClick={() => handleModeChange('welcome')} className="flex-1">{t('back')}</Button>
              <Button type="submit" isLoading={loading} className="flex-1">{t('createVaultAction')}</Button>
            </div>
          </form>
        )}

        {mode === 'open' && (
          <form onSubmit={handleUnlock} className="space-y-4 animate-fade-in">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-3 rounded-r-md flex items-start">
                <AlertCircle className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700 dark:text-red-200">{error}</p>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('selectVaultFile')}</label>
              <div 
                className={`
                  border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
                  ${isDragging 
                    ? 'border-primary bg-primary/5 dark:bg-primary/10' 
                    : 'border-gray-300 dark:border-dark-border hover:bg-gray-50 dark:hover:bg-zinc-900'
                  }
                `}
                onClick={handleFileClick}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                {selectedFile ? (
                   <div className="flex flex-col items-center">
                     <FileText className="h-8 w-8 text-primary mb-2" />
                     <span className="text-sm text-gray-900 dark:text-white font-semibold truncate max-w-[200px]">
                       {selectedFile.name}
                     </span>
                     <span className="text-xs text-gray-500 mt-1">
                       {(selectedFile.size / 1024).toFixed(1)} KB
                     </span>
                   </div>
                ) : (
                  <>
                    <Upload className={`mx-auto h-8 w-8 mb-2 ${isDragging ? 'text-primary' : 'text-gray-400'}`} />
                    <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                      {isDragging ? t('dropHere') : t('dragDrop')}
                    </span>
                  </>
                )}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileInputChange}
                  className="hidden" 
                  accept=".vlt,.json,.bin"
                />
              </div>
              
              <div className="mt-2 text-center">
                <button 
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs text-gray-400 hover:text-primary underline"
                >
                  {t('troubleUploading')}
                </button>
              </div>

            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('masterPassword')}</label>
              <input 
                type="password" 
                className="w-full p-3 rounded-lg border border-gray-300 dark:border-dark-border bg-gray-50 dark:bg-[#121212] dark:text-white focus:ring-2 focus:ring-primary outline-none"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
              />
            </div>
            <div className="pt-2 flex gap-3">
              <Button type="button" variant="ghost" onClick={() => handleModeChange('welcome')} className="flex-1">{t('back')}</Button>
              <Button type="submit" isLoading={loading} className="flex-1">{t('unlock')}</Button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
