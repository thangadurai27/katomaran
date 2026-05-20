// Simple placeholder pages for remaining routes
import React from 'react';
import { Globe, Layers, Download, Activity, Trash2, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

const PlaceholderPage = ({ icon: Icon, title, desc, color }) => (
    <div className="space-y-6 animate-in">
        <div>
            <h1 className="page-title flex items-center gap-2"><Icon className={`w-7 h-7 ${color}`} /> {title}</h1>
            <p className="page-subtitle">{desc}</p>
        </div>
        <div className="flex flex-col items-center justify-center py-24 glass-card">
            <Icon className="w-16 h-16 text-slate-500 mb-4" />
            <h3 className="text-xl font-semibold text-slate-600 mb-2">{title}</h3>
            <p className="text-slate-500 text-center max-w-sm">{desc}</p>
        </div>
    </div>
);

export const PublicPagesPage = () => {
    return (
        <div className="space-y-6 animate-in">
            <div>
                <h1 className="page-title flex items-center gap-2"><Globe className="w-7 h-7 text-brand-400" /> Public Bio Pages</h1>
                <p className="page-subtitle">Manage your Linktree-like public profile page</p>
            </div>
            <div className="glass-card p-6">
                <p className="text-slate-600 mb-4">Your bio page is publicly available at:</p>
                <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
                    <span className="text-brand-400 font-mono">{window.location.origin}/u/your-username</span>
                </div>
                <Link to="/u/test" target="_blank" className="btn-primary mt-4">
                    View My Bio Page
                </Link>
            </div>
        </div>
    );
};

export const BulkShortenerPage = () => {
    return (
        <div className="space-y-6 animate-in">
            <div>
                <h1 className="page-title flex items-center gap-2"><Layers className="w-7 h-7 text-brand-400" /> Bulk Shortener</h1>
                <p className="page-subtitle">Shorten multiple URLs at once by uploading a CSV file</p>
            </div>
            <div className="glass-card p-8 text-center space-y-4">
                <div className="w-20 h-20 rounded-2xl bg-brand-600/20 border-2 border-dashed border-brand-500/50 flex items-center justify-center mx-auto">
                    <Layers className="w-10 h-10 text-brand-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">Upload CSV File</h3>
                <p className="text-slate-600 text-sm max-w-sm mx-auto">CSV must have a <code className="text-brand-400">url</code> column. Maximum 500 URLs per upload.</p>
                <label className="btn-primary cursor-pointer">
                    <input type="file" accept=".csv" className="hidden" onChange={async (e) => {
                        const file = e.target.files[0];
                        if (!file) return;
                        const formData = new FormData();
                        formData.append('file', file);
                        try {
                            const { data } = await api.post('/bulk/import', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
                            alert(`Created ${data.data.created.length} links, ${data.data.errors.length} errors`);
                        } catch (err) {
                            alert('Upload failed');
                        }
                    }} />
                    Choose CSV File
                </label>
                <p className="text-slate-500 text-xs">Download <a href="#" className="text-brand-400">example CSV template</a></p>
            </div>
        </div>
    );
};

export const ExportCenterPage = () => (
    <div className="space-y-6 animate-in">
        <div>
            <h1 className="page-title flex items-center gap-2"><Download className="w-7 h-7 text-brand-400" /> Export Center</h1>
            <p className="page-subtitle">Download your data in various formats</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
                { title: 'Export Links (CSV)', desc: 'Download all your shortened links with metadata', endpoint: '/export/links', name: 'links.csv' },
                { title: 'Export Analytics (CSV)', desc: 'Download all click events and analytics data', endpoint: '/export/analytics', name: 'analytics.csv' },
            ].map((item, i) => (
                <div key={i} className="glass-card-hover p-6">
                    <Download className="w-8 h-8 text-brand-400 mb-4" />
                    <h3 className="text-lg font-semibold text-slate-900">{item.title}</h3>
                    <p className="text-slate-600 text-sm mb-4">{item.desc}</p>
                    <a href={`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}${item.endpoint}`}
                        className="btn-primary text-sm py-2"
                        target="_blank" rel="noopener noreferrer">
                        <Download className="w-4 h-4" /> Download
                    </a>
                </div>
            ))}
        </div>
    </div>
);

