import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Settings, Bell, Shield, Palette, Globe, Moon, Sun, Loader2, Save } from 'lucide-react';
import api from '@/lib/api';
import useAuthStore from '@/stores/authStore';
import toast from 'react-hot-toast';

const Toggle = ({ value, onChange, label, desc }) => (
    <div className="flex items-center justify-between py-3">
        <div>
            <p className="text-sm font-medium text-slate-700">{label}</p>
            {desc && <p className="text-xs text-slate-500 mt-0.5">{desc}</p>}
        </div>
        <button onClick={() => onChange(!value)}
            className={`relative w-11 h-6 rounded-full transition-colors ${value ? 'bg-brand-600' : 'bg-slate-200'}`}>
            <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${value ? 'translate-x-5' : 'translate-x-0.5'}`} />
        </button>
    </div>
);

const SettingsPage = () => {
    const { user, updateUser } = useAuthStore();
    const [prefs, setPrefs] = useState(user?.preferences || { emailNotifications: true, pushNotifications: true, weeklyReport: true, marketingEmails: false, theme: 'dark' });
    const [currentPw, setCurrentPw] = useState('');
    const [newPw, setNewPw] = useState('');

    const prefsMutation = useMutation({
        mutationFn: () => api.put('/users/profile', { preferences: prefs }),
        onSuccess: (res) => { updateUser({ preferences: prefs }); toast.success('Settings saved!'); },
    });

    const pwMutation = useMutation({
        mutationFn: () => api.put('/users/change-password', { currentPassword: currentPw, newPassword: newPw }),
        onSuccess: () => { toast.success('Password changed!'); setCurrentPw(''); setNewPw(''); },
        onError: (err) => toast.error(err.response?.data?.message || 'Failed')
    });

    return (
        <div className="space-y-6 animate-in max-w-2xl">
            <div>
                <h1 className="page-title flex items-center gap-2"><Settings className="w-7 h-7 text-brand-400" /> Settings</h1>
                <p className="page-subtitle">Manage your account preferences and security</p>
            </div>

            {/* Notifications */}
            <div className="glass-card p-6">
                <h2 className="text-lg font-semibold text-slate-900"><Bell className="w-5 h-5 text-brand-400" /> Notifications
                </h2>
                <div className="divide-y divide-slate-100">
                    <Toggle value={prefs.emailNotifications} onChange={v => setPrefs(p => ({ ...p, emailNotifications: v }))} label="Email Notifications" desc="Receive activity updates via email" />
                    <Toggle value={prefs.pushNotifications} onChange={v => setPrefs(p => ({ ...p, pushNotifications: v }))} label="Push Notifications" desc="Browser push notifications" />
                    <Toggle value={prefs.weeklyReport} onChange={v => setPrefs(p => ({ ...p, weeklyReport: v }))} label="Weekly Report" desc="Get a weekly analytics summary" />
                    <Toggle value={prefs.marketingEmails} onChange={v => setPrefs(p => ({ ...p, marketingEmails: v }))} label="Marketing Emails" desc="Product updates and tips" />
                </div>
                <button onClick={() => prefsMutation.mutate()} disabled={prefsMutation.isPending} className="btn-primary mt-4">
                    {prefsMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4" /> Save Preferences</>}
                </button>
            </div>

            {/* Security */}
            <div className="glass-card p-6">
                <h2 className="text-lg font-semibold text-slate-900"><Shield className="w-5 h-5 text-brand-400" /> Security
                </h2>
                <div className="space-y-4">
                    <div>
                        <label className="input-label">Current Password</label>
                        <input type="password" value={currentPw} onChange={e => setCurrentPw(e.target.value)} className="input-field" placeholder="••••••••" />
                    </div>
                    <div>
                        <label className="input-label">New Password</label>
                        <input type="password" value={newPw} onChange={e => setNewPw(e.target.value)} className="input-field" placeholder="••••••••" />
                    </div>
                    <button onClick={() => pwMutation.mutate()} disabled={!currentPw || !newPw || pwMutation.isPending} className="btn-primary">
                        {pwMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Change Password'}
                    </button>
                </div>
            </div>

            {/* Appearance */}
            <div className="glass-card p-6">
                <h2 className="text-lg font-semibold text-slate-900"><Palette className="w-5 h-5 text-brand-400" /> Appearance
                </h2>
                <div className="grid grid-cols-3 gap-3">
                    {['dark', 'light', 'system'].map(t => (
                        <button key={t} onClick={() => setPrefs(p => ({ ...p, theme: t }))}
                            className={`py-3 px-4 rounded-xl capitalize text-sm font-medium border-2 transition-all ${prefs.theme === t ? 'border-brand-500 bg-indigo-50 text-indigo-700' : 'border-slate-200 text-slate-600 hover:border-indigo-200 hover:text-indigo-700'}`}>
                            {t === 'dark' ? <Moon className="w-5 h-5 mx-auto mb-1" /> : t === 'light' ? <Sun className="w-5 h-5 mx-auto mb-1" /> : <Globe className="w-5 h-5 mx-auto mb-1" />}
                            {t}
                        </button>
                    ))}
                </div>
            </div>

            {/* Danger Zone */}
            <div className="glass-card p-6 border-red-500/20 bg-red-500/5">
                <h2 className="text-lg font-semibold text-red-400 mb-2">Danger Zone</h2>
                <p className="text-slate-600 text-sm mb-4">These actions are irreversible. Please be careful.</p>
                <button className="btn-danger text-sm">Delete Account</button>
            </div>
        </div>
    );
};

export default SettingsPage;
