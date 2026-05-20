import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Globe, Monitor, Smartphone, Loader2, MousePointerClick, Users, Share2, Copy, OctagonX } from 'lucide-react';
import api from '@/lib/api';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b'];

const PublicStatsPage = () => {
    const { shortCode } = useParams();

    const { data, isLoading, error } = useQuery({
        queryKey: ['public-stats', shortCode],
        queryFn: async () => {
            const { data } = await api.get(`/stats/${shortCode}`);
            return data.data;
        }
    });

    const linkData = data?.link;
    const stats = data?.stats || {};
    const countryData = data?.countryStats || [];
    const deviceData = data?.deviceStats || [];
    const dailyData = data?.dailyClicks?.map(d => ({
        date: format(new Date(d._id), 'MMM dd'),
        clicks: d.count
    })) || [];

    const shortUrl = linkData ? `${import.meta.env.VITE_SHORT_URL_BASE || window.location.origin + '/r/'}${linkData.shortCode}` : '';

    if (isLoading) return (
        <div className="min-h-screen bg-dark-950 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-brand-400 animate-spin" />
        </div>
    );

    if (error || !linkData) return (
        <div className="min-h-screen bg-dark-950 flex flex-col items-center justify-center text-center p-6">
            <OctagonX className="w-16 h-16 text-dark-600 mb-4" />
            <h1 className="text-2xl font-bold text-white mb-2">Stats not found</h1>
            <p className="text-dark-400">This link's stats are not publicly available or the link doesn't exist.</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-dark-950 grid-bg py-10 px-4">
            <div className="max-w-3xl mx-auto space-y-6">
                {/* Header */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center">
                            <span className="text-white text-xs font-bold">S</span>
                        </div>
                        <span className="text-dark-400 text-sm">SnapLink AI — Public Statistics</span>
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2 break-all">{shortUrl}</h1>
                    <div className="flex items-center justify-center gap-3 mt-3">
                        <button onClick={() => { navigator.clipboard.writeText(shortUrl); toast.success('Copied!'); }}
                            className="btn-ghost text-sm"><Copy className="w-4 h-4" /> Copy</button>
                        <button onClick={() => navigator.share?.({ url: shortUrl, title: 'Check out these link stats' })}
                            className="btn-ghost text-sm"><Share2 className="w-4 h-4" /> Share</button>
                    </div>
                </motion.div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="glass-card p-5 text-center">
                        <MousePointerClick className="w-6 h-6 text-brand-400 mx-auto mb-2" />
                        <p className="text-3xl font-black text-white">{(stats.totalClicks || 0).toLocaleString()}</p>
                        <p className="text-dark-400 text-sm">Total Clicks</p>
                    </div>
                    <div className="glass-card p-5 text-center">
                        <Users className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                        <p className="text-3xl font-black text-white">{(stats.uniqueClicks || 0).toLocaleString()}</p>
                        <p className="text-dark-400 text-sm">Unique Visitors</p>
                    </div>
                </div>

                {/* Daily Chart */}
                {dailyData.length > 0 && (
                    <div className="chart-container">
                        <h3 className="text-lg font-semibold text-white mb-4">Click History (30 days)</h3>
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={dailyData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                                <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                                <Tooltip />
                                <Bar dataKey="clicks" fill="#6366f1" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}

                {/* Countries & Devices */}
                {(countryData.length > 0 || deviceData.length > 0) && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {countryData.length > 0 && (
                            <div className="chart-container">
                                <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
                                    <Globe className="w-4 h-4 text-brand-400" /> Top Countries
                                </h3>
                                <div className="space-y-2">
                                    {countryData.slice(0, 5).map((c, i) => (
                                        <div key={i} className="flex items-center justify-between text-sm">
                                            <span className="text-dark-300">{c.country || c._id}</span>
                                            <span className="text-white font-medium">{c.count}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        {deviceData.length > 0 && (
                            <div className="chart-container">
                                <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
                                    <Smartphone className="w-4 h-4 text-purple-400" /> Devices
                                </h3>
                                <ResponsiveContainer width="100%" height={120}>
                                    <PieChart>
                                        <Pie data={deviceData.map(d => ({ name: d._id || 'Unknown', value: d.count }))}
                                            cx="50%" cy="50%" outerRadius={50} innerRadius={30} paddingAngle={3} dataKey="value">
                                            {deviceData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                    </div>
                )}

                <div className="text-center pt-4">
                    <p className="text-dark-500 text-sm">
                        Powered by <Link to="/" className="text-brand-400 hover:text-brand-300">SnapLink AI</Link> · Create your own free account
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PublicStatsPage;
