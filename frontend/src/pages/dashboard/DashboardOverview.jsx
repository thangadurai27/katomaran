import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Link2, MousePointerClick, TrendingUp, Clock, ArrowUpRight, ArrowDownRight, Shield, Users, Plus } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '@/lib/api';
import { format } from 'date-fns';
import PageHeader from '@/components/ui/PageHeader';
import { StatCard } from '@/components/ui';

const DashboardOverview = () => {
    const { data: statsData, isLoading } = useQuery({
        queryKey: ['dashboard-stats'],
        queryFn: async () => {
            const { data } = await api.get('/links/stats/overview');
            return data.data;
        }
    });

    const { data: analyticsData, isLoading: isLoading2 } = useQuery({
        queryKey: ['analytics-overview'],
        queryFn: async () => {
            const { data } = await api.get('/analytics/overview?days=30');
            return data.data;
        }
    });

    const stats = statsData || {};
    const recentLinks = stats.recentLinks || [];
    const analytics = analyticsData || {};

    return (
        <div className="space-y-6 animate-in bg-background">
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
                {/* Total Links */}
                <StatCard
                    icon={Link2}
                    label="Total Links"
                    value={stats.totalLinks || 0}
                    iconBg="bg-primary/10"
                    iconColor="text-primary"
                    delay={0}
                />
                {/* Total Clicks */}
                <StatCard
                    icon={MousePointerClick}
                    label="Total Clicks"
                    value={stats.totalClicks || 0}
                    change={stats.clickGrowth}
                    iconBg="bg-primary/10"
                    iconColor="text-primary"
                    delay={0.08}
                />
                {/* Active Links */}
                <StatCard
                    icon={Shield}
                    label="Active Links"
                    value={stats.activeLinks || 0}
                    iconBg="bg-secondary/10"
                    iconColor="text-secondary"
                    delay={0.16}
                />
                {/* Expired Links */}
                <StatCard
                    icon={Clock}
                    label="Expired Links"
                    value={stats.expiredLinks || 0}
                    iconBg="bg-warning/10"
                    iconColor="text-warning"
                    delay={0.24}
                />
                {/* Unique Visitors */}
                <StatCard
                    icon={Users}
                    label="Unique Visitors"
                    value={stats.uniqueClicks || 0}
                    iconBg="bg-primary/10"
                    iconColor="text-primary"
                    delay={0.32}
                />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Line Chart */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                    className="chart-container lg:col-span-2"
                >
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="font-semibold text-base" style={{ color: 'var(--primary-text)' }}>Click Performance</h3>
                            <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>Last 30 days</p>
                        </div>
                        <div className="flex items-center gap-4 text-xs">
                            <span className="flex items-center gap-1.5" style={{ color: 'var(--primary)' }}>
                                <span className="w-3 h-1 bg-primary rounded block" /> All Clicks
                            </span>
                            <span className="flex items-center gap-1.5" style={{ color: 'var(--secondary)' }}>
                                <span className="w-3 h-1 bg-secondary rounded block" /> Unique
                            </span>
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={220}>
                        <LineChart data={analytics.dailyClicks?.map(d => ({ date: d._id, clicks: d.clicks || d.count || 0, unique: d.unique || 0 })) || []}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                            <Tooltip />
                            <Line type="monotone" dataKey="clicks" stroke="#6846F5" strokeWidth={2.5} dot={{ fill: '#6846F5', r: 3, strokeWidth: 0 }} name="Clicks" />
                            <Line type="monotone" dataKey="unique" stroke="#8B5CF6" strokeWidth={2} strokeDasharray="5 5" dot={{ fill: '#8B5CF6', r: 2.5, strokeWidth: 0 }} name="Unique" />
                        </LineChart>
                    </ResponsiveContainer>
                </motion.div>

                {/* Device Breakdown */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.45 }}
                    className="chart-container"
                >
                    <h3 className="font-semibold text-base mb-1" style={{ color: 'var(--primary-text)' }}>Devices</h3>
                    <p className="text-xs mb-4" style={{ color: 'var(--muted)' }}>Traffic by device type</p>
                    {/* Device data would come from API - simplified for now */}
                    <div className="text-center text-sm text-slate-500">
                        No device data yet
                    </div>
                </motion.div>
            </div>

            {/* Recent Links */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55 }}
                className="card overflow-hidden"
            >
                <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'var(--border)', background: 'var(--bg-raised)' }}>
                    <h3 className="font-semibold text-base" style={{ color: 'var(--primary-text)' }}>Recent Links</h3>
                    <Link to="/dashboard/my-links" className="text-primary hover:text-secondary text-sm font-medium flex items-center gap-1 transition-colors">
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
                                    <div className="skeleton h-6 w-16 rounded-full" />
                                </div>
                            </div>
                        ))
                    ) : recentLinks.length > 0 ? (
                        recentLinks.map((link) => (
                            <div key={link._id}
                                className="px-6 py-4 flex items-center gap-4 border-b last:border-0 transition-colors"
                                style={{ borderColor: 'var(--border)' }}
                                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-raised)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                            >
                                <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                                    <Link2 className="w-5 h-5 text-primary" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate" style={{ color: 'var(--primary-text)' }}>
                                        {link.title || link.originalUrl}
                                    </p>
                                    <p className="text-xs truncate mt-0.5" style={{ color: 'var(--muted)' }}>
                                        /{link.shortCode}
                                    </p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right hidden sm:block">
                                        <p className="font-semibold text-sm" style={{ color: 'var(--primary-text)' }}>
                                            {(link.stats?.totalClicks || 0).toLocaleString()}
                                        </p>
                                        <p className="text-xs" style={{ color: 'var(--muted)' }}>clicks</p>
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
                            <p className="text-sm font-medium mb-1" style={{ color: 'var(--muted)' }}>No links yet</p>
                            <p className="text-xs mb-5" style={{ color: 'var(--muted)' }}>Create your first short link to get started</p>
                            <Link to="/dashboard/create-link" className="btn-primary text-sm">
                                <Plus className="w-4 h-4" /> Create Link
                            </Link>
                        </div>
                    )}
                </div>
            </motion.div>

            {/* Top Performing Links section removed - consolidating into main stats */}
        </div>
    );
};

export default DashboardOverview;