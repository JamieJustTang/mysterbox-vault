import React, { useState, useMemo } from 'react';
import { useVault } from '../context/VaultContext';
import { useTranslation } from '../i18n';
import { VaultCard } from '../types';
import { CardModal } from './CardModal';
import { Sidebar } from './Sidebar';
import { SecurityAudit } from './SecurityAudit';
import { Generator } from './Generator';
import { ExitModal } from './ExitModal';
import { TagManagerModal } from './TagManagerModal';
import { TagBadge } from './TagBadge';
import { BottomNav } from './BottomNav';
import { Drawer } from './ui/Drawer';

export const Dashboard: React.FC = () => {
    const { vault, saveVault, updateCard, deleteCard, language } = useVault();
    const t = useTranslation(language);
    const [showExitModal, setShowExitModal] = useState(false);
    const [showTagManager, setShowTagManager] = useState(false);
    const [activeTab, setActiveTab] = useState<'dashboard' | 'security-audit' | 'generator'>('dashboard');
    const [activeFilter, setActiveFilter] = useState<'all' | 'favorites' | 'archive'>('all');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [sortMode, setSortMode] = useState<'name' | 'recent' | 'frequent'>('name');
    const [selectedTag, setSelectedTag] = useState<string | null>(null);

    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCard, setEditingCard] = useState<VaultCard | null>(null);
    const [selectedArchivedCards, setSelectedArchivedCards] = useState<Set<string>>(new Set());
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const filteredCards = useMemo(() => {
        if (!vault) return [];
        let cards = vault.cards;

        if (activeFilter === 'archive') {
            cards = cards.filter(card => card.archived);
        } else {
            cards = cards.filter(card => !card.archived);

            if (selectedTag) {
                cards = cards.filter(card => card.tags.includes(selectedTag));
            } else {
                if (activeFilter === 'favorites') {
                    cards = cards.filter(card => card.favorite);
                }
            }
        }

        if (searchQuery) {
            cards = cards.filter(card => {
                const matchesSearch =
                    card.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    card.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    card.url?.toLowerCase().includes(searchQuery.toLowerCase());
                return matchesSearch;
            });
        }

        // Sort
        const sorted = [...cards];
        switch (sortMode) {
            case 'name':
                sorted.sort((a, b) => a.title.localeCompare(b.title));
                break;
            case 'recent':
                sorted.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
                break;
            case 'frequent':
                sorted.sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0));
                break;
        }

        return sorted;
    }, [vault, searchQuery, selectedTag, activeFilter, sortMode]);

    const handleEdit = (card: VaultCard) => {
        setEditingCard(card);
        setIsModalOpen(true);
    };

    const handleArchive = (card: VaultCard) => {
        updateCard({ ...card, archived: true });
        setIsModalOpen(false);
    };

    const handleRestore = () => {
        selectedArchivedCards.forEach(id => {
            const card = vault?.cards.find(c => c.id === id);
            if (card) {
                updateCard({ ...card, archived: false });
            }
        });
        setSelectedArchivedCards(new Set());
    };

    const handleDeleteCompletely = () => {
        selectedArchivedCards.forEach(id => {
            deleteCard(id);
        });
        setSelectedArchivedCards(new Set());
    };

    const toggleSelectArchived = (id: string) => {
        const newSelected = new Set(selectedArchivedCards);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedArchivedCards(newSelected);
    };

    const toggleSelectAllArchived = () => {
        if (selectedArchivedCards.size === filteredCards.length) {
            setSelectedArchivedCards(new Set());
        } else {
            setSelectedArchivedCards(new Set(filteredCards.map(c => c.id)));
        }
    };

    const recordUsage = (card: VaultCard) => {
        if (card.archived) return;
        updateCard({
            ...card,
            lastUsed: Date.now(),
            usageCount: (card.usageCount || 0) + 1
        });
    };

    const copyToClipboard = (text: string, card?: VaultCard) => {
        navigator.clipboard.writeText(text);
        if (card) {
            recordUsage(card);
        }
    };

    if (!vault) return null;

    const sidebarProps = {
        activeTab, setActiveTab, selectedTag, setSelectedTag, activeFilter, setActiveFilter,
    };

    return (
        <div className="flex h-[100dvh] w-full overflow-hidden relative p-2 gap-2 sm:p-4 sm:gap-4">
            {/* ── Desktop Sidebar ── */}
            <Sidebar {...sidebarProps} />

            {/* ── Mobile Sidebar Drawer ── */}
            <Drawer open={sidebarOpen} onClose={() => setSidebarOpen(false)} side="left" width="w-72">
                <Sidebar {...sidebarProps} drawerMode onClose={() => setSidebarOpen(false)} />
            </Drawer>

            {activeTab === 'security-audit' ? (
                <SecurityAudit onEditCard={(card) => { setEditingCard(card); setIsModalOpen(true); }} />
            ) : activeTab === 'generator' ? (
                <Generator />
            ) : (
                <main className="flex-1 overflow-y-auto rounded-2xl bg-white/50 border border-white/60 shadow-sm p-4 sm:p-6 scroll-smooth pb-24 lg:pb-6">
                    <div className="max-w-7xl mx-auto flex flex-col gap-6">
                        {/* Header */}
                        <div className="flex items-center justify-between gap-3">
                            <div className="min-w-0">
                                <h1 className="text-lg sm:text-2xl font-bold text-gray-900 tracking-tight truncate">
                                    {selectedTag ? `${vault?.tags.find(tg => tg.id === selectedTag)?.name || selectedTag}` :
                                        activeFilter === 'favorites' ? t.favorites :
                                            activeFilter === 'archive' ? t.archive :
                                                t.all_items}
                                </h1>
                                <p className="text-gray-500 text-xs mt-0.5 font-medium hidden sm:block">{t.appSubtitle || 'Manage your passwords & secure notes'}</p>
                            </div>
                            <div className="flex items-center gap-2 self-end sm:self-auto">
                                {activeFilter === 'archive' ? (
                                    <>
                                        {selectedArchivedCards.size > 0 && (
                                            <>
                                                <button
                                                    onClick={handleRestore}
                                                    className="flex items-center gap-1.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-3 py-2 rounded-lg text-xs font-bold transition-all shadow-sm"
                                                >
                                                    <span className="material-symbols-outlined text-[18px]">restore_from_trash</span>
                                                    <span>Restore ({selectedArchivedCards.size})</span>
                                                </button>
                                                <button
                                                    onClick={handleDeleteCompletely}
                                                    className="flex items-center gap-1.5 bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-xs font-bold transition-all shadow-lg shadow-red-500/20 hover:shadow-red-500/30 active:scale-95"
                                                >
                                                    <span className="material-symbols-outlined text-[18px]">delete_forever</span>
                                                    <span>Delete Completely ({selectedArchivedCards.size})</span>
                                                </button>
                                            </>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        <div className="flex items-center bg-gray-100/80 p-1 rounded-lg gap-0.5">
                                            <button
                                                onClick={() => setViewMode('grid')}
                                                className={`p-1.5 rounded-md transition-all flex items-center justify-center ${viewMode === 'grid' ? 'bg-white text-gray-900 shadow-sm ring-1 ring-black/5' : 'text-gray-400 hover:text-gray-600'}`}
                                                title="Grid View"
                                            >
                                                <span className="material-symbols-outlined text-[20px]">grid_view</span>
                                            </button>
                                            <button
                                                onClick={() => setViewMode('list')}
                                                className={`p-1.5 rounded-md transition-all flex items-center justify-center ${viewMode === 'list' ? 'bg-white text-gray-900 shadow-sm ring-1 ring-black/5' : 'text-gray-400 hover:text-gray-600'}`}
                                                title="List View"
                                            >
                                                <span className="material-symbols-outlined text-[20px]">view_list</span>
                                            </button>
                                        </div>
                                        {/* Sort mode icons */}
                                        <div className="flex items-center bg-gray-100/80 p-1 rounded-lg gap-0.5">
                                            {[
                                                { mode: 'name' as const, icon: 'sort_by_alpha', tip: 'A → Z' },
                                                { mode: 'recent' as const, icon: 'schedule', tip: language === 'zh' ? '最近修改' : 'Recently Modified' },
                                                { mode: 'frequent' as const, icon: 'trending_up', tip: language === 'zh' ? '常用优先' : 'Most Used' },
                                            ].map(s => (
                                                <button
                                                    key={s.mode}
                                                    onClick={() => setSortMode(s.mode)}
                                                    className={`p-1.5 rounded-md transition-all flex items-center justify-center ${sortMode === s.mode ? 'bg-white text-gray-900 shadow-sm ring-1 ring-black/5' : 'text-gray-400 hover:text-gray-600'}`}
                                                    title={s.tip}
                                                >
                                                    <span className="material-symbols-outlined text-[18px]">{s.icon}</span>
                                                </button>
                                            ))}
                                        </div>
                                        <button
                                            onClick={() => { setEditingCard(null); setIsModalOpen(true); }}
                                            className="hidden lg:flex items-center gap-1.5 bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-lg shadow-red-500/20 hover:shadow-red-500/30 active:scale-95"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">add</span>
                                            <span>New Item</span>
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Search Bar (Mobile/Tablet or Extra) */}
                        <div className="relative w-full md:hidden">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">search</span>
                            <input
                                className="w-full bg-white border border-gray-200 text-gray-800 text-xs rounded-full pl-9 pr-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none placeholder-gray-400 transition-all shadow-sm"
                                placeholder="Search your vault..."
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        {/* Content View */}
                        {activeFilter === 'archive' ? (
                            <div className="flex flex-col gap-2">
                                {/* Archive List Header */}
                                <div className="grid grid-cols-12 gap-4 px-4 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                                    <div className="col-span-1 flex items-center justify-center">
                                        <input
                                            type="checkbox"
                                            className="rounded border-gray-300 text-primary focus:ring-primary/20"
                                            checked={filteredCards.length > 0 && selectedArchivedCards.size === filteredCards.length}
                                            onChange={toggleSelectAllArchived}
                                        />
                                    </div>
                                    <div className="col-span-4 sm:col-span-3">Name</div>
                                    <div className="col-span-4 sm:col-span-3 hidden sm:block">Username</div>
                                    <div className="col-span-3 hidden md:block">URL</div>
                                    <div className="col-span-3 sm:col-span-5 md:col-span-2 text-right">Actions</div>
                                </div>

                                {/* Archive List Rows */}
                                {filteredCards.map(card => (
                                    <div
                                        key={card.id}
                                        className={`grid grid-cols-12 gap-4 px-4 py-3 bg-white rounded-xl border items-center transition-all cursor-pointer group ${selectedArchivedCards.has(card.id) ? 'border-primary/50 bg-red-50/10' : 'border-gray-100 hover:shadow-md hover:border-primary/20'}`}
                                        onClick={() => toggleSelectArchived(card.id)}
                                    >
                                        <div className="col-span-1 flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
                                            <input
                                                type="checkbox"
                                                className="rounded border-gray-300 text-primary focus:ring-primary/20"
                                                checked={selectedArchivedCards.has(card.id)}
                                                onChange={() => toggleSelectArchived(card.id)}
                                            />
                                        </div>
                                        <div className="col-span-4 sm:col-span-3 flex items-center gap-3 overflow-hidden">
                                            <div className="size-8 rounded-lg bg-gray-50 flex items-center justify-center shrink-0 border border-gray-100 relative overflow-hidden">
                                                {card.url ? (
                                                    <img
                                                        src={`https://www.google.com/s2/favicons?domain=${(() => {
                                                            try { return new URL(card.url).hostname; } catch { return ''; }
                                                        })()}&sz=64`}
                                                        alt={card.title}
                                                        className="size-5 object-contain"
                                                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                                    />
                                                ) : null}
                                                <span className={`material-symbols-outlined text-[18px] text-gray-400 ${card.url ? 'absolute -z-10' : ''}`}>lock</span>
                                            </div>
                                            <div className="min-w-0">
                                                <h3 className="font-bold text-sm text-gray-900 truncate">{card.title}</h3>
                                                <p className="text-[10px] text-gray-400 sm:hidden truncate">{card.username}</p>
                                            </div>
                                        </div>

                                        <div className="col-span-4 sm:col-span-3 hidden sm:flex items-center gap-2 overflow-hidden">
                                            <span className="text-xs font-medium text-gray-600 truncate">{card.username || '—'}</span>
                                        </div>

                                        <div className="col-span-3 hidden md:flex items-center overflow-hidden">
                                            {card.url ? (
                                                <span className="text-xs text-gray-400 truncate flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-[14px]">link</span>
                                                    {(() => { try { return new URL(card.url).hostname; } catch { return card.url; } })()}
                                                </span>
                                            ) : (
                                                <span className="text-xs text-gray-300">—</span>
                                            )}
                                        </div>

                                        <div className="col-span-3 sm:col-span-5 md:col-span-2 flex items-center justify-end gap-2">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); updateCard({ ...card, archived: false }); }}
                                                className="p-1.5 rounded-lg text-gray-400 hover:text-green-600 hover:bg-green-50 transition-colors"
                                                title="Restore"
                                            >
                                                <span className="material-symbols-outlined text-[18px]">restore_from_trash</span>
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); deleteCard(card.id); }}
                                                className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                                title="Delete Permanently"
                                            >
                                                <span className="material-symbols-outlined text-[18px]">delete_forever</span>
                                            </button>
                                        </div>
                                    </div>
                                ))}

                                {filteredCards.length === 0 && (
                                    <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-200">
                                        <div className="size-12 rounded-full bg-gray-50 mx-auto mb-3 flex items-center justify-center">
                                            <span className="material-symbols-outlined text-2xl text-gray-300">delete_outline</span>
                                        </div>
                                        <p className="text-sm font-bold text-gray-900">Archive is empty</p>
                                        <p className="text-xs text-gray-400 mt-1">Deleted items will appear here</p>
                                    </div>
                                )}
                            </div>
                        ) : viewMode === 'grid' ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {filteredCards.map(card => (
                                    <div
                                        key={card.id}
                                        onClick={() => handleEdit(card)}
                                        className="group relative bg-white rounded-xl p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-red-500/5 ring-1 ring-gray-100 hover:ring-primary/20 cursor-pointer"
                                    >
                                        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="text-gray-400 hover:text-primary p-1 rounded-full hover:bg-red-50 transition-colors">
                                                <span className="material-symbols-outlined text-[18px]">more_horiz</span>
                                            </button>
                                        </div>
                                        <div className="flex items-start mb-4">
                                            <div className="size-10 rounded-xl bg-white p-2 flex items-center justify-center shadow-soft ring-1 ring-gray-50 overflow-hidden relative">
                                                {card.url ? (
                                                    <img
                                                        src={`https://www.google.com/s2/favicons?domain=${(() => {
                                                            try { return new URL(card.url).hostname; } catch { return ''; }
                                                        })()}&sz=128`}
                                                        alt={card.title}
                                                        className="size-6 object-contain"
                                                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                                    />
                                                ) : null}
                                                <span className={`material-symbols-outlined text-2xl text-gray-400 ${card.url ? 'absolute -z-10' : ''}`}>lock</span>
                                            </div>
                                        </div>
                                        <h3 className="font-bold text-sm text-gray-900 mb-0.5 truncate">{card.title}</h3>
                                        <div className="flex items-center gap-1 mb-4 text-gray-400 hover:text-gray-600 transition-colors w-fit max-w-full">
                                            <p className="text-xs truncate font-medium tracking-wide">{card.username || 'No username'}</p>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); copyToClipboard(card.username || '', card); }}
                                                className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-primary"
                                            >
                                                <span className="material-symbols-outlined text-[12px]">content_copy</span>
                                            </button>
                                        </div>
                                        <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                                            <div className="flex items-center gap-1 overflow-hidden">
                                                {card.tags.slice(0, 2).map(tagId => {
                                                    const tag = vault?.tags.find(t => t.id === tagId);
                                                    return tag ? <TagBadge key={tag.id} tag={tag} small /> : null;
                                                })}
                                                {card.tags.length > 2 && <span className="text-[10px] text-gray-400 font-bold">+{card.tags.length - 2}</span>}
                                                {card.tags.length === 0 && <span className="text-[10px] text-gray-300 italic">No tags</span>}
                                            </div>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); copyToClipboard(card.password || '', card); }}
                                                className="text-gray-300 hover:text-primary transition-colors p-1 hover:bg-red-50 rounded-md group-hover:text-gray-400"
                                            >
                                                <span className="material-symbols-outlined text-[16px]">content_copy</span>
                                            </button>
                                        </div>
                                    </div>
                                ))}

                                {/* Add New Card Placeholder */}
                                <div
                                    onClick={() => { setEditingCard(null); setIsModalOpen(true); }}
                                    className="group relative bg-gray-50/50 border-2 border-dashed border-gray-200 rounded-xl p-4 transition-all duration-300 hover:border-primary/50 hover:bg-red-50/30 cursor-pointer flex flex-col items-center justify-center text-center min-h-[180px]"
                                >
                                    <div className="size-10 rounded-full bg-white shadow-sm ring-1 ring-gray-100 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                        <span className="material-symbols-outlined text-xl text-gray-400 group-hover:text-primary transition-colors">add</span>
                                    </div>
                                    <h3 className="font-bold text-sm text-gray-900 mb-0.5">Add New Item</h3>
                                    <p className="text-xs text-gray-400">Securely store a new password</p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-2">
                                {/* List Header */}
                                <div className="grid grid-cols-12 gap-4 px-4 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                                    <div className="col-span-5 sm:col-span-4">Name</div>
                                    <div className="col-span-4 sm:col-span-3 hidden sm:block">Username</div>
                                    <div className="col-span-3 hidden md:block">URL</div>
                                    <div className="col-span-7 sm:col-span-5 md:col-span-2 text-right">Actions</div>
                                </div>

                                {/* List Rows */}
                                {filteredCards.map(card => (
                                    <div
                                        key={card.id}
                                        onClick={() => handleEdit(card)}
                                        className="grid grid-cols-12 gap-4 px-4 py-3 bg-white rounded-xl border border-gray-100 items-center hover:shadow-md hover:border-primary/20 transition-all cursor-pointer group"
                                    >
                                        <div className="col-span-5 sm:col-span-4 flex items-center gap-3 overflow-hidden">
                                            <div className="size-8 rounded-lg bg-gray-50 flex items-center justify-center shrink-0 border border-gray-100 relative overflow-hidden">
                                                {card.url ? (
                                                    <img
                                                        src={`https://www.google.com/s2/favicons?domain=${(() => {
                                                            try { return new URL(card.url).hostname; } catch { return ''; }
                                                        })()}&sz=64`}
                                                        alt={card.title}
                                                        className="size-5 object-contain"
                                                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                                    />
                                                ) : null}
                                                <span className={`material-symbols-outlined text-[18px] text-gray-400 ${card.url ? 'absolute -z-10' : ''}`}>lock</span>
                                            </div>
                                            <div className="min-w-0">
                                                <h3 className="font-bold text-sm text-gray-900 truncate">{card.title}</h3>
                                                <p className="text-[10px] text-gray-400 sm:hidden truncate">{card.username}</p>
                                            </div>
                                        </div>

                                        <div className="col-span-4 sm:col-span-3 hidden sm:flex items-center gap-2 overflow-hidden">
                                            <span className="text-xs font-medium text-gray-600 truncate">{card.username || '—'}</span>
                                            {card.username && (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); copyToClipboard(card.username || '', card); }}
                                                    className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-primary transition-opacity"
                                                >
                                                    <span className="material-symbols-outlined text-[14px]">content_copy</span>
                                                </button>
                                            )}
                                        </div>

                                        <div className="col-span-3 hidden md:flex items-center overflow-hidden">
                                            {card.url ? (
                                                <a
                                                    href={card.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    onClick={(e) => { e.stopPropagation(); recordUsage(card); }}
                                                    className="text-xs text-gray-400 hover:text-primary hover:underline truncate flex items-center gap-1"
                                                >
                                                    <span className="material-symbols-outlined text-[14px]">link</span>
                                                    {(() => { try { return new URL(card.url).hostname; } catch { return card.url; } })()}
                                                </a>
                                            ) : (
                                                <span className="text-xs text-gray-300">—</span>
                                            )}
                                        </div>

                                        <div className="col-span-7 sm:col-span-5 md:col-span-2 flex items-center justify-end gap-2">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); copyToClipboard(card.password || '', card); }}
                                                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gray-50 text-gray-600 hover:bg-primary hover:text-white transition-colors text-xs font-bold ring-1 ring-gray-100 hover:ring-primary border border-transparent"
                                            >
                                                <span className="material-symbols-outlined text-[14px]">key</span>
                                                <span className="hidden sm:inline">Copy</span>
                                            </button>
                                            <button
                                                className="p-1.5 rounded-lg text-gray-400 hover:text-primary hover:bg-red-50 transition-colors"
                                            >
                                                <span className="material-symbols-outlined text-[18px]">more_vert</span>
                                            </button>
                                        </div>
                                    </div>
                                ))}

                                {filteredCards.length === 0 && (
                                    <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-200">
                                        <div className="size-12 rounded-full bg-gray-50 mx-auto mb-3 flex items-center justify-center">
                                            <span className="material-symbols-outlined text-2xl text-gray-300">search_off</span>
                                        </div>
                                        <p className="text-sm font-bold text-gray-900">No items found</p>
                                        <p className="text-xs text-gray-400 mt-1">Try adjusting your search or filters</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </main>
            )}

            {/* ── Mobile Bottom Navigation ── */}
            <BottomNav
                activeTab={activeTab}
                setActiveTab={(tab) => { setActiveTab(tab as 'dashboard' | 'security-audit' | 'generator'); }}
                onMenuOpen={() => setSidebarOpen(true)}
                onNewCard={() => { setEditingCard(null); setIsModalOpen(true); }}
            />

            {isModalOpen && (
                <CardModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    card={editingCard}
                />
            )}
            <ExitModal isOpen={showExitModal} onClose={() => setShowExitModal(false)} />
            <TagManagerModal isOpen={showTagManager} onClose={() => setShowTagManager(false)} />
        </div>
    );
};
