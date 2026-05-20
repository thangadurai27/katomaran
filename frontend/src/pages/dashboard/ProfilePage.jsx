import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { User, Globe, Building, MapPin, Camera, Save, Loader2 } from 'lucide-react';
import api from '@/lib/api';
import useAuthStore from '@/stores/authStore';
import toast from 'react-hot-toast';
import PageHeader from '@/components/ui/PageHeader';

const ProfilePage = () => {
    const { user, updateUser } = useAuthStore();
    const [form, setForm] = useState({
        name: user?.name || '',
        username: user?.username || '',
        bio: user?.bio || '',
        website: user?.website || '',
        location: user?.location || '',
        company: user?.company || '',
    });

    const updateMutation = useMutation({
        mutationFn: () => api.put('/users/profile', form),
        onSuccess: (res) => {
            updateUser(res.data.data.user);
            toast.success('Profile updated!');
        },
        onError: (err) => toast.error(err.response?.data?.message || 'Update failed'),
    });

    const fields = [
        { key: 'name', label: 'Full Name', icon: User, placeholder: 'John Doe' },
        { key: 'username', label: 'Username', icon: User, placeholder: 'johndoe' },
        { key: 'website', label: 'Website', icon: Globe, placeholder: 'https://yoursite.com' },
        { key: 'company', label: 'Company', icon: Building, placeholder: 'Acme Inc.' },
        { key: 'location', label: 'Location', icon: MapPin, placeholder: 'San Francisco, CA' },
    ];

    return (
        <div className="space-y-6 animate-in max-w-2xl">
            <PageHeader title="Profile" subtitle="Manage your account profile and preferences" />

            <div className="card p-6 flex items-center gap-6">
                <div className="relative">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center text-2xl font-bold text-white">
                        {user?.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <button
                        type="button"
                        className="absolute -bottom-1 -right-1 w-7 h-7 bg-brand-600 rounded-full flex items-center justify-center border-2 border-white hover:bg-brand-500 transition-colors"
                    >
                        <Camera className="w-3.5 h-3.5 text-white" />
                    </button>
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-slate-900">{user?.name}</h3>
                    <p className="text-slate-600 text-sm">@{user?.username}</p>
                    <span className="badge badge-primary mt-1 text-xs capitalize">{user?.plan || 'free'} plan</span>
                </div>
            </div>

            <div className="card p-6 space-y-4">
                <h2 className="text-lg font-semibold text-slate-900">Personal Information</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {fields.map((field) => (
                        <div key={field.key}>
                            <label className="input-label flex items-center gap-2">
                                <field.icon className="w-4 h-4" /> {field.label}
                            </label>
                            <input
                                value={form[field.key]}
                                onChange={(e) => setForm((p) => ({ ...p, [field.key]: e.target.value }))}
                                placeholder={field.placeholder}
                                className="input-field"
                            />
                        </div>
                    ))}
                    <div className="sm:col-span-2">
                        <label className="input-label">Bio</label>
                        <textarea
                            value={form.bio}
                            onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))}
                            placeholder="Tell us about yourself…"
                            className="input-field resize-none"
                            rows={3}
                            maxLength={300}
                        />
                        <p className="text-xs text-slate-500 mt-1">{form.bio.length}/300</p>
                    </div>
                </div>
                <button type="button" onClick={() => updateMutation.mutate()} disabled={updateMutation.isPending} className="btn-primary">
                    {updateMutation.isPending ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" /> Saving…
                        </>
                    ) : (
                        <>
                            <Save className="w-4 h-4" /> Save Changes
                        </>
                    )}
                </button>
            </div>

            <div className="card p-6 space-y-3">
                <h2 className="text-lg font-semibold text-slate-900">Account Information</h2>
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between py-2 border-b border-slate-200">
                        <span className="text-slate-600">Email</span>
                        <span className="text-slate-900 font-medium flex items-center gap-2">
                            {user?.email}
                            {user?.isEmailVerified && <span className="badge-success badge text-xs">Verified</span>}
                        </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-200">
                        <span className="text-slate-600">Provider</span>
                        <span className="text-slate-900 font-medium capitalize">{user?.provider || 'Email'}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-200">
                        <span className="text-slate-600">Member since</span>
                        <span className="text-slate-900 font-medium">
                            {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                        </span>
                    </div>
                    <div className="flex justify-between py-2">
                        <span className="text-slate-600">Total Links</span>
                        <span className="text-slate-900 font-medium">{user?.stats?.totalLinks || 0}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
