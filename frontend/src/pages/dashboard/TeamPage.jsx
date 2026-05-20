import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Users, Plus, Mail, Trash2, Shield, Eye, Edit, UserPlus, Copy, Loader2 } from 'lucide-react';
import api from '@/lib/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

const ROLE_COLORS = { owner: 'badge-primary', admin: 'badge-danger', editor: 'badge-warning', viewer: 'badge-muted' };

const TeamPage = () => {
    const [showCreate, setShowCreate] = useState(false);
    const [teamName, setTeamName] = useState('');
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteRole, setInviteRole] = useState('viewer');
    const [selectedTeam, setSelectedTeam] = useState(null);
    const queryClient = useQueryClient();

    const { data: teams, isLoading } = useQuery({
        queryKey: ['teams'],
        queryFn: async () => {
            const { data } = await api.get('/teams');
            return data.data.teams;
        }
    });

    const createMutation = useMutation({
        mutationFn: () => api.post('/teams', { name: teamName }),
        onSuccess: () => { queryClient.invalidateQueries(['teams']); setShowCreate(false); setTeamName(''); toast.success('Team created!'); },
        onError: () => toast.error('Failed to create team')
    });

    const inviteMutation = useMutation({
        mutationFn: ({ teamId, email, role }) => api.post(`/teams/${teamId}/invite`, { email, role }),
        onSuccess: (res) => {
            toast.success(`Invited! Token: ${res.data.data.token}`);
            setInviteEmail('');
        },
        onError: () => toast.error('Failed to send invite')
    });

    return (
        <div className="space-y-6 animate-in">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="page-title flex items-center gap-2"><Users className="w-7 h-7 text-brand-400" /> Team Collaboration</h1>
                    <p className="page-subtitle">Manage your teams and invite collaborators</p>
                </div>
                <button onClick={() => setShowCreate(true)} className="btn-primary"><Plus className="w-4 h-4" /> New Team</button>
            </div>

            {showCreate && (
                <motion.div initial={{ opacity: 0, y: -15 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 space-y-4">
                    <h3 className="text-lg font-semibold text-slate-900">Create Team</h3>
                    <div className="flex gap-3">
                        <input value={teamName} onChange={e => setTeamName(e.target.value)} placeholder="Team name" className="input-field flex-1" />
                        <button onClick={() => createMutation.mutate()} disabled={!teamName || createMutation.isPending} className="btn-primary px-6">
                            {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create'}
                        </button>
                        <button onClick={() => setShowCreate(false)} className="btn-secondary">Cancel</button>
                    </div>
                </motion.div>
            )}

            {isLoading ? (
                <div className="space-y-4">{Array(3).fill(0).map((_, i) => <div key={i} className="skeleton h-40 rounded-2xl" />)}</div>
            ) : teams?.length > 0 ? (
                <div className="space-y-6">
                    {teams.map(team => (
                        <div key={team._id} className="glass-card overflow-hidden">
                            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
                                <div>
                                    <h3 className="text-lg font-semibold text-slate-900">{team.name}</h3>
                                    <p className="text-slate-600 text-sm">{team.members?.length || 0} members</p>
                                </div>
                            </div>

                            {/* Members */}
                            <div className="divide-y divide-slate-100">
                                {team.members?.map(member => (
                                    <div key={member.user?._id || member.user} className="flex items-center justify-between px-6 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center text-sm font-bold text-white">
                                                {member.user?.name?.[0] || 'U'}
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-slate-900">{member.user?.name || 'Unknown'}</p>
                                                <p className="text-xs text-slate-600">{member.user?.email || ''}</p>
                                            </div>
                                        </div>
                                        <span className={`badge text-xs ${ROLE_COLORS[member.role] || 'badge-muted'}`}>{member.role}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Invite Form */}
                            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50">
                                <p className="text-sm font-semibold text-slate-800 flex items-center gap-2 mb-3"><UserPlus className="w-4 h-4 text-indigo-600" /> Invite Member</p>
                                <div className="flex gap-3">
                                    <input value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} placeholder="email@example.com" className="input-field flex-1" type="email" />
                                    <select value={inviteRole} onChange={e => setInviteRole(e.target.value)} className="input-field w-auto">
                                        <option value="viewer">Viewer</option>
                                        <option value="editor">Editor</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                    <button onClick={() => inviteMutation.mutate({ teamId: team._id, email: inviteEmail, role: inviteRole })}
                                        disabled={!inviteEmail || inviteMutation.isPending} className="btn-primary px-4">
                                        {inviteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-16 glass-card">
                    <Users className="w-12 h-12 text-slate-500 mb-4" />
                    <p className="text-slate-600 text-lg font-medium mb-6">No teams yet</p>
                    <button onClick={() => setShowCreate(true)} className="btn-primary"><Plus /> Create Team</button>
                </div>
            )}
        </div>
    );
};

export default TeamPage;
