import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Zap,
  ArrowRight,
  Link2,
  BarChart2,
  Sparkles,
  QrCode,
  Check,
  ChevronDown,
  Home,
  Megaphone,
  Users,
  Link as LinkIcon,
  LayoutGrid,
  Phone,
  BarChart3,
  Percent,
  Plus,
  CheckCircle2,
} from 'lucide-react';

/* --------------------------- grayscale brand logos --------------------------- */
const GoogleMark = () => (
  <span className="text-[22px] font-semibold tracking-tight text-slate-400" style={{ fontFamily: "'Plus Jakarta Sans', Inter, sans-serif" }}>Google</span>
);

const MicrosoftMark = () => (
  <span className="flex items-center gap-2 text-slate-400">
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor" aria-hidden="true">
      <path d="M3 3h9v9H3zM12 3h9v9h-9zM3 12h9v9H3zM12 12h9v9h-9z" />
    </svg>
    <span className="text-[19px] font-semibold">Microsoft</span>
  </span>
);

const ShopifyMark = () => (
  <span className="flex items-center gap-1.5 text-slate-400">
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor" aria-hidden="true">
      <path d="M15.34 4.58c.02.13-.05.3-.06.35-.14-.02-.3-.03-.48-.02-.4-.6-.98-.87-1.73-.8-1.06.1-2.13.87-2.9 2.06-.44.68-.75 1.5-.87 2.3l-1.03.32c-.23.07-.24.09-.27.31-.02.17-.6 4.63-.6 4.63l4.9.92 2.72-.6s-.66-9.3-.68-9.47zm-2.02.13c-.24.07-.5.15-.78.24.02-.36.07-.86.26-1.22.53.13.72.6.52.98zm-1.1.34c-.52.16-1.08.33-1.65.5.17-.66.5-1.32.9-1.71.15-.15.36-.31.6-.4-.2.55-.08 1.13.15 1.61z" />
      <path d="M15.9 5.06c-.14 0-.26.02-.4.04.02.02-.15 9.35-.15 9.35l2.7-.6S17.1 5.5 17.1 5.4c-.03-.2-.1-.24-.24-.28-.1-.02-.85-.06-.96-.06z" />
    </svg>
    <span className="text-[19px] font-bold italic tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', Inter, sans-serif" }}>shopify</span>
  </span>
);

const AmazonMark = () => (
  <span className="flex flex-col items-center leading-none text-slate-400">
    <span className="text-[19px] font-bold lowercase tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', Inter, sans-serif" }}>amazon</span>
    <svg viewBox="0 0 60 10" className="w-12 h-2.5 -mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <path d="M4 2c14 8 38 8 50 2" />
      <path d="M50 1l5 2.5-4.5 3" fill="currentColor" stroke="none" />
    </svg>
  </span>
);

const NotionMark = () => (
  <span className="flex items-center gap-2 text-slate-400">
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor" aria-hidden="true">
      <path d="M4.5 3.5h11.6c1 0 1.6.7 1.5 1.7l-.9 12.6c-.1.9-.8 1.6-1.7 1.7L5.6 20.6c-1 .1-1.8-.6-1.8-1.6V5.3c0-1 .4-1.8.7-1.8zm3 3.4v10.3l1.9-.1V10l3.4 7 2-.2V6.4l-1.9.2v6.4L9.5 6.7l-2 .2z" />
    </svg>
    <span className="text-[19px] font-semibold">Notion</span>
  </span>
);

const SpotifyMark = () => (
  <span className="flex items-center gap-2 text-slate-400">
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor" aria-hidden="true">
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm4.5 14.4c-.2.3-.6.4-.9.2-2.5-1.5-5.6-1.9-9.3-1-.4.1-.7-.2-.8-.5-.1-.4.2-.7.5-.8 4-.9 7.5-.5 10.3 1.2.3.2.4.6.2.9zm1.2-2.7c-.2.4-.7.5-1.1.3-2.9-1.8-7.2-2.3-10.6-1.2-.4.1-.9-.1-1-.5-.1-.4.1-.9.5-1 3.9-1.2 8.6-.6 12 1.4.3.1.4.6.2 1zm.1-2.9C14.3 8.8 9 8.6 5.9 9.6c-.5.2-1-.1-1.2-.6-.2-.5.1-1 .6-1.2 3.6-1.1 9.4-.9 13.2 1.4.5.3.6.9.4 1.4-.3.4-.9.6-1.1.6z" />
    </svg>
    <span className="text-[19px] font-bold tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', Inter, sans-serif" }}>Spotify</span>
  </span>
);

