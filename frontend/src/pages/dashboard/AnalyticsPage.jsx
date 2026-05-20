import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import ResponsiveChart from '@/components/ui/ResponsiveChart';
import { Globe, Monitor, TrendingUp, Users, Compass, BarChart3 } from 'lucide-react';
import api from '@/lib/api';
import { format } from 'date-fns';
import PageHeader from '@/components/ui/PageHeader';

const COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

const AXIS_TICK = { fill: '#64748b', fontSize: 11 };
const GRID_STROKE = '#e2e8f0';

const ChartTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="card px-3 py-2.5 text-sm shadow-card-md">
            <p className="text-xs font-medium chart-muted mb-1">{label}</p>
            {payload.map((p, i) => (
                <p key={i} style={{ color: p.color }} className="font-semibold">
                    {p.value?.toLocaleString()} {p.name}
                </p>
            ))}
        </div>
    );
};

const StatCard = ({ label, value, icon: Icon, iconBg, iconColor, delay, isLoading }) => (
    <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        className="stat-card-accent card-hover p-5"
    >
        <div className="flex items-center gap-2.5 mb-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBg}`}>
                <Icon className={`w-5 h-5 ${iconColor}`} />
            </div>
            <span className="chart-label font-medium">{label}</span>
        </div>
        {isLoading ? (
            <div className="skeleton h-8 w-24 rounded-lg" />
        ) : (
            <p className="chart-value">{(value ?? 0).toLocaleString()}</p>
        )}
    </motion.div>
);

