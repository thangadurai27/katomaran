import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import useUIStore from '@/stores/uiStore';
import useAuthStore from '@/stores/authStore';
import { useIsMobile } from '@/hooks/useMediaQuery';
import { LayoutDashboard, Link2, Plus, Brain, QrCode, Megaphone, Users, Globe, Layers, Shield, Settings, User, Trash2, LogOut, X, Eye, EyeOff, BarChart2 } from 'lucide-react';

const navItems = [
    {
        section: 'MAIN',
        label: 'SnapLink AI',
        kind: 'brand',
        items: [
            { label: 'Overview', icon: LayoutDashboard, path: '/dashboard/overview', highlight: true },
            { label: 'Create Link', icon: Plus, path: '/dashboard/create-link' },
            { label: 'My Links', icon: Link2, path: '/dashboard/my-links' },
        ],
    },
    {
        section: 'ANALYTICS',
        items: [
            { label: 'Analytics', icon: BarChart2, path: '/dashboard/analytics' },
            { label: 'AI Insights', icon: Brain, path: '/dashboard/ai-insights', badge: 'AI' }
        ],
    },
    {
        section: 'MANAGEMENT',
        items: [
            { label: 'Team', icon: Users, path: '/dashboard/team' },
            { label: 'QR Center', icon: QrCode, path: '/dashboard/qr-center' },
            { label: 'Campaigns', icon: Megaphone, path: '/dashboard/campaigns' },
        ],
    },
    {
        section: 'ACCOUNT',
        items: [
            { label: 'Profile', icon: User, path: '/dashboard/profile' },
            { label: 'Settings', icon: Settings, path: '/dashboard/settings' },
        ],
    },
];

const Sidebar = () => {
    const isMobile = useIsMobile();
    const collapsed = useUIStore(state => state.collapsed);
    const { user } = useAuthStore();

    const toggleSidebar = () => useUIStore(state => state.setSidebarOpen(!state.sidebarOpen));

    return (
        <nav className={`fixed left-0 top-0 bottom-0 z-30 flex flex-col overflow-hidden bg-[var(--bg-surface)] border-r border-slate-200/90 dark:border-slate-800 shadow-[1px_0_0_rgba(15,23,42,0.04)] safe-top ${isMobile ? 'w-[min(85vw,280px)]' : ''}`}>
            <div className="flex items-center gap-3 px-4 h-14 sm:h-16 border-b border-slate-200/80 dark:border-slate-800 shrink-0">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-sm font-bold text-white shrink-0">
                    {user?.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <button
                    onClick={toggleSidebar}
                    className="lg:hidden p-2 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    aria-label="Toggle sidebar"
                >
                    <X className="w-5 h-5 text-slate-400" />
                </button>
            </div>

            <ul className="flex-1 flex flex-col overflow-y-auto pr-2">
                {navItems.map((section, si) => (
                    <li key={si} className="border-t border-slate-200/80 dark:border-slate-800 pt-2.5 shrink-0 safe-bottom lg:pb-2.5">
                        <p className="text-[10px] font-bold uppercase tracking-widest px-2.5 mb-1.5 text-[var(--muted)]">
                            {section.label}
                        </p>
                        {section.kind === 'brand' && (
                            <Link
                                to="/dashboard/overview"
                                onClick={() => isMobile && toggleSidebar()}
                                className={`flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 ${collapsed && !isMobile ? 'justify-center' : ''}`}
                            >
                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-sm font-bold text-white shrink-0">
                                    SnapLink AI
                                </div>
                            </Link>
                        )}
                        {section.kind !== 'brand' && (
                            <ul className="pl-8">
                                {section.items.map((item) => (
                                    <li key={item.path} className="text-sm">
                                        <NavLink
                                            to={item.path}
                                            className={({ isActive }) => `group relative flex items-center gap-2.5 px-2.5 py-3 sm:py-2.5 rounded-xl text-sm font-medium transition-all duration-150 min-h-touch sm:min-h-0 ${isActive ? 'sidebar-link-active' : 'sidebar-link'}`}
                                        >
                                            <item.icon className="w-5 h-5 mr-3 flex-shrink-0" />
                                            <span className="truncate">{item.label}</span>
                                        </NavLink>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </li>
                ))}
            </ul>

            <div className="border-t border-slate-200/80 dark:border-slate-800 pt-2.5 shrink-0 safe-bottom lg:pb-2.5">
                <Link
                    to="/dashboard/profile"
                    onClick={() => isMobile && toggleSidebar()}
                    className={`flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 ${collapsed && !isMobile ? 'justify-center' : ''}`}
                >
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-sm font-bold text-white shrink-0">
                        {user?.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                </Link>
            </div>
        </nav>
    );
};

export default Sidebar;