const trustedLogos = [GoogleMark, MicrosoftMark, ShopifyMark, AmazonMark, NotionMark, SpotifyMark];

/* -------------------------------- quick features ------------------------------- */
const quickFeatures = [
  { icon: Link2, title: 'Smart Short Links', desc: 'Create clean, branded links in seconds.', grad: 'from-[#8B5CF6]/20 to-[#7C3AED]/15', iconColor: 'text-[#7C3AED]' },
  { icon: BarChart3, title: 'Real-time Analytics', desc: 'Track clicks, locations, and engagement instantly.', grad: 'from-[#A78BFA]/20 to-[#8B5CF6]/15', iconColor: 'text-[#7C3AED]' },
  { icon: Sparkles, title: 'AI-Powered Insights', desc: 'Get smart recommendations with Google Gemini AI.', grad: 'from-[#C4B5FD]/25 to-[#A78BFA]/15', iconColor: 'text-[#7C3AED]' },
  { icon: QrCode, title: 'QR Code Generator', desc: 'Generate and share beautiful QR codes for your links.', grad: 'from-[#8B5CF6]/20 to-[#A78BFA]/15', iconColor: 'text-[#7C3AED]' },
];

/* --------------------------------- deep sections -------------------------------- */
const steps = [
  { n: '1', icon: Link2, title: 'Paste Your URL', desc: 'Drop any long link into our shortener.' },
  { n: '2', icon: Sparkles, title: 'AI Optimizes It', desc: 'Google Gemini AI suggests better versions.' },
  { n: '3', icon: BarChart2, title: 'Track & Grow', desc: 'Monitor performance and improve results.' },
];

const plans = [
  { name: 'Free', price: '$0', period: '/month', desc: 'Perfect for individuals getting started.', features: ['Up to 100 links', 'Basic analytics', 'QR code generation', 'Custom aliases'], cta: 'Get Started Free', popular: false },
  { name: 'Pro', price: '$12', period: '/month', desc: 'For growing businesses and creators.', features: ['Unlimited links', 'Advanced analytics', 'AI-powered insights', 'Team collaboration', 'Custom domains'], cta: 'Start Free Trial', popular: true },
  { name: 'Business', price: '$39', period: '/month', desc: 'For agencies and enterprises.', features: ['Everything in Pro', 'Priority support', 'SLA guarantee', 'Bulk import/export', 'SSO & team roles'], cta: 'Contact Sales', popular: false },
];

const faqs = [
  { q: 'Is SnapLink AI free to use?', a: 'Yes. The Free plan is free forever and includes up to 100 links, basic analytics, QR code generation, and custom aliases. No credit card is required to start.' },
  { q: 'How does the AI insights feature work?', a: 'SnapLink AI uses Google Gemini to analyze your click patterns, identify top-performing links, and recommend the best times and channels to share your links for maximum engagement.' },
  { q: 'Can I use my own custom domain?', a: 'Custom domains are available on the Pro and Business plans. You can connect your own domain and brand every short link with your company name.' },
  { q: 'Is my data secure?', a: 'Absolutely. We use industry-standard encryption, secure JWT authentication with refresh token rotation, and bcrypt password hashing. Your data is stored securely in MongoDB Atlas.' },
];

const barHeights = [40, 60, 50, 75, 85, 92, 100];

/* line chart points for the hero preview (viewBox 0 0 280 110) */
const chartPoints = [
  [10, 82], [50, 70], [90, 74], [130, 55], [170, 48], [210, 34], [250, 22], [270, 18],
];

