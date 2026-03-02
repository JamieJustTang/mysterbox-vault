import React, { useState } from 'react';
import { useVault } from '../context/VaultContext';
import { useTranslation } from '../i18n';
import { openFile } from '../services/fileSystem';

export const UnlockScreen: React.FC = () => {
  const { unlockVault, createVault, language, setLanguage } = useVault();
  const t = useTranslation(language);
  const [mode, setMode] = useState<'unlock' | 'create'>('unlock');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [vaultName, setVaultName] = useState('');
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [fileHandle, setFileHandle] = useState<FileSystemFileHandle | null>(null);
  const [fileObj, setFileObj] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleOpenFile = async () => {
    setError(null);
    const result = await openFile();
    if (result) {
      setFileContent(result.content);
      if (result.handle) setFileHandle(result.handle);
      if (result.file) setFileObj(result.file);
    }
  };

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileContent) return;
    setIsLoading(true);
    setError(null);
    setTimeout(async () => {
      const success = await unlockVault(password, fileContent, fileHandle ?? undefined, fileObj ?? undefined);
      setIsLoading(false);
      if (!success) setError(t.error_wrong_password);
    }, 100);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) { setError(t.passwordMismatch); return; }
    if (password.length < 8) { setError(t.passwordTooShort); return; }
    setIsLoading(true);
    setError(null);
    setTimeout(async () => {
      await createVault(password, vaultName || 'My Vault');
      setIsLoading(false);
    }, 100);
  };

  const toggleLanguage = () => setLanguage(language === 'zh' ? 'en' : 'zh');

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-gray-50">
      {/* Background blobs */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-red-200/30 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-orange-200/30 rounded-full blur-[100px] pointer-events-none" />

      {/* Language switcher — top right */}
      <button
        onClick={toggleLanguage}
        className="fixed top-5 right-5 z-50 flex items-center gap-1.5 px-3 py-1.5 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-full shadow-sm text-xs font-bold text-gray-600 hover:text-primary hover:border-primary/30 hover:bg-white transition-all"
        title={t.langHint}
      >
        <span className="material-symbols-outlined text-[14px]">language</span>
        {language === 'zh' ? 'EN' : '中文'}
      </button>

      <div className="w-full max-w-md relative z-10">
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-8 ring-1 ring-gray-100">

          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center size-16 rounded-2xl bg-gradient-to-br from-red-500 to-orange-500 shadow-lg shadow-red-500/30 mb-4">
              <span className="material-symbols-outlined text-3xl text-white">lock</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight mb-1">{t.app_name}</h1>
            <p className="text-sm text-gray-500 font-medium">{t.welcome_subtitle}</p>
          </div>

          {/* Mode toggle */}
          <div className="flex p-1 bg-gray-100/80 rounded-xl mb-8 relative">
            <div
              className={`absolute inset-y-1 w-[calc(50%-4px)] bg-white rounded-lg shadow-sm transition-all duration-300 ease-out ${mode === 'unlock' ? 'left-1' : 'left-[calc(50%+4px)]'}`}
            />
            <button
              className={`flex-1 py-2 text-xs font-bold rounded-lg relative z-10 transition-colors ${mode === 'unlock' ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => { setMode('unlock'); setError(null); }}
            >
              {t.unlock_vault}
            </button>
            <button
              className={`flex-1 py-2 text-xs font-bold rounded-lg relative z-10 transition-colors ${mode === 'create' ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => { setMode('create'); setError(null); }}
            >
              {t.create_vault}
            </button>
          </div>

          {/* Forms */}
          <div className="relative min-h-[280px]">
            {mode === 'unlock' ? (
              <form onSubmit={handleUnlock} className="space-y-5 animate-in fade-in slide-in-from-left-4 duration-300">
                {!fileContent ? (
                  <div
                    onClick={handleOpenFile}
                    className="group border-2 border-dashed border-gray-200 hover:border-primary/50 hover:bg-red-50/30 rounded-2xl p-10 text-center cursor-pointer transition-all duration-300"
                  >
                    <div className="size-12 rounded-full bg-gray-50 group-hover:bg-white mx-auto mb-3 flex items-center justify-center transition-colors shadow-sm">
                      <span className="material-symbols-outlined text-2xl text-gray-400 group-hover:text-primary transition-colors">file_open</span>
                    </div>
                    <p className="text-sm font-bold text-gray-700 mb-1">{t.selectVaultFileTitle}</p>
                    <p className="text-xs text-gray-400 font-medium">{t.clickToBrowse}</p>
                  </div>
                ) : (
                  <div className="space-y-5">
                    <div className="flex items-center justify-between p-3 bg-gray-50 border border-gray-100 rounded-xl">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="size-8 rounded-lg bg-white flex items-center justify-center shadow-sm border border-gray-100 shrink-0">
                          <span className="material-symbols-outlined text-[18px] text-primary">folder</span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-gray-900 truncate">{t.vaultFileLoaded}</p>
                          <p className="text-[10px] text-gray-400 font-mono truncate">{t.readyToUnlock}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFileContent(null)}
                        className="text-xs font-bold text-gray-400 hover:text-primary transition-colors px-2 py-1 rounded-lg hover:bg-white"
                      >
                        {t.changeFile}
                      </button>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">{t.masterPassword}</label>
                      <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">key</span>
                        <input
                          type="password"
                          placeholder={t.enterPassword}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm font-medium text-gray-900 focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none transition-all placeholder-gray-400"
                          required
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-3 rounded-xl shadow-lg shadow-red-500/20 hover:shadow-red-500/30 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {isLoading
                        ? <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
                        : <span className="material-symbols-outlined text-[20px]">lock_open</span>
                      }
                      {isLoading ? t.unlocking : t.unlock}
                    </button>
                  </div>
                )}
              </form>
            ) : (
              <form onSubmit={handleCreate} className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">{t.vaultName}</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">label</span>
                    <input
                      type="text"
                      placeholder={t.vaultNamePlaceholder}
                      value={vaultName}
                      onChange={(e) => setVaultName(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm font-medium text-gray-900 focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none transition-all placeholder-gray-400"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">{t.masterPassword}</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">key</span>
                    <input
                      type="password"
                      placeholder={t.createStrongPassword}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm font-medium text-gray-900 focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none transition-all placeholder-gray-400"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">{t.confirm_password}</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">check_circle</span>
                    <input
                      type="password"
                      placeholder={t.confirmPasswordPlaceholder}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm font-medium text-gray-900 focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none transition-all placeholder-gray-400"
                      required
                    />
                  </div>
                </div>

                <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl">
                  <p className="text-[11px] text-amber-700 font-medium leading-relaxed">{t.passwordWarning}</p>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-3 rounded-xl shadow-lg shadow-red-500/20 hover:shadow-red-500/30 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading
                    ? <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
                    : <span className="material-symbols-outlined text-[20px]">add_circle</span>
                  }
                  {isLoading ? t.creating : t.create}
                </button>
              </form>
            )}
          </div>

          {error && (
            <div className="mt-6 p-3 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-bottom-2">
              <span className="material-symbols-outlined text-red-500 text-[20px] shrink-0">error</span>
              <p className="text-xs font-medium text-red-600 pt-0.5">{error}</p>
            </div>
          )}
        </div>

        <div className="text-center mt-6 space-y-2">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            {t.localFirstTagline}
          </p>
          <div className="flex items-center justify-center gap-3 text-[10px] text-gray-400">
            <a
              href="https://github.com/JamieJustTang/mysterbox-vault"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 hover:text-gray-700 transition-colors group"
            >
              {/* GitHub SVG icon */}
              <svg className="size-3 fill-current opacity-60 group-hover:opacity-100 transition-opacity" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 .5C5.648.5.5 5.648.5 12c0 5.084 3.292 9.394 7.862 10.916.575.105.784-.25.784-.554 0-.274-.01-1-.015-1.962-3.2.695-3.876-1.542-3.876-1.542-.522-1.327-1.276-1.681-1.276-1.681-1.044-.713.08-.699.08-.699 1.154.081 1.762 1.185 1.762 1.185 1.026 1.758 2.69 1.25 3.347.955.104-.742.402-1.25.731-1.537-2.554-.29-5.24-1.277-5.24-5.685 0-1.257.449-2.285 1.185-3.09-.12-.291-.514-1.462.112-3.046 0 0 .967-.31 3.167 1.18A11.01 11.01 0 0 1 12 6.582c.979.004 1.965.132 2.886.388 2.198-1.49 3.163-1.18 3.163-1.18.628 1.584.233 2.755.114 3.046.738.805 1.184 1.833 1.184 3.09 0 4.42-2.69 5.392-5.254 5.676.413.356.781 1.057.781 2.131 0 1.538-.014 2.78-.014 3.158 0 .307.207.664.789.552C20.21 21.39 23.5 17.082 23.5 12 23.5 5.648 18.352.5 12 .5z" />
              </svg>
              JamieJustTang/mysterbox-vault
            </a>
            <span className="opacity-40">·</span>
            <span>MIT License</span>
            <span className="opacity-40">·</span>
            <span>by JamieTang</span>
          </div>
        </div>
      </div>
    </div>
  );
};
