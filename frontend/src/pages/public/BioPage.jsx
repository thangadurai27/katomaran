import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Globe, Monitor, Smartphone, Loader2, MousePointerClick, Users, Share2, Copy, OctagonX, Link as LinkIcon, MessageCircle } from 'lucide-react';
import api from '@/lib/api';

const SOCIAL_ICONS = { twitter: MessageCircle, instagram: Globe, linkedin: LinkIcon, youtube: Monitor, github: OctagonX };

const BioPage = () => {
    const { username } = useParams();

    const { data, isLoading, error } = useQuery({
        queryKey: ['bio-page', username],
        queryFn: async () => {
            const { data } = await api.get(`/bio/${username}`);
            return data.data;
        }
    });

    const bioPage = data?.bioPage;

    if (isLoading) return (
        <div className="min-h-screen flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-brand-400 animate-spin" />
        </div>
    );

    if (error || !bioPage) return (
        <div className="min-h-screen flex flex-col items-center justify-center text-center p-6">
            <Globe className="w-16 h-16 text-dark-600 mb-4" />
            <h1 className="text-2xl font-bold text-white mb-2">Page not found</h1>
            <p className="text-dark-400">@{username} hasn't set up their bio page yet.</p>
        </div>
    );

    const gradients = {
        default: 'from-brand-950 to-dark-950',
        sunset: 'from-orange-950 to-pink-950',
        ocean: 'from-cyan-950 to-blue-950',
        forest: 'from-emerald-950 to-dark-950',
    };

    const bg = gradients[bioPage.theme?.gradient] || gradients.default;

    return (
        <div className={`min-h-screen bg-gradient-to-br ${bg} flex flex-col items-center py-12 px-4`}>
            <div className="w-full max-w-sm">
                {/* Avatar */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
                    {bioPage.avatar ? (
                        <img src={bioPage.avatar} alt={bioPage.displayName} className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-brand-500/50" />
                    ) : (
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center mx-auto mb-4 text-3xl font-bold text-white shadow-glow">
                            {bioPage.displayName?.[0]?.toUpperCase() || 'U'}
                        </div>
                    )}
                    <h1 className="text-2xl font-bold text-white">{bioPage.displayName}</h1>
                    {bioPage.username && <p className="text-dark-400 text-sm">@{bioPage.username}</p>}
                    {bioPage.bio && <p className="text-dark-300 text-sm mt-3 leading-relaxed">{bioPage.bio}</p>}
                </motion.div>

                {/* Social Links */}
                {bioPage.socialLinks && Object.entries(bioPage.socialLinks).some(([, v]) => v) && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                        className="flex justify-center gap-3 mb-6">
                        {Object.entries(bioPage.socialLinks).map(([platform, url]) => {
                            if (!url) return null;
                            const Icon = SOCIAL_ICONS[platform] || Globe;
                            return (
                                <a key={platform} href={url} target="_blank" rel="noopener noreferrer"
                                    className="w-10 h-10 rounded-xl bg-dark-800/60 border border-dark-700/50 flex items-center justify-center text-dark-300 hover:text-white hover:border-brand-500/50 transition-all">
                                    <Icon className="w-5 h-5" />
                                </a>
                            );
                        })}
                    </motion.div>
                )}

                {/* Links */}
                <div className="space-y-3">
                    {bioPage.links?.filter(l => l.isActive).map((link, i) => (
                        <motion.a
                            key={i}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15 + i * 0.05 }}
                            onClick={() => api.post(`/bio/${username}/click/${i}`).catch(() => { })}
                            className="flex items-center justify-between w-full px-5 py-4 bg-dark-800/60 backdrop-blur-sm border border-dark-700/50 rounded-2xl text-white font-medium text-sm hover:border-brand-500/50 hover:bg-dark-700/60 hover:shadow-glow transition-all group"
                        >
                            <div className="flex items-center gap-3">
                                {link.icon && <span className="text-xl">{link.icon}</span>}
                                <span>{link.title}</span>
                            </div>
                            <ExternalLink className="w-4 h-4 text-dark-400 group-hover:text-brand-400 transition-colors" />
                        </motion.a>
                    ))}
                </div>

                {/* Footer branding */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
                    className="text-center mt-10">
                    <a href="/" className="inline-flex items-center gap-1.5 text-xs text-dark-500 hover:text-dark-300 transition-colors">
                        <div className="w-4 h-4 rounded bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center">
                            <span className="text-white text-[8px] font-bold">S</span>
                        </div>
                        Created with SnapLink AI
                    </a>
                </motion.div>
            </div>
        </div>
    );
};

export default BioPage;