const HomePage = () => {
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div className="bg-[#F7F7FD] dark:bg-[#0B0D17] text-[#1D1B33] dark:text-white transition-colors overflow-x-hidden">
        {/* ============================== HERO ============================== */}
        <section className="relative overflow-hidden">
          {/* soft purple blobs */}
          <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
            <div className="absolute -top-32 right-[8%] w-[560px] h-[560px] rounded-full bg-gradient-to-br from-[#8B5CF6]/15 to-[#A78BFA]/5 blur-3xl" />
            <div className="absolute top-24 -right-40 w-[480px] h-[480px] rounded-full bg-[#A78BFA]/10 blur-3xl" />
            <div className="absolute -top-24 -left-32 w-[420px] h-[420px] rounded-full bg-[#8B5CF6]/5 blur-3xl" />
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-16 lg:pt-20 lg:pb-20">
            <div className="grid lg:grid-cols-[1fr_1.05fr] gap-12 lg:gap-10 items-center">
              {/* Left */}
              <div className="max-w-xl">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-white/5 border border-[#E4D8FF] dark:border-[#7C3AED]/30 shadow-sm mb-7">
                  <Sparkles className="w-4 h-4 text-[#7C3AED]" />
                  <span className="text-sm font-semibold text-[#7C3AED] dark:text-[#A78BFA]">Powered by Google Gemini AI</span>
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-[3.6rem] font-extrabold leading-[1.08] tracking-tight mb-6 text-[#1D1B33] dark:text-white">
                  Shorten Smarter.<br />
                  Track Everything.<br />
                  <span className="text-[#7C3AED] dark:text-[#A78BFA]">Grow Faster.</span>
                </h1>

                <p className="text-lg text-[#5A566E] dark:text-white/65 leading-relaxed mb-8">
                  Turn long URLs into powerful, trackable links with AI-driven analytics, insights, and campaign tools.
                </p>

                {/* two CTAs */}
                <div className="flex flex-wrap items-center gap-4 mb-7">
                  <Link to="/signup" className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl text-[15px] font-semibold text-white bg-gradient-to-r from-[#7C3AED] to-[#8B5CF6] shadow-lg shadow-[#7C3AED]/30 hover:shadow-xl hover:shadow-[#7C3AED]/40 hover:-translate-y-0.5 transition-all">
                    Get Started Free <ArrowRight className="w-4.5 h-4.5" />
                  </Link>
                  <Link to="/login" className="px-8 py-3.5 rounded-2xl text-[15px] font-semibold text-[#1D1B33] dark:text-white bg-white dark:bg-white/5 border border-[#E5E7EB] dark:border-white/15 hover:border-[#7C3AED]/50 hover:text-[#7C3AED] dark:hover:text-white transition-all shadow-sm">
                    Sign In
                  </Link>
                </div>

                {/* trust checks */}
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-[#5A566E] dark:text-white/60">
                  {['Free plan available', 'No credit card required', 'Set up in seconds'].map((t) => (
                    <span key={t} className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-[#7C3AED]" strokeWidth={2.5} /> {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Right — dashboard preview (visual only) */}
              <div className="relative">
                <motion.div
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="rounded-2xl bg-white dark:bg-[#15172B] border border-[#E9E6F5] dark:border-white/10 shadow-[0_24px_70px_-20px_rgba(124,58,237,0.25)] overflow-hidden"
                  aria-hidden="true"
                >
                  {/* window bar */}
                  <div className="flex items-center gap-1.5 px-4 py-3 border-b border-[#F0EEF8] dark:border-white/10">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#FEBC2E]" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#28C840]" />
                  </div>

                  <div className="flex">
                    {/* mini sidebar */}
                    <div className="hidden sm:flex flex-col w-40 border-r border-[#F0EEF8] dark:border-white/10 p-3 gap-1 shrink-0">
                      <div className="flex items-center gap-2 px-2 py-2.5 mb-1">
                        <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#7C3AED] to-[#8B5CF6] flex items-center justify-center">
                          <Zap className="w-3 h-3 text-white" strokeWidth={2.5} />
                        </div>
                        <span className="text-[11px] font-bold text-[#1D1B33] dark:text-white">SnapLink <span className="text-[#7C3AED]">AI</span></span>
                      </div>
                      {[
                        { icon: Home, label: 'Dashboard', active: true },
                        { icon: LinkIcon, label: 'My Links' },
                        { icon: BarChart2, label: 'Analytics' },
                        { icon: Megaphone, label: 'Campaigns' },
                        { icon: LayoutGrid, label: 'QR Center' },
                        { icon: Users, label: 'Team' },
                      ].map(({ icon: I, label, active }) => (
                        <div key={label} className={`flex items-center gap-2 px-2.5 py-2 rounded-lg text-[11px] font-semibold ${active ? 'bg-[#F0E9FF] dark:bg-[#7C3AED]/20 text-[#7C3AED] dark:text-[#A78BFA]' : 'text-[#5A566E] dark:text-white/60'}`}>
                          <I className="w-3.5 h-3.5" /> {label}
                        </div>
                      ))}
                    </div>

                    {/* content */}
                    <div className="flex-1 p-4 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-4">
                        <div>
                          <p className="text-sm font-bold text-[#1D1B33] dark:text-white">Dashboard Overview</p>
                          <p className="text-[10px] text-[#8B87A0] dark:text-white/50">Your link performance at a glance</p>
                        </div>
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-white bg-gradient-to-r from-[#7C3AED] to-[#8B5CF6] px-2.5 py-1.5 rounded-lg shrink-0">
                          <Plus className="w-3 h-3" /> Create Link
                        </span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
                        {[
                          { icon: LinkIcon, l: 'Total Links', v: '1,247', bg: 'bg-[#F0E9FF]', color: 'text-[#7C3AED]' },
                          { icon: Phone, l: 'Total Clicks', v: '45.2K', bg: 'bg-[#F0E9FF]', color: 'text-[#7C3AED]' },
                          { icon: Users, l: 'Unique Clicks', v: '32.8K', bg: 'bg-[#F0E9FF]', color: 'text-[#7C3AED]' },
                          { icon: Percent, l: 'AI Score', v: '94%', bg: 'bg-emerald-50 dark:bg-emerald-500/15', color: 'text-emerald-500' },
                        ].map((s) => (
                          <div key={s.l} className="rounded-xl border border-[#F0EEF8] dark:border-white/10 bg-[#FAF9FE] dark:bg-white/5 p-2.5">
                            <span className={`w-6 h-6 rounded-lg ${s.bg} flex items-center justify-center mb-1.5`}>
                              <s.icon className={`w-3.5 h-3.5 ${s.color}`} />
                            </span>
                            <p className="text-sm font-bold text-[#1D1B33] dark:text-white leading-none">{s.v}</p>
                            <p className="text-[9px] text-[#8B87A0] dark:text-white/50 mt-1">{s.l}</p>
                          </div>
                        ))}
                      </div>

                      <div className="rounded-xl border border-[#F0EEF8] dark:border-white/10 bg-[#FAF9FE] dark:bg-white/5 p-3">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-[11px] font-bold text-[#1D1B33] dark:text-white">Click Performance</p>
                          <span className="text-[9px] font-bold text-[#1D1B33] dark:text-white bg-white dark:bg-white/10 border border-[#F0EEF8] dark:border-white/10 rounded-full px-2 py-0.5 shadow-sm flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#7C3AED]" /> 12.4K clicks
                          </span>
                        </div>
                        <svg viewBox="0 0 280 110" className="w-full h-24" preserveAspectRatio="none" aria-hidden="true">
                          <defs>
                            <linearGradient id="heroArea" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.25" />
                              <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0" />
                            </linearGradient>
                          </defs>
                          <path d={`M${chartPoints.map((p) => p.join(',')).join(' L')} L270,110 L10,110 Z`} fill="url(#heroArea)" />
                          <path d={`M${chartPoints.map((p) => p.join(',')).join(' L')}`} fill="none" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" />
                          {chartPoints.map(([x, y], i) => (
                            <circle key={i} cx={x} cy={y} r="3" fill="#fff" stroke="#7C3AED" strokeWidth="2" />
                          ))}
                          <circle cx="270" cy="18" r="4.5" fill="#7C3AED" />
                        </svg>
                        <div className="flex justify-between text-[8px] text-[#8B87A0] dark:text-white/50 mt-1 px-1">
                          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => <span key={d}>{d}</span>)}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================== TRUSTED BY ============================== */}
        <section className="pb-14">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-center text-base text-[#5A566E] dark:text-white/60 mb-9">Trusted by marketers, creators, and growing businesses</p>
            <div className="flex flex-wrap items-center justify-center gap-x-14 gap-y-7">
              {trustedLogos.map((Mark, i) => (
                <div key={i} className="opacity-70 hover:opacity-100 transition-opacity">
                  <Mark />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============================== QUICK FEATURES ============================== */}
        <section id="features" className="pb-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {quickFeatures.map((f, i) => (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07 }}
                  className="flex items-start gap-4 p-5 rounded-2xl bg-white dark:bg-[#15172B] border border-[#ECEAF6] dark:border-white/10 shadow-[0_2px_12px_rgba(29,27,51,0.04)] hover:shadow-lg hover:shadow-[#7C3AED]/10 hover:-translate-y-1 transition-all"
                >
                  <span className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.grad} flex items-center justify-center shrink-0 ${f.iconColor}`}>
                    <f.icon className="w-6 h-6" strokeWidth={2} />
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-[15px] font-bold text-[#1D1B33] dark:text-white mb-1">{f.title}</h3>
                    <p className="text-sm text-[#5A566E] dark:text-white/60 leading-snug">{f.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ============================== HOW IT WORKS ============================== */}
        <section className="py-8 lg:py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="rounded-3xl bg-gradient-to-br from-[#7C3AED]/[0.04] to-[#8B5CF6]/[0.07] border border-[#7C3AED]/10 p-8 lg:p-12">
              <div className="grid lg:grid-cols-[1fr_2fr] gap-8 items-center">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">How it works?</h2>
                  <p className="text-sm text-[#5A566E] dark:text-white/60 mt-2">Turn long URLs into smart, trackable links in three simple steps.</p>
                </div>
                <div className="grid sm:grid-cols-3 gap-6">
                  {steps.map((s, i) => (
                    <div key={s.n} className="relative">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#8B5CF6] flex items-center justify-center text-white shadow-lg shadow-[#7C3AED]/25">
                          <s.icon className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-bold text-[#7C3AED]">STEP {s.n}</span>
                      </div>
                      <h3 className="text-sm font-bold mb-1">{s.title}</h3>
                      <p className="text-xs text-[#5A566E] dark:text-white/60 leading-relaxed">{s.desc}</p>
                      {i < steps.length - 1 && (
                        <ArrowRight className="hidden sm:block absolute -right-4 top-4 w-4 h-4 text-[#7C3AED]/40" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================== PRICING + ANALYTICS ============================== */}
        <section id="pricing" className="py-20 lg:py-28 bg-white dark:bg-transparent border-y border-[#E5E7EB] dark:border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">Simple, transparent <span className="text-[#7C3AED] dark:text-[#A78BFA]">pricing</span></h2>
              <p className="text-[#5A566E] dark:text-white/60">Choose the plan that fits your needs. No credit card required to start.</p>
            </div>

            <div className="grid lg:grid-cols-2 gap-10 items-start">
              {/* Pricing cards */}
              <div className="grid sm:grid-cols-3 gap-4">
                {plans.map((p) => (
                  <div key={p.name} className={`relative rounded-2xl p-6 flex flex-col ${p.popular ? 'bg-white dark:bg-[#15172B] border-2 border-[#7C3AED] shadow-xl shadow-[#7C3AED]/10' : 'bg-white dark:bg-[#15172B] border border-[#E5E7EB] dark:border-white/10'}`}>
                    {p.popular && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-bold text-white bg-gradient-to-r from-[#7C3AED] to-[#8B5CF6] px-3 py-1 rounded-full">Most Popular</span>
                    )}
                    <h3 className="text-sm font-bold">{p.name}</h3>
                    <div className="flex items-baseline gap-1 mt-2 mb-3">
                      <span className="text-3xl font-extrabold">{p.price}</span>
                      <span className="text-xs text-[#8B87A0] dark:text-white/50">{p.period}</span>
                    </div>
                    <p className="text-xs text-[#5A566E] dark:text-white/60 mb-4">{p.desc}</p>
                    <ul className="space-y-2.5 mb-6 flex-1">
                      {p.features.map((f) => (
                        <li key={f} className="flex items-start gap-2 text-xs text-[#5A566E] dark:text-white/60">
                          <Check className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" strokeWidth={3} /> {f}
                        </li>
                      ))}
                    </ul>
                    <Link to="/signup" className={`w-full py-2.5 rounded-xl text-sm font-semibold text-center transition-all ${p.popular ? 'text-white bg-gradient-to-r from-[#7C3AED] to-[#8B5CF6] shadow-md shadow-[#7C3AED]/25 hover:shadow-lg hover:-translate-y-0.5' : 'border border-[#E5E7EB] dark:border-white/15 hover:border-[#7C3AED] hover:text-[#7C3AED]'}`}>
                      {p.cta}
                    </Link>
                  </div>
                ))}
              </div>

              {/* Analytics preview */}
              <div id="analytics" className="rounded-2xl bg-white dark:bg-[#15172B] border border-[#E5E7EB] dark:border-white/10 p-6">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-sm font-bold">Analytics Preview</h3>
                  <span className="flex items-center gap-1.5 text-[10px] font-semibold text-emerald-500">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live Data
                  </span>
                </div>
                <div className="flex items-end gap-2 h-32 mb-4">
                  {barHeights.map((h, i) => (
                    <div key={i} className="flex-1 rounded-t-lg bg-gradient-to-t from-[#7C3AED] to-[#A78BFA]" style={{ height: `${h}%` }} />
                  ))}
                </div>
                <div className="flex justify-between text-[9px] text-[#8B87A0] dark:text-white/50 mb-5">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => <span key={d}>{d}</span>)}
                </div>
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { l: 'Total Clicks', v: '45.2K' },
                    { l: 'Unique Clicks', v: '32.8K' },
                    { l: 'Growth', v: '+42%' },
                    { l: 'Countries', v: '24' },
                  ].map((s) => (
                    <div key={s.l} className="rounded-xl bg-[#F7F7FD] dark:bg-white/5 p-3 text-center">
                      <p className="text-base font-extrabold">{s.v}</p>
                      <p className="text-[9px] text-[#8B87A0] dark:text-white/50 mt-0.5">{s.l}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================== FAQ ============================== */}
        <section className="py-20 lg:py-28">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">Frequently Asked <span className="text-[#7C3AED] dark:text-[#A78BFA]">Questions</span></h2>
              <p className="text-[#5A566E] dark:text-white/60">Got questions? We've got answers.</p>
            </div>

            <div className="space-y-3">
              {faqs.map((faq, i) => (
                <div key={i} className="rounded-xl bg-white dark:bg-[#15172B] border border-[#E5E7EB] dark:border-white/10 overflow-hidden">
                  <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between px-5 py-4 text-left">
                    <span className="text-sm font-semibold pr-4">{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 text-[#7C3AED] shrink-0 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                  </button>
                  {openFaq === i && <p className="px-5 pb-4 text-sm text-[#5A566E] dark:text-white/60 leading-relaxed">{faq.a}</p>}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============================== CTA ============================== */}
        <section className="pb-20 lg:pb-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#7C3AED] to-[#8B5CF6] px-8 py-14 lg:py-20 text-center text-white">
              <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
                <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-white/10 blur-3xl" />
                <div className="absolute -bottom-24 -left-16 w-72 h-72 rounded-full bg-white/10 blur-3xl" />
              </div>
              <div className="relative flex flex-col sm:flex-row items-center justify-between gap-8">
                <div className="max-w-xl">
                  <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-white/15 mb-5">
                    <Zap className="w-5 h-5" />
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">Ready to Make Every Link Smarter?</h2>
                  <p className="text-sm text-white/80">Join thousands of creators, marketers, and businesses using SnapLink AI.</p>
                </div>
                <Link to="/signup" className="shrink-0 inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-white text-[#7C3AED] font-semibold text-sm shadow-xl hover:bg-white/90 transition-all">
                  Get Started Free <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>
    </div>
  );
};

export default HomePage;
