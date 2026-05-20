import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, MessageCircle, Link as LinkIcon, Monitor, Mail } from 'lucide-react';

const LINKS = {
    Product: ['Features', 'Pricing', 'Analytics', 'QR Codes', 'API'],
    Company: ['About', 'Blog', 'Careers', 'Press'],
    Legal: ['Privacy Policy', 'Terms of Service', 'Cookie Policy'],
    Support: ['Documentation', 'Help Center', 'Status Page', 'Contact'],
};

const Footer = () => (
    <footer className="border-t border-slate-200/80 bg-white/80 backdrop-blur-sm py-16 mt-auto">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-12">
                {/* Brand */}
                <div className="col-span-2 md:col-span-1">
                    <Link to="/" className="flex items-center gap-2.5 mb-4">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center shadow-brand">
                            <Zap className="w-4 h-4 text-white" strokeWidth={2.5} />
                        </div>
                        <span className="text-base font-bold gradient-text-brand">SnapLink AI</span>
                    </Link>
                    <p className="text-slate-500 text-sm leading-relaxed mb-5">
                        The world's most intelligent URL shortener, powered by Google Gemini AI.
                    </p>
                    <div className="flex gap-2">
                        {[[MessageCircle, '#'], [LinkIcon, 'https://github.com'], [Monitor, '#'], [Mail, 'mailto:hello@snaplink.ai']].map(([Icon, href], i) => (
                            <a key={i} href={href} target="_blank" rel="noopener noreferrer"
                                className="w-9 h-9 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 hover:border-indigo-200 transition-all">
                                <Icon className="w-4 h-4" />
                            </a>
                        ))}
                    </div>
                </div>

                {/* Link Groups */}
                {Object.entries(LINKS).map(([group, items]) => (
                    <div key={group}>
                        <h4 className="text-slate-800 font-semibold text-sm mb-4">{group}</h4>
                        <ul className="space-y-2.5">
                            {items.map(item => (
                                <li key={item}>
                                    <Link to="#" className="text-slate-500 hover:text-indigo-600 text-sm transition-colors">{item}</Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>

            <div className="border-t border-slate-100 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
                <p className="text-slate-400 text-sm">© 2025 SnapLink AI. All rights reserved.</p>
                <div className="flex items-center gap-2">
                    <div className="status-dot-active" />
                    <span className="text-slate-500 text-sm">All systems operational</span>
                </div>
            </div>
        </div>
    </footer>
);

export default Footer;
