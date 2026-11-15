import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import useUIStore from '@/stores/uiStore';
import useAuthStore from '@/stores/authStore';
import { useIsMobile } from '@/hooks/useMediaQuery';
import {
    LayoutDashboard,
    Link2,
    Plus,
    Brain,
    QrCode,
    Megaphone,
    Users,
    Settings,
    User,
    Trash2,
    X,
    BarChart2,
    Activity,
    Bell,
    Shield,
} from 'lucide-react';

const navItems = [
    {
        section: 'MAIN',
        items: [
            { label: 'Overview', icon: LayoutDashboard, path: '/dashboard/overview' },
            { label: 'Create Link', icon: Plus, path: '/dashboard/create-link' },
            { label: 'My Links', icon: Link2, path: '/dashboard/my-links' },
        ],
    },
    {
        section: 'ANALYTICS',
        items: [
            { label: 'Analytics', icon: BarChart2, path: '/dashboard/analytics' },
            { label: 'AI Insights', icon: Brain, path: '/dashboard/ai-insights', badge: 'AI' },
            { label: 'Activity Logs', icon: Activity, path: '/dashboard/activity-logs' },
        ],
    },
    {
        section: 'TOOLS',
        items: [
            { label: 'QR Center', icon: QrCode, path: '/dashboard/qr-center' },
            { label: 'Bulk Shortener', icon: Link2, path: '/dashboard/bulk-shortener' },
            { label: 'Campaigns', icon: Megaphone, path: '/dashboard/campaigns' },
            { label: 'Public Pages', icon: LayoutDashboard, path: '/dashboard/public-pages' },
        ],
    },
    {
        section: 'MANAGEMENT',
        items: [
            { label: 'Team', icon: Users, path: '/dashboard/team-collaboration' },
            { label: 'Notifications', icon: Bell, path: '/dashboard/notifications' },
        ],
    },
    {
        section: 'ACCOUNT',
        items: [
            { label: 'Profile', icon: User, path: '/dashboard/profile' },
            { label: 'Settings', icon: Settings, path: '/dashboard/settings' },
            { label: 'Trash', icon: Trash2, path: '/dashboard/trash' },
        ],
    },
];

const Sidebar = () => {
    const isMobile = useIsMobile();
    const collapsed = useUIStore((state) => state.collapsed);
    const { user } = useAuthStore();
    const toggleSidebar = () => useUIStore((state) => state.setSidebarOpen(!state.sidebarOpen));
    const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';

    return (
        <nav
            className={`fixed left-0 top-0 bottom-0 z-30 flex flex-col overflow-hidden bg-[var(--bg-surface)] border-r border-slate-200/90 dark:border-slate-800 shadow-[1px_0_0_rgba(15,23,42,0.04)] safe-top ${
                isMobile ? 'w-[min(85vw,280px)]' : ''
            }`}
        >
            {/* Header / Brand */}
            <div className="flex items-center gap-3 px-4 h-14 sm:h-16 border-b border-slate-200/80 dark:border-slate-800 shrink-0">
                <Link to="/dashboard/overview" className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-sm">
                        S
                    </div>
                    {!collapsed && !isMobile && (
                        <span className="text-base font-bold font-display tracking-tight text-[var(--text-primary)] truncate">
                            SnapLink AI
                        </span>
                    )}
                </Link>
                <button
                    onClick={toggleSidebar}
                    className="lg:hidden ml-auto p-2 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    aria-label="Toggle sidebar"
                >
                    <X className="w-5 h-5 text-slate-400" />
                </button>
            </div>

            {/* Navigation */}
            <ul className="flex-1 flex flex-col overflow-y-auto pr-2 py-2">
                {navItems.map((section) => (
                    <li
                        key={section.section}
                        className="border-t border-slate-200/80 dark:border-slate-800 pt-2.5 mt-1 shrink-0 lg:pb-2.5 first:border-t-0 first:mt-0"
                    >
                        {!collapsed && (
                            <p className="text-[10px] font-bold uppercase tracking-widest px-2.5 mb-1.5 text-[var(--text-muted)]">
                                {section.section}
                            </p>
                        )}
                        <ul className={collapsed && !isMobile ? '' : 'pl-2'}>
                            {section.items.map((item) => (
                                <li key={item.path}>
                                    <NavLink
                                        to={item.path}
                                        title={collapsed ? item.label : undefined}
                                        className={({ isActive }) =>
                                            `group relative flex items-center gap-2.5 px-2.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 min-h-[44px] sm:min-h-0 ${
                                                isActive ? 'sidebar-link-active' : 'sidebar-link'
                                            } ${collapsed && !isMobile ? 'justify-center px-2' : ''}`
                                        }
                                    >
                                        <item.icon className="w-5 h-5 shrink-0" />
                                        {!collapsed && (
                                            <>
                                                <span className="truncate">{item.label}</span>
                                                {item.badge && (
                                                    <span className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-primary/10 text-primary">
                                                        {item.badge}
                                                    </span>
                                                )}
                                            </>
                                        )}
                                    </NavLink>
                                </li>
                            ))}
                        </ul>
                    </li>
                ))}

                {/* Admin section - only for admins */}
                {isAdmin && (
                    <li className="border-t border-slate-200/80 dark:border-slate-800 pt-2.5 mt-1 shrink-0 lg:pb-2.5">
                        {!collapsed && (
                            <p className="text-[10px] font-bold uppercase tracking-widest px-2.5 mb-1.5 text-[var(--text-muted)]">
                                ADMIN
                            </p>
                        )}
                        <ul className={collapsed && !isMobile ? '' : 'pl-2'}>
                            <li>
                                <NavLink
                                    to="/dashboard/admin"
                                    className={({ isActive }) =>
                                        `group relative flex items-center gap-2.5 px-2.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 min-h-[44px] sm:min-h-0 ${
                                            isActive ? 'sidebar-link-active' : 'sidebar-link'
                                        } ${collapsed && !isMobile ? 'justify-center px-2' : ''}`
                                    }
                                >
                                    <Shield className="w-5 h-5 shrink-0" />
                                    {!collapsed && <span className="truncate">Admin Panel</span>}
                                </NavLink>
                            </li>
                        </ul>
                    </li>
                )}
            </ul>

            {/* User profile footer */}
            <div className="border-t border-slate-200/80 dark:border-slate-800 p-2.5 shrink-0 safe-bottom lg:pb-2.5">
                <Link
                    to="/dashboard/profile"
                    onClick={() => isMobile && toggleSidebar()}
                    className={`flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 ${
                        collapsed && !isMobile ? 'justify-center' : ''
                    }`}
                >
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-sm font-bold shrink-0">
                        {user?.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                    {!collapsed && (
                        <div className="min-w-0">
                            <p className="text-sm font-semibold text-[var(--text-primary)] truncate">
                                {user?.name || 'User'}
                            </p>
                            <p className="text-xs text-[var(--text-secondary)] truncate">
                                {user?.email || ''}
                            </p>
                        </div>
                    )}
                </Link>
            </div>
        </nav>
    );
};

export default Sidebar;
