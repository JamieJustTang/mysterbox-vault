import React from 'react';
import { Tag } from '../types';

interface TagBadgeProps {
    tag: Tag;
    small?: boolean;
    removable?: boolean;
    onRemove?: () => void;
    onClick?: () => void;
}

export const TagBadge: React.FC<TagBadgeProps> = ({ tag, small = false, removable = false, onRemove, onClick }) => {
    const baseClasses = `inline-flex items-center gap-1 rounded-full font-bold transition-all ${small ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-1 text-xs'
        }`;

    return (
        <span
            className={`${baseClasses} ${onClick ? 'cursor-pointer hover:opacity-80' : ''}`}
            style={{
                backgroundColor: `${tag.color}20`,
                color: tag.color,
                border: `1px solid ${tag.color}40`,
            }}
            onClick={onClick}
        >
            <span
                className={`rounded-full ${small ? 'size-1.5' : 'size-2'}`}
                style={{ backgroundColor: tag.color }}
            />
            {tag.name}
            {removable && onRemove && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onRemove();
                    }}
                    className="ml-0.5 hover:opacity-60 transition-opacity"
                >
                    ×
                </button>
            )}
        </span>
    );
};
