import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { BarChart, Line, LineChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Link2, Copy, MousePointerClick, Users, Globe } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import PageHeader from '@/components/ui/PageHeader';
import { SHORT_URL_BASE } from '@/config/env';

const GRID_STROKE = '#e2e8f0';
const AXIS_TICK = { fill: '#64748b', fontSize: 11 };

const LinkDetailPage = () => {
    const { id } = useParams();

    const { data: linkData, isLoading } = useQuery({
        queryKey: ['link-detail', id],
        queryFn: async () => {
            const { data } = await api.get(`/links/${id}`);
            return data.data.link;
        },
    });

    const { data: analyticsData } = useQuery({
        queryKey: ['link-analytics', id],
        queryFn: async () => {
            const { data } = await api.get(`/analytics/link/${id}?days=30`);
            return data.data;
        },
        enabled: !!id,
    });

    const link = linkData;
    const analytics = analyticsData || {};
    const shortUrl = link
        ? `${SHORT_URL_BASE}${link.shortCode}`
        : '';

    const dailyData =
        analytics.dailyClicks?.map((d) => ({
            date: format(new Date(d._id), 'MMM dd'),
            clicks: d.count,
        })) || [];

    if (isLoading) {
        return (
            <div className="space-y-4">
                {Array(3)
                    .fill(0)
                    .map((_, i) => (
                        <div key={i} className="skeleton h-32 rounded-2xl" />
                    ))}
            </div>
        );
    }

    if (!link) {
        return (
            <div className="empty-state">
                <p className="text-lg font-medium text-slate-700">Link not found</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in">
            <div className="card-elevated p-6">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 min-w-0">
                        <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center flex-shrink-0">
                            <Link2 className="w-6 h-6 text-indigo-600" />
                        </div>
                        <div className="min-w-0">
                            <h1 className="text-xl font-bold text-slate-900 truncate">
                                {link.title || 'Untitled Link'}
                            </h1>
                            <p className="text-slate-500 text-sm mt-1 max-w-md truncate">{link.originalUrl}</p>
                            <div className="flex items-center gap-2 mt-3 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 max-w-md">
                                <span className="text-indigo-600 font-mono text-sm truncate">{shortUrl}</span>
                                <button
                                    type="button"
                                    onClick={() => {
                                        navigator.clipboard.writeText(shortUrl);
                                        toast.success('Copied!');
                                    }}
                                    className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-white transition-colors shrink-0"
                                >
                                    <Copy className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                    <span className={`badge shrink-0 ${link.isActive ? 'badge-success' : 'badge-muted'}`}>
                        {link.isActive ? 'Active' : 'Inactive'}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Total Clicks', value: analytics.totalClicks || 0, icon: MousePointerClick, bg: 'bg-indigo-50', color: 'text-indigo-600' },
                    { label: 'Unique Visitors', value: analytics.uniqueClicks || 0, icon: Users, bg: 'bg-purple-50', color: 'text-purple-600' },
                    { label: 'Countries', value: analytics.countryStats?.length || 0, icon: Globe, bg: 'bg-emerald-50', color: 'text-emerald-600' },
                    { label: 'AI Score', value: link.aiEngagementScore || 0, icon: Link2, bg: 'bg-amber-50', color: 'text-amber-600' },
                ].map((s, i) => (
                    <div key={i} className="stat-card-accent card p-4">
                        <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center mb-3`}>
                            <s.icon className={`w-5 h-5 ${s.color}`} />
                        </div>
                        <p className="chart-value text-xl">{s.value.toLocaleString()}</p>
                        <p className="chart-label text-sm mt-0.5">{s.label}</p>
                    </div>
                ))}
            </div>

            {dailyData.length > 0 ? (
                <div className="chart-container min-h-[280px]">
                    <h3 className="chart-title mb-4">Click History</h3>
                    <ResponsiveContainer width="100%" height={220}>
                        <LineChart data={dailyData}>
                            <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} vertical={false} />
                            <XAxis dataKey="date" tick={AXIS_TICK} axisLine={false} tickLine={false} />
                            <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} allowDecimals={false} />
                            <Tooltip />
                            <Line
                                type="monotone"
                                dataKey="clicks"
                                stroke="#6366f1"
                                strokeWidth={2.5}
                                dot={{ fill: '#6366f1', r: 3, strokeWidth: 0 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            ) : (
                <div className="chart-empty">
                    <p className="text-sm font-medium text-slate-600">No clicks recorded yet</p>
                </div>
            )}

            {analytics.countryStats?.length > 0 && (
                <div className="chart-container">
                    <h3 className="chart-title mb-4">Country Breakdown</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {analytics.countryStats.slice(0, 10).map((c, i) => (
                            <div
                                key={i}
                                className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-slate-50 border border-slate-100"
                            >
                                <span className="text-sm font-medium text-slate-600">{c.country || c._id}</span>
                                <span className="text-sm font-semibold text-slate-900">{c.count}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {link.qrCode?.url && (
                <div className="card p-6 flex flex-col sm:flex-row items-center gap-6">
                    <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                        <img src={link.qrCode.url} alt="QR" className="w-24 h-24" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-slate-900 mb-1">QR Code</h3>
                        <p className="text-slate-500 text-sm mb-3">Scan to visit this link</p>
                        <a href={link.qrCode.url} download={`qr-${link.shortCode}.png`} className="btn-secondary text-sm py-2 px-4">
                            Download QR
                        </a>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LinkDetailPage;
