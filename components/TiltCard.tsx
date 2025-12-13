
import React, { useRef, MouseEvent } from 'react';
import { Card, Tag, TranslationFn } from '../types';
import { TagBadge } from './TagBadge';

interface TiltCardProps {
  card: Card;
  resolvedTags: Tag[];
  onClick: () => void;
  t: TranslationFn;
}

export const TiltCard: React.FC<TiltCardProps> = ({ card, resolvedTags, onClick, t }) => {
  const ref = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const w = rect.width;
    const h = rect.height;
    
    // Normalize position (-1 to 1)
    const posX = (x - w / 2) / (w / 2);
    const posY = (y - h / 2) / (h / 2);

    const tiltDeg = 3; // Subtle tilt

    ref.current.style.transform = `perspective(1000px) rotateX(${-1 * posY * tiltDeg}deg) rotateY(${1 * posX * tiltDeg}deg) scale3d(1.02, 1.02, 1.02)`;
    ref.current.style.boxShadow = `${-posX * 10}px ${-posY * 10}px 20px rgba(0,0,0,0.15)`;
    // Make movement snappy while keeping hover entry/exit smooth.
    ref.current.style.transition = 'transform 0s, box-shadow 0s';
  };

  const handleMouseLeave = () => {
    if (!ref.current) return;
    ref.current.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    ref.current.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.05)';
    ref.current.style.transition = 'transform 0.3s ease-out, box-shadow 0.3s ease-out';
  };

  return (
    <div
      ref={ref}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="bg-white dark:bg-dark-surface rounded-xl p-5 cursor-pointer border border-transparent hover:border-primary/20 dark:border-dark-border group relative z-0 hover:z-10 will-change-transform"
      style={{
        transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        transition: 'transform 0.3s ease-out, box-shadow 0.3s ease-out',
        transformStyle: 'preserve-3d'
      }}
    >
      <div className="flex justify-between items-start mb-2 pointer-events-none">
        <h3 className="font-bold text-xl text-gray-800 dark:text-white truncate pr-2">{card.title}</h3>
      </div>
      
      {card.username && (
        <p className="text-base text-gray-600 dark:text-gray-300 mb-3 truncate font-mono bg-gray-50 dark:bg-black/30 p-1.5 rounded px-2 inline-block max-w-full pointer-events-none">
          {card.username}
        </p>
      )}

      <div className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-4 leading-relaxed pointer-events-none">
        {card.notes || <span className="italic opacity-50">{t('noDescription')}</span>}
      </div>

      <div className="flex flex-col gap-3 mt-auto pt-3 border-t border-gray-100 dark:border-zinc-800 pointer-events-none">
        <div className="flex gap-1 flex-wrap">
          {resolvedTags.length > 0 ? (
              resolvedTags.map(tag => (
              <TagBadge key={tag.id} tag={tag} />
            ))
          ) : (
            <span className="text-xs text-gray-300 dark:text-gray-600 italic">{t('noTags')}</span>
          )}
        </div>
      </div>
    </div>
  );
};
