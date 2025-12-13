
import React, { useState, KeyboardEvent } from 'react';
import { X, Plus, Trash2, Edit2, Check } from 'lucide-react';
import { Tag, TranslationFn } from '../types';
import { generateId } from '../utils/cryptoUtils';
import { Button } from './Button';

interface TagManagerProps {
  isOpen: boolean;
  onClose: () => void;
  tags: Tag[];
  onAdd: (tag: Tag) => void;
  onUpdate: (tag: Tag) => void;
  onDelete: (id: string) => void;
  t: TranslationFn;
}

const PRESET_COLORS = [
  '#FF0033', // Brand Red
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Yellow
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#6366F1', // Indigo
  '#64748B', // Slate
];

export const TagManagerModal: React.FC<TagManagerProps> = ({ isOpen, onClose, tags, onAdd, onUpdate, onDelete, t }) => {
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState(PRESET_COLORS[0]);
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('');

  if (!isOpen) return null;

  const handleAdd = () => {
    if (!newTagName.trim()) return;
    onAdd({
      id: generateId(),
      name: newTagName.trim(),
      color: newTagColor
    });
    setNewTagName('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleAdd();
    }
  };

  const startEdit = (tag: Tag) => {
    setEditingId(tag.id);
    setEditName(tag.name);
    setEditColor(tag.color);
  };

  const saveEdit = () => {
    if (editingId && editName.trim()) {
      onUpdate({
        id: editingId,
        name: editName.trim(),
        color: editColor
      });
      setEditingId(null);
    }
  };
  
  const cancelEdit = () => {
    setEditingId(null);
  };

  const sortedTags = [...tags].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-dark-surface w-full max-w-lg rounded-xl shadow-2xl flex flex-col border border-gray-200 dark:border-dark-border max-h-[80vh]">
        
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-dark-border">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t('manageTags')}</h3>
          <button onClick={onClose}><X size={20} className="text-gray-500" /></button>
        </div>

        <div className="p-4 border-b border-gray-100 dark:border-dark-border bg-gray-50 dark:bg-zinc-900/50">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{t('createNewTag')}</label>
          <div className="flex gap-2 mb-2">
             <input 
                value={newTagName}
                onChange={e => setNewTagName(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t('createTagPlaceholder')}
                className="flex-1 p-2 text-sm rounded border border-gray-300 dark:border-dark-border bg-white dark:bg-[#121212] dark:text-white focus:ring-2 focus:ring-primary outline-none"
                autoFocus
              />
              <Button onClick={handleAdd} disabled={!newTagName.trim()} className="shrink-0">
                <Plus size={20} />
              </Button>
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {PRESET_COLORS.map(c => (
              <button
                key={c}
                onClick={() => setNewTagColor(c)}
                className={`w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 ${newTagColor === c ? 'border-gray-600 dark:border-white' : 'border-transparent'}`}
                style={{ backgroundColor: c }}
                title={c}
              />
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
           {sortedTags.length === 0 && (
             <div className="text-center py-8 text-gray-400">
               <p>{t('noTagsCreatedYet')}</p>
               <p className="text-xs mt-1">{t('addTagHelp')}</p>
             </div>
           )}
           
           {sortedTags.map(tag => (
             <div key={tag.id} className="group flex items-center justify-between p-3 bg-white dark:bg-zinc-900 rounded-lg border border-gray-100 dark:border-dark-border shadow-sm hover:shadow-md transition-all">
                {editingId === tag.id ? (
                  <div className="flex-1 flex flex-col gap-2">
                    <div className="flex gap-2">
                       <input 
                        value={editName}
                        onChange={e => setEditName(e.target.value)}
                        className="flex-1 p-1.5 text-sm rounded border border-gray-300 dark:border-dark-border bg-gray-50 dark:bg-black dark:text-white"
                        autoFocus
                       />
                       <button onClick={saveEdit} className="text-green-600 p-1 hover:bg-green-50 rounded" title="Save"><Check size={18} /></button>
                       <button onClick={cancelEdit} className="text-gray-500 p-1 hover:bg-gray-100 rounded" title="Cancel"><X size={18} /></button>
                    </div>
                     <div className="flex gap-1 flex-wrap">
                        {PRESET_COLORS.map(c => (
                          <button
                            key={c}
                            onClick={() => setEditColor(c)}
                            className={`w-4 h-4 rounded-full ${editColor === c ? 'ring-2 ring-offset-1 ring-gray-400' : ''}`}
                            style={{ backgroundColor: c }}
                          />
                        ))}
                      </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full shadow-sm" style={{backgroundColor: tag.color}}></div>
                      <span className="font-medium text-gray-700 dark:text-gray-200">{tag.name}</span>
                    </div>
                    <div className="flex items-center gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => startEdit(tag)} className="p-2 text-gray-400 hover:text-primary hover:bg-gray-50 dark:hover:bg-zinc-800 rounded-lg transition-colors" title="Edit">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => onDelete(tag.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" title="Delete">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </>
                )}
             </div>
           ))}
        </div>

      </div>
    </div>
  );
};
