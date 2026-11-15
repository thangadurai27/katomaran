import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Trash2, RotateCcw, AlertTriangle } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

const TrashPage = () => {
    const queryClient = useQueryClient();
    const [confirmEmpty, setConfirmEmpty] = useState(false);

    const { data: links = [], isLoading } = useQuery({
        queryKey: ['trash'],
        queryFn: async () => {
            const { data } = await api.get('/links?trashed=true&limit=100');
            return data.data || [];
        },
    });

    const restoreMutation = useMutation({
        mutationFn: async (id) => api.put(`/links/${id}`, { isTrashed: false, isActive: true }),
        onSuccess: () => {
            queryClient.invalidateQueries(['trash']);
            queryClient.invalidateQueries(['links']);
            toast.success('Link restored');
        },
        onError: () => toast.error('Restore failed'),
    });

    const deleteMutation = useMutation({
        mutationFn: async (id) => api.delete(`/links/${id}?permanent=true`),
        onSuccess: () => {
            queryClient.invalidateQueries(['trash']);
            toast.success('Permanently deleted');
        },
        onError: () => toast.error('Delete failed'),
    });

    const emptyMutation = useMutation({
        mutationFn: async () => {
            await Promise.all(links.map((link) => api.delete(`/links/${link._id}?permanent=true`)));
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['trash']);
            setConfirmEmpty(false);
            toast.success('Trash emptied');
        },
        onError: () => toast.error('Empty trash failed'),
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="font-display text-[24px] font-extrabold tracking-tight text-[var(--text-primary)] sm:text-[28px]">
                        Trash
                    </h1>
                    <p className="mt-1.5 text-[14px] text-[var(--text-secondary)]">
                        Deleted links. Restore or permanently delete them.
                    </p>
                </div>
                {links.length > 0 && (
                    <button
                        type="button"
                        onClick={() => setConfirmEmpty(true)}
                        className="btn-danger gap-2 px-4 py-2.5 text-sm"
                    >
                        <Trash2 className="h-4 w-4" /> Empty Trash
                    </button>
                )}
            </div>

            {confirmEmpty && (
                <div className="card border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-950/30">
                    <div className="flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 shrink-0 text-red-600" />
                        <div className="flex-1">
                            <p className="text-sm font-semibold text-red-700 dark:text-red-300">
                                Permanently delete all {links.length} trashed links?
                            </p>
                            <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                                This action cannot be undone.
                            </p>
                            <div className="mt-3 flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => emptyMutation.mutate()}
                                    disabled={emptyMutation.isPending}
                                    className="btn-danger px-3 py-1.5 text-xs"
                                >
                                    {emptyMutation.isPending ? 'Deleting...' : 'Confirm'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setConfirmEmpty(false)}
                                    className="btn-secondary px-3 py-1.5 text-xs"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {isLoading ? (
                <div className="skeleton h-64 rounded-2xl" />
            ) : links.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 card">
                    <Trash2 className="h-12 w-12 text-[var(--text-muted)] mb-4" />
                    <p className="text-[var(--text-secondary)]">Trash is empty</p>
                </div>
            ) : (
                <div className="card divide-y divide-[var(--border)]">
                    {links.map((link) => (
                        <div key={link._id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-[var(--text-primary)]">
                                    {link.title || link.originalUrl}
                                </p>
                                <p className="truncate text-xs text-[var(--text-muted)] font-mono">/{link.shortCode}</p>
                                <p className="mt-1 text-xs text-[var(--text-muted)]">
                                    Deleted {link.updatedAt ? formatDistanceToNow(new Date(link.updatedAt), { addSuffix: true }) : ''}
                                </p>
                            </div>
                            <div className="flex shrink-0 gap-2">
                                <button
                                    type="button"
                                    onClick={() => restoreMutation.mutate(link._id)}
                                    className="btn-secondary gap-1.5 px-3 py-1.5 text-xs"
                                >
                                    <RotateCcw className="h-3.5 w-3.5" /> Restore
                                </button>
                                <button
                                    type="button"
                                    onClick={() => deleteMutation.mutate(link._id)}
                                    className="btn-danger gap-1.5 px-3 py-1.5 text-xs"
                                >
                                    <Trash2 className="h-3.5 w-3.5" /> Delete Forever
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TrashPage;