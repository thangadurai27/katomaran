import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Search, Menu, LogOut, User, Settings, ChevronDown, Zap } from 'lucide-react';
import useAuthStore from '@/stores/authStore';
import useUIStore from '@/stores/uiStore';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import ThemeToggle from '@/components/ui/ThemeToggle';
import toast from 'react-hot-toast';

const DashboardHeader = () => {
    const { user, logout } = useAuthStore();
    const { setSidebarOpen } = useUIStore();
    const { data: notificationData } = useQuery({
        queryKey: ['notifications'],
        queryFn: async () => {
            const { data } = await api.get('/notifications');
            return data.data;
        },
        refetchInterval: 30000,
    });
    const unreadCount = notificationData?.unreadCount || 0;
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef(null);
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        toast.success('Logged out successfully');
        navigate('/login', { replace: true });
    };

    const initials = user?.name
        ?.split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase() || 'U';

    const firstName = user?.name?.split(' ')[0] || 'there';
    const planLabel = user?.plan ? `${String(user.plan).charAt(0).toUpperCase()}${String(user.plan).slice(1)} Plan` : 'Free Plan';

    useEffect(() => {
        const onKey = (e) => {
            if (e.key === 'Escape') setMenuOpen(false);
        };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, []);

    useEffect(() => {
        const onClick = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
        };
        if (menuOpen) document.addEventListener('mousedown', onClick);
        return () => document.removeEventListener('mousedown', onClick);
    }, [menuOpen]);

    return (
        <header className="safe-top sticky top-0 z-20 h-[76px] border-b border-[var(--border)] bg-[var(--bg-surface)]/90 backdrop-blur-xl">
            <div className="mx-auto flex h-full w-full items-center gap-3 px-4 sm:px-6 lg:px-8">
                <button
                    type="button"
                    onClick={() => setSidebarOpen(true)}
                    className="touch-target -ml-1 shrink-0 rounded-xl p-2 text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-raised)] hover:text-[var(--text-primary)] lg:hidden"
                    aria-label="Open menu"
                >
                    <Menu className="h-5 w-5" />
                </button>

                {/* Compact brand on mobile */}
                <Link to="/dashboard/overview" className="flex min-w-0 items-center gap-2 lg:hidden">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-[10px] bg-gradient-to-br from-[#8B5CF6] to-[#6D28D9] shadow-[0_4px_12px_rgba(124,58,237,0.28)]">
                        <Zap className="h-4 w-4 fill-white text-white" />
                    </span>
                    <span className="truncate font-display text-[17px] font-extrabold tracking-tight text-[var(--text-primary)]">
                        SnapLink <span className="gradient-text-brand">AI</span>
                    </span>
                </Link>

                <div className="relative hidden w-full max-w-[490px] items-center md:flex">
                    <Search className="pointer-events-none absolute left-4 h-[17px] w-[17px] text-[var(--text-muted)]" />
                    <input
                        type="search"
                        placeholder="Search links, campaigns, or insights..."
                        className="h-11 w-full rounded-xl border border-[#ECEBF4] bg-[#F8F7FC] pl-11 pr-16 text-[14px] text-[var(--text-primary)] outline-none transition-all placeholder:text-[var(--text-muted)] focus:border-[#C9B4FF] focus:bg-white focus:ring-4 focus:ring-[#7C3AED]/[0.08] dark:border-[#2a2540] dark:bg-[#1e1a30] dark:focus:bg-[#221d36]"
                        aria-label="Search"
                    />
                    <kbd className="pointer-events-none absolute right-3 hidden items-center rounded-md border border-[#E4E1EE] bg-white px-1.5 py-0.5 text-[10px] font-medium text-[var(--text-muted)] dark:border-[#332a4d] dark:bg-[#1e1a30] lg:inline-flex">
                        ⌘K
                    </kbd>
                </div>

                <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2.5">
                    <ThemeToggle className="touch-target rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-2.5 text-[var(--text-secondary)] hover:bg-[var(--bg-raised)]" />

                    <Link
                        to="/dashboard/notifications"
                        className="relative grid h-10 w-10 place-items-center rounded-xl text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-raised)] hover:text-[var(--text-primary)]"
                        aria-label="Notifications"
                    >
                        <Bell className="h-[19px] w-[19px]" />
                        {unreadCount > 0 && (
                            <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-[16px] place-items-center rounded-full bg-[#8B5CF6] px-1 text-[9px] font-bold text-white ring-2 ring-[var(--bg-surface)]">
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                        )}
                    </Link>

                    <div className="relative" ref={menuRef}>
                        <button
                            type="button"
                            onClick={() => setMenuOpen(!menuOpen)}
                            className="flex items-center gap-2.5 rounded-xl p-1 transition-colors hover:bg-[var(--bg-raised)] sm:pr-2"
                            aria-expanded={menuOpen}
                            aria-haspopup="menu"
                        >
                            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#8B5CF6] to-[#7C3AED] text-[12px] font-bold text-white shadow-[0_4px_12px_rgba(124,58,237,0.25)]">
                                {initials}
                            </span>
                            <span className="hidden text-left md:block">
                                <span className="block text-[13px] font-semibold leading-none text-[var(--text-primary)]">
                                    {firstName}
                                </span>
                                <span className="mt-1 block text-[11px] leading-none text-[var(--text-muted)]">
                                    {planLabel}
                                </span>
                            </span>
                            <ChevronDown
                                className={`hidden h-4 w-4 text-[var(--text-muted)] transition-transform md:block ${
                                    menuOpen ? 'rotate-180' : ''
                                }`}
                            />
                        </button>

                        <AnimatePresence>
                            {menuOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: -6, scale: 0.98 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -6, scale: 0.98 }}
                                    transition={{ duration: 0.15 }}
                                    className="card-elevated absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-2xl"
                                    role="menu"
                                >
                                    <div className="border-b border-[var(--border)] bg-[var(--bg-raised)] px-4 py-3.5">
                                        <div className="flex items-center gap-3">
                                            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#8B5CF6] to-[#7C3AED] text-sm font-bold text-white">
                                                {initials}
                                            </span>
                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-semibold text-[var(--text-primary)]">
                                                    {user?.name}
                                                </p>
                                                <p className="truncate text-xs text-[var(--text-muted)]">{user?.email}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-1.5">
                                        {[
                                            { to: '/dashboard/profile', icon: User, label: 'Profile' },
                                            { to: '/dashboard/settings', icon: Settings, label: 'Settings' },
                                        ].map(({ to, icon: Icon, label }) => (
                                            <Link
                                                key={to}
                                                to={to}
                                                onClick={() => setMenuOpen(false)}
                                                role="menuitem"
                                                className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-raised)] hover:text-[var(--text-primary)]"
                                            >
                                                <Icon className="h-4 w-4" /> {label}
                                            </Link>
                                        ))}
                                        <div className="mt-1 border-t border-[var(--border)] pt-1">
                                            <button
                                                type="button"
                                                onClick={handleLogout}
                                                role="menuitem"
                                                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-red-600 transition-colors hover:bg-red-50 dark:hover:bg-red-950/30"
                                            >
                                                <LogOut className="h-4 w-4" /> Logout
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default DashboardHeader;
