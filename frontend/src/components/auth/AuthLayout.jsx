import { Link } from 'react-router-dom';
import { Zap, Sparkles, Link2, BarChart3 } from 'lucide-react';

const CONTENT = {
    signup: {
        badge: 'Join SnapLink AI',
        cardTitle: 'Create account',
        cardSubtitle: 'Start for free — no credit card required',
        cta: 'Get Started Free',
        footer: (
            <>
                Already have an account?{' '}
                <Link to="/login" className="font-semibold text-[#7C3AED] transition-colors hover:text-[#6D28D9]">Sign in</Link>
            </>
        ),
        features: [
            { icon: Link2, title: 'Shorten unlimited links', desc: 'Create clean, branded short URLs' },
            { icon: BarChart3, title: 'Track performance', desc: 'Get real-time analytics and insights' },
            { icon: Sparkles, title: 'AI-powered insights', desc: 'Optimize your links and campaigns' },
        ],
    },
    login: {
        badge: 'Welcome Back',
        cardTitle: 'Welcome back',
        cardSubtitle: 'Sign in to your account to continue',
        cta: 'Sign In',
        footer: (
            <>
                Don&rsquo;t have an account?{' '}
                <Link to="/signup" className="font-semibold text-[#7C3AED] transition-colors hover:text-[#6D28D9]">Sign up free</Link>
            </>
        ),
        features: [
            { icon: Link2, title: 'Manage your links', desc: 'Create, edit, and track short links' },
            { icon: BarChart3, title: 'View real-time analytics', desc: 'Monitor clicks, devices, and performance' },
            { icon: Sparkles, title: 'Get AI insights', desc: 'Optimize and grow with smart suggestions' },
        ],
    },
    forgot: {
        badge: 'Password Help',
        cardTitle: 'Forgot password?',
        cardSubtitle: 'Enter your email and we’ll send you a reset link',
        cta: 'Send Reset Link',
        footer: (
            <>
                Remember your password?{' '}
                <Link to="/login" className="font-semibold text-[#7C3AED] transition-colors hover:text-[#6D28D9]">Sign in</Link>
            </>
        ),
        features: [
            { icon: Link2, title: 'Manage your links', desc: 'Create, edit, and track short links' },
            { icon: BarChart3, title: 'View real-time analytics', desc: 'Monitor clicks, devices, and performance' },
            { icon: Sparkles, title: 'Get AI insights', desc: 'Optimize and grow with smart suggestions' },
        ],
    },
    reset: {
        badge: 'Password Help',
        cardTitle: 'Reset password',
        cardSubtitle: 'Choose a strong new password',
        cta: 'Reset Password',
        footer: (
            <>
                Remember your password?{' '}
                <Link to="/login" className="font-semibold text-[#7C3AED] transition-colors hover:text-[#6D28D9]">Sign in</Link>
            </>
        ),
        features: [
            { icon: Link2, title: 'Manage your links', desc: 'Create, edit, and track short links' },
            { icon: BarChart3, title: 'View real-time analytics', desc: 'Monitor clicks, devices, and performance' },
            { icon: Sparkles, title: 'Get AI insights', desc: 'Optimize and grow with smart suggestions' },
        ],
    },
};

const HEADINGS = {
    signup: ['Create your', 'account'],
    login: ['Sign in to', 'SnapLink AI'],
    forgot: ['Forgot your', 'password?'],
    reset: ['Set a new', 'password'],
};

const Heading = ({ variant }) => {
    if (variant === 'signup') {
        return (
            <h1 className="font-display text-[40px] font-extrabold leading-[1.08] tracking-tight text-[#17153A] sm:text-[48px]">
                Create your{' '}
                <span className="relative inline-block text-[#7C3AED]">
                    free
                    <svg viewBox="0 0 120 12" className="absolute -bottom-1.5 left-0 w-full" aria-hidden preserveAspectRatio="none">
                        <path d="M4 9 C 40 2.5, 82 2.5, 116 8" stroke="#7C3AED" strokeWidth="5" fill="none" strokeLinecap="round" />
                    </svg>
                </span>
                <br />
                account
            </h1>
        );
    }

    const [lineA, lineB] = HEADINGS[variant];
    const accentWords = { login: 'SnapLink AI', forgot: 'password?', reset: 'password' };
    const accent = accentWords[variant] || '';

    return (
        <h1 className="font-display text-[40px] font-extrabold leading-[1.08] tracking-tight text-[#17153A] sm:text-[48px]">
            {lineA}
            <br />
            {accent ? (
                <>
                    {lineB.replace(accent, '')}
                    <span className="text-[#7C3AED]">{accent}</span>
                </>
            ) : (
                lineB
            )}
        </h1>
    );
};

