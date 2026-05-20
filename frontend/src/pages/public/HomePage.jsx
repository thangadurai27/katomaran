import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Zap, Link2, BarChart3, Brain, QrCode, Shield, Users, Globe,
    ArrowRight, Check, Star, TrendingUp, MousePointerClick, Layers,
    ChevronRight, Sparkles, Target, Clock, Lock
} from 'lucide-react';

/* ── Animation presets ─────────────────────────────────── */
const fadeUp = { hidden: { opacity: 0, y: 32 }, show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' } } };
const stagger = { show: { transition: { staggerChildren: 0.09 } } };
const fadeIn = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { duration: 0.5 } } };

/* ── Data ──────────────────────────────────────────────── */
const FEATURES = [
    { icon: Brain, title: 'AI-Powered Analytics', desc: 'Gemini AI analyzes your traffic and provides actionable insights, best posting times, and audience profiling.', color: 'bg-indigo-500', light: 'bg-indigo-50', text: 'text-indigo-600' },
    { icon: Shield, title: 'Smart Spam Detection', desc: 'Every URL is scanned by AI before shortening to detect phishing, malware, and suspicious patterns.', color: 'bg-emerald-500', light: 'bg-emerald-50', text: 'text-emerald-600' },
    { icon: BarChart3, title: 'Deep Analytics', desc: 'Track clicks, countries, devices, browsers, referrers with real-time data and beautiful visualizations.', color: 'bg-purple-500', light: 'bg-purple-50', text: 'text-purple-600' },
    { icon: QrCode, title: 'Dynamic QR Codes', desc: 'Auto-generate customizable QR codes for every link. Change colors, add logos, download in PNG/SVG.', color: 'bg-cyan-500', light: 'bg-cyan-50', text: 'text-cyan-600' },
    { icon: Users, title: 'Team Collaboration', desc: 'Invite your team with role-based access. Share campaigns, analytics, and manage links together.', color: 'bg-amber-500', light: 'bg-amber-50', text: 'text-amber-600' },
    { icon: Globe, title: 'Smart Bio Pages', desc: 'Create your Linktree-like profile with unlimited links, themes, social icons, and analytics.', color: 'bg-pink-500', light: 'bg-pink-50', text: 'text-pink-600' },
    { icon: Lock, title: 'Password Protection', desc: 'Secure your links with passwords. Set expiry dates, one-time access, and device restrictions.', color: 'bg-red-500', light: 'bg-red-50', text: 'text-red-600' },
    { icon: Layers, title: 'Bulk Shortening', desc: 'Upload CSVs with hundreds of URLs and shorten them all at once with campaign tagging.', color: 'bg-violet-500', light: 'bg-violet-50', text: 'text-violet-600' },
];

const PRICING_PLANS = [
    {
        name: 'Free', price: '$0', period: '/forever', desc: 'Perfect for getting started',
        features: ['500 links/month', '1,000 clicks/month', 'Basic analytics', 'QR code generation', 'Standard support'],
        cta: 'Get Started Free', highlight: false, badge: null
    },
    {
        name: 'Pro', price: '$12', period: '/month', desc: 'For serious link builders',
        features: ['Unlimited links', '100K clicks/month', 'Advanced analytics', 'AI insights', 'Custom aliases', 'Team (5 members)', 'Priority support'],
        cta: 'Start Pro Trial', highlight: true, badge: 'Most Popular'
    },
    {
        name: 'Enterprise', price: '$49', period: '/month', desc: 'For teams at scale',
        features: ['Everything in Pro', 'Unlimited clicks', 'White-label solution', 'API access', 'SSO/SAML', 'Dedicated manager', 'SLA guarantee'],
        cta: 'Contact Sales', highlight: false, badge: null
    }
];

