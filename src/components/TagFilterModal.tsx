import React from 'react';
import { useVault } from '../context/VaultContext';
import { TagBadge } from './TagBadge';

interface TagFilterModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedTags: string[];
    onToggleTag: (tagId: string) => void;
    onClearAll: () => void;
}

export const TagFilterModal: React.FC<TagFilterModalProps> = ({
    isOpen,
    onClose,
    selectedTags,
    onToggleTag,
    onClearAll,
}) => {
    const { vault } = useVault();

    if (!isOpen || !vault) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-sm p-6 ring-1 ring-gray-200 dark:ring-gray-700 animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between mb-5">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">filter_list</span>
                        Filter by Tags
                    </h3>
                    <button
                        onClick={onClose}
                        className="size-8 rounded-lg flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                        <span className="material-symbols-outlined text-gray-400">close</span>
                    </button>
                </div>

                {/* Tags */}
                {vault.tags.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                        <span className="material-symbols-outlined text-3xl mb-2 block opacity-50">sell</span>
                        <p className="text-sm font-medium">No tags available.</p>
                        <p className="text-xs mt-1">Create some tags first.</p>
                    </div>
                ) : (
                    <div className="flex flex-wrap gap-2 mb-5">
                        {vault.tags.map((tag) => (
                            <button
                                key={tag.id}
                                onClick={() => onToggleTag(tag.id)}
                                className={`transition-all ${selectedTags.includes(tag.id) ? 'ring-2 ring-offset-1 ring-gray-400 dark:ring-gray-500 scale-105' : 'opacity-60 hover:opacity-100'}`}
                            >
                                <TagBadge tag={tag} />
                            </button>
                        ))}
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                    {selectedTags.length > 0 && (
                        <button
                            onClick={onClearAll}
                            className="flex-1 py-2 rounded-xl text-gray-500 font-bold text-xs hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                        >
                            Clear Selection
                        </button>
                    )}
                    <button
                        onClick={onClose}
                        className="flex-1 py-2 rounded-xl bg-primary text-white font-bold text-xs hover:bg-primary-hover active:scale-95 transition-all"
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
};
