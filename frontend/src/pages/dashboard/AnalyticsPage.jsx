import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Globe, Monitor, TrendingUp, Users, Compass, BarChart2, Download, Eye } from 'lucide-react';
import api from '@/lib/api';
import { format } from 'date-fns';
import PageHeader from '@/components/ui/PageHeader';
import { StatCard } from '@/components/ui';


const AXIS_TICK = { fill: 'var(--muted)', fontSize: 11 };
const GRID_STROKE = 'var(--border)';

const ChartTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="card px-3 py-2.5 text-sm shadow-card-md">
            <p className="text-xs font-medium chart-muted mb-1">{label}</p>
            {payload.map((p, i) => (
                <p key={i} style={{ color: 'var(--primary)' }} className="font-semibold">
                    {p.value?.toLocaleString()} {p.name}
                </p>
            ))}
        </div>
    );
};

const AnalyticsPage = () => {
    const [days, setDays] = useState(30);
    const [realTime, setRealTime] = useState(null);

    const { data, isLoading } = useQuery({
        queryKey: ['analytics-overview', days],
        queryFn: async () => {
            const { data: res } = await api.get(`/analytics/overview?days=${days}`);
            return res.data;
        }
    });

    // Fetch real-time visits
    useEffect(() => {
        const fetchRealTime = async () => {
            try {
                const { data: res } = await api.get('/analytics/realtime');
                setRealTime(res.data);
            } catch (err) {
                console.error('Failed to fetch real-time analytics:', err);
            }
        };

        fetchRealTime();
        const interval = setInterval(fetchRealTime, 30000);
        return () => clearInterval(interval);
    }, []);

    const analytics = data || {};
    const dailyData =
        analytics.dailyClicks?.map((d) => ({
            date: format(new Date(d._id), 'MMM dd'),
            clicks: d.clicks || d.count || 0,
            unique: d.unique || 0,
        })) || [];

    const countryData = analytics.countryStats?.slice(0, 10) || [];
    const browserData = analytics.browserStats?.slice(0, 8) || [];
    const topReferers = analytics.referrerStats?.slice(0, 10) || [];

    const hasDailyData = dailyData.some((d) => d.clicks > 0 || d.unique > 0);

    return (
        <div className="space-y-6 bg-background">
            <PageHeader
                title="Analytics"
                subtitle="Deep dive into your traffic data"
                action={
                    <div className="flex gap-2">
                        {[7, 30, 90].map((d) => (
                            <button
                                key={d}
                                type="button"
                                onClick={() => setDays(d)}
                                className={days === d ? 'filter-pill-active' : 'filter-pill'}
                            >
                                {d}d
                            </button>
                        ))}
                        <button
                            type="button"
                            onClick={() => window.open(`${process.env.VITE_API_URL}/export/analytics?days=${days}`, '_blank')}
                            className="btn-secondary flex items-center gap-2"
                        >
                            <Download className="w-4 h-4" /> Export CSV
                        </button>
                    </div>
                }
            />

            {/* Stat Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                <StatCard
                    label="Total Clicks"
                    value={analytics.totalClicks}
                    icon={TrendingUp}
                    iconBg="bg-primary/10"
                    iconColor="text-primary"
                    delay={0}
                    isLoading={isLoading}
                />
                <StatCard
                    label="Unique Visitors"
                    value={analytics.uniqueClicks}
                    icon={Users}
                    iconBg="bg-secondary/10"
                    iconColor="text-secondary"
                    delay={0.08}
                    isLoading={isLoading}
                />
                <StatCard
                    label="Human Traffic"
                    value={analytics.humanClicks}
                    icon={Globe}
                    iconBg="bg-emerald/10"
                    iconColor="text-emerald"
                    delay={0.16}
                    isLoading={isLoading}
                />
                <StatCard
                    label="Bot Traffic"
                    value={analytics.botClicks}
                    icon={Monitor}
                    iconBg="bg-warning/10"
                    iconColor="text-warning"
                    delay={0.24}
                    isLoading={isLoading}
                />
            </div>

            {/* Real-time Visits */}
            {realTime && (
                <div className="card p-4 rounded-lg mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                            <Eye className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <p className="font-medium text-base">{realTime.currentVisitors || 0} active</p>
                            <p className="text-xs text-slate-500">right now</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Daily Click Trend */}
                <div className="chart-container rounded-lg p-4">
                    <h3 className="chart-title mb-4 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-primary" /> Daily Click Trend
                    </h3>
                    <p className="chart-subtitle text-xs">Last {days} days</p>
                    <div className="flex items-center gap-4 text-xs">
                        <span className="flex items-center gap-1.5 text-primary font-medium">
                            <span className="w-3 h-3 rounded block" /> Clicks
                        </span>
                        <span className="flex items-center gap-1.5 text-secondary font-medium">
                            <span className="w-3 h-3 rounded block" /> Unique
                        </span>
                    </div>
                    {isLoading ? (
                        loadingSkeleton
                    ) : hasDailyData ? (
                        <ResponsiveChart height={250} mobileHeight={220}>
                            <BarChart data={dailyData} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} vertical={false} />
                                <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} width={36} />
                                <Tooltip content={<ChartTooltip />} />
                                <Bar dataKey="clicks" name="Clicks" fill="var(--primary)" radius={[6, 6, 0, 0]} maxBarSize={40} />
                                <Bar dataKey="unique" name="Unique" fill="var(--secondary)" radius={[6, 6, 0, 0]} maxBarSize={40} />
                            </BarChart>
                        </ResponsiveChart>
                    ) : (
                        <div className="chart-empty min-h-[220px]">
                            <BarChart2 className="w-10 h-10 mb-3 opacity-40 text-primary" />
                            <p className="text-sm font-medium text-slate-500">No click data yet</p>
                            <p className="text-xs chart-muted mt-1">Create links and share them to see trends here</p>
                        </div>
                    )}
                </div>

                {/* Geo & Browser */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Top Countries */}
                    <div className="chart-container rounded-lg p-4">
                        <h3 className="chart-title mb-4 flex items-center gap-2">
                            <Globe className="w-4 h-4 text-primary" /> Top Countries
                        </h3>
                        {isLoading ? (
                            <div className="space-y-3">
                                <div className="h-8 rounded-lg w-16 bg-slate-200/50 dark:bg-slate-800/50 mx-auto my-1" />
                                <div className="h-8 rounded-lg w-16 bg-slate-200/50 dark:bg-slate-800/50 mx-auto my-1" />
                                <div className="h-8 rounded-lg w-16 bg-slate-200/50 dark:bg-slate-800/50 mx-auto my-1" />
                                <div className="h-8 rounded-lg w-16 bg-slate-200/50 dark:bg-slate-800/50 mx-auto my-1" />
                                <div className="h-8 rounded-lg w-16 bg-slate-200/50 dark:bg-slate-800/50 mx-auto my-1" />
                            </div>
                        ) : countryData.length > 0 ? (
                            <div className="space-y-4">
                                {countryData.map((c, i) => (
                                    <div key={i} className="flex items-center gap-3 text-sm">
                                        <span className="text-xs w-4 text-right font-medium" style={{ color: 'var(--muted)' }}>{i + 1}</span>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-1.5">
                                                <span className="text-sm" style={{ color: 'var(--muted)' }}>{c.country || c._id || 'Unknown'}</span>
                                                <span className="font-semibold text-primary">
                                                    {c.count.toLocaleString()}({(countryData.reduce((sum, x) => sum + x.count, 0) / c.count) * 100 > 0 ? ((c.count / countryData.reduce((sum, x) => sum + x.count, 0)) * 100).toFixed(1) : 0}%)
                                                </span>
                                            </div>
                                            <div className="progress-track">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: '100%' }}
                                                    transition={{ delay: 0.2, duration: 0.5 }}
                                                    className="h-full rounded-full"
                                                    style={{ background: 'var(--primary)' }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-secondary-text text-sm">No country data yet</p>
                        )}
                    </div>

                    {/* Browsers */}
                    <div className="chart-container rounded-lg p-4">
                        <h3 className="chart-title mb-4 flex items-center gap-2">
                            <Compass className="w-4 h-4 text-primary" /> Browsers
                        </h3>
                        {isLoading ? (
                            <div className="skeleton h-48 rounded-xl" />
                        ) : browserData.length > 0 ? (
                            <ResponsiveChart height={200} mobileHeight={160}>
                                <PieChart>
                                    <Pie
                                        data={browserData.map((b) => ({ name: b._id || 'Unknown', value: b.count }))}
                                        cx="50%" cy="50%" outerRadius={80} innerRadius={50} paddingAngle={3} dataKey="value"
                                        stroke="#fff" strokeWidth={2}
                                    >
                                        {browserData.map((_, i) => (
                                            <Cell key={i} fill="var(--primary)" />
                                        ))}
                                    </Pie>
                                </PieChart>
                                <div className="grid grid-cols-2 gap-2 mt-4">
                                    {browserData.slice(0, 6).map((b, i) => (
                                        <div key={i} className="flex items-center gap-2 text-xs">
                                            <div
                                                className="w-2.5 h-2.5 rounded-shrink-0"
                                                style={{ background: 'var(--primary)' }}
                                            />
                                            <span className="chart-label truncate">{b._id || 'Unknown'}</span>
                                            <span className="font-semibold text-slate-400 ml-auto">{b.count}</span>
                                        </div>
                                    ))}
                                </div>
                            </ResponsiveChart>
                        ) : (
                            <div className="chart-empty py-10">
                                <Compass className="w-8 h-8 mb-2 opacity-40" />
                                <p className="text-sm">No browser data yet</p>
                            </div>
                        )
                        }
                    </div>
                </div>
            </div>

            {/* Top Referrers */}
            {topReferers.length > 0 && (
                <div className="table-container rounded-lg p-4">
                    <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/80">
                        <h3 className="chart-title text-base">Top Referrers</h3>
                    </div>
                    <div className="divide-y divide-slate-100">
                        {topReferers.map((r, i) => (
                            <div key={i} className="table-row flex items-center justify-between px-6 py-3.5">
                                <span className="text-sm chart-label truncate max-w-md">{r._id || 'Direct'}</span>
                                <span className="text-sm font-semibold text-primary">{r.count.toLocaleString()}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AnalyticsPage;