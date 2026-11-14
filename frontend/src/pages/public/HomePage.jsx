import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap,
  ArrowRight,
  ExternalLink,
  Globe,
  Monitor,
  Smartphone,
  Users,
  Share2,
  Copy,
  BarChart2,
  Brain,
  Shield,
  Clock,
  Link as LinkIcon,
  QrCode,
  Rocket,
  Target,
  Sparkles,
} from 'lucide-react';
import api from '@/lib/api';

const HomePage = () => {
  const [shortenUrl, setShortenUrl] = useState('');
  const [shortening, setShortening] = useState(false);
  const [shortened, setShortened] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleShorten = async (e) => {
    e.preventDefault();
    if (!shortenUrl.trim()) return;
    setShortening(true);
    setError(null);
    try {
      const { data } = await api.post('/links/shorten', {
        originalUrl: shortenUrl,
      });
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
      setError(null);
    } catch {
      setError('Failed to copy');
    }
  };

  const featureCards = [
    {
      icon: Zap,
      title: 'Smart URL Shortening',
      description: 'Create clean, memorable short links in seconds with AI-powered suggestions.',
      color: 'bg-primary/10',
      iconColor: 'text-primary',
    },
    {
      icon: BarChart2,
      title: 'Real-time Analytics',
      description: 'Track clicks, geographic distribution, referrers, and device data live.',
      color: 'bg-primary/10',
      iconColor: 'text-primary',
    },
    {
      icon: Brain,
      title: 'AI-Powered Insights',
      description: 'Get intelligent recommendations to optimize your link performance using Google Gemini AI.',
      color: 'bg-primary/10',
      iconColor: 'text-primary',
    },
    {
      icon: QrCode,
      title: 'QR Code Generator',
      description: 'Generate scannable QR codes for every short link with customizable colors.',
      color: 'bg-primary/10',
      iconColor: 'text-primary',
    },
    {
      icon: Users,
      title: 'Team Collaboration',
      description: 'Invite team members, assign roles, and manage links together in shared workspaces.',
      color: 'bg-primary/10',
      iconColor: 'text-primary',
    },
    {
      icon: Shield,
      title: 'Campaign Management',
      description: 'Organize links into campaigns and track ROI across all your marketing channels.',
      color: 'bg-primary/10',
      iconColor: 'text-primary',
    },
  ];

  const steps = [
    {
      number: '01',
      title: 'Paste Your URL',
      description: 'Drop any long link into our smart shortener.',
      icon: LinkIcon,
    },
    {
      number: '02',
      title: 'AI Creates Your Smart Link',
      description: 'Google Gemini AI optimizes your link for better engagement.',
      icon: Brain,
    },
    {
      number: '03',
      title: 'Track and Optimize',
      description: 'Monitor clicks, locations, and performance in real-time.',
      icon: BarChart2,
    },
  ];

  const pricingPlans = [
    {
      name: 'Free',
      price: '$0',
      description: 'Perfect for individuals getting started.',
      features: [
        'Up to 100 links',
        'Basic analytics',
        'QR code generation',
        'Custom aliases',
      ],
      popular: false,
      buttonText: 'Get Started Free',
    },
    {
      name: 'Pro',
      price: '$12',
      period: '/mo',
      description: 'For growing businesses and creators.',
      features: [
        'Unlimited links',
        'Advanced analytics',
        'AI-powered insights',
        'Team collaboration',
        'Custom domains',
      ],
      popular: true,
      buttonText: 'Start Free Trial',
    },
    {
      name: 'Business',
      price: '$39',
      period: '/mo',
      description: 'For agencies and enterprises.',
      features: [
        'Everything in Pro',
        'Priority support',
        'SLA guarantee',
        'Bulk import/export',
        'SSO & team roles',
      ],
      popular: false,
      buttonText: 'Contact Sales',
    },
  ];

  const trustedCompanies = [
    { name: 'Google', color: 'text-blue-500' },
    { name: 'Microsoft', color: 'text-blue-600' },
    { name: 'GitHub', color: 'text-slate-700' },
    { name: 'Notion', color: 'text-purple-500' },
    { name: 'Vercel', color: 'text-slate-800' },
    { name: 'Meta', color: 'text-blue-900' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background text-primary-text">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-white/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/20">
                <Zap className="w-4.5 h-4.5 text-white" strokeWidth={2.5} />
              </div>
              <span className="text-xl font-bold font-display tracking-tight gradient-text-brand">SnapLink AI</span>
            </div>

            <div className="hidden md:flex items-center gap-1 px-3 py-1 rounded-2xl bg-slate-100 border border-border/60">
              {[
                { label: 'Features', href: '#features' },
                { label: 'Pricing', href: '#pricing' },
                { label: 'Analytics', href: '#analytics' },
                { label: 'API', href: '#api' },
              ].map((item) => (
                <Link
                  key={item.label}
                  to={item.href}
                  className="px-4 py-2 text-sm font-medium rounded-xl transition-colors hover:bg-white hover:text-primary"
                >
                  {item.label}
                </Link>
              ))}
            </div>

            <div className="hidden md:flex items-center gap-3">
              <Link to="/login" className="text-sm font-medium text-secondary-text hover:text-primary transition-colors">
                Sign in
              </Link>
              <Link to="/signup" className="btn-primary text-sm px-5 py-2.5">
                Get Started Free <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <button
              className="md:hidden p-2.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
              aria-label="Toggle menu"
            >
              <Rocket className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden -z-10">
          <div className="hero-orb-1 absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full blur-3xl" />
          <div className="hero-orb-2 absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Column */}
            <div className="space-y-8">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/5 border border-primary/10">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                  Powered by Google Gemini AI
                </span>
              </div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-5xl lg:text-7xl font-bold leading-tight tracking-tight"
              >
                Shorten, Track &amp; Grow Your Links{' '}
                <span className="gradient-text-brand">with AI</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-lg text-secondary-text max-w-xl leading-relaxed"
              >
                Transform ordinary URLs into powerful marketing tools. Shorten links, track
                performance, and discover actionable insights using AI.
              </motion.p>

              {/* URL Shortener */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="card p-6 lg:p-8 shadow-lg shadow-primary/5"
              >
                <form onSubmit={handleShorten} className="space-y-4">
                  <div className="relative">
                    <input
                      type="url"
                      value={shortenUrl}
                      onChange={(e) => setShortenUrl(e.target.value)}
                      placeholder="Paste your long URL here..."
                      className="w-full px-4 py-4 pl-12 pr-10 rounded-xl text-base border border-border focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                      autoComplete="off"
                    />
                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    {shortening ? (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        <div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                      </div>
                    ) : (
                      <button
                        type="submit"
                        disabled={shortening || !shortenUrl.trim()}
                        className="absolute right-2 top-2 bottom-2 px-6 rounded-xl bg-primary text-white font-medium shadow-lg shadow-primary/25 hover:bg-secondary hover:shadow-primary/35 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Shorten
                      </button>
                    )}
                  </div>

                  {error && (
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-danger/5 border border-danger/10 text-danger">
                      <Shield className="w-4 h-4 shrink-0 mt-0.5" />
                      <p className="text-sm">{error}</p>
                    </div>
                  )}

                  {shortened && (
                    <div className="flex items-center gap-3 p-4 rounded-lg bg-primary/5 border border-primary/10">
                      <input
                        type="text"
                        value={shortened}
                        readOnly
                        className="flex-1 px-3 py-2 text-sm text-slate-700 bg-white border border-border rounded-lg outline-none"
                      />
                      <button
                        onClick={handleCopy}
                        className="px-4 py-2 rounded-lg bg-white text-primary font-medium shadow-sm hover:bg-slate-50 transition-colors"
                      >
                        Copy
                      </button>
                      <Link
                        to={shortened}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 rounded-lg btn-ghost text-sm text-slate-600 hover:text-primary hover:bg-slate-50"
                      >
                        Open
                      </Link>
                    </div>
                  )}
                </form>
              </motion.div>

              <div className="flex items-center gap-4 text-xs text-secondary-text">
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-success" />
                  Free Forever
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-success" />
                  No Credit Card
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-success" />
                  Setup in 1 Minute
                </span>
              </div>
            </div>

            {/* Right Column - Dashboard Preview */}
            <div className="relative">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="relative rounded-3xl overflow-hidden shadow-2xl border border-white/50 bg-white"
              >
                {/* Header bar */}
                <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-danger" />
                    <div className="w-2 h-2 rounded-full bg-warning" />
                    <div className="w-2 h-2 rounded-full bg-success" />
                  </div>
                  <div className="text-xs font-mono text-secondary-text">snaplink.ai • analytics</div>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-3 gap-4 p-6 border-b border-border/50">
                  <div className="p-4 rounded-xl bg-primary/5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-secondary-text">Total Links</p>
                        <p className="text-sm font-bold text-primary-text">1,247</p>
                      </div>
                      <LinkIcon className="w-5 h-5 text-primary" />
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-primary/5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-secondary-text">Total Clicks</p>
                        <p className="text-sm font-bold text-primary-text">45.2K</p>
                      </div>
                      <BarChart2 className="w-5 h-5 text-primary" />
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-primary/5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-secondary-text">AI Score</p>
                        <p className="text-sm font-bold text-primary-text">94%</p>
                      </div>
                      <Brain className="w-5 h-5 text-primary" />
                    </div>
                  </div>
                </div>

                {/* Analytics chart preview */}
                <div className="p-6">
                  <h3 className="text-sm font-semibold text-primary-text mb-4">Click Performance (Last 7 Days)</h3>
                  <div className="h-48 flex items-end gap-2">
                    {[45, 78, 62, 110, 95, 140, 185].map((val, i) => (
                      <div
                        key={i}
                        className="w-full rounded-t-lg bg-primary transition-all duration-500"
                        style={{ height: `${val}%` }}
                      />
                    ))}
                  </div>
                  <div className="flex justify-between text-[10px] text-secondary-text mt-2">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                      <span key={day}>{day}</span>
                    ))}
                  </div>
                </div>

                {/* Recent activity */}
                <div className="p-6 border-t border-border/50">
                  <h3 className="text-sm font-semibold text-primary-text mb-4">Recent Activity</h3>
                  <div className="space-y-3">
                    {[
                      { link: 'snap.la/ai-summary', clicks: 124, country: 'United States', time: '2m ago' },
                      { link: 'snap.la/product-launch', clicks: 89, country: 'Germany', time: '15m ago' },
                      { link: 'snap.la/blog-post', clicks: 203, country: 'India', time: '1h ago' },
                    ].map((item) => (
                      <div key={item.link} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                        <div className="flex items-center gap-3">
                          <LinkIcon className="w-4 h-4 text-slate-400" />
                          <span className="text-xs text-primary-text">{item.link}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-secondary-text">
                          <span>{item.clicks} clicks</span>
                          <span>•</span>
                          <span>{item.country}</span>
                          <span>•</span>
                          <span>{item.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted Companies */}
      <section className="py-16 border-y border-border/50 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-sm font-medium text-secondary-text uppercase tracking-wider">Trusted by innovative teams</p>
          </div>
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
            {trustedCompanies.map((company) => (
              <div
                key={company.name}
                className="flex items-center gap-2 cursor-default group"
                title={company.name}
              >
                <span className={`text-2xl font-bold ${company.color} transition-colors group-hover:text-primary`}>
                  {company.name.charAt(0)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold tracking-tight mb-4">Everything you need to manage your links</h2>
            <p className="text-lg text-secondary-text max-w-2xl mx-auto">From simple shortening to AI-powered insights, we have you covered.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {featureCards.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -5 }}
                className="card p-6 hover:border-primary/30 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl {feature.color} flex items-center justify-center mb-5">
                  <feature.icon className="w-6 h-6 {feature.iconColor}" />
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-secondary-text text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold tracking-tight mb-4">How it works</h2>
            <p className="text-lg text-secondary-text">Turn long URLs into smart, trackable links in three simple steps.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step) => (
              <div key={step.title} className="text-center">
                <div className="flex items-center justify-center gap-2 mb-6">
                  <span className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg shadow-lg shadow-primary/25">
                    {step.number}
                  </span>
                  <step.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                <p className="text-secondary-text text-sm leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Analytics Preview */}
      <section id="analytics" className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold tracking-tight mb-4">Powerful analytics at your fingertips</h2>
            <p className="text-lg text-secondary-text max-w-2xl mx-auto">Understand your audience with detailed click metrics, geographic data, and AI insights.</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="card p-6">
                <h3 className="text-lg font-bold mb-6">Click Performance Over Time</h3>
                <div className="h-64 flex items-end gap-3">
                  {[30, 55, 40, 85, 70, 120, 95, 160, 140, 200, 180, 250].map((val, i) => (
                    <div
                      key={i}
                      className="w-full rounded-t-lg bg-primary transition-all duration-500"
                      style={{ height: `${val}%` }}
                    />
                  ))}
                </div>
                <div className="flex justify-between text-[10px] text-secondary-text mt-3">
                  {['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8', 'W9', 'W10', 'W11', 'W12'].map((w) => (
                    <span key={w}>{w}</span>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="card p-5">
                  <h4 className="text-sm font-bold text-secondary-text mb-3">Top Countries</h4>
                  <div className="space-y-3">
                    {[
                      { country: 'United States', pct: '42%', bar: 85 },
                      { country: 'India', pct: '23%', bar: 65 },
                      { country: 'Germany', pct: '15%', bar: 50 },
                    ].map((c) => (
                      <div key={c.country} className="flex items-center justify-between">
                        <span className="text-sm text-primary-text">{c.country}</span>
                        <div className="flex items-center gap-2 ml-4">
                          <div className="h-1.5 w-24 rounded-full bg-slate-200">
                            <div className="h-1.5 rounded-full bg-primary" style={{ width: `${c.bar}%` }} />
                          </div>
                          <span className="text-xs font-bold text-primary">{c.pct}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="card p-5">
                  <h4 className="text-sm font-bold text-secondary-text mb-3">Device Breakdown</h4>
                  <div className="space-y-3">
                    {[
                      { device: 'Mobile', pct: '68%', bar: 90 },
                      { device: 'Desktop', pct: '27%', bar: 75 },
                      { device: 'Tablet', pct: '5%', bar: 20 },
                    ].map((d) => (
                      <div key={d.device} className="flex items-center justify-between">
                        <span className="text-sm text-primary-text">{d.device}</span>
                        <div className="flex items-center gap-2 ml-4">
                          <div className="h-1.5 w-24 rounded-full bg-slate-200">
                            <div className="h-1.5 rounded-full bg-secondary" style={{ width: `${d.bar}%` }} />
                          </div>
                          <span className="text-xs font-bold text-primary">{d.pct}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="card p-6">
                <h3 className="text-lg font-bold mb-4">AI Insights</h3>
                <p className="text-sm text-secondary-text mb-4">
                  Our AI analyzed your link performance and found that tweets posted between 2-4 PM
                  get 3x more clicks. Would you like to optimize your posting schedule?
                </p>
                <div className="flex items-center justify-between p-4 rounded-xl bg-primary/5 border border-primary/10">
                  <div>
                    <p className="text-sm text-primary-text font-medium">Apply AI Optimization</p>
                    <p className="text-xs text-secondary-text">Est. +40% click increase</p>
                  </div>
                  <button className="btn-primary text-xs px-4 py-2">Apply</button>
                </div>
              </div>
              <div className="card p-6">
                <h3 className="text-lg font-bold mb-4">Recent Links</h3>
                <div className="space-y-3">
                  {[
                    { title: 'Product Launch', url: 'snap.la/launch', clicks: 1.2 },
                    { title: 'Blog Post', url: 'snap.la/blog', clicks: 856 },
                    { title: 'Newsletter', url: 'snap.la/news', clicks: 421 },
                  ].map((l) => (
                    <div key={l.url} className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                      <div className="flex items-center gap-3">
                        <LinkIcon className="w-4 h-4 text-slate-400" />
                        <span className="text-sm text-primary-text truncate w-32">{l.title}</span>
                      </div>
                      <span className="text-xs font-mono text-secondary-text">{l.url}</span>
                      <span className="text-xs font-bold text-primary">{l.clicks}K</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold tracking-tight mb-4">Simple, transparent pricing</h2>
            <p className="text-lg text-secondary-text max-w-2xl mx-auto">Choose the plan that fits your needs. No credit card required to start.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricingPlans.map((plan) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -5 }}
                className={`card p-8 rounded-2xl relative ${plan.popular ? 'border-2 border-primary shadow-lg shadow-primary/15' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="px-3 py-1 rounded-full bg-primary text-white text-xs font-bold">Most Popular</span>
                  </div>
                )}
                <h3 className="text-xl font-bold text-primary-text">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  {plan.period && <span className="text-secondary-text">{plan.period}</span>}
                </div>
                <p className="text-secondary-text text-sm mt-4">{plan.description}</p>
                <ul className="space-y-3 mt-6">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <span className="w-5 h-5 rounded-full bg-success/10 text-success flex items-center justify-center text-xs">
                        ✓
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link to="/signup" className={`w-full mt-8 py-3 rounded-xl font-medium transition-all ${plan.popular ? 'btn-primary' : 'btn-secondary'}`}>
                  {plan.buttonText}
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="card p-10 lg:p-16 rounded-3xl bg-gradient-to-br from-primary to-secondary text-white text-center shadow-lg shadow-primary/30">
            <h2 className="text-4xl lg:text-5xl font-bold mb-4">Ready to Make Every Link Smarter?</h2>
            <p className="text-lg text-primary/10 mb-8 max-w-2xl mx-auto">
              Join thousands of creators and businesses using SnapLink AI to grow their audience.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/signup" className="btn-primary text-white px-8 py-3 text-lg font-semibold shadow-lg shadow-primary/40 hover:shadow-primary/50">
                Get Started Free
              </Link>
              <Link to="/features" className="px-8 py-3 rounded-xl font-medium text-lg bg-white text-primary hover:bg-slate-100 transition-all">
                Explore Features
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                  <Zap className="w-3.5 h-3.5 text-white" strokeWidth={2} />
                </div>
                <span className="text-lg font-bold font-display gradient-text-brand">SnapLink AI</span>
              </div>
              <p className="text-secondary-text text-sm leading-relaxed">
                The intelligent URL shortener with AI-powered analytics.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-primary-text mb-4 text-sm uppercase tracking-wider">Product</h4>
              <ul className="space-y-3">
                <li><Link to="#features" className="text-secondary-text text-sm hover:text-primary transition-colors">Features</Link></li>
                <li><Link to="#pricing" className="text-secondary-text text-sm hover:text-primary transition-colors">Pricing</Link></li>
                <li><Link to="#analytics" className="text-secondary-text text-sm hover:text-primary transition-colors">Analytics</Link></li>
                <li><a href="#" className="text-secondary-text text-sm hover:text-primary transition-colors">API</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-primary-text mb-4 text-sm uppercase tracking-wider">Company</h4>
              <ul className="space-y-3">
                <li><Link to="#" className="text-secondary-text text-sm hover:text-primary transition-colors">About</Link></li>
                <li><Link to="#" className="text-secondary-text text-sm hover:text-primary transition-colors">Blog</Link></li>
                <li><Link to="#" className="text-secondary-text text-sm hover:text-primary transition-colors">Careers</Link></li>
                <li><Link to="#" className="text-secondary-text text-sm hover:text-primary transition-colors">Press</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-primary-text mb-4 text-sm uppercase tracking-wider">Legal</h4>
              <ul className="space-y-3">
                <li><Link to="#" className="text-secondary-text text-sm hover:text-primary transition-colors">Privacy Policy</Link></li>
                <li><Link to="#" className="text-secondary-text text-sm hover:text-primary transition-colors">Terms of Service</Link></li>
                <li><Link to="#" className="text-secondary-text text-sm hover:text-primary transition-colors">Cookie Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border/50 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-secondary-text text-sm">© 2025 SnapLink AI. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <a href="#" className="text-secondary-text hover:text-primary transition-colors text-sm">Twitter</a>
              <a href="#" className="text-secondary-text hover:text-primary transition-colors text-sm">LinkedIn</a>
              <a href="#" className="text-secondary-text hover:text-primary transition-colors text-sm">GitHub</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
