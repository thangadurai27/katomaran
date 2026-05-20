import React, { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Menu, X, ArrowRight } from 'lucide-react';
import useAuthStore from '@/stores/authStore';

const NAV_LINKS = [
    { label: 'Features', href: '/features' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'Analytics', href: '/features#analytics' },
    { label: 'API', href: '/features#api' },
];

const navClass = ({ isActive }) =>
    isActive ? 'nav-link-active' : 'nav-link';

const Navbar = () => {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const { isAuthenticated } = useAuthStore();

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 16);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    useEffect(() => {
        document.body.style.overflow = mobileOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [mobileOpen]);

    return (
        <motion.nav
            initial={{ y: -72, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-5 lg:px-8 h-[4.25rem] transition-all duration-300 ${
                scrolled
                    ? 'bg-white/90 backdrop-blur-xl shadow-[0_1px_0_rgba(15,23,42,0.06),0_8px_24px_rgba(15,23,42,0.06)] border-b border-slate-200/80'
                    : 'bg-white/60 backdrop-blur-md border-b border-transparent'
            }`}
        >
            <Link to="/" className="flex items-center gap-2.5 select-none group">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center shadow-brand transition-transform duration-200 group-hover:scale-105">
                    <Zap className="w-4.5 h-4.5 text-white" strokeWidth={2.5} />
                </div>
                <span className="text-base font-bold font-display gradient-text-brand tracking-tight">SnapLink AI</span>
            </Link>

            <div className="hidden md:flex items-center gap-0.5 p-1 rounded-xl bg-slate-100/80 border border-slate-200/60">
                {NAV_LINKS.map(({ label, href }) => (
                    <NavLink key={label} to={href} className={navClass}>
                        {label}
                    </NavLink>
                ))}
            </div>

            <div className="hidden md:flex items-center gap-2">
                {isAuthenticated ? (
                    <Link to="/dashboard" className="btn-primary py-2 px-5 text-sm">
                        Dashboard <ArrowRight className="w-4 h-4" />
                    </Link>
                ) : (
                    <>
                        <Link to="/login" className="btn-ghost text-sm">Sign in</Link>
                        <Link to="/signup" className="btn-primary py-2 px-5 text-sm">
                            Get Started Free <ArrowRight className="w-4 h-4" />
                        </Link>
                    </>
                )}
            </div>

            <button
                type="button"
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden p-2.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
                aria-label="Toggle menu"
                aria-expanded={mobileOpen}
            >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <AnimatePresence>
                {mobileOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 top-[4.25rem] bg-slate-900/20 backdrop-blur-sm md:hidden z-40"
                            onClick={() => setMobileOpen(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, y: -12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -12 }}
                            transition={{ duration: 0.22 }}
                            className="absolute top-full left-4 right-4 mt-2 bg-white rounded-2xl border border-slate-200 shadow-card-lg overflow-hidden md:hidden z-50"
                        >
                            <div className="p-3 space-y-1">
                                {NAV_LINKS.map(({ label, href }) => (
                                    <NavLink
                                        key={label}
                                        to={href}
                                        onClick={() => setMobileOpen(false)}
                                        className={({ isActive }) =>
                                            `flex items-center h-11 px-4 text-sm font-medium rounded-xl transition-all ${
                                                isActive ? 'nav-link-active' : 'text-slate-600 hover:bg-slate-50'
                                            }`
                                        }
                                    >
                                        {label}
                                    </NavLink>
                                ))}
                                <div className="border-t border-slate-100 pt-3 mt-2 flex flex-col gap-2">
                                    {isAuthenticated ? (
                                        <Link to="/dashboard" onClick={() => setMobileOpen(false)} className="btn-primary text-center w-full">
                                            Dashboard
                                        </Link>
                                    ) : (
                                        <>
                                            <Link to="/login" onClick={() => setMobileOpen(false)} className="btn-secondary w-full text-center">Sign in</Link>
                                            <Link to="/signup" onClick={() => setMobileOpen(false)} className="btn-primary w-full text-center">Get Started Free</Link>
                                        </>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </motion.nav>
    );
};

export default Navbar;
