import React from 'react';

type Tab = 'dashboard' | 'security-audit' | 'generator';

interface BottomNavProps {
    activeTab: Tab;
    setActiveTab: (tab: Tab) => void;
    onMenuOpen: () => void;
    onNewCard: () => void;
}

interface NavItem {
    tab?: Tab;
    icon: string;
    label: string;
    action?: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
    activeTab,
    setActiveTab,
    onMenuOpen,
    onNewCard,
}) => {
    const items: NavItem[] = [
        { icon: 'menu', label: '菜单', action: onMenuOpen },
        { tab: 'dashboard', icon: 'inventory_2', label: '密码库' },
        { tab: 'generator', icon: 'grid_view', label: '生成器' },
        { tab: 'security-audit', icon: 'policy', label: '安全审计' },
    ];

    return (
        <>
            {/* Bottom nav bar */}
            <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/90 backdrop-blur-xl border-t border-gray-200 safe-bottom">
                <div className="flex items-stretch h-16">
                    {items.map((item) => {
                        const isActive = item.tab ? activeTab === item.tab : false;
                        const handleClick = item.action ?? (() => item.tab && setActiveTab(item.tab));
                        return (
                            <button
                                key={item.label}
                                onClick={handleClick}
                                className={`flex-1 flex flex-col items-center justify-center gap-0.5 transition-all ${isActive
                                    ? 'text-primary'
                                    : 'text-gray-400 hover:text-gray-700'
                                    }`}
                            >
                                <span className={`material-symbols-outlined text-[22px] transition-all ${isActive ? 'fill-1 scale-110' : ''}`}>
                                    {item.icon}
                                </span>
                                <span className="text-[10px] font-semibold leading-none">{item.label}</span>
                                {isActive && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full bg-primary" />}
                            </button>
                        );
                    })}
                </div>
            </nav>

            {/* FAB — new card button (mobile only, shown only on dashboard) */}
            {activeTab === 'dashboard' && (
                <button
                    onClick={onNewCard}
                    className="lg:hidden fixed bottom-20 right-4 z-30 size-13 rounded-full bg-primary hover:bg-primary-hover text-white shadow-xl shadow-red-500/30 flex items-center justify-center transition-all active:scale-95"
                    aria-label="新建"
                >
                    <span className="material-symbols-outlined text-[24px]">add</span>
                </button>
            )}
        </>
    );
};
