import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import useUIStore from '@/stores/uiStore';
import useAuthStore from '@/stores/authStore';
import { useIsMobile } from '@/hooks/useMediaQuery';
import { navigationGroups } from '@/config/navigation';
import SidebarGroup from './SidebarGroup';
import {
    Zap,
    Crown,
    ArrowRight,
    X,
    ChevronLeft,
    ChevronRight,
    LogOut,
    User,
    Settings,
    MoreHorizontal,
} from 'lucide-react';

const Sidebar = () => {
    const isMobile = useIsMobile();
    const sidebarOpen = useUIStore((state) => state.sidebarOpen);
    const setSidebarOpen = useUIStore((state) => state.setSidebarOpen);
    const sidebarCollapsed = useUIStore((state) => state.sidebarCollapsed);
    const toggleCollapse = useUIStore((state) => state.toggleCollapse);
    const { user, logout } = useAuthStore();
    const [accountOpen, setAccountOpen] = useState(false);

    const closeMobile = () => {
        if (isMobile) setSidebarOpen(false);
    };

    const handleLogout = async () => {
        await logout();
        closeMobile();
    };

    const initials = user?.name
        ?.split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase() || 'U';

    const planLabel = user?.plan
        ? `${String(user.plan).charAt(0).toUpperCase()}${String(user.plan).slice(1)} Plan`
        : 'Free Plan';

    const collapsed = !isMobile && sidebarCollapsed;

    return (
        <aside
            className={`fixed inset-y-0 left-0 z-40 flex flex-col border-r bg-[var(--bg-surface)] transition-all duration-300 ease-out ${
                collapsed ? 'w-[72px]' : 'w-[250px]'
            } ${sidebarOpen ? 'translate-x-0 shadow-2xl lg:shadow-none' : '-translate-x-full'} lg:translate-x-0`}
            style={{ borderColor: 'var(--border)' }}
            aria-label="Dashboard navigation"
        >
            {/* Brand */}
            <div className={`flex h-16 shrink-0 items-center border-b ${collapsed ? 'justify-center px-2' : 'gap-3 px-5'}`} style={{ borderColor: 'var(--border)' }}>
                <Link to="/dashboard/overview" onClick={closeMobile} className="flex min-w-0 items-center gap-2">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[11px] bg-gradient-to-br from-[#8B5CF6] to-[#6D28D9] shadow-[0_6px_16px_rgba(124,58,237,0.30)]">
                        <Zap className="h-[17px] w-[17px] fill-white text-white" />
                    </span>
                    {!collapsed && (
                        <span className="truncate font-display text-[18px] font-extrabold tracking-tight text-[var(--text-primary)]">
                            SnapLink <span className="gradient-text-brand">AI</span>
                        </span>
                    )}
                </Link>

                {isMobile && (
                    <button
                        type="button"
                        onClick={() => setSidebarOpen(false)}
                        className="ml-auto rounded-lg p-2 text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-raised)] hover:text-[var(--text-primary)]"
                        aria-label="Close menu"
                    >
                        <X className="h-5 w-5" />
                    </button>
                )}
            </div>

            {/* Collapse toggle (desktop) */}
            <div className={`hidden lg:flex ${collapsed ? 'justify-center' : 'justify-end'} px-3 pt-2`}>
                <button
                    type="button"
                    onClick={toggleCollapse}
                    className="grid h-8 w-8 place-items-center rounded-lg text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-raised)] hover:text-[var(--text-primary)]"
                    aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                >
                    {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                </button>
            </div>

            {/* Navigation */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-3">
                <div className="space-y-5">
                    {navigationGroups.map((group) => (
                        <SidebarGroup key={group.label} group={group} collapsed={collapsed} onNavigate={closeMobile} />
                    ))}
                </div>
            </div>

            {/* Upgrade to Pro */}
            <div className="shrink-0 px-3 pb-2">
                <Link
                    to="/pricing"
                    onClick={closeMobile}
                    className={`flex items-center gap-3 rounded-2xl border border-[#EDE4FF] bg-gradient-to-br from-[#FAF7FF] to-[#F0E8FF] p-3 transition-colors hover:border-[#D8C7FF] dark:border-[#3a2a5c] dark:from-[#1e1730] dark:to-[#2c2147] ${
                        collapsed ? 'justify-center' : ''
                    }`}
                >
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white text-[#F59E0B] shadow-sm">
                        <Crown className="h-[17px] w-[17px]" strokeWidth={2.1} />
                    </span>
                    {!collapsed && (
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-[13px] font-bold text-[var(--text-primary)]">Upgrade to Pro</p>
                            <p className="truncate text-[11px] text-[var(--text-secondary)]">Unlock advanced features</p>
                        </div>
                    )}
                    {!collapsed && <ArrowRight className="h-4 w-4 shrink-0 text-[var(--text-muted)]" />}
                </Link>
            </div>

            {/* User profile */}
            <div className="relative shrink-0 border-t p-3" style={{ borderColor: 'var(--border)' }}>
                <button
                    type="button"
                    onClick={() => setAccountOpen((open) => !open)}
                    className={`flex w-full items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-[var(--bg-raised)] ${
                        collapsed ? 'justify-center' : ''
                    }`}
                    aria-expanded={accountOpen}
                    aria-haspopup="menu"
                >
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#8B5CF6] to-[#7C3AED] text-[12px] font-bold text-white">
                        {initials}
                    </span>
                    {!collapsed && (
                        <div className="min-w-0 flex-1 text-left">
                            <p className="truncate text-[13px] font-semibold text-[var(--text-primary)]">
                                {user?.name || 'Account'}
                            </p>
                            <p className="truncate text-[11px] text-[var(--text-muted)]">{planLabel}</p>
                        </div>
                    )}
                    {!collapsed && <MoreHorizontal className="h-4 w-4 shrink-0 text-[var(--text-muted)]" />}
                </button>

                {accountOpen && (
                    <div
                        className={`card-elevated absolute bottom-full z-50 mb-2 overflow-hidden rounded-2xl ${collapsed ? 'left-2 w-56' : 'left-3 right-3'}`}
                        role="menu"
                    >
                        <div className="border-b border-[var(--border)] bg-[var(--bg-raised)] px-4 py-3">
                            <p className="truncate text-sm font-semibold text-[var(--text-primary)]">{user?.name}</p>
                            <p className="truncate text-xs text-[var(--text-muted)]">{user?.email}</p>
                        </div>
                        <div className="p-1.5">
                            <NavLink
                                to="/dashboard/profile"
                                onClick={() => { setAccountOpen(false); closeMobile(); }}
                                role="menuitem"
                                className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-raised)] hover:text-[var(--text-primary)]"
                            >
                                <User className="h-4 w-4" /> Profile
                            </NavLink>
                            <NavLink
                                to="/dashboard/settings"
                                onClick={() => { setAccountOpen(false); closeMobile(); }}
                                role="menuitem"
                                className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-raised)] hover:text-[var(--text-primary)]"
                            >
                                <Settings className="h-4 w-4" /> Settings
                            </NavLink>
                            <div className="mt-1 border-t border-[var(--border)] pt-1">
                                <button
                                    type="button"
                                    onClick={() => { setAccountOpen(false); handleLogout(); }}
                                    role="menuitem"
                                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-red-600 transition-colors hover:bg-red-50 dark:hover:bg-red-950/30"
                                >
                                    <LogOut className="h-4 w-4" /> Logout
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </aside>
    );
};

export default Sidebar;