const AnalyticsPage = () => {
    const [days, setDays] = useState(30);

    const { data, isLoading } = useQuery({
        queryKey: ['analytics-overview', days],
        queryFn: async () => {
            const { data: res } = await api.get(`/analytics/overview?days=${days}`);
            return res.data;
        },
    });

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
        <div className="space-y-6 animate-in">
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
                    </div>
                }
            />

            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <StatCard
                    label="Total Clicks"
                    value={analytics.totalClicks}
                    icon={TrendingUp}
                    iconBg="bg-indigo-50"
                    iconColor="text-indigo-600"
                    delay={0}
                    isLoading={isLoading}
                />
                <StatCard
                    label="Unique Visitors"
                    value={analytics.uniqueClicks}
                    icon={Users}
                    iconBg="bg-purple-50"
                    iconColor="text-purple-600"
                    delay={0.08}
                    isLoading={isLoading}
                />
                <StatCard
                    label="Human Traffic"
                    value={analytics.humanClicks}
                    icon={Globe}
                    iconBg="bg-emerald-50"
                    iconColor="text-emerald-600"
                    delay={0.16}
                    isLoading={isLoading}
                />
                <StatCard
                    label="Bot Traffic"
                    value={analytics.botClicks}
                    icon={Monitor}
                    iconBg="bg-amber-50"
                    iconColor="text-amber-600"
                    delay={0.24}
                    isLoading={isLoading}
                />
            </div>

            <div className="chart-container min-h-[320px]">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="chart-title">Daily Click Trend</h3>
                        <p className="chart-subtitle">Last {days} days</p>
                    </div>
                    <div className="flex items-center gap-4 text-xs">
                        <span className="flex items-center gap-1.5 text-indigo-600 font-medium">
                            <span className="w-3 h-3 rounded-sm bg-indigo-500 block" /> Clicks
                        </span>
                        <span className="flex items-center gap-1.5 text-purple-600 font-medium">
                            <span className="w-3 h-3 rounded-sm bg-purple-500 block" /> Unique
                        </span>
                    </div>
                </div>
                {isLoading ? (
                    <div className="skeleton h-[250px] w-full rounded-xl" />
                ) : hasDailyData ? (
                    <ResponsiveChart height={250} mobileHeight={220}>
                        <BarChart data={dailyData} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} vertical={false} />
                            <XAxis dataKey="date" tick={AXIS_TICK} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                            <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} allowDecimals={false} width={36} />
                            <Tooltip content={<ChartTooltip />} />
                            <Bar dataKey="clicks" name="Clicks" fill="#6366f1" radius={[6, 6, 0, 0]} maxBarSize={40} />
                            <Bar dataKey="unique" name="Unique" fill="#8b5cf6" radius={[6, 6, 0, 0]} maxBarSize={40} />
                        </BarChart>
                    </ResponsiveChart>
                ) : (
                    <div className="chart-empty min-h-[220px]">
                        <BarChart3 className="w-10 h-10 mb-3 opacity-40 text-indigo-400" />
                        <p className="text-sm font-medium text-slate-600">No click data yet</p>
                        <p className="text-xs chart-muted mt-1">Create links and share them to see trends here</p>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="chart-container">
                    <h3 className="chart-title mb-4 flex items-center gap-2">
                        <Globe className="w-5 h-5 text-indigo-600" /> Top Countries
                    </h3>
                    {isLoading ? (
                        <div className="space-y-3">
                            {Array(5)
                                .fill(0)
                                .map((_, i) => (
                                    <div key={i} className="skeleton h-8 rounded-lg" />
                                ))}
                        </div>
                    ) : countryData.length > 0 ? (
                        <div className="space-y-4">
                            {countryData.map((c, i) => {
                                const total = countryData.reduce((sum, x) => sum + x.count, 0);
                                const pct = total > 0 ? ((c.count / total) * 100).toFixed(1) : 0;
                                return (
                                    <div key={i}>
                                        <div className="flex justify-between text-sm mb-1.5">
                                            <span className="chart-label font-medium">{c.country || c._id || 'Unknown'}</span>
                                            <span className="font-semibold text-slate-800">
                                                {c.count.toLocaleString()} ({pct}%)
                                            </span>
                                        </div>
                                        <div className="progress-track">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${pct}%` }}
                                                transition={{ delay: 0.2 + i * 0.05, duration: 0.5 }}
                                                className="h-full rounded-full"
                                                style={{ background: COLORS[i % COLORS.length] }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="chart-empty py-10">
                            <Globe className="w-8 h-8 mb-2 opacity-40" />
                            <p className="text-sm">No country data yet</p>
                        </div>
                    )}
                </div>

                <div className="chart-container">
                    <h3 className="chart-title mb-4 flex items-center gap-2">
                        <Compass className="w-5 h-5 text-purple-600" /> Browsers
                    </h3>
                    {isLoading ? (
                        <div className="skeleton h-48 rounded-xl" />
                    ) : browserData.length > 0 ? (
                        <>
                            <ResponsiveChart height={200} mobileHeight={160}>
                                <PieChart>
                                    <Pie
                                        data={browserData.map((b) => ({
                                            name: b._id || 'Unknown',
                                            value: b.count,
                                        }))}
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={80}
                                        innerRadius={50}
                                        paddingAngle={3}
                                        dataKey="value"
                                        stroke="#ffffff"
                                        strokeWidth={2}
                                    >
                                        {browserData.map((_, i) => (
                                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<ChartTooltip />} />
                                </PieChart>
                            </ResponsiveChart>
                            <div className="grid grid-cols-2 gap-2 mt-4">
                                {browserData.slice(0, 6).map((b, i) => (
                                    <div key={i} className="flex items-center gap-2 text-xs">
                                        <div
                                            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                                            style={{ background: COLORS[i % COLORS.length] }}
                                        />
                                        <span className="chart-label truncate">{b._id || 'Unknown'}</span>
                                        <span className="font-semibold text-slate-800 ml-auto">{b.count}</span>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="chart-empty py-10">
                            <Compass className="w-8 h-8 mb-2 opacity-40" />
                            <p className="text-sm">No browser data yet</p>
                        </div>
                    )}
                </div>
            </div>

            {topReferers.length > 0 && (
                <div className="table-container">
                    <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/80">
                        <h3 className="chart-title text-base">Top Referrers</h3>
                    </div>
                    <div className="divide-y divide-slate-100">
                        {topReferers.map((r, i) => (
                            <div key={i} className="table-row flex items-center justify-between px-6 py-3.5">
                                <span className="text-sm chart-label truncate max-w-md">{r._id || 'Direct'}</span>
                                <span className="text-sm font-semibold text-slate-800">{r.count.toLocaleString()}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AnalyticsPage;