export const ActivityLogsPage = () => {
    const { data, isLoading } = useQuery({
        queryKey: ['activity-logs'],
        queryFn: async () => {
            const { data } = await api.get('/activity?limit=50');
            return data.data.logs;
        }
    });

    return (
        <div className="space-y-6 animate-in">
            <div>
                <h1 className="page-title flex items-center gap-2"><Activity className="w-7 h-7 text-brand-400" /> Activity Logs</h1>
                <p className="page-subtitle">Complete history of your account activity</p>
            </div>
            <div className="table-container">
                <div className="divide-y divide-slate-100">
                    {isLoading ? Array(8).fill(0).map((_, i) => <div key={i} className="px-6 py-4 skeleton h-12" />) :
                        data?.map((log) => (
                            <div key={log._id} className="px-6 py-4 flex items-center justify-between">
                                <div>
                                    <p className="text-lg font-semibold text-slate-900">{log.action.replace(/_/g, ' ')}</p>
                                    <p className="text-xs text-slate-600">{log.description}</p>
                                </div>
                                <div className="text-right">
                                    <span className={`badge text-xs ${log.severity === 'warning' ? 'badge-warning' : log.severity === 'error' ? 'badge-danger' : 'badge-muted'}`}>
                                        {log.severity}
                                    </span>
                                    <p className="text-xs text-slate-500 mt-1">{new Date(log.createdAt).toLocaleDateString()}</p>
                                </div>
                            </div>
                        ))
                    }
                </div>
            </div>
        </div>
    );
};

export const TrashPage = () => {
    const { data, isLoading } = useQuery({
        queryKey: ['trash'],
        queryFn: async () => {
            const { data } = await api.get('/links?trashed=true&limit=50');
            return data.data;
        }
    });

    return (
        <div className="space-y-6 animate-in">
            <div>
                <h1 className="page-title flex items-center gap-2"><Trash2 className="w-7 h-7 text-red-400" /> Trash</h1>
                <p className="page-subtitle">Links moved to trash. Permanently delete or restore.</p>
            </div>
            {isLoading ? <div className="skeleton h-64 rounded-2xl" /> :
                data?.length > 0 ? (
                    <div className="table-container">
                        {data.map(link => (
                            <div key={link._id} className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
                                <div>
                                    <p className="text-lg font-semibold text-slate-900">{link.title || link.originalUrl}</p>
                                    <p className="text-xs text-slate-600 font-mono">/{link.shortCode}</p>
                                </div>
                                <button onClick={async () => { await api.delete(`/links/${link._id}?permanent=true`); window.location.reload(); }}
                                    className="btn-danger text-xs py-1.5 px-3">Delete Forever</button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-16 glass-card">
                        <Trash2 className="w-12 h-12 text-slate-500 mb-4" />
                        <p className="text-slate-600">Trash is empty</p>
                    </div>
                )
            }
        </div>
    );
};

export const AdminPage = () => {
    const { data: stats } = useQuery({
        queryKey: ['admin-stats'],
        queryFn: async () => {
            const { data } = await api.get('/admin/stats');
            return data.data;
        }
    });

    return (
        <div className="space-y-6 animate-in">
            <div>
                <h1 className="page-title flex items-center gap-2"><Shield className="w-7 h-7 text-brand-400" /> Admin Panel</h1>
                <p className="page-subtitle">Platform administration and management</p>
            </div>
            {stats && (
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                    {[
                        { key: 'totalUsers', label: 'Total Users' },
                        { key: 'totalLinks', label: 'Total Links' },
                        { key: 'totalClicks', label: 'Total Clicks' },
                        { key: 'newUsersToday', label: 'New Today' },
                        { key: 'activeToday', label: 'Active Today' },
                    ].map((s) => (
                        <div key={s.key} className="glass-card p-4 text-center">
                            <p className="text-lg font-semibold text-slate-900">{(stats[s.key] || 0).toLocaleString()}</p>
                            <p className="text-slate-600 text-xs mt-1">{s.label}</p>
                        </div>
                    ))}
                </div>
            )}
            <div className="glass-card p-6">
                <p className="text-slate-600 text-sm">Full admin panel with user management, ban controls, and system monitoring available via API.</p>
            </div>
        </div>
    );
};

export default PublicPagesPage;
