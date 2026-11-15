import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Zap,
  ArrowRight,
  Link2,
  BarChart2,
  Brain,
  QrCode,
  Users,
  Megaphone,
  Check,
  ChevronDown,
} from 'lucide-react';
import api from '@/lib/api';

/* ---------------------------------- logos ---------------------------------- */
const GoogleLogo = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

const MicrosoftLogo = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
    <path fill="#F25022" d="M1 1h10v10H1z" />
    <path fill="#7FBA00" d="M13 1h10v10H13z" />
    <path fill="#00A4EF" d="M1 13h10v10H1z" />
    <path fill="#FFB900" d="M13 13h10v10H13z" />
  </svg>
);

const GitHubLogo = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true" fill="currentColor">
    <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.55 0-.27-.01-1.17-.02-2.12-3.2.7-3.88-1.36-3.88-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.03 1.76 2.69 1.25 3.35.96.1-.75.4-1.25.72-1.54-2.55-.29-5.24-1.28-5.24-5.68 0-1.26.45-2.28 1.18-3.09-.12-.29-.51-1.46.11-3.05 0 0 .96-.31 3.15 1.18a10.9 10.9 0 0 1 5.74 0c2.19-1.49 3.15-1.18 3.15-1.18.62 1.59.23 2.76.11 3.05.74.81 1.18 1.83 1.18 3.09 0 4.41-2.69 5.38-5.25 5.67.41.35.77 1.05.77 2.12 0 1.53-.01 2.76-.01 3.14 0 .3.2.67.8.55A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5z" />
  </svg>
);

const NotionLogo = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true" fill="currentColor">
    <path d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L17.86 2.32c-.466-.373-1.07-.793-2.055-.7l-12.89.84c-.466.046-.56.28-.373.466l1.82.91zm.793 2.474v12.65c0 .746.373 1.026 1.213.98l14.12-.84c.84-.046.933-.56.933-1.12V5.69c0-.56-.233-.933-.746-.887l-14.724.84c-.56.047-.84.327-.84.887zm13.888.56c.093.42 0 .84-.42.887l-.7.14v9.33c-.607.327-1.167.513-1.634.513-.746 0-.933-.233-1.493-.933l-4.577-7.186v6.953l1.446.327s0 .84-1.167.84l-3.22.186c-.093-.186 0-.653.327-.746l.84-.233V8.45l-1.167-.093c-.093-.42.187-1.026.84-1.073l3.454-.233 4.763 7.28v-6.44l-1.213-.14c-.093-.513.28-.887.746-.933l3.22-.186zM2.546 1.026l13.262-.887c1.167-.093 1.493.093 1.96.466l2.706 1.867c.373.28.513.373.513.887l-.093 15.05c0 .746-.373 1.026-1.26 1.073l-14.4.84c-.7.046-1.027-.14-1.4-.607L1.66 16.76c-.42-.56-.56-.933-.56-1.4V2.66c0-.606.373-1.073.98-1.12z" />
  </svg>
);

const VercelLogo = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true" fill="currentColor">
    <path d="M12 2l10 18H2L12 2z" />
  </svg>
);

const MetaLogo = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true" fill="#0081FB">
    <path d="M12 2C6.48 2 2 6.48 2 12c0 4.99 3.66 9.13 8.44 9.88v-6.99H7.9v-2.89h2.54V9.85c0-2.51 1.49-3.9 3.78-3.9 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.87h2.78l-.44 2.89h-2.34v6.99C18.34 21.13 22 16.99 22 12c0-5.52-4.48-10-10-10z" />
  </svg>
);

const companies = [
  { name: 'Google', Logo: GoogleLogo },
  { name: 'Microsoft', Logo: MicrosoftLogo },
  { name: 'GitHub', Logo: GitHubLogo },
  { name: 'Notion', Logo: NotionLogo },
  { name: 'Vercel', Logo: VercelLogo },
  { name: 'Meta', Logo: MetaLogo },
];

const features = [
  { icon: Link2, title: 'Smart URL Shortening', desc: 'Create clean, branded short links instantly.', color: 'bg-primary/10 text-primary' },
  { icon: BarChart2, title: 'Real-time Analytics', desc: 'Track clicks, locations, devices, and referrers.', color: 'bg-secondary/10 text-secondary' },
  { icon: Brain, title: 'AI-Powered Insights', desc: 'Get intelligent recommendations to improve performance.', color: 'bg-violet-100 text-violet-600' },
  { icon: QrCode, title: 'QR Code Generator', desc: 'Generate customizable QR codes for any link.', color: 'bg-pink-100 text-pink-600' },
  { icon: Users, title: 'Team Collaboration', desc: 'Invite team members and manage links together.', color: 'bg-amber-100 text-amber-600' },
  { icon: Megaphone, title: 'Campaign Management', desc: 'Organize links into campaigns and track ROI.', color: 'bg-emerald-100 text-emerald-600' },
];

