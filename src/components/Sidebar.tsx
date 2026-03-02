import React, { useMemo } from 'react';
import { useVault } from '../context/VaultContext';
import { useTranslation } from '../i18n';
import { runAudit } from '../services/auditService';

interface SidebarProps {
  activeTab: 'dashboard' | 'security-audit' | 'generator';
  setActiveTab: (tab: 'dashboard' | 'security-audit' | 'generator') => void;
  selectedTag: string | null;
  setSelectedTag: (tag: string | null) => void;
  activeFilter?: 'all' | 'favorites' | 'archive';
  setActiveFilter?: (filter: 'all' | 'favorites' | 'archive') => void;
  /** When rendered inside a Drawer on mobile, provide this to show a close button */
  onClose?: () => void;
  drawerMode?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, selectedTag, setSelectedTag, activeFilter = 'all', setActiveFilter = (_: 'all' | 'favorites' | 'archive') => { }, onClose, drawerMode = false }) => {
  const { vault, saveVaultAs, fileHandle, isSaving, language } = useVault();
  const t = useTranslation(language);

  const audit = useMemo(() => runAudit(vault?.cards || []), [vault?.cards]);

  const healthColor = audit.score >= 80 ? 'bg-emerald-500' : audit.score >= 60 ? 'bg-amber-400' : 'bg-red-400';
  const healthTextColor = audit.score >= 80 ? 'text-emerald-600' : audit.score >= 60 ? 'text-amber-600' : 'text-red-500';
  const healthLabel = audit.score >= 80 ? t.healthGood : audit.score >= 60 ? t.healthFair : t.healthPoor;
  const issueCount = audit.allIssueItems.length;

  return (
    <aside className={drawerMode
      ? 'flex flex-col w-full h-full'
      : 'w-60 flex-col glass-panel rounded-2xl overflow-y-auto shrink-0 hidden lg:flex h-[calc(100dvh-3rem)]'
    }>
      <div className="p-4 flex flex-col gap-4 h-full">
        {/* Drawer close button (mobile only) */}
        {drawerMode && onClose && (
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold text-gray-900">MysterBox</span>
            <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        )}
        {/* Vault Location */}
        <div className="relative group">
          <h3 className="px-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">{t.vaultLocation}</h3>
          <div className="flex items-center gap-2 p-2.5 rounded-xl border border-gray-200/60 bg-white/40 transition-all">
            <div className="size-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 shrink-0">
              <span className="material-symbols-outlined text-[18px] text-primary">folder_open</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-gray-900 truncate">{vault?.meta.name || 'vault.vlt'}</p>
              <p className="text-[10px] text-gray-400 truncate font-mono">
                {fileHandle ? t.localFile : t.unsaved}
              </p>
            </div>
            <div className="flex items-center shrink-0">
              {/* Export button */}
              <button
                className="size-7 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 flex items-center justify-center transition-colors"
                title={t.exportCopy}
                onClick={() => saveVaultAs()}
              >
                <span className="material-symbols-outlined text-[16px]">file_download</span>
              </button>
            </div>
          </div>
          {/* Auto-save hint */}
          <div className="flex items-center gap-1.5 mt-2 px-1">
            {isSaving ? (
              <>
                <span className="material-symbols-outlined text-[12px] text-amber-400 animate-spin">autorenew</span>
                <span className="text-[10px] text-amber-500 font-medium">
                  {language === 'zh' ? '正在保存…' : 'Saving…'}
                </span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[12px] text-emerald-500">shield_lock</span>
                <span className="text-[10px] text-gray-400 font-medium leading-snug">{t.autoSaveHint}</span>
              </>
            )}
          </div>
        </div>

        {/* My Vault */}
        <div className="flex flex-col gap-1">
          <h3 className="px-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">{t.myVault}</h3>
          <button
            onClick={() => {
              setActiveTab('dashboard');
              setSelectedTag(null);
              setActiveFilter('all');
            }}
            className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all group hover:shadow-sm w-full text-left ${activeTab === 'dashboard' && !selectedTag && activeFilter === 'all'
              ? 'bg-gradient-to-r from-red-50 to-white text-primary font-bold shadow-sm ring-1 ring-red-100'
              : 'text-gray-600 hover:bg-white hover:text-gray-900'
              }`}
          >
            <span className={`material-symbols-outlined text-[20px] ${activeTab === 'dashboard' && !selectedTag && activeFilter === 'all' ? 'fill-1' : 'group-hover:text-primary transition-colors'}`}>inventory_2</span>
            <span className="text-xs font-medium">{t.allItems}</span>
            <span className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm ${activeTab === 'dashboard' && !selectedTag && activeFilter === 'all' ? 'bg-white text-primary' : 'bg-gray-100 text-gray-500 group-hover:text-gray-600'}`}>
              {vault?.cards.filter(c => !c.archived).length || 0}
            </span>
          </button>
          <button
            onClick={() => {
              setActiveTab('dashboard');
              setSelectedTag(null);
              setActiveFilter('favorites');
            }}
            className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all group hover:shadow-sm w-full text-left ${activeTab === 'dashboard' && !selectedTag && activeFilter === 'favorites'
              ? 'bg-gradient-to-r from-red-50 to-white text-primary font-bold shadow-sm ring-1 ring-red-100'
              : 'text-gray-600 hover:bg-white hover:text-gray-900'
              }`}
          >
            <span className={`material-symbols-outlined text-[20px] ${activeTab === 'dashboard' && !selectedTag && activeFilter === 'favorites' ? 'fill-1' : 'group-hover:text-primary transition-colors'}`}>favorite</span>
            <span className="text-xs font-medium">{t.favorites}</span>
            <span className={`ml-auto text-[10px] font-medium ${activeTab === 'dashboard' && !selectedTag && activeFilter === 'favorites' ? 'text-primary' : 'text-gray-400 group-hover:text-gray-600'}`}>
              {vault?.cards.filter(c => c.favorite).length || 0}
            </span>
          </button>
          <button
            onClick={() => {
              setActiveTab('dashboard');
              setSelectedTag(null);
              setActiveFilter('archive');
            }}
            className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all group hover:shadow-sm w-full text-left ${activeTab === 'dashboard' && !selectedTag && activeFilter === 'archive'
              ? 'bg-gradient-to-r from-red-50 to-white text-primary font-bold shadow-sm ring-1 ring-red-100'
              : 'text-gray-600 hover:bg-white hover:text-gray-900'
              }`}
          >
            <span className={`material-symbols-outlined text-[20px] ${activeTab === 'dashboard' && !selectedTag && activeFilter === 'archive' ? 'fill-1' : 'group-hover:text-primary transition-colors'}`}>inventory</span>
            <span className="text-xs font-medium">{t.archive}</span>
            <span className={`ml-auto text-[10px] font-medium ${activeTab === 'dashboard' && !selectedTag && activeFilter === 'archive' ? 'text-primary' : 'text-gray-400 group-hover:text-gray-600'}`}>
              {vault?.cards.filter(c => c.archived).length || 0}
            </span>
          </button>
        </div>

        {/* Tags */}
        <div className="flex flex-col gap-1">
          <div className="px-3 mb-2">
            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t.tags}</h3>
          </div>
          {vault && vault.tags.length > 0 ? (
            vault.tags.map((tag) => {
              const count = vault.cards.filter(c => c.tags.includes(tag.id)).length;
              return (
                <button
                  key={tag.id}
                  onClick={() => {
                    setActiveTab('dashboard');
                    setSelectedTag(tag.id);
                  }}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all group w-full text-left ${selectedTag === tag.id
                    ? 'bg-gradient-to-r from-gray-50 to-white text-gray-900 font-bold shadow-sm ring-1 ring-gray-100'
                    : 'text-gray-600 hover:bg-white hover:text-gray-900'
                    }`}
                >
                  <div
                    className="size-2 rounded-full shrink-0"
                    style={{ backgroundColor: tag.color, boxShadow: `0 0 8px ${tag.color}60` }}
                  />
                  <span className="text-xs font-medium truncate flex-1">{tag.name}</span>
                  <span className={`text-[10px] font-medium ${selectedTag === tag.id ? 'text-gray-600' : 'text-gray-400 group-hover:text-gray-600'}`}>
                    {count}
                  </span>
                </button>
              );
            })
          ) : (
            <div className="px-3 py-2 text-xs text-gray-400 italic">{t.noTagsCreated}</div>
          )}
        </div>

        {/* Tools */}
        <div className="flex flex-col gap-1">
          <h3 className="px-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">{t.tools}</h3>
          <button
            onClick={() => setActiveTab('generator')}
            className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all group w-full text-left ${activeTab === 'generator'
              ? 'bg-gradient-to-r from-red-50 to-white text-primary font-bold shadow-sm ring-1 ring-red-100'
              : 'text-gray-600 hover:bg-white hover:text-gray-900'
              }`}
          >
            <span className={`material-symbols-outlined text-[20px] ${activeTab === 'generator' ? 'fill-1' : 'group-hover:text-primary transition-colors'}`}>grid_view</span>
            <span className="text-xs font-medium">{t.generate_password}</span>
          </button>
          <button
            onClick={() => setActiveTab('security-audit')}
            className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all group w-full text-left ${activeTab === 'security-audit'
              ? 'bg-gradient-to-r from-red-50 to-white text-primary font-bold shadow-sm ring-1 ring-red-100'
              : 'text-gray-600 hover:bg-white hover:text-gray-900'
              }`}
          >
            <span className={`material-symbols-outlined text-[20px] ${activeTab === 'security-audit' ? 'fill-1' : 'group-hover:text-primary transition-colors'}`}>policy</span>
            <span className="text-xs font-medium">Security Audit</span>
          </button>
        </div>

        {/* Vault Health */}
        <div className="mt-auto">
          <div
            onClick={() => setActiveTab('security-audit')}
            className="bg-white/60 backdrop-blur-sm border border-white/60 rounded-xl p-3 shadow-sm relative overflow-hidden group cursor-pointer hover:bg-white/80 transition-all"
          >
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-bold text-[10px] uppercase tracking-wider text-gray-500">{t.vaultHealth}</h4>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm border border-gray-100 bg-white ${healthTextColor}`}>
                {audit.score}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1 mb-2 overflow-hidden">
              <div className={`${healthColor} h-1 rounded-full transition-all duration-500`} style={{ width: `${audit.score}%` }} />
            </div>
            <div className="flex items-center justify-between">
              <p className="text-[10px] text-gray-400">{healthLabel}</p>
              {issueCount > 0 ? (
                <span className="text-[10px] font-bold text-primary flex items-center gap-0.5">
                  {issueCount}{t.issuesPending}
                  <span className="material-symbols-outlined text-[10px]">arrow_forward</span>
                </span>
              ) : (
                <span className="text-[10px] font-bold text-emerald-500 flex items-center gap-0.5">
                  <span className="material-symbols-outlined text-[10px]">check_circle</span>
                  {t.allSafe}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
