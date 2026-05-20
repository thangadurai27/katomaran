import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
    Search, Filter, Grid3X3, List, Copy, Edit, Archive, Trash2, QrCode,
    Star, Pin, ExternalLink, MoreVertical, Plus, Link2, SortAsc, SortDesc
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { format } from 'date-fns';
import PageHeader from '@/components/ui/PageHeader';

const LinkCard = ({ link, onAction }) => {
    const [menuOpen, setMenuOpen] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const shortUrl = `${import.meta.env.VITE_SHORT_URL_BASE || 'http://localhost:5000/r/'}${link.shortCode}`;

    const copyLink = (e) => {
        e.preventDefault();
        navigator.clipboard.writeText(shortUrl);
        toast.success('Copied!');
    };

    const isExpired = link.expiresAt && new Date(link.expiresAt) < new Date();

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card-hover p-4 sm:p-5 active:scale-[0.99] transition-transform"
        >
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3 min-w-0">
                    {link.metadata?.favicon && (
                        <img src={link.metadata.favicon} alt="" className="w-6 h-6 rounded flex-shrink-0" onError={(e) => e.target.style.display = 'none'} />
                    )}
                    <div className="min-w-0">
                        <p className="font-semibold text-sm truncate" style={{ color: 'var(--text-primary)' }}>{link.title || 'Untitled Link'}</p>
                        <p className="text-xs truncate max-w-48" style={{ color: 'var(--text-muted)' }}>{link.originalUrl}</p>
                    </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                    {link.isFavorited && <Star className="w-3.5 h-3.5 text-amber-400 fill-current" />}
                    {link.isPinned && <Pin className="w-3.5 h-3.5 text-brand-400" />}
                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => setMenuOpen(!menuOpen)}
                            className="touch-target p-2 rounded-xl transition-colors text-slate-500"
                            aria-label="Link actions"
                        >
                            <MoreVertical className="w-4 h-4" />
                        </button>
                        {menuOpen && (
                            <div className="absolute right-0 top-8 w-44 card p-1.5 z-20 shadow-card-lg">
                                <button onClick={() => { onAction('favorite', link._id); setMenuOpen(false); }}
                                    className="w-full text-left px-3 py-1.5 text-xs rounded-lg flex items-center gap-2 transition-colors" style={{ color: 'var(--text-secondary)' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-raised)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                    <Star className="w-3.5 h-3.5" /> {link.isFavorited ? 'Unfavorite' : 'Favorite'}
                                </button>
                                <button onClick={() => { onAction('pin', link._id); setMenuOpen(false); }}
                                    className="w-full text-left px-3 py-1.5 text-xs rounded-lg flex items-center gap-2 transition-colors" style={{ color: 'var(--text-secondary)' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-raised)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                    <Pin className="w-3.5 h-3.5" /> {link.isPinned ? 'Unpin' : 'Pin'}
                                </button>
                                <button onClick={() => { onAction('archive', link._id); setMenuOpen(false); }}
                                    className="w-full text-left px-3 py-1.5 text-xs rounded-lg flex items-center gap-2 transition-colors" style={{ color: 'var(--text-secondary)' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-raised)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                    <Archive className="w-3.5 h-3.5" /> Archive
                                </button>
                                <div className="border-t my-1" style={{ borderColor: 'var(--border)' }} />
                                <button onClick={() => { onAction('delete', link._id); setMenuOpen(false); }}
                                    className="w-full text-left px-3 py-1.5 text-xs text-red-400 hover:bg-red-500/10 rounded-lg flex items-center gap-2">
                                    <Trash2 className="w-3.5 h-3.5" /> Delete
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Short URL */}
            <div className="flex items-center gap-2 rounded-lg px-3 py-2 mb-3" style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)' }}>
                <span className="text-indigo-600 font-mono text-xs flex-1 truncate">{shortUrl}</span>
                <button onClick={copyLink} className="transition-colors hover:text-indigo-600" style={{ color: 'var(--text-muted)' }}>
                    <Copy className="w-3.5 h-3.5" />
                </button>
                <a href={shortUrl} target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-indigo-600" style={{ color: 'var(--text-muted)' }}>
                    <ExternalLink className="w-3.5 h-3.5" />
                </a>
            </div>

            <div className="flex items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <span className="font-bold text-base text-slate-900">{(link.stats?.totalClicks || 0).toLocaleString()}</span>
                    <span>clicks</span>
                    <span className="hidden xs:inline">·</span>
                    <span>{format(new Date(link.createdAt), 'MMM d, yyyy')}</span>
                </div>
                <span className={`badge text-[10px] shrink-0 ${isExpired ? 'badge-danger' : link.isActive ? 'badge-success' : 'badge-muted'}`}>
                    {isExpired ? 'Expired' : link.isActive ? 'Active' : 'Inactive'}
                </span>
            </div>

            <button
                type="button"
                onClick={() => setExpanded(!expanded)}
                className="mt-3 w-full text-xs font-medium text-indigo-600 py-2 md:hidden"
            >
                {expanded ? 'Hide details' : 'View details'}
            </button>
            <div className={`mt-3 pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-600 ${expanded ? 'block' : 'hidden'} md:block`}>
                    <p className="break-all line-clamp-2 sm:line-clamp-none">{link.originalUrl}</p>
                    {link.aiEngagementScore > 0 && <span className="badge badge-primary text-[10px]">AI score {link.aiEngagementScore}</span>}
                    <div className="flex gap-2 pt-1">
                        <Link to={`/dashboard/link/${link._id}`} className="btn-secondary text-xs py-2 px-3 flex-1 text-center">Analytics</Link>
                        <button type="button" onClick={copyLink} className="btn-ghost text-xs py-2 px-3 flex-1 border border-slate-200">Copy</button>
                    </div>
                </div>

            {menuOpen && <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />}
        </motion.div>
    );
};

const MyLinksPage = () => {
    const [search, setSearch] = useState('');
    const [view, setView] = useState('grid');
    const [sortBy, setSortBy] = useState('createdAt');
    const [sortOrder, setSortOrder] = useState('-1');
    const [page, setPage] = useState(1);
    const [filter, setFilter] = useState('all');
    const [selectedIds, setSelectedIds] = useState([]);
    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery({
        queryKey: ['links', { search, sortBy, sortOrder, page, filter }],
        queryFn: async () => {
            const params = { search, sortBy, sortOrder, page, limit: 12 };
            if (filter === 'active') params.status = 'active';
            if (filter === 'expired') params.status = 'expired';
            if (filter === 'favorites') params.favorites = true;
            if (filter === 'archived') params.archived = true;
            const { data } = await api.get('/links', { params });
            return data;
        },
        keepPreviousData: true
    });

    const actionMutation = useMutation({
        mutationFn: async ({ action, id }) => {
            if (action === 'delete') return api.delete(`/links/${id}`);
            if (action === 'archive') return api.patch(`/links/${id}/archive`);
            if (action === 'favorite') return api.put(`/links/${id}`, { isFavorited: !data?.data?.find(l => l._id === id)?.isFavorited });
            if (action === 'pin') return api.put(`/links/${id}`, { isPinned: !data?.data?.find(l => l._id === id)?.isPinned });
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['links']);
            toast.success('Done!');
        },
        onError: () => toast.error('Action failed')
    });

    const bulkMutation = useMutation({
        mutationFn: async (operation) => {
            return api.post('/links/bulk', { ids: selectedIds, operation });
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['links']);
            setSelectedIds([]);
            toast.success('Bulk action completed');
        }
    });

    const links = data?.data || [];
    const pagination = data?.pagination || {};

    const filters = [
        { key: 'all', label: 'All Links' },
        { key: 'active', label: 'Active' },
        { key: 'expired', label: 'Expired' },
        { key: 'favorites', label: 'Favorites' },
        { key: 'archived', label: 'Archived' },
    ];

    return (
        <div className="space-y-6 animate-in">
            <PageHeader
                title="My Links"
                subtitle={`${pagination.total || 0} total links`}
                action={
                    <Link to="/dashboard/create-link" className="btn-primary">
                        <Plus className="w-4 h-4" /> New Link
                    </Link>
                }
            />

            <div className="mobile-scroll-x sm:flex sm:flex-wrap sm:gap-2">
                {filters.map(f => (
                    <button
                        key={f.key}
                        onClick={() => { setFilter(f.key); setPage(1); }}
                        className={`touch-target px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${filter === f.key
                                ? 'bg-indigo-600 text-white shadow-brand'
                                : 'bg-white border border-slate-200 text-slate-600 hover:border-indigo-200 hover:text-indigo-600'
                            }`}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            {/* Search & Controls */}
            <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-48">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                    <input
                        type="text"
                        placeholder="Search links..."
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        className="input-field pl-10"
                    />
                </div>
                <select
                    value={`${sortBy}:${sortOrder}`}
                    onChange={(e) => {
                        const [by, order] = e.target.value.split(':');
                        setSortBy(by);
                        setSortOrder(order);
                    }}
                    className="input-field w-auto"
                >
                    <option value="createdAt:-1">Newest First</option>
                    <option value="createdAt:1">Oldest First</option>
                    <option value="stats.totalClicks:-1">Most Clicks</option>
                    <option value="stats.totalClicks:1">Least Clicks</option>
                    <option value="title:1">Title A-Z</option>
                </select>
                <div className="flex gap-1 bg-white border border-slate-200 rounded-xl p-1">
                    <button onClick={() => setView('grid')}
                        className={`p-2 rounded-lg transition-colors ${view === 'grid' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-700'}`}>
                        <Grid3X3 className="w-4 h-4" />
                    </button>
                    <button onClick={() => setView('list')}
                        className={`p-2 rounded-lg transition-colors ${view === 'list' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-700'}`}>
                        <List className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Bulk Actions */}
            {selectedIds.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="card p-4 flex items-center gap-4 border-indigo-200 bg-indigo-50"
                >
                    <span className="text-sm text-indigo-600 font-semibold">{selectedIds.length} selected</span>
                    <div className="flex gap-2">
                        <button onClick={() => bulkMutation.mutate('archive')} className="btn-secondary text-sm py-1.5 px-3">Archive</button>
                        <button onClick={() => bulkMutation.mutate('delete')} className="btn-danger text-sm py-1.5 px-3">Delete</button>
                    </div>
                    <button onClick={() => setSelectedIds([])} className="ml-auto btn-ghost text-sm">Cancel</button>
                </motion.div>
            )}

            {/* Links Grid/List */}
            {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Array(6).fill(0).map((_, i) => (
                        <div key={i} className="card p-5 space-y-3">
                            <div className="skeleton h-4 w-3/4" />
                            <div className="skeleton h-3 w-full" />
                            <div className="skeleton h-8 w-full rounded-lg" />
                            <div className="skeleton h-4 w-1/2" />
                        </div>
                    ))}
                </div>
            ) : links.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 card">
                    <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                        <Link2 className="w-8 h-8 text-slate-400" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>No links found</h3>
                    <p className="mb-6 text-center max-w-sm text-sm" style={{ color: 'var(--text-muted)' }}>
                        {search ? `No results for "${search}"` : 'Create your first short link to get started'}
                    </p>
                    <Link to="/dashboard/create-link" className="btn-primary">
                        <Plus className="w-4 h-4" /> Create Link
                    </Link>
                </div>
            ) : (
                <div className={view === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-3'}>
                    {links.map((link) => (
                        <LinkCard
                            key={link._id}
                            link={link}
                            onAction={(action, id) => actionMutation.mutate({ action, id })}
                        />
                    ))}
                </div>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2">
                    <button
                        onClick={() => setPage(page - 1)}
                        disabled={!pagination.hasPrevPage}
                        className="btn-secondary py-2 px-4 text-sm disabled:opacity-40"
                    >
                        Previous
                    </button>
                    <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                        Page {pagination.page} of {pagination.totalPages}
                    </span>
                    <button
                        onClick={() => setPage(page + 1)}
                        disabled={!pagination.hasNextPage}
                        className="btn-secondary py-2 px-4 text-sm disabled:opacity-40"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
};

export default MyLinksPage;