const steps = [
  { n: '1', icon: Link2, title: 'Paste Your URL', desc: 'Drop any long link into our shortener.' },
  { n: '2', icon: Brain, title: 'AI Optimizes It', desc: 'Google Gemini AI suggests better versions.' },
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

const HomePage = () => {
  const [shortenUrl, setShortenUrl] = useState('');
  const [shortening, setShortening] = useState(false);
  const [shortened, setShortened] = useState(null);
  const [error, setError] = useState(null);
  const [openFaq, setOpenFaq] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleShorten = async (e) => {
    e.preventDefault();
    if (!shortenUrl.trim()) return;
    setShortening(true);
    setError(null);
    try {
      const { data } = await api.post('/links/shorten', { originalUrl: shortenUrl });
      setShortened(data.data?.shortUrl || data.data?.shortCode);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to shorten link');
    } finally {
      setShortening(false);
    }
  };

  const handleCopy = async () => {
    if (!shortened) return;
    try {
      await navigator.clipboard.writeText(shortened);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* noop */ }
  };

  return (
    <div className="bg-[#F7F8FC] dark:bg-[#0B0D17] text-[#172033] dark:text-white transition-colors">
        {/* ============================== HERO ============================== */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
            <div className="absolute -top-24 -left-24 w-[480px] h-[480px] rounded-full bg-[#5145E5]/10 blur-3xl" />
            <div className="absolute top-40 -right-32 w-[520px] h-[520px] rounded-full bg-[#7C3AED]/10 blur-3xl" />
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 lg:pt-24 lg:pb-28">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
              {/* Left */}
              <div className="max-w-xl">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#5145E5]/5 border border-[#5145E5]/15 mb-6">
                  <Zap className="w-3.5 h-3.5 text-[#5145E5]" />
                  <span className="text-xs font-semibold text-[#5145E5]">Powered by Google Gemini AI</span>
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-[3.4rem] font-extrabold leading-[1.1] tracking-tight mb-6">
                  Shorten Smarter.<br />
                  Track Everything.<br />
                  <span className="bg-gradient-to-r from-[#5145E5] to-[#7C3AED] bg-clip-text text-transparent">Grow Faster.</span>
                </h1>

                <p className="text-base sm:text-lg text-[#64748B] leading-relaxed mb-8">
                  Transform long URLs into powerful, trackable short links with AI-driven analytics, insights, and campaign tools.
                </p>

                <form onSubmit={handleShorten} className="flex flex-col sm:flex-row gap-3 mb-4">
                  <div className="relative flex-1">
                    <Link2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[#94A3B8]" />
                    <input
                      type="url"
                      value={shortenUrl}
                      onChange={(e) => setShortenUrl(e.target.value)}
                      placeholder="Paste your long URL here..."
                      className="w-full pl-11 pr-4 py-3.5 rounded-xl text-sm bg-white dark:bg-white/5 border border-[#E5E7EB] dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-[#5145E5]/30 focus:border-[#5145E5] transition"
                    />
                  </div>
                  <button type="submit" disabled={shortening || !shortenUrl.trim()} className="btn-primary px-6 py-3.5 text-sm whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed">
                    {shortening ? 'Shortening…' : (<>Shorten <Zap className="w-4 h-4" /></>)}
                  </button>
                </form>

                {error && <p className="text-sm text-red-500 mb-3">{error}</p>}
                {shortened && (
                  <div className="flex items-center gap-2 mb-3 p-3 rounded-xl bg-[#5145E5]/5 border border-[#5145E5]/15">
                    <span className="flex-1 text-sm font-mono text-[#5145E5] truncate">{shortened}</span>
                    <button onClick={handleCopy} className="text-xs font-semibold text-[#5145E5] hover:underline">
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-[#64748B]">
                  {['No credit card', 'Free plan available', 'Set up in seconds'].map((t) => (
                    <span key={t} className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-500" strokeWidth={3} /> {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Right — dashboard preview */}
              <div className="relative">
                <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="rounded-2xl bg-white dark:bg-[#15172B] border border-[#E5E7EB] dark:border-white/10 shadow-2xl shadow-[#5145E5]/10 overflow-hidden">
                  {/* window bar */}
                  <div className="flex items-center gap-1.5 px-4 py-3 border-b border-[#E5E7EB] dark:border-white/10">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#FEBC2E]" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#28C840]" />
                    <span className="ml-auto text-[10px] font-mono text-[#94A3B8]">SnapLink AI • Analytics</span>
                  </div>

                  <div className="flex">
                    {/* mini sidebar */}
                    <div className="hidden sm:flex flex-col w-36 border-r border-[#E5E7EB] dark:border-white/10 p-3 gap-1">
                      {[
                        { icon: BarChart2, label: 'Dashboard' },
                        { icon: Link2, label: 'My Links' },
                        { icon: BarChart2, label: 'Analytics' },
                        { icon: Brain, label: 'AI Insights' },
                        { icon: Megaphone, label: 'Campaigns' },
                        { icon: Users, label: 'Team' },
                      ].map(({ icon: I, label }, i) => (
                        <div key={label} className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[10px] font-medium ${i === 0 ? 'bg-[#5145E5]/10 text-[#5145E5]' : 'text-[#64748B]'}`}>
                          <I className="w-3 h-3" /> {label}
                        </div>
                      ))}
                    </div>

                    {/* content */}
                    <div className="flex-1 p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="text-xs font-bold">Dashboard Overview</p>
                          <p className="text-[9px] text-[#94A3B8]">Your link performance at a glance</p>
                        </div>
                        <span className="text-[9px] font-semibold text-[#5145E5] bg-[#5145E5]/10 px-2 py-1 rounded-lg">+ Create Link</span>
                      </div>

                      <div className="grid grid-cols-4 gap-2 mb-4">
                        {[
                          { l: 'Total Links', v: '1,247' },
                          { l: 'Total Clicks', v: '45.2K' },
                          { l: 'Unique Clicks', v: '32.8K' },
                          { l: 'AI Score', v: '94%' },
                        ].map((s) => (
                          <div key={s.l} className="rounded-lg bg-[#F7F8FC] dark:bg-white/5 p-2">
                            <p className="text-[8px] text-[#94A3B8] leading-tight">{s.l}</p>
                            <p className="text-xs font-bold mt-0.5">{s.v}</p>
                          </div>
                        ))}
                      </div>

                      <div className="rounded-lg bg-[#F7F8FC] dark:bg-white/5 p-3">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-[9px] font-semibold">Click Performance</p>
                          <span className="text-[8px] font-bold text-[#5145E5]">12.4K clicks</span>
                        </div>
                        <div className="flex items-end gap-1 h-20">
                          {[35, 55, 45, 70, 60, 90, 75].map((h, i) => (
                            <div key={i} className="flex-1 rounded-t bg-gradient-to-t from-[#5145E5] to-[#7C3AED]" style={{ height: `${h}%` }} />
                          ))}
                        </div>
                        <div className="flex justify-between text-[7px] text-[#94A3B8] mt-1">
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
        <section className="py-14 border-y border-[#E5E7EB] dark:border-white/10 bg-white dark:bg-transparent">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-[#94A3B8] mb-8">Trusted by innovative teams</p>
            <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6">
              {companies.map(({ name, Logo }) => (
                <div key={name} className="flex items-center gap-2 text-[#172033] dark:text-white/80 opacity-80 hover:opacity-100 transition-opacity" title={name}>
                  <Logo />
                  <span className="text-sm font-semibold">{name}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============================== FEATURES ============================== */}
        <section id="features" className="py-20 lg:py-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
                Everything you need to <span className="bg-gradient-to-r from-[#5145E5] to-[#7C3AED] bg-clip-text text-transparent">manage your links</span>
              </h2>
              <p className="text-[#64748B]">From simple shortening to AI-powered insights, we have you covered.</p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {features.map((f, i) => (
                <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }} className="group p-6 rounded-2xl bg-white dark:bg-[#15172B] border border-[#E5E7EB] dark:border-white/10 hover:border-[#5145E5]/30 hover:shadow-lg hover:shadow-[#5145E5]/5 transition-all">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${f.color}`}>
                    <f.icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold mb-2">{f.title}</h3>
                  <p className="text-sm text-[#64748B] leading-relaxed">{f.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ============================== HOW IT WORKS ============================== */}
        <section className="py-8 lg:py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="rounded-3xl bg-gradient-to-br from-[#5145E5]/[0.04] to-[#7C3AED]/[0.06] border border-[#5145E5]/10 p-8 lg:p-12">
              <div className="grid lg:grid-cols-[1fr_2fr] gap-8 items-center">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">How it works?</h2>
                  <p className="text-sm text-[#64748B] mt-2">Turn long URLs into smart, trackable links in three simple steps.</p>
                </div>
                <div className="grid sm:grid-cols-3 gap-6">
                  {steps.map((s, i) => (
                    <div key={s.n} className="relative">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#5145E5] to-[#7C3AED] flex items-center justify-center text-white shadow-lg shadow-[#5145E5]/25">
                          <s.icon className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-bold text-[#5145E5]">STEP {s.n}</span>
                      </div>
                      <h3 className="text-sm font-bold mb-1">{s.title}</h3>
                      <p className="text-xs text-[#64748B] leading-relaxed">{s.desc}</p>
                      {i < steps.length - 1 && (
                        <ArrowRight className="hidden sm:block absolute -right-4 top-4 w-4 h-4 text-[#5145E5]/40" />
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
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">Simple, transparent <span className="bg-gradient-to-r from-[#5145E5] to-[#7C3AED] bg-clip-text text-transparent">pricing</span></h2>
              <p className="text-[#64748B]">Choose the plan that fits your needs. No credit card required to start.</p>
            </div>

            <div className="grid lg:grid-cols-2 gap-10 items-start">
              {/* Pricing cards */}
              <div className="grid sm:grid-cols-3 gap-4">
                {plans.map((p) => (
                  <div key={p.name} className={`relative rounded-2xl p-6 flex flex-col ${p.popular ? 'bg-white dark:bg-[#15172B] border-2 border-[#5145E5] shadow-xl shadow-[#5145E5]/10' : 'bg-white dark:bg-[#15172B] border border-[#E5E7EB] dark:border-white/10'}`}>
                    {p.popular && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-bold text-white bg-gradient-to-r from-[#5145E5] to-[#7C3AED] px-3 py-1 rounded-full">Most Popular</span>
                    )}
                    <h3 className="text-sm font-bold">{p.name}</h3>
                    <div className="flex items-baseline gap-1 mt-2 mb-3">
                      <span className="text-3xl font-extrabold">{p.price}</span>
                      <span className="text-xs text-[#94A3B8]">{p.period}</span>
                    </div>
                    <p className="text-xs text-[#64748B] mb-4">{p.desc}</p>
                    <ul className="space-y-2.5 mb-6 flex-1">
                      {p.features.map((f) => (
                        <li key={f} className="flex items-start gap-2 text-xs text-[#64748B]">
                          <Check className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" strokeWidth={3} /> {f}
                        </li>
                      ))}
                    </ul>
                    <Link to="/signup" className={`w-full py-2.5 rounded-xl text-sm font-semibold text-center transition-all ${p.popular ? 'btn-primary' : 'border border-[#E5E7EB] dark:border-white/15 hover:border-[#5145E5] hover:text-[#5145E5]'}`}>
                      {p.cta}
                    </Link>
                  </div>
                ))}
              </div>

              {/* Analytics preview */}
              <div className="rounded-2xl bg-white dark:bg-[#15172B] border border-[#E5E7EB] dark:border-white/10 p-6">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-sm font-bold">Analytics Preview</h3>
                  <span className="flex items-center gap-1.5 text-[10px] font-semibold text-emerald-500">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live Data
                  </span>
                </div>
                <div className="flex items-end gap-2 h-32 mb-4">
                  {barHeights.map((h, i) => (
                    <div key={i} className="flex-1 rounded-t-lg bg-gradient-to-t from-[#5145E5] to-[#7C3AED]" style={{ height: `${h}%` }} />
                  ))}
                </div>
                <div className="flex justify-between text-[9px] text-[#94A3B8] mb-5">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => <span key={d}>{d}</span>)}
                </div>
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { l: 'Total Clicks', v: '45.2K' },
                    { l: 'Unique Clicks', v: '32.8K' },
                    { l: 'Growth', v: '+42%' },
                    { l: 'Countries', v: '24' },
                  ].map((s) => (
                    <div key={s.l} className="rounded-xl bg-[#F7F8FC] dark:bg-white/5 p-3 text-center">
                      <p className="text-base font-extrabold">{s.v}</p>
                      <p className="text-[9px] text-[#94A3B8] mt-0.5">{s.l}</p>
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
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">Frequently Asked <span className="bg-gradient-to-r from-[#5145E5] to-[#7C3AED] bg-clip-text text-transparent">Questions</span></h2>
              <p className="text-[#64748B]">Got questions? We've got answers.</p>
            </div>

            <div className="space-y-3">
              {faqs.map((faq, i) => (
                <div key={i} className="rounded-xl bg-white dark:bg-[#15172B] border border-[#E5E7EB] dark:border-white/10 overflow-hidden">
                  <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between px-5 py-4 text-left">
                    <span className="text-sm font-semibold pr-4">{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 text-[#5145E5] shrink-0 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                  </button>
                  {openFaq === i && <p className="px-5 pb-4 text-sm text-[#64748B] leading-relaxed">{faq.a}</p>}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============================== CTA ============================== */}
        <section className="pb-20 lg:pb-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#5145E5] to-[#7C3AED] px-8 py-14 lg:py-20 text-center text-white">
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
                <Link to="/signup" className="shrink-0 inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-white text-[#5145E5] font-semibold text-sm shadow-xl hover:bg-white/90 transition-all">
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
