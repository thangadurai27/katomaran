import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Menu, X, ArrowRight, Moon, Sun, ChevronDown, LayoutGrid, BookOpen, HelpCircle, FileText } from 'lucide-react';
import useAuthStore from '@/stores/authStore';
import useUIStore from '@/stores/uiStore';

const NAV_LINKS = [
    { label: 'Features', href: '/#features' },
    { label: 'Pricing', href: '/#pricing' },
    { label: 'Analytics', href: '/#analytics' },
    { label: 'API', href: '/#api' },
];

const RESOURCES = [
    { label: 'Documentation', href: '/#docs', icon: FileText },
    { label: 'Blog', href: '/#blog', icon: BookOpen },
    { label: 'Help Center', href: '/#help', icon: HelpCircle },
    { label: 'API Reference', href: '/#api', icon: LayoutGrid },
];

const Navbar = () => {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [resourcesOpen, setResourcesOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const { isAuthenticated } = useAuthStore();
    const { theme, toggleTheme } = useUIStore();
    const location = useLocation();

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 16);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    useEffect(() => {
        document.body.style.overflow = mobileOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [mobileOpen]);

    useEffect(() => {
        if (location.hash) {
            const el = document.querySelector(location.hash);
            if (el) el.scrollIntoView({ behavior: 'smooth' });
        }
    }, [location]);

    useEffect(() => {
        const close = () => setResourcesOpen(false);
        window.addEventListener('click', close);
        return () => window.removeEventListener('click', close);
    }, []);

    return (
        <>
            <motion.header
                initial={{ y: -72, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.45, ease: 'easeOut' }}
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
                    scrolled
                        ? 'bg-white/85 dark:bg-[#0B0D17]/85 backdrop-blur-xl border-b border-[#E5E7EB] dark:border-white/10 shadow-[0_1px_0_rgba(15,23,42,0.04)]'
                        : 'bg-white/60 dark:bg-[#0B0D17]/60 backdrop-blur-md border-b border-transparent'
                }`}
            >
                <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[72px] flex items-center justify-between gap-4">
                    <Link to="/" className="flex items-center gap-2.5 shrink-0">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#8B5CF6] flex items-center justify-center shadow-lg shadow-[#7C3AED]/30">
                            <Zap className="w-4.5 h-4.5 text-white" strokeWidth={2.5} />
                        </div>
                        <span className="text-lg font-bold tracking-tight text-[#172033] dark:text-white">
                            SnapLink <span className="text-[#7C3AED]">AI</span>
                        </span>
                    </Link>

                    {/* center links */}
                    <div className="hidden lg:flex items-center gap-8">
                        {NAV_LINKS.map(({ label, href }) => (
                            <Link key={label} to={href} className="text-[15px] font-medium text-[#3E3A52] dark:text-white/75 hover:text-[#7C3AED] dark:hover:text-white transition-colors">
                                {label}
                            </Link>
                        ))}

                        {/* Resources dropdown */}
                        <div className="relative" onClick={(e) => e.stopPropagation()}>
                            <button
                                onClick={() => setResourcesOpen(!resourcesOpen)}
                                className="flex items-center gap-1 text-[15px] font-medium text-[#3E3A52] dark:text-white/75 hover:text-[#7C3AED] dark:hover:text-white transition-colors"
                            >
                                Resources
                                <ChevronDown className={`w-4 h-4 transition-transform ${resourcesOpen ? 'rotate-180' : ''}`} />
                            </button>
                            <AnimatePresence>
                                {resourcesOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 8, scale: 0.97 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 8, scale: 0.97 }}
                                        transition={{ duration: 0.18 }}
                                        className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-56 bg-white dark:bg-[#15172B] rounded-2xl border border-[#E5E7EB] dark:border-white/10 shadow-xl p-2"
                                    >
                                        {RESOURCES.map(({ label, href, icon: Icon }) => (
                                            <Link
                                                key={label}
                                                to={href}
                                                onClick={() => setResourcesOpen(false)}
                                                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#3E3A52] dark:text-white/75 hover:bg-[#7C3AED]/5 hover:text-[#7C3AED] dark:hover:text-white transition-all"
                                            >
                                                <span className="w-8 h-8 rounded-lg bg-[#7C3AED]/10 text-[#7C3AED] flex items-center justify-center">
                                                    <Icon className="w-4 h-4" />
                                                </span>
                                                {label}
                                            </Link>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* right actions */}
                    <div className="hidden md:flex items-center gap-3">
                        <button
                            onClick={toggleTheme}
                            className="w-10 h-10 rounded-full bg-white dark:bg-white/5 border border-[#E5E7EB] dark:border-white/10 flex items-center justify-center text-[#3E3A52] dark:text-white/75 hover:border-[#7C3AED]/40 hover:text-[#7C3AED] transition-all shadow-sm"
                            aria-label="Toggle theme"
                        >
                            {theme === 'dark' ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
                        </button>
                        {isAuthenticated ? (
                            <>
                                <Link to="/dashboard/overview" className="text-[15px] font-semibold text-[#3E3A52] dark:text-white/80 hover:text-[#7C3AED] dark:hover:text-white px-4 py-2.5 rounded-full hover:bg-[#7C3AED]/5 transition-all">
                                    Dashboard
                                </Link>
                                <Link to="/dashboard/overview" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-[15px] font-semibold text-white bg-gradient-to-r from-[#7C3AED] to-[#8B5CF6] shadow-lg shadow-[#7C3AED]/30 hover:shadow-xl hover:shadow-[#7C3AED]/40 hover:-translate-y-0.5 transition-all">
                                    Open App
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="px-6 py-2.5 rounded-full text-[15px] font-semibold text-[#172033] dark:text-white bg-white dark:bg-white/5 border border-[#E5E7EB] dark:border-white/15 hover:border-[#7C3AED]/50 hover:text-[#7C3AED] dark:hover:text-white transition-all shadow-sm">
                                    Sign In
                                </Link>
                                <Link to="/signup" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-[15px] font-semibold text-white bg-gradient-to-r from-[#7C3AED] to-[#8B5CF6] shadow-lg shadow-[#7C3AED]/30 hover:shadow-xl hover:shadow-[#7C3AED]/40 hover:-translate-y-0.5 transition-all">
                                    Get Started Free <ArrowRight className="w-4 h-4" />
                                </Link>
                            </>
                        )}
                    </div>

                    <button
                        onClick={() => setMobileOpen(!mobileOpen)}
                        className="lg:hidden p-2 rounded-lg text-[#3E3A52] dark:text-white/75"
                        aria-label="Toggle menu"
                        aria-expanded={mobileOpen}
                    >
                        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </nav>

                <AnimatePresence>
                    {mobileOpen && (
                        <>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 top-[72px] bg-slate-900/20 backdrop-blur-sm z-40"
                                onClick={() => setMobileOpen(false)}
                            />
                            <motion.div
                                initial={{ opacity: 0, y: -12 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -12 }}
                                transition={{ duration: 0.22 }}
                                className="absolute top-full left-4 right-4 mt-2 bg-white dark:bg-[#15172B] rounded-2xl border border-[#E5E7EB] dark:border-white/10 shadow-xl overflow-hidden z-50"
                            >
                                <div className="p-3 space-y-1">
                                    {NAV_LINKS.map(({ label, href }) => (
                                        <Link
                                            key={label}
                                            to={href}
                                            onClick={() => setMobileOpen(false)}
                                            className="flex items-center h-11 px-4 text-sm font-medium rounded-xl text-[#3E3A52] dark:text-white/75 hover:bg-[#7C3AED]/5 hover:text-[#7C3AED] transition-all"
                                        >
                                            {label}
                                        </Link>
                                    ))}
                                    <div className="pt-2 mt-2 border-t border-[#E5E7EB] dark:border-white/10 flex flex-col gap-2">
                                        {isAuthenticated ? (
                                            <Link to="/dashboard/overview" onClick={() => setMobileOpen(false)} className="btn-primary w-full text-center text-sm rounded-full">
                                                Dashboard
                                            </Link>
                                        ) : (
                                            <>
                                                <Link to="/login" onClick={() => setMobileOpen(false)} className="w-full text-center text-sm font-semibold py-2.5 rounded-full border border-[#E5E7EB] dark:border-white/15 text-[#172033] dark:text-white">Sign In</Link>
                                                <Link to="/signup" onClick={() => setMobileOpen(false)} className="btn-primary w-full text-center text-sm rounded-full">Get Started Free</Link>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>
            </motion.header>
            {/* spacer so content isn't hidden behind fixed header */}
            <div className="h-[72px]" aria-hidden="true" />
        </>
    );
};

export default Navbar;
