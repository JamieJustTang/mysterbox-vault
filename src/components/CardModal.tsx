import React, { useState, useEffect } from 'react';
import { useVault } from '../context/VaultContext';
import { useTranslation } from '../i18n';
import { VaultCard } from '../types';
import { TagBadge } from './TagBadge';

interface CardModalProps {
    isOpen: boolean;
    onClose: () => void;
    card: VaultCard | null;
}

// Password strength helper
function getPasswordStrength(pwd: string): { level: 'weak' | 'medium' | 'strong'; label: string; color: string; width: string } {
    if (!pwd) return { level: 'weak', label: '', color: '', width: '0%' };
    const hasUpper = /[A-Z]/.test(pwd);
    const hasLower = /[a-z]/.test(pwd);
    const hasNum = /[0-9]/.test(pwd);
    const hasSpecial = /[^A-Za-z0-9]/.test(pwd);
    const score = [pwd.length >= 12, hasUpper, hasLower, hasNum, hasSpecial].filter(Boolean).length;
    if (score >= 4) return { level: 'strong', label: '强', color: 'bg-emerald-500', width: '100%' };
    if (score >= 3) return { level: 'medium', label: '中', color: 'bg-amber-400', width: '60%' };
    return { level: 'weak', label: '弱', color: 'bg-red-400', width: '30%' };
}

// Reusable field label
const FieldLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
        {children}
    </label>
);

// Reusable input base class
const inputCls = "w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all";

