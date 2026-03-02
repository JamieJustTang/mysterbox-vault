import React, { useState } from 'react';
import { useVault } from '../context/VaultContext';
import { Tag } from '../types';
import { TagBadge } from './TagBadge';
import { v4 as uuidv4 } from 'uuid';

const TAG_COLORS = [
    '#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6',
    '#3b82f6', '#6366f1', '#a855f7', '#ec4899', '#f43f5e',
];

interface TagManagerModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const TagManagerModal: React.FC<TagManagerModalProps> = ({ isOpen, onClose }) => {
    const { vault, addTag, updateTag, deleteTag } = useVault();
    const [newTagName, setNewTagName] = useState('');
    const [selectedColor, setSelectedColor] = useState(TAG_COLORS[0]);
    const [editingTag, setEditingTag] = useState<Tag | null>(null);

    if (!isOpen || !vault) return null;

    const handleCreateTag = (e?: React.FormEvent) => {
        e?.preventDefault();
        const name = newTagName.trim();
        if (!name) return;

        if (editingTag) {
            updateTag({ ...editingTag, name, color: selectedColor });
            setEditingTag(null);
        } else {
            const tag: Tag = {
                id: uuidv4(),
                name,
                color: selectedColor,
            };
            addTag(tag);
        }

        setNewTagName('');
        setSelectedColor(TAG_COLORS[Math.floor(Math.random() * TAG_COLORS.length)]);
    };

    const handleEditTag = (tag: Tag) => {
        setEditingTag(tag);
        setNewTagName(tag.name);
        setSelectedColor(tag.color);
    };

    const handleDeleteTag = (id: string) => {
        deleteTag(id);
        if (editingTag?.id === id) {
            setEditingTag(null);
            setNewTagName('');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md p-6 ring-1 ring-gray-200 dark:ring-gray-700 animate-in zoom-in-95 duration-200 max-h-[80vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between mb-5">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">sell</span>
                        Manage Tags
                    </h3>
                    <button
                        onClick={onClose}
                        className="size-8 rounded-lg flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                        <span className="material-symbols-outlined text-gray-400">close</span>
                    </button>
                </div>

                {/* Create / Edit form */}
                <form onSubmit={handleCreateTag} className="flex flex-col gap-3 mb-5">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="Tag Name (Press Enter to Add)"
                            value={newTagName}
                            onChange={(e) => setNewTagName(e.target.value)}
                            className="flex-1 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-sm font-medium text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none transition-all"
                        />
                        <button
                            type="submit"
                            className="px-4 py-2 rounded-xl bg-primary text-white font-bold text-xs hover:bg-primary-hover active:scale-95 transition-all"
                        >
                            {editingTag ? 'Update' : 'Add'}
                        </button>
                    </div>

                    {/* Color picker */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                        {TAG_COLORS.map((color) => (
                            <button
                                key={color}
                                type="button"
                                onClick={() => setSelectedColor(color)}
                                className={`size-6 rounded-full transition-all ${selectedColor === color
                                        ? 'ring-2 ring-offset-2 ring-gray-400 dark:ring-gray-500 scale-110'
                                        : 'hover:scale-110'
                                    }`}
                                style={{ backgroundColor: color }}
                            />
                        ))}
                    </div>

                    {editingTag && (
                        <button
                            type="button"
                            onClick={() => {
                                setEditingTag(null);
                                setNewTagName('');
                            }}
                            className="text-xs text-gray-400 hover:text-gray-600 font-bold self-start"
                        >
                            Cancel Editing
                        </button>
                    )}
                </form>

                {/* Tag list */}
                <div className="flex-1 overflow-y-auto space-y-1.5 min-h-0">
                    {vault.tags.length === 0 ? (
                        <div className="text-center py-8 text-gray-400">
                            <span className="material-symbols-outlined text-4xl mb-2 block opacity-50">sell</span>
                            <p className="text-sm font-medium">No tags created yet.</p>
                            <p className="text-xs mt-1">Add a tag above to get started.</p>
                        </div>
                    ) : (
                        vault.tags.map((tag) => (
                            <div
                                key={tag.id}
                                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group"
                            >
                                <TagBadge tag={tag} />
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => handleEditTag(tag)}
                                        className="size-7 rounded-lg flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-[16px] text-gray-400">edit</span>
                                    </button>
                                    <button
                                        onClick={() => handleDeleteTag(tag.id)}
                                        className="size-7 rounded-lg flex items-center justify-center hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-[16px] text-red-400">delete</span>
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};
