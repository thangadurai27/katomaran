import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Search, Menu, Plus, LogOut, User, Settings, ChevronDown } from 'lucide-react';
import useAuthStore from '@/stores/authStore';
import useUIStore from '@/stores/uiStore';
import ThemeToggle from '@/components/ui/ThemeToggle';
import { useIsMobile } from '@/hooks/useMediaQuery';
import toast from 'react-hot-toast';

const DashboardHeader = () => {
    const { user, logout } = useAuthStore();
    const { setSidebarOpen } = useUIStore();
    const isMobile = useIsMobile();
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef(null);
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        toast.success('Logged out successfully');
        navigate('/');
    };

    const initials = user?.name
        ?.split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase() || 'U';

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
        <header className="sticky top-0 z-20 flex items-center justify-between h-14 sm:h-16 px-3 sm:px-6 bg-[var(--bg-surface)]/90 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800 shadow-[0_1px_0_rgba(15,23,42,0.04)] safe-top">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                <button
                    type="button"
                    onClick={() => setSidebarOpen(true)}
                    className="touch-target btn-ghost p-2 lg:hidden shrink-0"
                    aria-label="Open menu"
                >
                    <Menu className="w-5 h-5" />
                </button>

                <div className="relative hidden md:flex items-center flex-1 max-w-md">
                    <Search className="absolute left-3.5 w-4 h-4 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
                    <input
                        type="search"
                        placeholder="Search links, campaigns…"
                        className="input-field w-72 pl-10 pr-14 py-2 bg-raised"
                        aria-label="Search"
                    />
                    <kbd className="absolute right-3 hidden lg:inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium rounded-md border border-slate-200 bg-white text-slate-400">
                        ⌘K
                    </kbd>
                </div>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                <ThemeToggle className="hidden sm:flex" />
                <Link to="/dashboard/create-link" className="btn-primary hidden lg:inline-flex py-2 px-4 text-sm">
                    <Plus className="w-4 h-4" />
                    <span className="hidden xl:inline">New Link</span>
                    <span className="xl:hidden">New</span>
                </Link>

                <Link
                    to="/dashboard/notifications"
                    className="relative p-2.5 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                    aria-label="Notifications"
                >
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-brand-500 rounded-full ring-2 ring-white" />
                </Link>

                <div className="relative" ref={menuRef}>
                    <button
                        type="button"
                        onClick={() => setMenuOpen(!menuOpen)}
                        className="flex items-center gap-2 pl-1.5 pr-2 py-1.5 rounded-xl hover:bg-slate-100 transition-colors"
                        aria-expanded={menuOpen}
                        aria-haspopup="menu"
                    >
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white shadow-brand">
                            {initials}
                        </div>
                        <div className="hidden md:block text-left">
                            <p className="text-sm font-semibold leading-none text-slate-800">{user?.name?.split(' ')[0]}</p>
                            <p className="text-xs capitalize mt-0.5 text-slate-500">{user?.plan || 'free'} plan</p>
                        </div>
                        <ChevronDown className={`w-4 h-4 text-slate-400 hidden md:block transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
                    </button>

                    <AnimatePresence>
                        {menuOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: -6, scale: 0.98 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -6, scale: 0.98 }}
                                transition={{ duration: 0.15 }}
                                className="absolute right-0 mt-2 w-60 card-elevated rounded-2xl overflow-hidden z-50"
                                role="menu"
                            >
                                <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/80">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center text-sm font-bold text-white shrink-0">
                                            {initials}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-semibold truncate text-slate-800">{user?.name}</p>
                                            <p className="text-xs truncate text-slate-500">{user?.email}</p>
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
                                            className="flex items-center gap-2.5 px-3 py-2.5 text-sm rounded-xl text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                                        >
                                            <Icon className="w-4 h-4" /> {label}
                                        </Link>
                                    ))}
                                    <div className="border-t border-slate-100 mt-1 pt-1">
                                        <button
                                            type="button"
                                            onClick={handleLogout}
                                            role="menuitem"
                                            className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm rounded-xl text-red-600 hover:bg-red-50 transition-colors"
                                        >
                                            <LogOut className="w-4 h-4" /> Logout
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </header>
    );
};

export default DashboardHeader;
