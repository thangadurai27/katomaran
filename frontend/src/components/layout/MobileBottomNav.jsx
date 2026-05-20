import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Plus, BarChart3, QrCode, User } from 'lucide-react';

const TABS = [
    { path: '/dashboard/overview', label: 'Home', icon: LayoutDashboard, match: ['/dashboard', '/dashboard/overview'] },
    { path: '/dashboard/create-link', label: 'Create', icon: Plus },
    { path: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
    { path: '/dashboard/qr-center', label: 'QR', icon: QrCode },
    { path: '/dashboard/profile', label: 'Profile', icon: User },
];

const isActive = (pathname, tab) => {
    if (tab.match) return tab.match.some((m) => pathname === m || pathname.startsWith(m + '/'));
    return pathname === tab.path || pathname.startsWith(tab.path + '/');
};

const MobileBottomNav = () => {
    const { pathname } = useLocation();

    return (
        <nav
            className="lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200/90 bg-white/90 dark:bg-slate-900/95 dark:border-slate-800 backdrop-blur-xl safe-bottom"
            aria-label="Main navigation"
        >
            <div className="flex items-stretch justify-around px-1 pt-1.5 pb-1 max-w-lg mx-auto">
                {TABS.map((tab) => {
                    const active = isActive(pathname, tab);
                    const Icon = tab.icon;
                    return (
                        <NavLink
                            key={tab.path}
                            to={tab.path}
                            className={`touch-target flex flex-col items-center justify-center gap-0.5 min-w-[4rem] rounded-xl px-2 py-1 transition-colors ${
                                active
                                    ? 'text-brand-600 dark:text-brand-400'
                                    : 'text-slate-500 dark:text-slate-400'
                            }`}
                            aria-current={active ? 'page' : undefined}
                        >
                            <span
                                className={`flex items-center justify-center w-10 h-7 rounded-full transition-all ${
                                    active ? 'bg-brand-50 dark:bg-brand-950/60' : ''
                                }`}
                            >
                                <Icon className={`w-5 h-5 ${active ? 'stroke-[2.5]' : ''}`} aria-hidden />
                            </span>
                            <span className="text-[10px] font-semibold leading-none">{tab.label}</span>
                        </NavLink>
                    );
                })}
            </div>
        </nav>
    );
};

export default MobileBottomNav;
