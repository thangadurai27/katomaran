import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Link2, MousePointerClick, TrendingUp, Clock, ArrowUpRight, ArrowDownRight, Wifi, Plus } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '@/lib/api';
import { format } from 'date-fns';
import PageHeader from '@/components/ui/PageHeader';

const DEVICE_COLORS = {
    desktop: '#6366f1',
    mobile: '#8b5cf6',
    tablet: '#06b6d4',
    bot: '#94a3b8',
    unknown: '#e2e8f0',
};

/* ── Stat Card ──────────────────────────────────── */
const StatCard = ({ icon: Icon, label, value, change, iconBg, iconColor, delay }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        className="stat-card-accent card-hover p-6 shine"
    >
        <div className="flex items-start justify-between mb-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${iconBg}`}>
                <Icon className={`w-6 h-6 ${iconColor}`} />
            </div>
            {change !== undefined && (
                <span className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${change >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
                    {change >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {Math.abs(change)}%
                </span>
            )}
        </div>
        <p className="text-3xl font-black mb-1" style={{ color: 'var(--text-primary)' }}>
            {typeof value === 'number' ? value.toLocaleString() : value}
        </p>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{label}</p>
    </motion.div>
);

/* ── Skeleton ───────────────────────────────────── */
const SkeletonCard = () => (
    <div className="card p-6 space-y-4">
        <div className="skeleton h-12 w-12 rounded-2xl" />
        <div className="skeleton h-8 w-24 rounded-lg" />
        <div className="skeleton h-4 w-32 rounded" />
    </div>
);

/* ── Tooltip ────────────────────────────────────── */
const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="card px-3 py-2.5 text-sm shadow-card-md">
            <p className="text-xs mb-1.5 font-medium" style={{ color: 'var(--text-muted)' }}>{label}</p>
            {payload.map(p => (
                <p key={p.dataKey} style={{ color: p.color }} className="font-semibold">
                    {p.value?.toLocaleString()} {p.name}
                </p>
            ))}
        </div>
    );
};