const TESTIMONIALS = [
    { name: 'Sarah Chen', role: 'Growth Manager @ TechCorp', text: 'SnapLink AI transformed how we track campaigns. The AI insights are mind-blowing.', avatar: 'SC', color: 'from-indigo-400 to-purple-500' },
    { name: 'Marcus Johnson', role: 'Founder @ StartupHub', text: "The best URL shortener I've ever used. The analytics depth is comparable to enterprise tools.", avatar: 'MJ', color: 'from-emerald-400 to-cyan-500' },
    { name: 'Priya Sharma', role: 'Digital Marketer', text: 'AI spam detection and auto QR generation save me hours every week. Incredible product.', avatar: 'PS', color: 'from-pink-400 to-rose-500' },
];

const STATS = [
    { value: '50K+', label: 'Links Created', icon: Link2, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { value: '2M+', label: 'Clicks Tracked', icon: MousePointerClick, color: 'text-purple-600', bg: 'bg-purple-50' },
    { value: '5K+', label: 'Active Users', icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { value: '99.9%', label: 'Uptime SLA', icon: TrendingUp, color: 'text-cyan-600', bg: 'bg-cyan-50' },
];

/* ── Sub-components ────────────────────────────────────── */
const FeatureCard = ({ icon: Icon, title, desc, color, light, text }) => (
    <motion.div variants={fadeUp}
        className="card-hover p-6 group cursor-default shine"
    >
        <div className={`w-11 h-11 rounded-2xl ${light} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
            <Icon className={`w-5 h-5 ${text}`} />
        </div>
        <h3 className="text-base font-semibold text-slate-800 mb-2">{title}</h3>
        <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
    </motion.div>
);

const StatCard = ({ value, label, icon: Icon, color, bg }) => (
    <motion.div variants={fadeUp} className="text-center p-6">
        <div className={`w-12 h-12 ${bg} rounded-2xl flex items-center justify-center mx-auto mb-3`}>
            <Icon className={`w-6 h-6 ${color}`} />
        </div>
        <p className={`text-4xl font-black mb-1 gradient-text`}>{value}</p>
        <p className="text-slate-500 text-sm font-medium">{label}</p>
    </motion.div>
);

/* ── Main Component ────────────────────────────────────── */
const HomePage = () => {
    const [urlInput, setUrlInput] = useState('');
    const [activeTestimonial, setActiveTestimonial] = useState(0);

    useEffect(() => {
        const t = setInterval(() => setActiveTestimonial(i => (i + 1) % TESTIMONIALS.length), 4500);
        return () => clearInterval(t);
    }, []);

    return (
        <div className="overflow-x-hidden bg-white">

            {/* ── Hero ───────────────────────────────── */}
            <section className="relative min-h-[92vh] flex items-center justify-center pt-20 pb-48 overflow-hidden">
                {/* Orbs */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full hero-orb-1 blur-3xl" />
                    <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] rounded-full hero-orb-2 blur-3xl" />
                    <div className="grid-bg absolute inset-0 opacity-60" />
                    {/* Floating dots */}
                    {[...Array(8)].map((_, i) => (
                        <motion.div key={i}
                            className="absolute w-1.5 h-1.5 rounded-full bg-indigo-400/40"
                            animate={{ y: [-15, 15, -15], opacity: [0.3, 0.8, 0.3] }}
                            transition={{ duration: 3.5 + i * 0.4, repeat: Infinity, delay: i * 0.6 }}
                            style={{ top: `${15 + i * 10}%`, left: `${8 + i * 11}%` }}
                        />
                    ))}
                </div>

                <div className="max-w-5xl mx-auto px-6 lg:px-8 text-center relative z-10">
                    {/* AI badge */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.05 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-indigo-200 bg-indigo-50 text-indigo-600 text-sm font-medium mb-8 shadow-sm"
                    >
                        <Sparkles className="w-4 h-4" />
                        Powered by Google Gemini AI
                        <ChevronRight className="w-4 h-4 opacity-60" />
                    </motion.div>

                    {/* Headline */}
                    <motion.h1
                        initial={{ opacity: 0, y: 28 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15, duration: 0.6 }}
                        className="text-5xl sm:text-6xl lg:text-7xl font-extrabold font-display text-slate-900 leading-[1.08] mb-6 tracking-tight"
                    >
                        The Smartest Way to<br />
                        <span className="gradient-text">Shorten &amp; Track</span><br />
                        Your Links
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.25 }}
                        className="text-lg sm:text-xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed"
                    >
                        SnapLink AI combines advanced URL shortening with Gemini AI analytics, spam detection,
                        real-time insights, and team collaboration — all in one premium platform.
                    </motion.p>

                    {/* URL Input */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.35 }}
                        className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto mb-10"
                    >
                        <div className="flex-1 relative">
                            <Link2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="url"
                                value={urlInput}
                                onChange={e => setUrlInput(e.target.value)}
                                placeholder="Paste your long URL here..."
                                className="w-full pl-12 pr-4 py-4 bg-white border-2 border-slate-200 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 text-base shadow-card transition-all duration-200"
                            />
                        </div>
                        <Link
                            to={urlInput ? `/signup?url=${encodeURIComponent(urlInput)}` : '/signup'}
                            className="btn-primary py-4 px-8 text-base font-bold whitespace-nowrap rounded-2xl"
                        >
                            Shorten It Free <ArrowRight className="w-5 h-5" />
                        </Link>
                    </motion.div>

                    {/* Social proof */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.45 }}
                        className="flex flex-wrap items-center justify-center gap-5 text-sm text-slate-400"
                    >
                        <div className="flex items-center gap-1.5">
                            {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
                            <span className="ml-1 text-slate-500 font-medium">4.9/5 rating</span>
                        </div>
                        <span className="w-1 h-1 bg-slate-300 rounded-full" />
                        <span className="text-slate-500"><strong className="text-slate-700">50,000+</strong> links shortened</span>
                        <span className="w-1 h-1 bg-slate-300 rounded-full" />
                        <span className="text-slate-500"><strong className="text-slate-700">No credit card</strong> required</span>
                    </motion.div>
                </div>

                {/* Dashboard preview floating */}
                <motion.div
                    initial={{ opacity: 0, y: 60 }}
                    animate={{ opacity: 1, y: 24 }}
                    transition={{ delay: 0.55, duration: 0.8 }}
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-4xl px-6 pointer-events-none"
                >
                    <div className="card shadow-card-lg overflow-hidden">
                        <div className="bg-slate-50 px-4 py-3 border-b border-slate-100 flex items-center gap-2">
                            <div className="flex gap-1.5">
                                {['#ef4444', '#f59e0b', '#22c55e'].map(c => <div key={c} className="w-3 h-3 rounded-full" style={{ background: c }} />)}
                            </div>
                            <div className="flex-1 mx-2 h-7 bg-white border border-slate-200 rounded-lg flex items-center px-3">
                                <span className="text-slate-400 text-xs font-mono">dashboard.snaplinkAI.com</span>
                            </div>
                        </div>
                        <div className="p-4 bg-white">
                            <div className="grid grid-cols-4 gap-3 mb-4">
                                {[{ label: 'Total Links', val: '1,247', color: 'bg-indigo-50 text-indigo-600' }, { label: 'Total Clicks', val: '89,432', color: 'bg-purple-50 text-purple-600' }, { label: 'Active', val: '1,109', color: 'bg-emerald-50 text-emerald-600' }, { label: 'AI Score', val: '94%', color: 'bg-amber-50 text-amber-600' }].map((s, i) => (
                                    <div key={i} className={`${s.color} rounded-xl p-3 text-center`}>
                                        <p className="text-lg font-bold">{s.val}</p>
                                        <p className="text-xs opacity-70">{s.label}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="h-20 bg-slate-50 rounded-xl border border-slate-100 flex items-end gap-1 px-4 pb-3">
                                {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88].map((h, i) => (
                                    <div key={i} className="flex-1 rounded-t-sm" style={{ height: `${h}%`, background: `hsl(${240 + i * 2}, 70%, ${55 + i}%)`, opacity: 0.75 }} />
                                ))}
                            </div>
                        </div>
                    </div>
                </motion.div>
            </section>

            {/* ── Stats ──────────────────────────────── */}
            <section className="py-20 bg-slate-50 border-y border-slate-100">
                <div className="max-w-5xl mx-auto px-6">
                    <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}
                        className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                        {STATS.map(s => <StatCard key={s.label} {...s} />)}
                    </motion.div>
                </div>
            </section>

            {/* ── Features ───────────────────────────── */}
            <section className="py-24 bg-white" id="features">
                <div className="max-w-6xl mx-auto px-6 lg:px-8">
                    <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }} className="text-center mb-16">
                        <motion.span variants={fadeUp} className="badge-primary inline-flex mb-4">Features</motion.span>
                        <motion.h2 variants={fadeUp} className="text-4xl lg:text-5xl font-black text-slate-900 mb-4 tracking-tight">
                            Everything you need to<br /><span className="gradient-text">dominate your links</span>
                        </motion.h2>
                        <motion.p variants={fadeUp} className="text-slate-500 text-lg max-w-2xl mx-auto">
                            Built for marketers, developers, and teams who need more than just a short URL.
                        </motion.p>
                    </motion.div>

                    <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        {FEATURES.map(f => <FeatureCard key={f.title} {...f} />)}
                    </motion.div>
                </div>
            </section>

            {/* ── AI Section ─────────────────────────── */}
            <section className="py-24 bg-gradient-to-br from-indigo-50 via-white to-purple-50 relative overflow-hidden">
                <div className="absolute inset-0 grid-bg opacity-40" />
                <div className="max-w-6xl mx-auto px-6 lg:px-8 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <motion.div initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
                            <span className="badge-primary inline-flex mb-6">🤖 AI Features</span>
                            <h2 className="text-4xl font-black text-slate-900 mb-6 leading-tight tracking-tight">
                                Your intelligent<br /><span className="gradient-text">marketing assistant</span>
                            </h2>
                            <p className="text-slate-500 mb-8 leading-relaxed">
                                SnapLink AI uses Google Gemini to provide real-time URL analysis, traffic predictions,
                                spam detection, and personalized marketing recommendations.
                            </p>
                            <div className="space-y-4">
                                {[
                                    { icon: Brain, text: 'AI generates memorable, SEO-friendly slug suggestions' },
                                    { icon: Shield, text: 'Real-time malware & phishing URL detection' },
                                    { icon: Target, text: 'Predict link performance before you publish' },
                                    { icon: BarChart3, text: 'Natural language analytics insights & reports' },
                                ].map((item, i) => (
                                    <motion.div key={i}
                                        initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                                        className="flex items-start gap-3"
                                    >
                                        <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center flex-shrink-0">
                                            <item.icon className="w-4 h-4 text-indigo-600" />
                                        </div>
                                        <p className="text-slate-600 text-sm leading-relaxed pt-2">{item.text}</p>
                                    </motion.div>
                                ))}
                            </div>
                            <Link to="/signup" className="btn-primary mt-8 inline-flex">
                                Try AI Features Free <ArrowRight className="w-4 h-4" />
                            </Link>
                        </motion.div>

                        {/* AI Chat Demo */}
                        <motion.div initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
                            <div className="card shadow-card-lg overflow-hidden">
                                <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3 bg-slate-50">
                                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-brand">
                                        <Brain className="w-4 h-4 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-slate-800 font-semibold text-sm">SnapLink AI Assistant</p>
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                                            <span className="text-emerald-600 text-xs font-medium">Online</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-5 space-y-4 min-h-[280px] bg-white">
                                    {[
                                        { role: 'user', msg: 'How is my traffic performing this week?' },
                                        { role: 'ai', msg: 'Your links got 2,847 clicks this week — 34% higher than last week! 🚀\n\nTop insight: 68% of traffic comes from mobile. Consider optimizing your landing pages for mobile users.' },
                                        { role: 'user', msg: 'When is the best time to post?' },
                                        { role: 'ai', msg: 'Based on your audience data, post between 2–4 PM on Tuesdays and Thursdays. Your engagement peaks during lunch hours in Eastern Time zones.' },
                                    ].map((m, i) => (
                                        <motion.div key={i}
                                            initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }}
                                            viewport={{ once: true }} transition={{ delay: i * 0.18 }}
                                            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${m.role === 'user'
                                                ? 'bg-indigo-600 text-white'
                                                : 'bg-slate-50 border border-slate-100 text-slate-700'
                                                }`}>
                                                {m.msg.split('\n').map((line, li) => <p key={li} className={li > 0 ? 'mt-1.5' : ''}>{line}</p>)}
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                                <div className="px-5 py-3 border-t border-slate-100 bg-white">
                                    <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5">
                                        <span className="text-slate-400 text-sm flex-1">Ask anything about your links...</span>
                                        <button className="p-1.5 bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors">
                                            <ArrowRight className="w-3.5 h-3.5 text-white" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* ── Pricing ────────────────────────────── */}
            <section className="py-24 bg-white" id="pricing">
                <div className="max-w-5xl mx-auto px-6 lg:px-8">
                    <motion.div initial="hidden" whileInView="show" variants={stagger} viewport={{ once: true }} className="text-center mb-16">
                        <motion.span variants={fadeUp} className="badge-primary inline-flex mb-4">Pricing</motion.span>
                        <motion.h2 variants={fadeUp} className="text-4xl font-black text-slate-900 mb-4 tracking-tight">
                            Simple, transparent pricing
                        </motion.h2>
                        <motion.p variants={fadeUp} className="text-slate-500 text-lg">Start free, upgrade when you need more power</motion.p>
                    </motion.div>

                    <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}
                        className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {PRICING_PLANS.map((plan) => (
                            <motion.div key={plan.name} variants={fadeUp}
                                className={`relative flex flex-col p-8 rounded-2xl border-2 transition-all ${plan.highlight
                                    ? 'border-indigo-500 bg-indigo-600 text-white shadow-brand-lg'
                                    : 'border-slate-200 bg-white hover:border-indigo-200 hover:shadow-card-md'
                                    }`}
                            >
                                {plan.badge && (
                                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                                        <span className="px-4 py-1 text-xs font-bold bg-amber-400 text-amber-900 rounded-full shadow-sm">
                                            {plan.badge}
                                        </span>
                                    </div>
                                )}
                                <div className="mb-6">
                                    <h3 className={`text-xl font-bold mb-1 ${plan.highlight ? 'text-white' : 'text-slate-800'}`}>{plan.name}</h3>
                                    <p className={`text-sm ${plan.highlight ? 'text-indigo-200' : 'text-slate-500'}`}>{plan.desc}</p>
                                </div>
                                <div className="flex items-end gap-1 mb-8">
                                    <span className={`text-4xl font-black ${plan.highlight ? 'text-white' : 'text-slate-900'}`}>{plan.price}</span>
                                    <span className={`mb-1 ${plan.highlight ? 'text-indigo-200' : 'text-slate-400'}`}>{plan.period}</span>
                                </div>
                                <ul className="space-y-3 flex-1 mb-8">
                                    {plan.features.map(f => (
                                        <li key={f} className="flex items-center gap-3 text-sm">
                                            <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${plan.highlight ? 'bg-white/20' : 'bg-emerald-50'}`}>
                                                <Check className={`w-3 h-3 ${plan.highlight ? 'text-white' : 'text-emerald-600'}`} />
                                            </div>
                                            <span className={plan.highlight ? 'text-indigo-100' : 'text-slate-600'}>{f}</span>
                                        </li>
                                    ))}
                                </ul>
                                <Link
                                    to="/signup"
                                    className={`w-full text-center font-semibold py-3 rounded-xl transition-all ${plan.highlight
                                        ? 'bg-white text-indigo-600 hover:bg-indigo-50 shadow-sm'
                                        : 'btn-primary'
                                        }`}
                                >
                                    {plan.cta}
                                </Link>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* ── Testimonials ───────────────────────── */}
            <section className="py-20 bg-slate-50 border-y border-slate-100">
                <div className="max-w-3xl mx-auto px-6 text-center">
                    <motion.span initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
                        className="badge-primary inline-flex mb-10">Testimonials</motion.span>
                    <AnimatePresence mode="wait">
                        <motion.div key={activeTestimonial}
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.4 }}
                            className="card shadow-card-md p-10 mb-8"
                        >
                            <div className="flex justify-center mb-5">
                                {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />)}
                            </div>
                            <p className="text-xl text-slate-700 leading-relaxed mb-8 font-medium">
                                "{TESTIMONIALS[activeTestimonial].text}"
                            </p>
                            <div className="flex items-center justify-center gap-3">
                                <div className={`w-11 h-11 rounded-full bg-gradient-to-br ${TESTIMONIALS[activeTestimonial].color} flex items-center justify-center text-white font-bold text-sm`}>
                                    {TESTIMONIALS[activeTestimonial].avatar}
                                </div>
                                <div className="text-left">
                                    <p className="text-slate-800 font-semibold text-sm">{TESTIMONIALS[activeTestimonial].name}</p>
                                    <p className="text-slate-400 text-xs">{TESTIMONIALS[activeTestimonial].role}</p>
                                </div>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                    <div className="flex justify-center gap-2">
                        {TESTIMONIALS.map((_, i) => (
                            <button key={i} onClick={() => setActiveTestimonial(i)}
                                className={`h-2 rounded-full transition-all duration-300 ${i === activeTestimonial ? 'w-7 bg-indigo-500' : 'w-2 bg-slate-300'}`}
                            />
                        ))}
                    </div>
                </div>
            </section>

            {/* ── CTA ────────────────────────────────── */}
            <section className="py-24 bg-gradient-to-br from-indigo-600 to-purple-700 relative overflow-hidden">
                <div className="absolute inset-0 grid-bg opacity-20" />
                <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-white/5 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-purple-400/10 rounded-full blur-3xl" />
                <div className="max-w-3xl mx-auto px-6 text-center relative z-10">
                    <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/15 text-white text-xs font-semibold rounded-full border border-white/20 mb-8">
                            <Sparkles className="w-3.5 h-3.5" />
                            Get Started Today
                        </span>
                        <h2 className="text-4xl lg:text-5xl font-black text-white mb-6 leading-tight tracking-tight">
                            Ready to supercharge<br />
                            <span className="text-indigo-200">your link strategy?</span>
                        </h2>
                        <p className="text-indigo-200 text-lg mb-10 max-w-xl mx-auto">
                            Join thousands of marketers and developers using SnapLink AI to track, optimize, and grow their online presence.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link to="/signup" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-indigo-600 font-bold text-base rounded-2xl hover:bg-indigo-50 transition-all shadow-lg hover:shadow-xl active:scale-95">
                                Start for Free <ArrowRight className="w-5 h-5" />
                            </Link>
                            <Link to="/features" className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-white/30 text-white font-bold text-base rounded-2xl hover:bg-white/10 transition-all active:scale-95">
                                View All Features
                            </Link>
                        </div>
                        <p className="text-indigo-300 text-sm mt-6">Free forever · No credit card required</p>
                    </motion.div>
                </div>
            </section>
        </div>
    );
};

export default HomePage;
