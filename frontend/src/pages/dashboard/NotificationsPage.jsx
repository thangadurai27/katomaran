import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Bell, CheckCheck, Trash2 } from 'lucide-react';
import api from '@/lib/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const TYPE_ICONS = {
    link_expired: '⏰', traffic_spike: '📈', team_invite: '👥',
    security_alert: '🔒', system: '⚙️', ai_insight: '🤖', campaign: '🎯', report: '📊'
};

const NotificationsPage = () => {
    const queryClient = useQueryClient();
    const { data, isLoading } = useQuery({
        queryKey: ['notifications'],
        queryFn: async () => {
            const { data } = await api.get('/notifications');
            return data.data;
        }
    });

    const markAllMutation = useMutation({
        mutationFn: () => api.patch('/notifications/read-all'),
        onSuccess: () => { queryClient.invalidateQueries(['notifications']); toast.success('All marked as read'); }
    });

    const markReadMutation = useMutation({
        mutationFn: (id) => api.patch(`/notifications/${id}/read`),
        onSuccess: () => queryClient.invalidateQueries(['notifications'])
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => api.delete(`/notifications/${id}`),
        onSuccess: () => { queryClient.invalidateQueries(['notifications']); }
    });

    const notifications = data?.notifications || [];
    const unreadCount = data?.unreadCount || 0;

    return (
        <div className="space-y-6 animate-in max-w-2xl">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="page-title flex items-center gap-2"><Bell className="w-7 h-7 text-brand-400" /> Notifications</h1>
                    <p className="page-subtitle">{unreadCount} unread notifications</p>
                </div>
                {unreadCount > 0 && (
                    <button onClick={() => markAllMutation.mutate()} className="btn-secondary text-sm">
                        <CheckCheck className="w-4 h-4" /> Mark all read
                    </button>
                )}
            </div>

            {isLoading ? (
                <div className="space-y-3">{Array(5).fill(0).map((_, i) => <div key={i} className="skeleton h-16 rounded-2xl" />)}</div>
            ) : notifications.length > 0 ? (
                <div className="space-y-2">
                    {notifications.map((n) => (
                        <motion.div key={n._id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                            className={`glass-card p-4 flex items-start gap-3 cursor-pointer hover:bg-slate-100 transition-colors ${!n.isRead ? 'border-brand-500/20 bg-brand-600/5' : ''}`}
                            onClick={() => !n.isRead && markReadMutation.mutate(n._id)}
                        >
                            <span className="text-2xl flex-shrink-0">{TYPE_ICONS[n.type] || '🔔'}</span>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                    <p className={`text-sm font-medium ${n.isRead ? 'text-slate-600' : 'text-slate-900'}`}>{n.title}</p>
                                    {!n.isRead && <div className="w-2 h-2 rounded-full bg-brand-500 flex-shrink-0 mt-1" />}
                                </div>
                                <p className="text-xs text-slate-600 mt-0.5 truncate">{n.message}</p>
                                <p className="text-xs text-slate-500 mt-1">{format(new Date(n.createdAt), 'MMM d, h:mm a')}</p>
                            </div>
                            <button onClick={(e) => { e.stopPropagation(); deleteMutation.mutate(n._id); }}
                                className="p-1 text-slate-500 hover:text-red-400 transition-colors flex-shrink-0">
                                <Trash2 className="w-3.5 h-3.5" />
                            </button>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-16 glass-card">
                    <Bell className="w-12 h-12 text-slate-500 mb-4" />
                    <p className="text-slate-600 text-lg font-medium">All caught up!</p>
                    <p className="text-slate-500 text-sm">No new notifications</p>
                </div>
            )}
        </div>
    );
};

export default NotificationsPage;
