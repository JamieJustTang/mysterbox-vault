import React from 'react';
import { Tag as TagType } from '../types';

interface TagBadgeProps {
  tag: TagType;
  onClick?: () => void;
  selected?: boolean;
}

export const TagBadge: React.FC<TagBadgeProps> = ({ tag, onClick, selected }) => {
  return (
    <span
      onClick={onClick}
      className={`
        inline-flex shrink-0 items-center px-3 py-1 rounded-md text-xs font-medium cursor-pointer transition-all border select-none whitespace-nowrap
        ${selected 
          ? 'border-transparent' 
          : 'border-transparent hover:opacity-80'}
      `}
      style={{ 
        backgroundColor: tag.color + '20', // 20% opacity hex
        color: tag.color,
        borderColor: selected ? 'transparent' : tag.color + '40',
        // Use box-shadow to create a ring effect that matches the tag color exactly.
        // This fixes the issue where random tag colors clashed with the fixed red ring.
        boxShadow: selected ? `0 0 0 1.5px ${tag.color}` : 'none'
      }}
    >
      {tag.name}
    </span>
  );
};