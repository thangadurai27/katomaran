import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { User, Mail, Settings, Shield, Image, LogOut } from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'react-hot-toast';
import PageHeader from '@/components/ui/PageHeader';

const ProfilePage = () => {
    const { data: user, isLoading } = useQuery({
        queryKey: ['user-profile'],
        queryFn: async () => {
            const { data } = await api.get('/auth/me');
            return data.data.user;
        }
    });

    const [showPassword, setShowPassword] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const updateProfile = async () => {
        try {
            await api.put('/profile', { name: user?.name, email: user?.email });
            toast.success('Profile updated successfully!');
        } catch (error) {
            toast.error('Failed to update profile');
        }
    };

    const changePassword = async () => {
        if (newPassword !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }
        try {
            await api.put('/profile/password', { currentPassword, newPassword });
            toast.success('Password changed successfully!');
            setShowPassword(false);
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error) {
            toast.error('Failed to change password');
        }
    };

    return (
        <div className="space-y-6 bg-background">
            <PageHeader title="Profile" subtitle="Your account information" />

            {/* User Info Card */}
            <div className="card rounded-lg p-6 mb-6">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <User className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                        <p className="font-medium text-slate-900">{user?.name || 'User'}</p>
                        <p className="text-sm text-slate-500">{user?.email || ''}</p>
                        <p className="text-xs text-slate-400">Member since {new Date(user?.createdAt || Date.now()).toLocaleDateString()}</p>
                    </div>
                </div>
            </div>

            {/* Account Settings */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                {/* Change Password Card */}
                <div className="glass-card rounded-lg p-5">
                    <h4 className="text-sm font-medium text-slate-500 mb-2">Change Password</h4>
                    <div className="space-y-3">
                        <div>
                            <input
                                type="password"
                                placeholder="Current password"
                                className="input-field w-full rounded-lg focus:outline-none focus:border-primary"
                            />
                        </div>
                        <div>
                            <input
                                type="password"
                                placeholder="New password"
                                className="input-field w-full rounded-lg focus:outline-none focus:border-primary"
                            />
                        </div>
                        <div>
                            <input
                                type="password"
                                placeholder="Confirm new password"
                                className="input-field w-full rounded-lg focus:outline-none focus:border-primary"
                            />
                        </div>
                        <button
                            onClick={changePassword}
                            className="btn-sm py-2 text-primary hover:bg-primary/10"
                        >
                            Change Password
                        </button>
                    </div>
                </div>

                {/* API Keys Card */}
                <div className="glass-card rounded-lg p-5">
                    <h4 className="text-sm font-medium text-slate-500 mb-2">API Keys</h4>
                    <p className="text-xs text-slate-400">
                        Your API keys are managed in the dashboard settings.
                    </p>
                </div>
            </div>

            {/* Appearance Settings */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                <div className="glass-card rounded-lg p-4">
                    <p className="text-xs text-slate-500">Theme</p>
                    <select className="input-field w-full rounded-lg p-2 focus:outline-none focus:border-primary">
                        <option>Light</option>
                        <option>Dark</option>
                        <option>System</option>
                    </select>
                </div>
                <div className="glass-card rounded-lg p-4">
                    <p className="text-xs text-slate-500">Language</p>
                    <select className="input-field w-full rounded-lg p-2 focus:outline-none focus:border-primary">
                        <option>English</option>
                        <option>Spanish</option>
                        <option>French</option>
                    </select>
                </div>
                <div className="glass-card rounded-lg p-4">
                    <p className="text-xs text-slate-500">Timezone</p>
                    <select className="input-field w-full rounded-lg p-2 focus:outline-none focus:border-primary">
                        <option>UTC</option>
                        <option>EST</option>
                        <option>PST</option>
                    </select>
                </div>
            </div>

            {/* Security */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                <div className="glass-card rounded-lg p-4">
                    <p className="text-xs text-slate-500">Two-Factor</p>
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input type="checkbox" className="w-4 h-4 rounded border-primary focus:ring-primary" />
                        Enable two-factor authentication
                    </label>
                </div>
                <div className="glass-card rounded-lg p-4">
                    <p className="text-xs text-slate-500">Session Activity</p>
                    <p className="text-xs text-slate-400">View active sessions</p>
                </div>
                <div className="glass-card rounded-lg p-4">
                    <p className="text-xs text-slate-500">Email Notifications</p>
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input type="checkbox" checked className="w-4 h-4 rounded border-primary focus:ring-primary" />
                        Receive weekly reports
                    </label>
                </div>
            </div>

            {/* Logout */}
            <div className="mt-8 pt-6 border-t border-slate-200/50">
                <button
                    onClick={() => toast.logout()}
                    className="w-full py-3 text-lg text-danger hover:bg-danger/10 transition-colors"
                >
                    <LogOut className="mr-3" /> Logout
                </button>
            </div>
        </div>
    );
};

export default ProfilePage;