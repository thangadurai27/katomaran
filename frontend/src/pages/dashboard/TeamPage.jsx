import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Users, UserCheck, UserMinus, UserX, UserPlus, Shield, Loader2, MessageCircle } from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'react-hot-toast';
import PageHeader from '@/components/ui/PageHeader';

const TeamPage = () => {
    const [members, setMembers] = useState([]);
    const [newMemberName, setNewMemberName] = useState('');
    const [newMemberRole, setNewMemberRole] = useState('member');
    const [invitingEmail, setInvitingEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { data: teamStats } = useQuery({
        queryKey: ['team-stats'],
        queryFn: async () => {
            try {
                const { data } = await api.get('/teams/stats');
                return data.data;
            } catch {
                return null;
            }
        },
        retry: false,
    });

    const addMember = async () => {
        setIsLoading(true);
        try {
            await api.post('/team/members', { name: newMemberName, role: newMemberRole });
            setMembers(prev => [...prev, { name: newMemberName, role: newMemberRole, status: 'active' }]);
            setNewMemberName('');
            setNewMemberRole('member');
            toast.success('Member added successfully!');
        } catch (error) {
            toast.error('Failed to add member');
        } finally {
            setIsLoading(false);
        }
    };

    const removeMember = async (memberId) => {
        if (window.confirm('Are you sure you want to remove this member?')) {
            setIsLoading(true);
            try {
                await api.delete(`/team/members/${memberId}`);
                setMembers(prev => prev.filter(m => m.id !== memberId));
                toast.success('Member removed successfully!');
            } catch (error) {
                toast.error('Failed to remove member');
            } finally {
                setIsLoading(false);
            }
        }
    };

    const sendInvite = async () => {
        setIsLoading(true);
        try {
            await api.post('/team/invitations', { email: invitingEmail });
            toast.success('Invitation sent!');
            setInvitingEmail('');
        } catch (error) {
            toast.error('Failed to send invitation');
        } finally {
            setIsLoading(false);
        }
    };

    const getInitial = (name) => name && name[0] ? name[0] : '?';

    return (
        <div className="space-y-6 bg-background">
            <PageHeader
                title="Team Collaboration"
                subtitle="Manage team members and collaborate on links"
            />

            {/* Team Stats */}
            {teamStats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                    {[['Total Members', teamStats.totalMembers], ['Active', teamStats.activeMembers], ['Pending', teamStats.pendingMembers], ['Invitations', teamStats.totalInvitations]].map(([label, value]) => (
                        <div key={label} className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                            <div className="text-2xl font-bold text-primary">{value}</div>
                            <p className="text-xs text-slate-500">{label}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* Members List */}
            <div className="rounded-lg p-6 bg-card border border-slate-200/50">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Team Members</h3>
                {isLoading ? (
                    <div className="h-64 rounded-lg bg-slate-100 animate-pulse" />
                ) : members.length === 0 ? (
                    <div className="text-center py-12">
                        <UserX className="w-12 h-12 text-slate-400 mb-3" />
                        <p className="text-slate-500">No team members yet</p>
                        <p className="text-sm">
                            <a href="#" className="font-medium text-primary">Add your first member</a>
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {members.map((member) => (
                            <div key={member.id} className="flex items-center gap-3 py-2 px-3 rounded-lg bg-white">
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                    <span className="text-xs font-bold text-primary">{getInitial(member.name)}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-slate-900">{member.name}</p>
                                    <p className="text-xs text-slate-500">{member.role}</p>
                                </div>
                                <button
                                    onClick={() => removeMember(member.id)}
                                    className="p-1 rounded-lg hover:bg-primary/5 text-primary text-sm"
                                >
                                    <UserMinus className="w-3.5 h-3.5" /> Remove
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Add Member Form */}
            <div className="card rounded-lg p-6 mt-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-3">Add Member</h3>
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-sm text-slate-500 mb-2">Name</label>
                        <input
                            value={newMemberName}
                            onChange={(e) => setNewMemberName(e.target.value)}
                            placeholder="John Doe"
                            className="input-field rounded-lg focus:outline-none focus:border-primary"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-slate-500 mb-2">Role</label>
                        <select
                            value={newMemberRole}
                            onChange={(e) => setNewMemberRole(e.target.value)}
                            className="input-field rounded-lg focus:outline-none focus:border-primary"
                        >
                            <option value="owner">Owner</option>
                            <option value="admin">Admin</option>
                            <option value="member" selected>Member</option>
                        </select>
                    </div>
                </div>
                <div className="mt-4">
                    <button
                        onClick={addMember}
                        className="btn-primary w-full py-3"
                        disabled={!newMemberName.trim() || isLoading}
                    >
                        {isLoading ? 'Adding...' : 'Add Member'}
                    </button>
                </div>
            </div>

            {/* Invitations */}
            <div className="card rounded-lg p-6 mt-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-3">Invite Members</h3>
                <p className="text-sm text-slate-500 mb-3">Send invitations by email</p>
                <div className="grid grid-cols-2 gap-3">
                    <input
                        type="email"
                        placeholder="recipient@example.com"
                        value={invitingEmail}
                        onChange={(e) => setInvitingEmail(e.target.value)}
                        className="input-field rounded-lg focus:outline-none focus:border-primary"
                    />
                    <button
                        onClick={sendInvite}
                        className="btn-primary py-2 text-sm"
                        disabled={!invitingEmail.trim() || isLoading}
                    >
                        {isLoading ? 'Sending...' : 'Send Invitation'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TeamPage;