const Logo = ({ className = '' }) => (
    <Link to="/" className={`flex items-center gap-2.5 ${className}`}>
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#7C3AED] to-[#8B5CF6] shadow-[0_6px_18px_rgba(124,58,237,0.35)]">
            <Zap className="h-4 w-4 text-white" fill="currentColor" strokeWidth={0} />
        </span>
        <span className="font-display text-[19px] font-extrabold tracking-tight text-[#17153A]">
            SnapLink <span className="text-[#7C3AED]">AI</span>
        </span>
    </Link>
);

const AuthLayout = ({ variant, children }) => {
    const content = CONTENT[variant];

    return (
        <div className="relative flex min-h-dvh overflow-hidden bg-[#F4F1FB]">
            {/* ── Left marketing panel ───────────────────────── */}
            <aside className="relative z-10 hidden w-[54%] flex-col px-10 py-10 lg:flex xl:px-16 xl:py-12">
                <Logo />

                <div className="relative z-10 mt-auto mb-auto flex max-w-[560px] flex-col items-start pt-12">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EBE3FA] px-4 py-2 text-[13px] font-semibold text-[#6D28D9]">
                        <Sparkles className="h-3.5 w-3.5" /> {content.badge}
                    </span>

                    <div className="mt-6">
                        <Heading variant={variant} />
                    </div>

                    <p className="mt-5 max-w-md text-[16px] leading-relaxed text-[#5C5975]">
                        {variant === 'signup'
                            ? 'Start shortening, tracking, and growing your links with AI-powered tools.'
                            : 'Access your links, analytics, and AI-powered tools in one place.'}
                    </p>

                    <div className="mt-9 w-full max-w-md space-y-6">
                        {content.features.map(({ icon: Icon, title, desc }) => (
                            <div key={title} className="flex items-start gap-4">
                                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#EDE6FA] text-[#7C3AED]">
                                    <Icon className="h-5 w-5" />
                                </span>
                                <div>
                                    <p className="text-[15px] font-bold text-[#17153A]">{title}</p>
                                    <p className="mt-0.5 text-[13.5px] text-[#6B6880]">{desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Decorative waves */}
                <svg
                    className="pointer-events-none absolute bottom-0 left-0 h-[280px] w-full"
                    viewBox="0 0 800 280"
                    preserveAspectRatio="none"
                    aria-hidden
                >
                    <path fill="#E7DFF6" d="M0 190 C 180 110 340 230 800 150 L 800 280 L 0 280 Z" />
                    <path fill="#D9CBF2" d="M0 240 C 220 170 420 260 800 210 L 800 280 L 0 280 Z" />
                    <path fill="#8B5CF6" fillOpacity="0.28" d="M0 280 C 140 200 300 260 460 280 Z" />
                    <circle cx="120" cy="255" r="95" fill="#7C3AED" fillOpacity="0.22" />
                </svg>
            </aside>

            {/* ── Right card ─────────────────────────────────── */}
            <main className="relative z-10 flex w-full items-center justify-center px-5 py-10 sm:px-10 lg:w-[46%] lg:py-12">
                <div className="w-full max-w-[560px]">
                    <Logo className="mb-7 flex justify-center lg:hidden" />

                    <div className="rounded-[28px] bg-white px-6 py-9 shadow-[0_24px_80px_rgba(124,58,237,0.13),0_2px_8px_rgba(29,27,51,0.04)] sm:px-10 sm:py-11">
                        <div className="flex flex-col items-center text-center">
                            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-[#8B5CF6] to-[#6D28D9] shadow-[0_10px_26px_rgba(124,58,237,0.32)]">
                                <Zap className="h-7 w-7 text-white" fill="currentColor" strokeWidth={0} />
                            </span>
                            <h2 className="mt-5 font-display text-[27px] font-extrabold tracking-tight text-[#17153A]">
                                {content.cardTitle}
                            </h2>
                            <p className="mt-1.5 text-[14.5px] text-[#6B6880]">{content.cardSubtitle}</p>
                        </div>

                        <div className="mt-8">{children}</div>
                    </div>

                    <p className="mt-6 text-center text-[14px] text-[#6B6880]">{content.footer}</p>
                </div>
            </main>
        </div>
    );
};

export default AuthLayout;