/* ── Main ───────────────────────────────────────── */
const DashboardOverview = () => {
    const { data: statsData, isLoading } = useQuery({
        queryKey: ['dashboard-stats'],
        queryFn: async () => {
            const { data } = await api.get('/links/stats/overview');
            return data.data;
        }
    });

    const { data: analyticsData } = useQuery({
        queryKey: ['analytics-overview'],
        queryFn: async () => {
            const { data } = await api.get('/analytics/overview?days=30');
            return data.data;
        }
    });

    const stats = statsData || {};
    const analytics = analyticsData || {};

    const statCards = [
        { icon: Link2, label: 'Total Links', value: stats.totalLinks || 0, iconBg: 'bg-indigo-50', iconColor: 'text-indigo-600', delay: 0 },
        { icon: MousePointerClick, label: 'Total Clicks', value: stats.totalClicks || 0, change: stats.clickGrowth, iconBg: 'bg-purple-50', iconColor: 'text-purple-600', delay: 0.08 },
        { icon: Wifi, label: 'Active Links', value: stats.activeLinks || 0, iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600', delay: 0.16 },
        { icon: Clock, label: 'Expired Links', value: stats.expiredLinks || 0, iconBg: 'bg-amber-50', iconColor: 'text-amber-600', delay: 0.24 },
    ];

    const dailyData = analytics.dailyClicks?.map(d => ({
        date: format(new Date(d._id), 'MMM dd'),
        clicks: d.clicks || d.count || 0,
        unique: d.unique || 0
    })) || [];

    const deviceData = analytics.deviceStats?.map(d => ({
        name: d._id || 'Unknown',
        value: d.count
    })) || [];

    return (
        <div className="space-y-6 animate-in">
            <PageHeader
                title="Dashboard Overview"
                subtitle="Your link performance at a glance"
                badge="Live"
                action={
                    <Link to="/dashboard/create-link" className="btn-primary text-sm">
                        <Plus className="w-4 h-4" /> Create Link
                    </Link>
                }
            />

            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {isLoading
                    ? Array(4).fill(0).map((_, i) => <SkeletonCard key={i} />)
                    : statCards.map(card => <StatCard key={card.label} {...card} />)
                }
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Line Chart */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
                    className="chart-container lg:col-span-2"
                >
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="font-semibold text-base" style={{ color: 'var(--text-primary)' }}>Click Performance</h3>
                            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Last 30 days</p>
                        </div>
                        <div className="flex items-center gap-4 text-xs">
                            <span className="flex items-center gap-1.5" style={{ color: '#6366f1' }}>
                                <span className="w-3 h-1 bg-indigo-500 rounded block" /> All Clicks
                            </span>
                            <span className="flex items-center gap-1.5" style={{ color: '#8b5cf6' }}>
                                <span className="w-3 h-1 bg-purple-500 rounded block" /> Unique
                            </span>
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={220}>
                        <LineChart data={dailyData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                            <Tooltip content={<CustomTooltip />} />
                            <Line type="monotone" dataKey="clicks" stroke="#6366f1" strokeWidth={2.5} dot={{ fill: '#6366f1', r: 3, strokeWidth: 0 }} name="Clicks" />
                            <Line type="monotone" dataKey="unique" stroke="#8b5cf6" strokeWidth={2} strokeDasharray="5 5" dot={{ fill: '#8b5cf6', r: 2.5, strokeWidth: 0 }} name="Unique" />
                        </LineChart>
                    </ResponsiveContainer>
                </motion.div>

                {/* Device Breakdown */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
                    className="chart-container"
                >
                    <h3 className="font-semibold text-base mb-1" style={{ color: 'var(--text-primary)' }}>Devices</h3>
                    <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>Traffic by device type</p>
                    {deviceData.length > 0 ? (
                        <>
                            <ResponsiveContainer width="100%" height={150}>
                                <PieChart>
                                    <Pie data={deviceData} cx="50%" cy="50%" innerRadius={42} outerRadius={65} paddingAngle={3} dataKey="value">
                                        {deviceData.map((entry, index) => (
                                            <Cell key={index} fill={DEVICE_COLORS[entry.name] || '#6366f1'} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="space-y-2.5 mt-3">
                                {deviceData.map((d, i) => (
                                    <div key={i} className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: DEVICE_COLORS[d.name] || '#6366f1' }} />
                                            <span className="capitalize text-sm" style={{ color: 'var(--text-secondary)' }}>{d.name}</span>
                                        </div>
                                        <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{d.value.toLocaleString()}</span>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-40" style={{ color: 'var(--text-muted)' }}>
                            <MousePointerClick className="w-8 h-8 mb-2 opacity-40" />
                            <p className="text-sm">No device data yet</p>
                        </div>
                    )}
                </motion.div>
            </div>

            {/* Recent Links */}
            <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}
                className="card overflow-hidden"
            >
                <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'var(--border)', background: 'var(--bg-raised)' }}>
                    <h3 className="font-semibold text-base" style={{ color: 'var(--text-primary)' }}>Recent Links</h3>
                    <Link to="/dashboard/my-links" className="text-indigo-600 hover:text-indigo-700 text-sm font-medium flex items-center gap-1 transition-colors">
                        View all <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                </div>
                <div>
                    {isLoading ? (
                        Array(3).fill(0).map((_, i) => (
                            <div key={i} className="px-6 py-4 flex items-center gap-4 border-b last:border-0" style={{ borderColor: 'var(--border)' }}>
                                <div className="skeleton h-10 w-10 rounded-xl" />
                                <div className="flex-1 space-y-2">
                                    <div className="skeleton h-4 w-48 rounded" />
                                    <div className="skeleton h-3 w-32 rounded" />
                                </div>
                                <div className="skeleton h-6 w-16 rounded-full" />
                            </div>
                        ))
                    ) : stats.recentLinks?.length > 0 ? (
                        stats.recentLinks.map((link) => (
                            <div key={link._id}
                                className="px-6 py-4 flex items-center gap-4 border-b last:border-0 transition-colors group cursor-pointer"
                                style={{ borderColor: 'var(--border)' }}
                                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-raised)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                            >
                                <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center flex-shrink-0">
                                    <Link2 className="w-5 h-5 text-indigo-500" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                                        {link.title || link.originalUrl}
                                    </p>
                                    <p className="text-xs truncate mt-0.5" style={{ color: 'var(--text-muted)' }}>
                                        {import.meta.env.VITE_SHORT_URL_BASE}{link.shortCode}
                                    </p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right hidden sm:block">
                                        <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                                            {(link.stats?.totalClicks || 0).toLocaleString()}
                                        </p>
                                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>clicks</p>
                                    </div>
                                    <span className={link.isActive ? 'badge-success' : 'badge-muted'}>
                                        {link.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="px-6 py-16 text-center">
                            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                                <Link2 className="w-7 h-7 text-slate-400" />
                            </div>
                            <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>No links yet</p>
                            <p className="text-xs mb-5" style={{ color: 'var(--text-muted)' }}>Create your first short link to get started</p>
                            <Link to="/dashboard/create-link" className="btn-primary text-sm">
                                <Plus className="w-4 h-4" /> Create Link
                            </Link>
                        </div>
                    )}
                </div>
            </motion.div>

            {/* Top Countries */}
            {analytics.countryStats?.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 }}
                    className="chart-container"
                >
                    <h3 className="font-semibold text-base mb-5" style={{ color: 'var(--text-primary)' }}>Top Countries</h3>
                    <div className="space-y-4">
                        {analytics.countryStats.slice(0, 8).map((c, i) => {
                            const total = analytics.countryStats.reduce((sum, x) => sum + x.count, 0);
                            const pct = total > 0 ? ((c.count / total) * 100).toFixed(1) : 0;
                            return (
                                <div key={i} className="flex items-center gap-3">
                                    <span className="text-xs w-4 text-right font-medium" style={{ color: 'var(--text-muted)' }}>{i + 1}</span>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-1.5">
                                            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{c.country || c._id}</span>
                                            <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{c.count.toLocaleString()}</span>
                                        </div>
                                        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-raised)' }}>
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${pct}%` }}
                                                transition={{ delay: 0.8 + i * 0.05, duration: 0.6 }}
                                                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
                                            />
                                        </div>
                                    </div>
                                    <span className="text-xs w-10 text-right" style={{ color: 'var(--text-muted)' }}>{pct}%</span>
                                </div>
                            );
                        })}
                    </div>
                </motion.div>
            )}
        </div>
    );
};

export default DashboardOverview;
