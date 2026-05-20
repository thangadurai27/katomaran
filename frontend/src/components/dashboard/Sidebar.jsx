import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import useUIStore from '@/stores/uiStore';
import useAuthStore from '@/stores/authStore';
import { useIsMobile } from '@/hooks/useMediaQuery';
import {
    LayoutDashboard, Link2, Plus, BarChart3, Brain, QrCode,
    Megaphone, Users, Globe, Layers, Download, Activity,
    Settings, User, Bell, Trash2, Shield, ChevronLeft,
    ChevronRight, Zap, LogOut, X,
} from 'lucide-react';

const navItems = [
    {
        section: 'Main',
        items: [
            { label: 'Overview', icon: LayoutDashboard, path: '/dashboard/overview' },
            { label: 'Create Link', icon: Plus, path: '/dashboard/create-link', highlight: true },
            { label: 'My Links', icon: Link2, path: '/dashboard/my-links' },
        ],
    },
    {
        section: 'Analytics',
        items: [
            { label: 'Analytics', icon: BarChart3, path: '/dashboard/analytics' },
            { label: 'AI Insights', icon: Brain, path: '/dashboard/ai-insights', badge: 'AI' },
        ],
    },
    {
        section: 'Tools',
        items: [
            { label: 'QR Center', icon: QrCode, path: '/dashboard/qr-center' },
            { label: 'Campaigns', icon: Megaphone, path: '/dashboard/campaigns' },
            { label: 'Team', icon: Users, path: '/dashboard/team-collaboration' },
            { label: 'Public Pages', icon: Globe, path: '/dashboard/public-pages' },
            { label: 'Bulk Shortener', icon: Layers, path: '/dashboard/bulk-shortener' },
            { label: 'Export Center', icon: Download, path: '/dashboard/export-center' },
        ],
    },
    {
        section: 'Account',
        items: [
            { label: 'Activity Logs', icon: Activity, path: '/dashboard/activity-logs' },
            { label: 'Notifications', icon: Bell, path: '/dashboard/notifications' },
            { label: 'Profile', icon: User, path: '/dashboard/profile' },
            { label: 'Settings', icon: Settings, path: '/dashboard/settings' },
            { label: 'Trash', icon: Trash2, path: '/dashboard/trash' },
            { label: 'Admin Panel', icon: Shield, path: '/dashboard/admin' },
        ],
    },
];

const Sidebar = () => {
    const { sidebarOpen, sidebarCollapsed, toggleCollapse, setSidebarOpen } = useUIStore();
    const { user, logout } = useAuthStore();
    const isMobile = useIsMobile();
    const collapsed = sidebarCollapsed && !isMobile;
    const width = collapsed ? 68 : 256;

    const visible = isMobile ? sidebarOpen : sidebarOpen;

    return (
        <>
            <motion.aside
                initial={false}
                animate={
                    isMobile
                        ? { x: visible ? 0 : -width }
                        : { width }
                }
                transition={{ duration: 0.28, ease: 'easeInOut' }}
                className={`fixed left-0 top-0 bottom-0 z-30 flex flex-col overflow-hidden bg-[var(--bg-surface)] border-r border-slate-200/90 dark:border-slate-800 shadow-[1px_0_0_rgba(15,23,42,0.04)] safe-top ${
                    isMobile ? 'w-[min(85vw,280px)]' : ''
                }`}
                style={!isMobile ? { width } : undefined}
                aria-label="Sidebar navigation"
            >
                <div className="flex items-center gap-3 px-4 h-14 sm:h-16 border-b border-slate-200/80 dark:border-slate-800 shrink-0">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-brand">
                        <Zap className="w-4.5 h-4.5 text-white" strokeWidth={2.5} />
                    </div>
                    <AnimatePresence>
                        {(!collapsed || isMobile) && (
                            <motion.span
                                initial={{ opacity: 0, x: -8 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -8 }}
                                className="text-base font-bold font-display gradient-text-brand tracking-tight truncate flex-1"
                            >
                                SnapLink AI
                            </motion.span>
                        )}
                    </AnimatePresence>
                    {isMobile ? (
                        <button
                            type="button"
                            onClick={() => setSidebarOpen(false)}
                            className="touch-target p-2 rounded-xl text-slate-500"
                            aria-label="Close menu"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={toggleCollapse}
                            className="ml-auto touch-target p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                        >
                            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                        </button>
                    )}
                </div>

                <nav className="flex-1 overflow-y-auto overscroll-contain py-3 px-2.5 space-y-5">
                    {navItems.map((section) => (
                        <div key={section.section}>
                            {(!collapsed || isMobile) && (
                                <p className="text-[10px] font-bold uppercase tracking-widest px-2.5 mb-1.5 text-[var(--text-muted)]">
                                    {section.section}
                                </p>
                            )}
                            <div className="space-y-0.5">
                                {section.items.map((item) => (
                                    <NavLink
                                        key={item.path}
                                        to={item.path}
                                        onClick={() => isMobile && setSidebarOpen(false)}
                                        title={collapsed && !isMobile ? item.label : undefined}
                                        className={({ isActive }) =>
                                            `group relative flex items-center gap-2.5 px-2.5 py-3 sm:py-2.5 rounded-xl text-sm font-medium transition-all duration-150 min-h-touch sm:min-h-0 ${
                                                isActive
                                                    ? 'sidebar-link-active'
                                                    : item.highlight
                                                      ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-brand'
                                                      : 'sidebar-link'
                                            } ${collapsed && !isMobile ? 'justify-center' : ''}`
                                        }
                                    >
                                        <item.icon className="w-5 h-5 sm:w-4.5 sm:h-4.5 flex-shrink-0" />
                                        <AnimatePresence>
                                            {(!collapsed || isMobile) && (
                                                <motion.span
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    className="truncate flex-1"
                                                >
                                                    {item.label}
                                                </motion.span>
                                            )}
                                        </AnimatePresence>
                                        {(!collapsed || isMobile) && item.badge && (
                                            <span className="badge-primary px-1.5 py-0.5 text-[10px] font-bold rounded-md">
                                                {item.badge}
                                            </span>
                                        )}
                                    </NavLink>
                                ))}
                            </div>
                        </div>
                    ))}
                </nav>

                <div className="border-t border-slate-200/80 dark:border-slate-800 p-2.5 shrink-0 safe-bottom lg:pb-2.5">
                    <Link
                        to="/dashboard/profile"
                        onClick={() => isMobile && setSidebarOpen(false)}
                        className={`flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 ${collapsed && !isMobile ? 'justify-center' : ''}`}
                    >
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center text-sm font-bold text-white shrink-0">
                            {user?.name?.[0]?.toUpperCase() || 'U'}
                        </div>
                        {(!collapsed || isMobile) && (
                            <>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold truncate text-[var(--text-primary)]">{user?.name}</p>
                                    <p className="text-xs capitalize truncate text-[var(--text-muted)]">{user?.plan || 'Free'} plan</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        logout();
                                    }}
                                    className="touch-target p-1.5 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/30"
                                    title="Logout"
                                >
                                    <LogOut className="w-4 h-4" />
                                </button>
                            </>
                        )}
                    </Link>
                </div>
            </motion.aside>
        </>
    );
};

export default Sidebar;
