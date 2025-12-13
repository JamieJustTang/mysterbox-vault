
import React from 'react';
import { X, Filter, Settings } from 'lucide-react';
import { Tag, TranslationFn } from '../types';
import { TagBadge } from './TagBadge';
import { Button } from './Button';

interface TagFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  tags: Tag[];
  selectedTags: string[];
  onToggleTag: (id: string) => void;
  onClearFilters: () => void;
  onManageTags: () => void;
  t: TranslationFn;
}

export const TagFilterModal: React.FC<TagFilterModalProps> = ({
  isOpen,
  onClose,
  tags,
  selectedTags,
  onToggleTag,
  onClearFilters,
  onManageTags,
  t
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-dark-surface w-full max-w-md rounded-xl shadow-2xl flex flex-col border border-gray-200 dark:border-dark-border max-h-[80vh]">
        
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-dark-border">
          <div className="flex items-center gap-2">
            <Filter size={20} className="text-primary" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t('filterByTags')}</h3>
          </div>
          <button onClick={onClose} className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full">
            <X size={20} />
          </button>
        </div>

        <div className="p-4 overflow-y-auto min-h-[200px]">
          {tags.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              {t('noTagsAvailable')}
            </div>
          ) : (
            <div className="flex flex-wrap gap-3">
              {tags.map(tag => (
                <TagBadge
                  key={tag.id}
                  tag={tag}
                  selected={selectedTags.includes(tag.id)}
                  onClick={() => onToggleTag(tag.id)}
                />
              ))}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-gray-100 dark:border-dark-border bg-gray-50 dark:bg-zinc-900/50 flex flex-col gap-3 rounded-b-xl">
          <div className="flex justify-between items-center">
             <button 
              onClick={onManageTags}
              className="flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-primary transition-colors"
            >
              <Settings size={14} className="mr-1.5" />
              {t('manageTags')}
            </button>

            <button 
              onClick={onClearFilters}
              className="text-sm text-gray-500 hover:text-red-500 transition-colors"
              disabled={selectedTags.length === 0}
            >
              {t('clearSelection')} ({selectedTags.length})
            </button>
          </div>
          
          <Button onClick={onClose} className="w-full">
            {t('done')}
          </Button>
        </div>

      </div>
    </div>
  );
};
