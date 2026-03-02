import React, { useEffect } from 'react';

interface DrawerProps {
    open: boolean;
    onClose: () => void;
    children: React.ReactNode;
    side?: 'left' | 'right' | 'bottom';
    width?: string;   // for left/right drawers
    height?: string;  // for bottom drawer
    overlayClass?: string;
}

/**
 * Generic slide-in Drawer / Sheet.
 *
 * side='left'   — slides in from the left (Sidebar on mobile)
 * side='right'  — slides in from the right
 * side='bottom' — slides up from the bottom (CardModal on mobile)
 */
export const Drawer: React.FC<DrawerProps> = ({
    open,
    onClose,
    children,
    side = 'left',
    width = 'w-72',
    height = 'h-[90dvh]',
    overlayClass = '',
}) => {
    // Lock body scroll while open
    useEffect(() => {
        if (open) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [open]);

    // Prevent closing if not open
    if (!open) return null;

    const sideStyles: Record<string, string> = {
        left: `top-0 left-0 h-full ${width} translate-x-0`,
        right: `top-0 right-0 h-full ${width} translate-x-0`,
        bottom: `bottom-0 left-0 right-0 ${height} rounded-t-3xl translate-y-0`,
    };

    return (
        <div className="fixed inset-0 z-40 flex">
            {/* Overlay */}
            <div
                className={`fixed inset-0 bg-black/30 backdrop-blur-sm animate-in fade-in duration-200 ${overlayClass}`}
                onClick={onClose}
            />

            {/* Panel */}
            <div
                className={`
          fixed bg-white shadow-2xl overflow-y-auto
          animate-in duration-300 ease-out
          ${side === 'left' ? 'slide-in-from-left-full' : ''}
          ${side === 'right' ? 'slide-in-from-right-full' : ''}
          ${side === 'bottom' ? 'slide-in-from-bottom-full' : ''}
          ${sideStyles[side]}
        `.trim().replace(/\s+/g, ' ')}
                onClick={e => e.stopPropagation()}
            >
                {/* Bottom drawer pull bar */}
                {side === 'bottom' && (
                    <div className="flex justify-center pt-3 pb-1 sticky top-0 bg-white z-10">
                        <div className="w-10 h-1 rounded-full bg-gray-200" />
                    </div>
                )}
                {children}
            </div>
        </div>
    );
};