export const CardModal: React.FC<CardModalProps> = ({ isOpen, onClose, card }) => {
    const { vault, addCard, updateCard, addTag, language } = useVault();
    const t = useTranslation(language);

    const [formData, setFormData] = useState<Partial<VaultCard>>({
        title: '', username: '', password: '', url: '',
        notes: '', tags: [], customFields: [], attachments: [], favorite: false,
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showTagSelector, setShowTagSelector] = useState(false);
    const [showNewTagInput, setShowNewTagInput] = useState(false);
    const [newTagName, setNewTagName] = useState('');
    const [newTagColor, setNewTagColor] = useState('#6366f1');
    const [copied, setCopied] = useState(false);
    const [confirmingArchive, setConfirmingArchive] = useState(false);

    useEffect(() => {
        setFormData(card
            ? { ...card, attachments: card.attachments || [] }
            : { title: '', username: '', password: '', url: '', notes: '', tags: [], customFields: [], attachments: [], favorite: false }
        );
        setShowTagSelector(false);
        setShowNewTagInput(false);
        setNewTagName('');
        setShowPassword(false);
        setCopied(false);
        setConfirmingArchive(false);
    }, [card, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title?.trim()) return;
        card ? updateCard({ ...formData, id: card.id } as VaultCard) : addCard(formData);
        onClose();
    };

    const handleArchive = () => {
        if (!card) return;
        if (!confirmingArchive) {
            setConfirmingArchive(true);
            setTimeout(() => setConfirmingArchive(false), 3000);
            return;
        }
        // Use formData to preserve any in-progress edits
        updateCard({ ...formData, id: card.id, archived: true, updatedAt: Date.now() } as VaultCard);
        onClose();
    };

    const handleUnarchive = () => {
        if (!card) return;
        updateCard({ ...formData, id: card.id, archived: false, updatedAt: Date.now() } as VaultCard);
        onClose();
    };

    const generatePassword = () => {
        const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()-_=+";
        const arr = crypto.getRandomValues(new Uint8Array(18));
        const pass = Array.from(arr).map(b => charset[b % charset.length]).join('');
        setFormData(prev => ({ ...prev, password: pass }));
    };

    const copyPassword = async () => {
        if (!formData.password) return;
        await navigator.clipboard.writeText(formData.password);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };

    const toggleTag = (tagId: string) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags?.includes(tagId)
                ? prev.tags.filter(t => t !== tagId)
                : [...(prev.tags || []), tagId],
        }));
    };

    const strength = getPasswordStrength(formData.password || '');

    // Preset tag colors palette
    const TAG_COLORS = [
        '#6366f1', '#ec4899', '#f59e0b', '#10b981',
        '#3b82f6', '#8b5cf6', '#ef4444', '#14b8a6',
    ];

    const handleCreateTag = () => {
        const name = newTagName.trim();
        if (!name) return;
        const newTag = { id: crypto.randomUUID(), name, color: newTagColor };
        addTag(newTag);
        // Auto-select the new tag on this card
        setFormData(prev => ({ ...prev, tags: [...(prev.tags || []), newTag.id] }));
        setNewTagName('');
        setShowNewTagInput(false);
    };

    if (!isOpen) return null;

    // Favicon domain
    let faviconDomain = '';
    try { faviconDomain = formData.url ? new URL(formData.url).hostname : ''; } catch { }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-[480px] flex flex-col max-h-[90vh] ring-1 ring-gray-200 animate-in zoom-in-95 fade-in duration-200"
                onClick={e => e.stopPropagation()}
            >
                {/* ── Header ── */}
                <div className="px-5 pt-4 pb-3 flex items-center justify-between shrink-0 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        {/* Favicon / Icon */}
                        <div className="size-9 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden shrink-0">
                            {faviconDomain ? (
                                <img
                                    src={`https://www.google.com/s2/favicons?domain=${faviconDomain}&sz=64`}
                                    alt=""
                                    className="size-5 object-contain"
                                    onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                />
                            ) : (
                                <span className="material-symbols-outlined text-[18px] text-gray-400">lock</span>
                            )}
                        </div>
                        <div>
                            <h2 className="text-sm font-bold text-gray-900 leading-tight">
                                {card ? (formData.title || t.editCard) : t.newCard}
                            </h2>
                            <p className="text-[11px] text-gray-400 leading-tight mt-0.5">
                                {card ? t.editCard : t.newCard}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-1">
                        {/* Favorite toggle */}
                        <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, favorite: !prev.favorite }))}
                            className={`p-2 rounded-lg transition-colors ${formData.favorite
                                ? 'text-rose-500 bg-rose-50'
                                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                                }`}
                            title={formData.favorite ? t.copied : t.addTag}
                        >
                            <span className={`material-symbols-outlined text-[20px] ${formData.favorite ? 'fill-1' : ''}`}>
                                favorite
                            </span>
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                        >
                            <span className="material-symbols-outlined text-[20px]">close</span>
                        </button>
                    </div>
                </div>

                {/* ── Body ── */}
                <div className="overflow-y-auto flex-1 px-5 py-4">
                    <form id="card-form" onSubmit={handleSave} className="space-y-5">

                        {/* Item Name */}
                        <div>
                            <FieldLabel>{t.fieldName}</FieldLabel>
                            <input
                                type="text"
                                name="title"
                                className={`${inputCls} font-medium`}
                                placeholder={t.namePlaceholder}
                                value={formData.title}
                                onChange={handleChange}
                                required
                                autoFocus
                            />
                        </div>

                        {/* Username */}
                        <div>
                            <FieldLabel>{t.username}</FieldLabel>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[17px] pointer-events-none">person</span>
                                <input
                                    type="text"
                                    name="username"
                                    className={`${inputCls} pl-9`}
                                    placeholder={t.usernamePlaceholder || 'username@example.com'}
                                    value={formData.username}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <FieldLabel>{t.password}</FieldLabel>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[17px] pointer-events-none">key</span>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    className={`${inputCls} pl-9 pr-24 font-mono tracking-wider`}
                                    placeholder="••••••••••••"
                                    value={formData.password}
                                    onChange={handleChange}
                                />
                                {/* Password action buttons */}
                                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
                                    <button type="button" onClick={() => setShowPassword(v => !v)}
                                        className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                        title={showPassword ? t.hidePassword : t.showPassword}>
                                        <span className="material-symbols-outlined text-[16px]">
                                            {showPassword ? 'visibility_off' : 'visibility'}
                                        </span>
                                    </button>
                                    <button type="button" onClick={copyPassword}
                                        className={`p-1.5 rounded-lg transition-colors ${copied ? 'text-emerald-500 bg-emerald-50' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'}`}
                                        title={t.copyPassword}>
                                        <span className="material-symbols-outlined text-[16px]">
                                            {copied ? 'check' : 'content_copy'}
                                        </span>
                                    </button>
                                    <button type="button" onClick={generatePassword}
                                        className="p-1.5 text-gray-400 hover:text-primary hover:bg-red-50 rounded-lg transition-colors"
                                        title={t.generatePassword}>
                                        <span className="material-symbols-outlined text-[16px]">casino</span>
                                    </button>
                                </div>
                            </div>

                            {/* Strength bar */}
                            {formData.password && (
                                <div className="mt-2 flex items-center gap-2">
                                    <div className="flex-1 h-1 rounded-full bg-gray-100 overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-500 ${strength.color}`}
                                            style={{ width: strength.width }}
                                        />
                                    </div>
                                    <span className={`text-[11px] font-semibold ${strength.level === 'strong' ? 'text-emerald-500' : strength.level === 'medium' ? 'text-amber-500' : 'text-red-400'}`}>
                                        {strength.label}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Website URL */}
                        <div>
                            <FieldLabel>{t.fieldWebsite}</FieldLabel>
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[17px] pointer-events-none">language</span>
                                    <input
                                        type="url"
                                        name="url"
                                        className={`${inputCls} pl-9`}
                                        placeholder="https://example.com"
                                        value={formData.url}
                                        onChange={handleChange}
                                    />
                                </div>
                                {formData.url && (
                                    <a href={formData.url} target="_blank" rel="noopener noreferrer"
                                        className="shrink-0 flex items-center justify-center size-[42px] rounded-xl border border-gray-200 bg-gray-50 text-gray-500 hover:text-primary hover:border-primary/40 hover:bg-red-50 transition-colors"
                                        title="在浏览器中打开">
                                        <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                                    </a>
                                )}
                            </div>
                        </div>

                        {/* Tags */}
                        <div>
                            <FieldLabel>{t.fieldTags}</FieldLabel>
                            <div className="border border-gray-200 rounded-xl bg-gray-50/50 p-2.5 min-h-[42px]">
                                {/* Selected tags */}
                                <div className="flex flex-wrap items-center gap-1.5">
                                    {formData.tags?.map(tagId => {
                                        const tag = vault?.tags.find(t => t.id === tagId);
                                        return tag ? (
                                            <TagBadge key={tag.id} tag={tag} small removable onRemove={() => toggleTag(tag.id)} />
                                        ) : null;
                                    })}
                                    {/* Toggle selector */}
                                    <button
                                        type="button"
                                        onClick={() => { setShowTagSelector(v => !v); setShowNewTagInput(false); }}
                                        className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium text-gray-400 hover:text-primary hover:bg-white border border-dashed border-gray-300 hover:border-primary/40 rounded-full transition-all"
                                    >
                                        <span className="material-symbols-outlined text-[12px]">add</span>
                                        {t.addTag}
                                    </button>
                                </div>

                                {/* Tag picker panel */}
                                {showTagSelector && (
                                    <div className="pt-2 mt-2 border-t border-gray-200 space-y-2">
                                        {/* Existing tags */}
                                        {vault && vault.tags.filter(tag => !formData.tags?.includes(tag.id)).length > 0 && (
                                            <div className="flex flex-wrap gap-1.5">
                                                {vault.tags.filter(tag => !formData.tags?.includes(tag.id)).map(tag => (
                                                    <button key={tag.id} type="button" onClick={() => toggleTag(tag.id)}
                                                        className="opacity-60 hover:opacity-100 transition-opacity">
                                                        <TagBadge tag={tag} small />
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                        {vault && vault.tags.filter(tag => !formData.tags?.includes(tag.id)).length === 0 && !showNewTagInput && (
                                            <span className="text-[11px] text-gray-400 italic">{t.allTagsAdded}</span>
                                        )}

                                        {/* Inline new tag creation */}
                                        {showNewTagInput ? (
                                            <div className="flex flex-col gap-2">
                                                <div className="flex items-center gap-1.5">
                                                    <input
                                                        type="text"
                                                        autoFocus
                                                        placeholder={t.newTagName}
                                                        value={newTagName}
                                                        onChange={e => setNewTagName(e.target.value)}
                                                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleCreateTag(); } if (e.key === 'Escape') setShowNewTagInput(false); }}
                                                        className="flex-1 bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary placeholder-gray-400"
                                                    />
                                                    <button type="button" onClick={handleCreateTag}
                                                        disabled={!newTagName.trim()}
                                                        className="size-7 rounded-lg bg-primary text-white flex items-center justify-center hover:bg-primary-hover disabled:opacity-40 transition-colors shrink-0">
                                                        <span className="material-symbols-outlined text-[14px]">check</span>
                                                    </button>
                                                    <button type="button" onClick={() => setShowNewTagInput(false)}
                                                        className="size-7 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 flex items-center justify-center transition-colors shrink-0">
                                                        <span className="material-symbols-outlined text-[14px]">close</span>
                                                    </button>
                                                </div>
                                                {/* Color picker */}
                                                <div className="flex items-center gap-1.5">
                                                    {TAG_COLORS.map(color => (
                                                        <button
                                                            key={color}
                                                            type="button"
                                                            onClick={() => setNewTagColor(color)}
                                                            className={`size-5 rounded-full transition-all ${newTagColor === color ? 'ring-2 ring-offset-1 ring-gray-400 scale-110' : 'hover:scale-110'}`}
                                                            style={{ backgroundColor: color }}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() => setShowNewTagInput(true)}
                                                className="inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:bg-red-50 px-2 py-1 rounded-lg transition-colors"
                                            >
                                                <span className="material-symbols-outlined text-[13px]">new_label</span>
                                                {t.createNewTag}
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Notes */}
                        <div>
                            <FieldLabel>{t.fieldNotes}</FieldLabel>
                            <textarea
                                name="notes"
                                className={`${inputCls} min-h-[72px] resize-y`}
                                placeholder={t.noteplaceholder}
                                value={formData.notes}
                                onChange={handleChange}
                            />
                        </div>

                        {/* Custom Fields */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <FieldLabel>{t.fieldCustom}</FieldLabel>
                                <button
                                    type="button"
                                    onClick={() => setFormData(prev => ({
                                        ...prev,
                                        customFields: [...(prev.customFields || []), { id: crypto.randomUUID(), label: '', value: '', type: 'text' }],
                                    }))}
                                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:bg-red-50 px-2 py-1 rounded-lg transition-colors"
                                >
                                    <span className="material-symbols-outlined text-[14px]">add</span>
                                    {t.addField}
                                </button>
                            </div>

                            {(formData.customFields?.length ?? 0) > 0 && (
                                <div className="space-y-2">
                                    {formData.customFields?.map((field, index) => (
                                        <div key={field.id} className="p-3 bg-gray-50 border border-gray-200 rounded-xl group">
                                            {/* Row 1: label input + action buttons */}
                                            <div className="flex items-center gap-2 mb-1.5">
                                                <input
                                                    type="text"
                                                    placeholder={t.fieldNamePlaceholderShort}
                                                    className="flex-1 bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-gray-600 focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary placeholder-gray-400"
                                                    value={field.label}
                                                    onChange={e => {
                                                        const f = [...(formData.customFields || [])];
                                                        f[index] = { ...f[index], label: e.target.value };
                                                        setFormData(prev => ({ ...prev, customFields: f }));
                                                    }}
                                                />
                                                <div className="flex gap-0.5 shrink-0">
                                                    <button type="button"
                                                        onClick={() => {
                                                            const f = [...(formData.customFields || [])];
                                                            f[index] = { ...f[index], type: field.type === 'hidden' ? 'text' : 'hidden' };
                                                            setFormData(prev => ({ ...prev, customFields: f }));
                                                        }}
                                                        className={`p-1.5 rounded-lg transition-colors ${field.type === 'hidden' ? 'text-primary bg-red-50' : 'text-gray-400 hover:text-gray-600 hover:bg-white'}`}
                                                        title={t.toggleVisibility}>
                                                        <span className="material-symbols-outlined text-[15px]">
                                                            {field.type === 'hidden' ? 'visibility_off' : 'visibility'}
                                                        </span>
                                                    </button>
                                                    <button type="button"
                                                        onClick={() => {
                                                            const f = (formData.customFields || []).filter((_, i) => i !== index);
                                                            setFormData(prev => ({ ...prev, customFields: f }));
                                                        }}
                                                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                                                        title={t.delete}>
                                                        <span className="material-symbols-outlined text-[15px]">delete</span>
                                                    </button>
                                                </div>
                                            </div>
                                            {/* Row 2: value input + copy button */}
                                            <div className="flex items-center gap-1.5">
                                                <input
                                                    type={field.type === 'hidden' ? 'password' : 'text'}
                                                    placeholder={t.fieldValuePlaceholder}
                                                    className="flex-1 bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-sm text-gray-900 font-mono focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary placeholder-gray-400"
                                                    value={field.value}
                                                    onChange={e => {
                                                        const f = [...(formData.customFields || [])];
                                                        f[index] = { ...f[index], value: e.target.value };
                                                        setFormData(prev => ({ ...prev, customFields: f }));
                                                    }}
                                                />
                                                <button type="button"
                                                    onClick={() => field.value && navigator.clipboard.writeText(field.value)}
                                                    className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-white transition-colors shrink-0"
                                                    title={t.copy}>
                                                    <span className="material-symbols-outlined text-[15px]">content_copy</span>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Metadata (edit mode only) */}
                        {card && (
                            <div className="pt-3 border-t border-gray-100 grid grid-cols-2 gap-x-4 gap-y-1.5">
                                <MetaItem icon="calendar_today" label={t.metaCreated} value={new Date(card.createdAt).toLocaleDateString()} />
                                <MetaItem icon="edit_calendar" label={t.metaModified} value={new Date(card.updatedAt).toLocaleDateString()} />
                                {card.lastUsed && (
                                    <MetaItem icon="history" label={t.metaLastUsed} value={new Date(card.lastUsed).toLocaleDateString()} />
                                )}
                                {card.usageCount !== undefined && (
                                    <MetaItem icon="bar_chart" label={t.metaUsageCount} value={`${card.usageCount}${t.metaUsageSuffix}`} />
                                )}
                            </div>
                        )}
                    </form>
                </div>

                {/* ── Footer ── */}
                <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/60 flex items-center justify-between gap-3 shrink-0 rounded-b-2xl">
                    {/* Archive / Unarchive (edit only) */}
                    {card ? (
                        card.archived ? (
                            <button type="button" onClick={handleUnarchive}
                                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition-colors">
                                <span className="material-symbols-outlined text-[16px]">unarchive</span>
                                {t.unarchive || 'Unarchive'}
                            </button>
                        ) : (
                            <button type="button" onClick={handleArchive}
                                className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl transition-all ${confirmingArchive
                                        ? 'text-white bg-red-500 hover:bg-red-600 shadow-sm animate-pulse'
                                        : 'text-gray-500 hover:text-red-500 hover:bg-red-50'
                                    }`}>
                                <span className="material-symbols-outlined text-[16px]">{confirmingArchive ? 'warning' : 'archive'}</span>
                                {confirmingArchive ? (t.confirmArchive || 'Click again to confirm') : t.archive}
                            </button>
                        )
                    ) : <span />}

                    <div className="flex items-center gap-2">
                        <button type="button" onClick={onClose}
                            className="px-4 py-2 text-xs font-semibold text-gray-600 bg-white border border-gray-200 hover:bg-gray-100 rounded-xl transition-colors">
                            {t.cancel}
                        </button>
                        <button type="submit" form="card-form"
                            className="px-5 py-2 text-xs font-bold text-white bg-primary hover:bg-primary-hover rounded-xl shadow-md shadow-red-500/20 hover:shadow-red-500/30 active:scale-95 transition-all flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[16px]">save</span>
                            {card ? t.saveChangesBtn : t.createItem}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Helper: metadata row
const MetaItem: React.FC<{ icon: string; label: string; value: string }> = ({ icon, label, value }) => (
    <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
        <span className="material-symbols-outlined text-[11px] leading-none">{icon}</span>
        <span className="text-gray-500 font-medium">{label}:</span>
        <span className="font-mono">{value}</span>
    </div>
);
