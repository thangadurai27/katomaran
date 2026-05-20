import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Megaphone, Plus, Trash2, Edit, BarChart3, Loader2 } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const STATUS_COLORS = { active: 'badge-success', draft: 'badge-muted', paused: 'badge-warning', completed: 'badge-primary', archived: 'badge-muted' };

const CampaignsPage = () => {
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ name: '', description: '', color: '#6366f1', utmSource: '', utmMedium: '' });
    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery({
        queryKey: ['campaigns'],
        queryFn: async () => {
            const { data } = await api.get('/campaigns');
            return data.data.campaigns;
        }
    });

    const createMutation = useMutation({
        mutationFn: () => api.post('/campaigns', form),
        onSuccess: () => { queryClient.invalidateQueries(['campaigns']); setShowForm(false); setForm({ name: '', description: '', color: '#6366f1', utmSource: '', utmMedium: '' }); toast.success('Campaign created!'); },
        onError: () => toast.error('Failed to create campaign')
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => api.delete(`/campaigns/${id}`),
        onSuccess: () => { queryClient.invalidateQueries(['campaigns']); toast.success('Deleted!'); }
    });

    return (
        <div className="space-y-6 animate-in">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="page-title flex items-center gap-2"><Megaphone className="w-7 h-7 text-brand-400" /> Campaigns</h1>
                    <p className="page-subtitle">Organize links into campaigns for better tracking</p>
                </div>
                <button onClick={() => setShowForm(!showForm)} className="btn-primary">
                    <Plus className="w-4 h-4" /> New Campaign
                </button>
            </div>

            {showForm && (
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 space-y-4">
                    <h3 className="text-lg font-semibold text-slate-900">Create Campaign</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div><label className="input-label">Name *</label><input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Spring Campaign 2025" className="input-field" /></div>
                        <div><label className="input-label">Color</label>
                            <input type="color" value={form.color} onChange={e => setForm(p => ({ ...p, color: e.target.value }))} className="w-full h-10 rounded-xl border border-slate-200 cursor-pointer bg-slate-50" />
                        </div>
                        <div><label className="input-label">UTM Source</label><input value={form.utmSource} onChange={e => setForm(p => ({ ...p, utmSource: e.target.value }))} placeholder="twitter" className="input-field" /></div>
                        <div><label className="input-label">UTM Medium</label><input value={form.utmMedium} onChange={e => setForm(p => ({ ...p, utmMedium: e.target.value }))} placeholder="social" className="input-field" /></div>
                        <div className="sm:col-span-2"><label className="input-label">Description</label><textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="What is this campaign about?" className="input-field resize-none" rows={2} /></div>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={() => createMutation.mutate()} disabled={!form.name || createMutation.isPending} className="btn-primary">
                            {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create'}
                        </button>
                        <button onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
                    </div>
                </motion.div>
            )}

            {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Array(6).fill(0).map((_, i) => <div key={i} className="skeleton h-36 rounded-2xl" />)}
                </div>
            ) : data?.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {data.map(campaign => (
                        <motion.div key={campaign._id} initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
                            className="glass-card-hover p-5 space-y-3">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: campaign.color + '30', border: `1px solid ${campaign.color}60` }}>
                                        <Megaphone className="w-5 h-5" style={{ color: campaign.color }} />
                                    </div>
                                    <div>
                                        <p className="text-lg font-semibold text-slate-900">{campaign.name}</p>
                                        <span className={`badge text-[10px] ${STATUS_COLORS[campaign.status] || 'badge-muted'}`}>{campaign.status}</span>
                                    </div>
                                </div>
                                <button onClick={() => deleteMutation.mutate(campaign._id)} className="p-1.5 text-slate-500 hover:text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
                            </div>
                            {campaign.description && <p className="text-slate-600 text-sm">{campaign.description}</p>}
                            <div className="flex items-center justify-between text-xs text-slate-600 pt-2 border-t border-slate-200">
                                <span className="flex items-center gap-1"><BarChart3 className="w-3 h-3" /> {campaign.stats?.totalClicks || 0} clicks</span>
                                <span>{format(new Date(campaign.createdAt), 'MMM d, yyyy')}</span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-16 glass-card">
                    <Megaphone className="w-12 h-12 text-slate-500 mb-4" />
                    <p className="text-slate-600 text-lg font-medium mb-1">No campaigns yet</p>
                    <p className="text-slate-500 text-sm mb-6">Create campaigns to organize and track your links</p>
                    <button onClick={() => setShowForm(true)} className="btn-primary"><Plus className="w-4 h-4" /> Create Campaign</button>
                </div>
            )}
        </div>
    );
};

export default CampaignsPage;
