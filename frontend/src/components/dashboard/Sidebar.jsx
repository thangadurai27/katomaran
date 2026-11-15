import { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import useUIStore from '@/stores/uiStore';
import useAuthStore from '@/stores/authStore';
import { useIsMobile } from '@/hooks/useMediaQuery';
import {
    Home,
    Link2,
    Plus,
    BarChart3,
    Sparkles,
    Megaphone,
    QrCode,
    Users,
    User,
    Settings,
    MoreHorizontal,
    ChevronDown,
    Zap,
    Crown,
    ArrowRight,
    Layers,
    Globe2,
    Activity,
    Bell,
    Trash2,
    Shield,
    X,
} from 'lucide-react';

const primaryNav = [
    { label: 'Dashboard', icon: Home, path: '/dashboard/overview' },
    { label: 'Links', icon: Link2, path: '/dashboard/my-links' },
    { label: 'Analytics', icon: BarChart3, path: '/dashboard/analytics' },
    { label: 'AI Insights', icon: Sparkles, path: '/dashboard/ai-insights', badge: 'New' },
    { label: 'Campaigns', icon: Megaphone, path: '/dashboard/campaigns' },
    { label: 'QR Center', icon: QrCode, path: '/dashboard/qr-center' },
    { label: 'Team', icon: Users, path: '/dashboard/team-collaboration' },
];

const accountNav = [
    { label: 'Profile', icon: User, path: '/dashboard/profile' },
    { label: 'Settings', icon: Settings, path: '/dashboard/settings' },
];

const toolsNav = [
    { label: 'Create Link', icon: Plus, path: '/dashboard/create-link' },
    { label: 'Bulk Shortener', icon: Layers, path: '/dashboard/bulk-shortener' },
    { label: 'Public Pages', icon: Globe2, path: '/dashboard/public-pages' },
    { label: 'Activity Logs', icon: Activity, path: '/dashboard/activity-logs' },
    { label: 'Notifications', icon: Bell, path: '/dashboard/notifications' },
    { label: 'Trash', icon: Trash2, path: '/dashboard/trash' },
];

const NavItem = ({ item, onNavigate }) => (
    <li>
        <NavLink
            to={item.path}
            onClick={onNavigate}
            className={({ isActive }) =>
                `group relative flex h-12 items-center gap-3 rounded-xl px-3.5 text-[15px] font-medium transition-all duration-200 ${
                    isActive ? 'sidebar-link-active' : 'sidebar-link'
                }`
            }
        >
            {({ isActive }) => (
                <>
                    <item.icon className="h-5 w-5 shrink-0" strokeWidth={isActive ? 2.2 : 1.9} />
                    <span className="truncate">{item.label}</span>
                    {item.badge && (
                        <span
                            className={`ml-auto rounded-md px-1.5 py-0.5 text-[10px] font-bold leading-none ${
                                isActive
                                    ? 'bg-white/20 text-white'
                                    : 'bg-[var(--brand-light)] text-[var(--brand-primary)]'
                            }`}
                        >
                            {item.badge}
                        </span>
                    )}
                </>
            )}
        </NavLink>
    </li>
);

const Sidebar = () => {
    const isMobile = useIsMobile();
    const sidebarOpen = useUIStore((state) => state.sidebarOpen);
    const setSidebarOpen = useUIStore((state) => state.setSidebarOpen);
    const { user } = useAuthStore();
    const [moreOpen, setMoreOpen] = useState(false);

    const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';
    const isPro = user?.plan && !['free', 'trial'].includes(String(user.plan).toLowerCase());
    const extraNav = isAdmin
        ? [...toolsNav, { label: 'Admin Panel', icon: Shield, path: '/dashboard/admin' }]
        : toolsNav;

    const closeMobile = () => {
        if (isMobile) setSidebarOpen(false);
    };

    return (
        <aside
            className={`fixed inset-y-0 left-0 z-40 flex w-[272px] max-w-[85vw] flex-col border-r bg-[var(--bg-surface)] transition-transform duration-300 ease-out lg:translate-x-0 ${
                sidebarOpen ? 'translate-x-0 shadow-2xl lg:shadow-none' : '-translate-x-full'
            }`}
            style={{ borderColor: 'var(--border)' }}
            aria-label="Dashboard navigation"
        >
            {/* Brand */}
            <div className="flex h-20 shrink-0 items-center gap-3 px-6">
                <Link to="/dashboard/overview" onClick={closeMobile} className="flex min-w-0 items-center gap-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[13px] bg-gradient-to-br from-[#8B5CF6] to-[#6D28D9] shadow-[0_8px_20px_rgba(124,58,237,0.32)]">
                        <Zap className="h-[19px] w-[19px] fill-white text-white" />
                    </span>
                    <span className="truncate font-display text-[21px] font-extrabold tracking-tight text-[var(--text-primary)]">
                        SnapLink <span className="gradient-text-brand">AI</span>
                    </span>
                </Link>

                <button
                    type="button"
                    onClick={() => setSidebarOpen(false)}
                    className="ml-auto rounded-lg p-2 text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-raised)] hover:text-[var(--text-primary)] lg:hidden"
                    aria-label="Close menu"
                >
                    <X className="h-5 w-5" />
                </button>
            </div>

            {/* Navigation */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden px-5 pb-5">
                <ul className="space-y-1.5">
                    {primaryNav.map((item) => (
                        <NavItem key={item.path} item={item} onNavigate={closeMobile} />
                    ))}
                </ul>

                <div className="my-5 h-px bg-[var(--border)]" />

                <ul className="space-y-1.5">
                    {accountNav.map((item) => (
                        <NavItem key={item.path} item={item} onNavigate={closeMobile} />
                    ))}
                </ul>

                <div className="my-5 h-px bg-[var(--border)]" />

                <button
                    type="button"
                    onClick={() => setMoreOpen((open) => !open)}
                    className="flex h-12 w-full items-center gap-3 rounded-xl px-3.5 text-[15px] font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--brand-light)] hover:text-[var(--brand-primary)]"
                    aria-expanded={moreOpen}
                >
                    <MoreHorizontal className="h-5 w-5 shrink-0" strokeWidth={1.9} />
                    <span>More</span>
                    <ChevronDown
                        className={`ml-auto h-4 w-4 transition-transform duration-200 ${moreOpen ? 'rotate-180' : ''}`}
                    />
                </button>

                <div
                    className={`grid overflow-hidden transition-all duration-300 ${
                        moreOpen ? 'mt-1 grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                    }`}
                >
                    <ul className="min-h-0 space-y-1">
                        {extraNav.map((item) => (
                            <li key={item.path}>
                                <NavLink
                                    to={item.path}
                                    onClick={closeMobile}
                                    className={({ isActive }) =>
                                        `flex h-10 items-center gap-3 rounded-xl px-3.5 pl-[3.15rem] text-sm font-medium transition-colors ${
                                            isActive
                                                ? 'bg-[var(--brand-light)] text-[var(--brand-primary)]'
                                                : 'text-[var(--text-secondary)] hover:bg-[var(--bg-raised)] hover:text-[var(--text-primary)]'
                                        }`
                                    }
                                >
                                    <item.icon className="h-4 w-4 shrink-0" />
                                    <span className="truncate">{item.label}</span>
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Upgrade card */}
            {!isPro && (
                <div className="mt-auto shrink-0 p-5 pt-0">
                    <div className="relative overflow-hidden rounded-2xl border border-[#EDE4FF] bg-gradient-to-br from-[#FAF7FF] via-[#F6F0FF] to-[#F0E8FF] p-5 dark:border-[#3a2a5c] dark:from-[#1e1730] dark:via-[#241b3a] dark:to-[#2c2147]">
                        <span className="pointer-events-none absolute -right-7 -top-8 h-24 w-24 rounded-full bg-[#E6D8FF]/70 blur-2xl dark:bg-[#3a2a5c]/50" />
                        <span className="pointer-events-none absolute -bottom-10 -left-8 h-24 w-24 rounded-full bg-white/70 blur-2xl dark:bg-white/5" />

                        <div className="relative">
                            <span className="grid h-9 w-9 place-items-center rounded-xl bg-white text-[#F59E0B] shadow-[0_4px_12px_rgba(124,58,237,0.10)]">
                                <Crown className="h-[18px] w-[18px]" strokeWidth={2.1} />
                            </span>
                            <h3 className="mt-3 font-display text-[15px] font-bold text-[var(--text-primary)]">
                                Upgrade to Pro
                            </h3>
                            <p className="mt-1 text-[12px] leading-relaxed text-[var(--text-secondary)]">
                                Unlock advanced analytics, custom domains, and more.
                            </p>
                            <Link
                                to="/pricing"
                                onClick={closeMobile}
                                className="btn-primary mt-4 w-full gap-1.5 rounded-xl px-3 py-2.5 text-xs font-semibold"
                            >
                                Upgrade Now <ArrowRight className="h-3.5 w-3.5" />
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </aside>
    );
};

export default Sidebar;
