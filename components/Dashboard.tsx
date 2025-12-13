
import React, { useState, useMemo } from 'react';
import { Search, Plus, LogOut, Download, Clock, BarChart2, Moon, Sun, Lock, MoreHorizontal, LayoutGrid, List, Globe, Menu } from 'lucide-react';
import { Card, Tag, VaultData, SortMode, Language, TranslationFn } from '../types';
import { Button } from './Button';
import { TagBadge } from './TagBadge';
import { TiltCard } from './TiltCard';
import { TagFilterModal } from './TagFilterModal';

interface DashboardProps {
  vault: VaultData;
  onLogout: () => void;
  onSave: () => void;
  onAddCard: () => void;
  onOpenCard: (card: Card) => void;
  tags: Tag[];
  onManageTags: () => void;
  sortMode: SortMode;
  setSortMode: (m: SortMode) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  lang: Language;
  toggleLang: () => void;
  t: TranslationFn;
}

export const Dashboard: React.FC<DashboardProps> = ({
  vault, onLogout, onSave, onAddCard, onOpenCard, tags, onManageTags, sortMode, setSortMode, theme, toggleTheme, lang, toggleLang, t
}) => {
  const [search, setSearch] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagLogic, setTagLogic] = useState<'OR' | 'AND'>('OR');
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'timeline'>('grid');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const filteredCards = useMemo(() => {
    // Normalize to avoid runtime errors when older vault data misses optional fields
    const normalized = vault.cards.map(c => ({
      ...c,
      username: c.username || '',
      notes: c.notes || '',
      tags: Array.isArray(c.tags) ? c.tags : [],
      usageCount: c.usageCount || 0,
      dates: {
        created: c.dates?.created || 0,
        modified: c.dates?.modified || c.dates?.created || 0,
        accessed: c.dates?.accessed || c.dates?.modified || c.dates?.created || 0,
      },
    }));

    let result = [...normalized];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(c => 
        c.title.toLowerCase().includes(q) || 
        c.username?.toLowerCase().includes(q) || 
        c.notes.toLowerCase().includes(q)
      );
    }

    if (selectedTags.length > 0) {
      if (tagLogic === 'OR') {
        result = result.filter(c => (c.tags || []).some(t => selectedTags.includes(t)));
      } else {
        result = result.filter(c => selectedTags.every(t => (c.tags || []).includes(t)));
      }
    }

    const sorted = [...result];
    if (viewMode === 'grid') {
      sorted.sort((a, b) => {
        if (sortMode === 'recent') {
          return (b.dates.accessed || 0) - (a.dates.accessed || 0);
        } else {
          return (b.usageCount || 0) - (a.usageCount || 0);
        }
      });
    } else {
      sorted.sort((a, b) => (b.dates.created || 0) - (a.dates.created || 0));
    }

    return sorted;
  }, [vault.cards, search, selectedTags, tagLogic, sortMode, viewMode]);

  const toggleFilterTag = (id: string) => {
    setSelectedTags(prev => prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]);
  };

  const timelineGroups = useMemo(() => {
    if (viewMode !== 'timeline') return [];
    
    const groups: { dateStr: string; cards: Card[] }[] = [];
    
    filteredCards.forEach(card => {
      const date = new Date(card.dates.created || 0);
      // Explicitly use 'en-US' if not Chinese to avoid browser default locale (which might be Chinese) overriding the English setting
      const dateStr = date.toLocaleDateString(lang === 'zh' ? 'zh-CN' : 'en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });

      const lastGroup = groups[groups.length - 1];
      if (lastGroup && lastGroup.dateStr === dateStr) {
        lastGroup.cards.push(card);
      } else {
        groups.push({ dateStr, cards: [card] });
      }
    });

    return groups;
  }, [filteredCards, viewMode, lang]);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-black text-gray-900 dark:text-gray-100 transition-colors flex flex-col relative">
      
      {/* Navbar */}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-dark-surface/80 backdrop-blur-md border-b border-gray-200 dark:border-dark-border">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between relative">
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 bg-primary rounded flex items-center justify-center text-white">
              <Lock size={18} />
            </div>
            <span className="font-bold text-lg hidden md:block">{vault.meta.name}</span>
          </div>

          <div className="flex-1 max-w-xl mx-2 md:mx-4 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text"
              placeholder={t('searchPlaceholder')}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-full bg-gray-100 dark:bg-zinc-900 border-none focus:ring-2 focus:ring-primary text-sm"
            />
          </div>

          <div className="flex items-center gap-1 md:gap-2 relative">
             
             {/* Desktop Actions */}
             <div className="hidden md:flex items-center gap-2">
                <button 
                  onClick={toggleLang}
                  className="p-2 text-gray-500 hover:text-primary transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 font-bold text-xs"
                  title={lang === 'en' ? "切换到中文" : "Switch to English"}
                >
                  {lang === 'en' ? '中' : 'EN'}
                </button>
                <button 
                    onClick={() => setViewMode(prev => prev === 'grid' ? 'timeline' : 'grid')} 
                    className="p-2 text-gray-500 hover:text-primary transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800"
                    title={viewMode === 'grid' ? t('switchTimeline') : t('switchGrid')}
                  >
                  {viewMode === 'grid' ? <List size={20} /> : <LayoutGrid size={20} />}
                </button>
                <button onClick={toggleTheme} className="p-2 text-gray-500 hover:text-primary transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800">
                  {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                </button>
                <Button variant="ghost" onClick={onSave} title={t('saveVault')}>
                  <Download size={20} />
                </Button>
                <Button variant="ghost" onClick={onLogout} title={t('lockVault')}>
                  <LogOut size={20} />
                </Button>
                <Button onClick={onAddCard} className="flex ml-2">
                  <Plus size={18} className="mr-1" /> {t('new')}
                </Button>
             </div>

             {/* Mobile Actions */}
             <div className="flex md:hidden items-center gap-2">
                <button onClick={onAddCard} className="p-2 bg-primary text-white rounded-full shadow-sm hover:bg-primary-hover active:scale-95 transition-all">
                  <Plus size={20} />
                </button>
                <button 
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
                  className={`p-2 rounded-full transition-colors ${isMobileMenuOpen ? 'bg-gray-200 dark:bg-zinc-800 text-primary' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-zinc-800'}`}
                >
                  <Menu size={24} />
                </button>
             </div>

          </div>
        </div>
        
        {/* Sub-header controls */}
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
          
          <div className={`flex items-center gap-2 shrink-0 transition-opacity ${viewMode === 'timeline' ? 'opacity-30 pointer-events-none grayscale' : 'opacity-100'}`}>
            <div className="flex bg-gray-200 dark:bg-zinc-800 rounded-lg p-1">
              <button 
                onClick={() => setSortMode('recent')}
                className={`px-3 py-1 rounded text-xs font-medium flex items-center gap-1 transition-all ${sortMode === 'recent' ? 'bg-white dark:bg-zinc-600 shadow text-primary' : 'text-gray-500'}`}
              >
                <Clock size={12} /> <span className="hidden sm:inline">{t('recent')}</span>
              </button>
              <button 
                onClick={() => setSortMode('frequency')}
                className={`px-3 py-1 rounded text-xs font-medium flex items-center gap-1 transition-all ${sortMode === 'frequency' ? 'bg-white dark:bg-zinc-600 shadow text-primary' : 'text-gray-500'}`}
              >
                <BarChart2 size={12} /> <span className="hidden sm:inline">{t('freq')}</span>
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-hidden relative h-9 flex items-center group">
             <div 
               className="flex gap-2 items-center absolute left-0 h-full pr-4" 
               style={{ 
                 maskImage: 'linear-gradient(to right, black calc(100% - 48px), transparent 100%)', 
                 WebkitMaskImage: 'linear-gradient(to right, black calc(100% - 48px), transparent 100%)' 
               }}
             >
                {tags.length === 0 && <span className="text-xs text-gray-400 italic">{t('noTags')}</span>}
                {tags.map(t => (
                  <TagBadge 
                    key={t.id} 
                    tag={t} 
                    selected={selectedTags.includes(t.id)}
                    onClick={() => toggleFilterTag(t.id)}
                  />
                ))}
             </div>
          </div>

          <button 
            onClick={() => setIsFilterModalOpen(true)}
            className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${selectedTags.length > 0 ? 'bg-primary text-white shadow-md' : 'bg-gray-200 dark:bg-zinc-800 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-zinc-700'}`}
            title={t('filterTags')}
          >
            <MoreHorizontal size={18} />
          </button>

        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto px-4 py-6 w-full">
        {filteredCards.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <Search size={48} className="mb-4 opacity-20" />
            <p>{t('noCardsFound')}</p>
          </div>
        ) : (
          <>
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredCards.map(card => {
                  const cardTags = (card.tags || []).slice(0, 10).map(tid => tags.find(t => t.id === tid)).filter((t): t is Tag => !!t);
                  return (
                    <TiltCard 
                      key={card.id}
                      card={card}
                      resolvedTags={cardTags}
                      onClick={() => onOpenCard(card)}
                      t={t}
                    />
                  );
                })}
              </div>
            ) : (
              <div className="relative max-w-3xl mx-auto pb-12">
                <div className="absolute left-4 md:left-8 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-zinc-800" />

                {timelineGroups.map((group, groupIdx) => (
                  <div key={group.dateStr} className="relative mb-12">
                    <div className="flex items-center mb-6">
                      <div className="absolute left-4 md:left-8 w-4 h-4 -ml-[7px] rounded-full border-4 border-white dark:border-black bg-primary z-10 shadow-sm" />
                      <div className="ml-12 md:ml-20">
                        <span className="text-sm font-bold text-primary uppercase tracking-wide bg-primary/10 px-3 py-1 rounded-full">
                          {group.dateStr}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-6 ml-12 md:ml-20">
                      {group.cards.map(card => {
                        const cardTags = (card.tags || []).slice(0, 10).map(tid => tags.find(t => t.id === tid)).filter((t): t is Tag => !!t);
                        return (
                          <div key={card.id} className="relative max-w-md">
                            <div className="absolute -left-4 md:-left-8 top-8 w-4 md:w-8 h-px bg-gray-200 dark:bg-zinc-800" />
                            
                            <TiltCard 
                              card={card}
                              resolvedTags={cardTags}
                              onClick={() => onOpenCard(card)}
                              t={t}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {/* Mobile Menu & Overlay - Placed outside Header to ensure full-screen coverage */}
      {isMobileMenuOpen && (
        <>
          <div 
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm md:hidden animate-in fade-in duration-200" 
            onClick={() => setIsMobileMenuOpen(false)} 
          />
          <div className="fixed top-16 right-4 mt-2 w-56 bg-white dark:bg-[#1E1E1E] rounded-xl shadow-2xl border border-gray-100 dark:border-zinc-800 py-2 z-50 flex flex-col animate-in fade-in zoom-in-95 duration-200 md:hidden overflow-hidden origin-top-right">
            
            <div className="px-4 py-2 border-b border-gray-100 dark:border-zinc-800 mb-1">
               <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{t('appName')}</span>
            </div>

            <button onClick={() => { toggleLang(); setIsMobileMenuOpen(false); }} className="w-full text-left px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-zinc-800 flex items-center gap-3 transition-colors">
               <Globe size={18} className="text-primary" />
               <span>{lang === 'en' ? '切换到中文' : 'Switch to English'}</span>
            </button>

            <button onClick={() => { setViewMode(viewMode === 'grid' ? 'timeline' : 'grid'); setIsMobileMenuOpen(false); }} className="w-full text-left px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-zinc-800 flex items-center gap-3 transition-colors">
               {viewMode === 'grid' ? <List size={18} /> : <LayoutGrid size={18} />}
               <span>{viewMode === 'grid' ? t('switchTimeline') : t('switchGrid')}</span>
            </button>

            <button onClick={() => { toggleTheme(); setIsMobileMenuOpen(false); }} className="w-full text-left px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-zinc-800 flex items-center gap-3 transition-colors">
               {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
               <span>{theme === 'dark' ? (lang === 'en' ? 'Light Mode' : '亮色模式') : (lang === 'en' ? 'Dark Mode' : '深色模式')}</span>
            </button>
            
            <div className="my-1 border-t border-gray-100 dark:border-zinc-800" />

            <button onClick={() => { onSave(); setIsMobileMenuOpen(false); }} className="w-full text-left px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-zinc-800 flex items-center gap-3 transition-colors">
               <Download size={18} />
               <span>{t('saveVault')}</span>
            </button>

            <button onClick={() => { onLogout(); setIsMobileMenuOpen(false); }} className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 flex items-center gap-3 transition-colors">
               <LogOut size={18} />
               <span>{t('lockVault')}</span>
            </button>
          </div>
        </>
      )}
      
      <TagFilterModal 
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        tags={tags}
        selectedTags={selectedTags}
        onToggleTag={toggleFilterTag}
        onClearFilters={() => setSelectedTags([])}
        onManageTags={onManageTags}
        t={t}
      />

    </div>
  );
};
