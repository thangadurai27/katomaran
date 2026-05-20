import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Shield, BarChart3, QrCode, Zap, Layers, Users, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';

const FEATURES = [
    {
        icon: Brain,
        title: 'Google Gemini AI Engine',
        desc: 'Our core AI analyzes traffic patterns, predicts engagement, and suggests the best times to share your links.',
        color: 'text-brand-400',
        bg: 'bg-brand-500/10 border-brand-500/20'
    },
    {
        icon: Shield,
        title: 'Smart Spam Prevention',
        desc: 'Real-time phishing and malware detection blocks malicious URLs before they are shortened, keeping your audience safe.',
        color: 'text-emerald-400',
        bg: 'bg-emerald-500/10 border-emerald-500/20'
    },
    {
        icon: BarChart3,
        title: 'Advanced Analytics',
        desc: 'Track device types, operating systems, browsers, referrers, and precise geographic locations of your clickers.',
        color: 'text-purple-400',
        bg: 'bg-purple-500/10 border-purple-500/20'
    },
    {
        icon: QrCode,
        title: 'Dynamic QR Codes',
        desc: 'Generate customizable, high-resolution QR codes that can be downloaded as PNG/SVG. Track printed engagement.',
        color: 'text-cyan-400',
        bg: 'bg-cyan-500/10 border-cyan-500/20'
    },
    {
        icon: Layers,
        title: 'UTM & Campaign Builder',
        desc: 'Organize links into campaigns. Automatically append UTM tags for clean, consistent Google Analytics tracking.',
        color: 'text-amber-400',
        bg: 'bg-amber-500/10 border-amber-500/20'
    },
    {
        icon: Users,
        title: 'Team Workspaces',
        desc: 'Invite team members, assign granular roles (Admin, Editor, Viewer), and collaborate on shared link campaigns.',
        color: 'text-pink-400',
        bg: 'bg-pink-500/10 border-pink-500/20'
    },
    {
        icon: Globe,
        title: 'Public Bio Pages',
        desc: 'Create beautiful Linktree-style mobile landing pages. Customize themes, add social links, and track tap-through rates.',
        color: 'text-indigo-400',
        bg: 'bg-indigo-500/10 border-indigo-500/20'
    },
    {
        icon: Zap,
        title: 'Developer API',
        desc: 'Integrate SnapLink AI directly into your product with our robust, documented REST API and Webhooks.',
        color: 'text-red-400',
        bg: 'bg-red-500/10 border-red-500/20'
    }
];

const FeaturesPage = () => {
    return (
        <div className="min-h-screen pt-24 pb-16">
            <div className="absolute inset-0 grid-bg opacity-50 pointer-events-none" />

            <div className="max-w-6xl mx-auto px-6 relative z-10">
                <div className="text-center mb-16">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <span className="badge badge-primary mb-4">Everything You Need</span>
                        <h1 className="text-4xl md:text-5xl font-black text-white mb-6">
                            Powerful Features for<br />
                            <span className="gradient-text">Modern Marketers</span>
                        </h1>
                        <p className="text-dark-400 max-w-2xl mx-auto text-lg leading-relaxed">
                            We've re-engineered the URL shortener from the ground up, adding AI, advanced security, and enterprise-grade analytics.
                        </p>
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
                    {FEATURES.map((f, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className={`glass-card p-6 border transition-all duration-300 hover:shadow-glow-lg hover:-translate-y-1 ${f.bg}`}
                        >
                            <f.icon className={`w-8 h-8 ${f.color} mb-4`} />
                            <h3 className="text-lg font-bold text-white mb-2">{f.title}</h3>
                            <p className="text-dark-300 text-sm leading-relaxed">{f.desc}</p>
                        </motion.div>
                    ))}
                </div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="glass-card p-10 md:p-16 text-center bg-gradient-to-br from-brand-900/40 to-purple-900/40 border-brand-500/30 shadow-glow"
                >
                    <h2 className="text-3xl font-bold text-white mb-4">Ready to unlock these features?</h2>
                    <p className="text-dark-300 mb-8 max-w-xl mx-auto">
                        Join thousands of professionals tracking and optimizing their links with SnapLink AI.
                        Takes less than 30 seconds to sign up.
                    </p>
                    <Link to="/signup" className="btn-primary py-3 px-8 text-lg">
                        Create Free Account
                    </Link>
                </motion.div>
            </div>
        </div>
    );
};

export default FeaturesPage;
