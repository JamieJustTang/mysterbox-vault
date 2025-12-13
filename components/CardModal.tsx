
import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Calendar, Clock, Eye, EyeOff, Copy, BarChart2, History } from 'lucide-react';
import { Card, Tag, CustomField, TranslationFn } from '../types';
import { Button } from './Button';
import { generateId } from '../utils/cryptoUtils';
import { TagBadge } from './TagBadge';

interface CardModalProps {
  card?: Card | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (card: Card) => void;
  onDelete: (id: string) => void;
  allTags: Tag[];
  onCreateTag?: (tag: Tag) => void;
  t: TranslationFn;
}

export const CardModal: React.FC<CardModalProps> = ({ 
  card, isOpen, onClose, onSave, onDelete, allTags, onCreateTag, t
}) => {
  const [formData, setFormData] = useState<Partial<Card>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [passTimer, setPassTimer] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [visibleFields, setVisibleFields] = useState<Record<string, boolean>>({});
  
  const [isCreatingTag, setIsCreatingTag] = useState(false);
  const [newTagName, setNewTagName] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (card) {
        setFormData({ ...card, usageCount: card.usageCount + 1, dates: { ...card.dates, accessed: Date.now() } });
        setVisibleFields({});
      } else {
        setFormData({
          id: generateId(),
          title: '',
          username: '',
          password: '',
          notes: '',
          tags: [],
          fields: [],
          attachments: [],
          dates: { created: Date.now(), modified: Date.now(), accessed: Date.now() },
          usageCount: 0
        });
        setVisibleFields({});
      }
      setShowPassword(false);
      setIsCreatingTag(false);
      setNewTagName('');
    }
    return () => {
      if (passTimer) clearTimeout(passTimer);
    };
  }, [isOpen, card]);

  const handleSave = () => {
    if (!formData.title) return alert(t('targetName'));
    
    const now = Date.now();
    const defaultDates = { created: now, modified: now, accessed: now };

    const finalCard: Card = {
      id: formData.id || generateId(),
      title: formData.title,
      username: formData.username || '',
      password: formData.password || '',
      notes: formData.notes || '',
      tags: formData.tags || [],
      fields: formData.fields || [],
      attachments: formData.attachments || [],
      dates: {
        ...(formData.dates || defaultDates),
        modified: now,
      },
      usageCount: formData.usageCount || 0
    };
    onSave(finalCard);
    onClose();
  };

  const togglePassword = () => {
    const nextState = !showPassword;
    setShowPassword(nextState);
    
    if (passTimer) clearTimeout(passTimer);
    
    if (nextState) {
      const timer = setTimeout(() => {
        setShowPassword(false);
      }, 5000);
      setPassTimer(timer);
    }
  };

  const toggleFieldVisibility = (fieldId: string) => {
    setVisibleFields(prev => ({
      ...prev,
      [fieldId]: !prev[fieldId]
    }));
  };

  const copyToClipboard = (text?: string) => {
    if (text) {
      navigator.clipboard.writeText(text);
    }
  };

  const toggleTag = (tagId: string) => {
    const currentTags = formData.tags || [];
    if (currentTags.includes(tagId)) {
      setFormData(p => ({ ...p, tags: currentTags.filter(t => t !== tagId) }));
    } else {
      setFormData(p => ({ ...p, tags: [...currentTags, tagId] }));
    }
  };
  
  const handleCreateTag = (e?: React.MouseEvent | React.KeyboardEvent) => {
    if (e) {
      e.stopPropagation();
    }
    
    if (!newTagName.trim() || !onCreateTag) return;
    
    const newTagId = generateId();
    const PRESET_COLORS = ['#FF0033', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6'];
    const randomColor = PRESET_COLORS[Math.floor(Math.random() * PRESET_COLORS.length)];
    
    const newTag: Tag = {
      id: newTagId,
      name: newTagName.trim(),
      color: randomColor
    };
    
    onCreateTag(newTag);
    setFormData(p => ({ ...p, tags: [...(p.tags || []), newTagId] }));
    
    setNewTagName('');
    setIsCreatingTag(false);
  };

  const addField = () => {
    const newId = generateId();
    const newField: CustomField = {
      id: newId,
      label: '',
      value: '',
      type: 'text'
    };
    
    setVisibleFields(prev => ({
      ...prev,
      [newId]: true
    }));
    
    setFormData(p => ({ ...p, fields: [...(p.fields || []), newField] }));
  };

  const updateField = (id: string, key: keyof CustomField, val: string) => {
    setFormData(p => ({
      ...p,
      fields: p.fields?.map(f => f.id === id ? { ...f, [key]: val } : f)
    }));
  };

  const removeField = (id: string) => {
    setFormData(p => ({
      ...p,
      fields: p.fields?.filter(f => f.id !== id)
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-dark-surface w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl flex flex-col border border-gray-200 dark:border-dark-border">
        
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-dark-border sticky top-0 bg-white dark:bg-dark-surface z-10">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {card ? t('editCard') : t('newCard')}
          </h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('targetName')}</label>
              <input 
                type="text" 
                value={formData.title || ''}
                onChange={e => setFormData({...formData, title: e.target.value})}
                className="w-full p-3 rounded-lg border border-gray-300 dark:border-dark-border bg-gray-50 dark:bg-[#121212] text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                placeholder={t('targetNamePlaceholder')}
                autoFocus
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('username')}</label>
                <div className="relative">
                  <input 
                    type="text" 
                    value={formData.username || ''}
                    onChange={e => setFormData({...formData, username: e.target.value})}
                    className="w-full p-3 rounded-lg border border-gray-300 dark:border-dark-border bg-gray-50 dark:bg-[#121212] text-gray-900 dark:text-white focus:ring-2 focus:ring-primary outline-none"
                    placeholder={t('usernamePlaceholder')}
                  />
                  <button 
                    onClick={() => copyToClipboard(formData.username)}
                    className="absolute right-3 top-3.5 text-gray-400 hover:text-primary"
                    title="Copy Username"
                  >
                    <Copy size={16} />
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('password')}</label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    value={formData.password || ''}
                    onChange={e => setFormData({...formData, password: e.target.value})}
                    className="w-full p-3 pr-20 rounded-lg border border-gray-300 dark:border-dark-border bg-gray-50 dark:bg-[#121212] text-gray-900 dark:text-white focus:ring-2 focus:ring-primary outline-none font-mono"
                    placeholder="••••••••"
                  />
                  <div className="absolute right-2 top-2 flex items-center space-x-1">
                     <button 
                      onClick={() => copyToClipboard(formData.password)}
                      className="p-1.5 text-gray-400 hover:text-primary rounded"
                      title="Copy Password"
                    >
                      <Copy size={16} />
                    </button>
                    <button 
                      onClick={togglePassword}
                      className="p-1.5 text-gray-400 hover:text-primary rounded"
                      title={showPassword ? "Hide" : "Show"}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('tags')}</label>
            <div className="flex flex-wrap gap-2 items-center">
              {allTags.map(tag => (
                <TagBadge 
                  key={tag.id} 
                  tag={tag} 
                  selected={formData.tags?.includes(tag.id)} 
                  onClick={() => toggleTag(tag.id)}
                />
              ))}
              
              {isCreatingTag ? (
                <div className="flex items-center gap-1 animate-fade-in">
                  <input 
                    type="text" 
                    value={newTagName}
                    onChange={e => setNewTagName(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleCreateTag(e);
                      }
                      if (e.key === 'Escape') {
                        e.preventDefault();
                        setIsCreatingTag(false);
                        setNewTagName('');
                      }
                    }}
                    placeholder={t('newTagName')}
                    className="px-2 py-1 text-xs rounded border border-gray-300 dark:border-dark-border bg-white dark:bg-black text-gray-900 dark:text-white outline-none focus:ring-1 focus:ring-primary w-32"
                    autoFocus
                  />
                  <button type="button" onClick={handleCreateTag} className="text-green-500 hover:text-green-600"><Plus size={16} /></button>
                  <button type="button" onClick={() => setIsCreatingTag(false)} className="text-gray-400 hover:text-gray-500"><X size={16} /></button>
                </div>
              ) : (
                <button 
                  type="button"
                  onClick={() => setIsCreatingTag(true)}
                  className="px-3 py-1 text-xs rounded border border-dashed border-gray-300 dark:border-dark-border text-gray-500 hover:text-primary hover:border-primary transition-colors flex items-center"
                >
                  <Plus size={12} className="mr-1" /> {t('newTag')}
                </button>
              )}
            </div>
            {allTags.length === 0 && !isCreatingTag && <span className="text-xs text-gray-500 italic ml-1">{t('noTagsCreated')}</span>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('customFields')}</label>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
              {t('customFieldsDesc')}
            </p>

            <div className="space-y-3 mb-3">
              {formData.fields?.map((field, idx) => (
                <div key={field.id} className="flex items-start gap-3 bg-gray-50 dark:bg-zinc-900 p-3 rounded-lg border border-gray-200 dark:border-dark-border group transition-all hover:border-primary/50">
                  <div className="flex-1 space-y-3">
                    <input 
                      className="w-full bg-transparent text-sm font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 p-1 focus:ring-0 focus:border-primary placeholder-gray-400 transition-colors"
                      value={field.label}
                      onChange={e => updateField(field.id, 'label', e.target.value)}
                      placeholder={t('fieldNamePlaceholder')}
                    />
                    
                    <div className="relative">
                       <input 
                         type={visibleFields[field.id] ? "text" : "password"}
                         className="w-full bg-white dark:bg-black/20 text-base text-gray-900 dark:text-white rounded border border-gray-200 dark:border-gray-700 p-2 pr-10 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder-gray-400"
                         value={field.value}
                         onChange={e => updateField(field.id, 'value', e.target.value)}
                         placeholder={t('valuePlaceholder')}
                       />
                       <button
                         onClick={() => toggleFieldVisibility(field.id)}
                         className="absolute right-2 top-2 text-gray-400 hover:text-primary transition-colors"
                         tabIndex={-1}
                       >
                         {visibleFields[field.id] ? <EyeOff size={16} /> : <Eye size={16} />}
                       </button>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => removeField(field.id)} 
                    className="text-gray-400 hover:text-red-500 p-1 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors mt-1"
                    title="Remove Field"
                  >
                    <X size={18} />
                  </button>
                </div>
              ))}
            </div>

            <button 
              onClick={addField} 
              className="w-full py-3 border-2 border-dashed border-gray-300 dark:border-zinc-700 rounded-lg text-sm font-medium text-gray-500 dark:text-gray-400 hover:border-primary hover:text-primary hover:bg-primary/5 transition-all flex items-center justify-center group"
            >
              <Plus size={18} className="mr-2 group-hover:scale-110 transition-transform" /> 
              {t('addCustomField')}
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('notes')}</label>
            <textarea 
              value={formData.notes || ''}
              onChange={e => setFormData({...formData, notes: e.target.value})}
              className="w-full p-3 rounded-lg border border-gray-300 dark:border-dark-border bg-gray-50 dark:bg-[#121212] text-gray-900 dark:text-white focus:ring-2 focus:ring-primary outline-none min-h-[100px] resize-y"
              placeholder={t('notesPlaceholder')}
            />
          </div>

          {card && (
            <div className="grid grid-cols-2 gap-3 text-xs text-gray-500 dark:text-gray-400 pt-4 border-t border-gray-100 dark:border-dark-border">
              <div className="flex items-center" title="Date Created">
                <Calendar size={13} className="mr-1.5 opacity-70" />
                <span>{t('created')}: {new Date(formData.dates?.created || 0).toLocaleString()}</span>
              </div>
              <div className="flex items-center" title="Last Modified">
                <Clock size={13} className="mr-1.5 opacity-70" />
                <span>{t('modified')}: {new Date(formData.dates?.modified || 0).toLocaleString()}</span>
              </div>
              <div className="flex items-center" title="Last Accessed">
                <History size={13} className="mr-1.5 opacity-70" />
                <span>{t('lastAccessed')}: {formData.dates?.accessed ? new Date(formData.dates.accessed).toLocaleString() : '-'}</span>
              </div>
              <div className="flex items-center" title="Usage Count">
                <BarChart2 size={13} className="mr-1.5 opacity-70" />
                <span>{t('usageCount')}: {formData.usageCount || 0}</span>
              </div>
            </div>
          )}

        </div>

        <div className="p-6 border-t border-gray-100 dark:border-dark-border bg-gray-50 dark:bg-dark-surface rounded-b-xl flex justify-between items-center">
          {card ? (
            <Button variant="danger" onClick={() => onDelete(card.id)}>
              <Trash2 size={16} className="mr-2" />
              {t('delete')}
            </Button>
          ) : <div></div>}
          
          <div className="flex gap-3">
            <Button variant="secondary" onClick={onClose}>{t('cancel')}</Button>
            <Button variant="primary" onClick={handleSave}>{t('saveCard')}</Button>
          </div>
        </div>

      </div>
    </div>
  );
};
