import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Menu, X, ArrowRight, Moon, Sun } from 'lucide-react';
import useAuthStore from '@/stores/authStore';
import useUIStore from '@/stores/uiStore';

const NAV_LINKS = [
    { label: 'Features', href: '/#features' },
    { label: 'Pricing', href: '/#pricing' },
    { label: 'Analytics', href: '/#analytics' },
    { label: 'API', href: '/#api' },
    { label: 'Docs', href: '/#docs' },
];

const Navbar = () => {
    const [mobileOpen, setMobileOpen] = useState(false);
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
                <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2.5 shrink-0">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#5145E5] to-[#7C3AED] flex items-center justify-center shadow-lg shadow-[#5145E5]/25">
                            <Zap className="w-4 h-4 text-white" strokeWidth={2.5} />
                        </div>
                        <span className="text-lg font-bold tracking-tight text-[#172033] dark:text-white">SnapLink AI</span>
                    </Link>

                    <div className="hidden md:flex items-center gap-7">
                        {NAV_LINKS.map(({ label, href }) => (
                            <Link key={label} to={href} className="text-sm font-medium text-[#64748B] dark:text-white/70 hover:text-[#5145E5] dark:hover:text-white transition-colors">
                                {label}
                            </Link>
                        ))}
                    </div>

                    <div className="hidden md:flex items-center gap-2.5">
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-lg text-[#64748B] dark:text-white/70 hover:bg-[#5145E5]/10 transition-colors"
                            aria-label="Toggle theme"
                        >
                            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                        </button>
                        {isAuthenticated ? (
                            <Link to="/dashboard/overview" className="btn-primary text-sm px-4 py-2">
                                Dashboard <ArrowRight className="w-4 h-4" />
                            </Link>
                        ) : (
                            <>
                                <Link to="/login" className="text-sm font-medium text-[#64748B] dark:text-white/70 hover:text-[#5145E5] px-3 py-2">
                                    Sign in
                                </Link>
                                <Link to="/signup" className="btn-primary text-sm px-4 py-2">
                                    Get Started Free <ArrowRight className="w-4 h-4" />
                                </Link>
                            </>
                        )}
                    </div>

                    <button
                        onClick={() => setMobileOpen(!mobileOpen)}
                        className="md:hidden p-2 rounded-lg text-[#64748B] dark:text-white/70"
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
                                className="fixed inset-0 top-16 bg-slate-900/20 backdrop-blur-sm md:hidden z-40"
                                onClick={() => setMobileOpen(false)}
                            />
                            <motion.div
                                initial={{ opacity: 0, y: -12 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -12 }}
                                transition={{ duration: 0.22 }}
                                className="absolute top-full left-4 right-4 mt-2 bg-white dark:bg-[#15172B] rounded-2xl border border-[#E5E7EB] dark:border-white/10 shadow-xl overflow-hidden md:hidden z-50"
                            >
                                <div className="p-3 space-y-1">
                                    {NAV_LINKS.map(({ label, href }) => (
                                        <Link
                                            key={label}
                                            to={href}
                                            onClick={() => setMobileOpen(false)}
                                            className="flex items-center h-11 px-4 text-sm font-medium rounded-xl text-[#64748B] dark:text-white/70 hover:bg-[#5145E5]/5 hover:text-[#5145E5] transition-all"
                                        >
                                            {label}
                                        </Link>
                                    ))}
                                    <div className="border-t border-[#E5E7EB] dark:border-white/10 pt-3 mt-2 flex flex-col gap-2">
                                        {isAuthenticated ? (
                                            <Link to="/dashboard/overview" onClick={() => setMobileOpen(false)} className="btn-primary w-full text-center text-sm">
                                                Dashboard
                                            </Link>
                                        ) : (
                                            <>
                                                <Link to="/login" onClick={() => setMobileOpen(false)} className="btn-secondary w-full text-center text-sm">Sign in</Link>
                                                <Link to="/signup" onClick={() => setMobileOpen(false)} className="btn-primary w-full text-center text-sm">Get Started Free</Link>
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
            <div className="h-16" aria-hidden="true" />
        </>
    );
};

export default Navbar;
