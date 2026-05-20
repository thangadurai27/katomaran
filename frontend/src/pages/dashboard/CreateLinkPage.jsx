import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Link2, Wand2, Shield, Clock, QrCode, ChevronDown, ChevronUp, Loader2, CheckCircle, ExternalLink, Copy, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { SHORT_URL_BASE } from '@/config/env';

const schema = z.object({
    originalUrl: z.string().url('Please enter a valid URL starting with http:// or https://'),
    customAlias: z.string().regex(/^[a-z0-9-_]*$/, 'Only lowercase letters, numbers, hyphens, underscores').max(50).optional().or(z.literal('')),
    title: z.string().max(200).optional(),
    description: z.string().max(500).optional(),
    password: z.string().optional(),
    utmSource: z.string().optional(),
    utmMedium: z.string().optional(),
    utmCampaign: z.string().optional(),
});

const CreateLinkPage = () => {
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [isPasswordProtected, setIsPasswordProtected] = useState(false);
    const [isOneTime, setIsOneTime] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [expiresAt, setExpiresAt] = useState('');
    const [aiSlugs, setAiSlugs] = useState([]);
    const [aiLoading, setAiLoading] = useState(false);
    const [createdLink, setCreatedLink] = useState(null);
    const queryClient = useQueryClient();

    const { data: campaigns } = useQuery({
        queryKey: ['campaigns-list'],
        queryFn: async () => {
            const { data } = await api.get('/campaigns?limit=100');
            return data.data.campaigns;
        }
    });

    const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm({
        resolver: zodResolver(schema)
    });

    const watchedUrl = watch('originalUrl');

    const createMutation = useMutation({
        mutationFn: async (formData) => {
            const { data } = await api.post('/links', formData);
            return data.data.link;
        },
        onSuccess: (link) => {
            setCreatedLink(link);
            queryClient.invalidateQueries(['links']);
            queryClient.invalidateQueries(['dashboard-stats']);
            toast.success('🎉 Short link created successfully!');
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to create link');
        }
    });

    const generateAiSlugs = async () => {
        if (!watchedUrl) return toast.error('Enter a URL first');
        setAiLoading(true);
        setAiSlugs([]);
        try {
            const { data } = await api.post('/ai/generate-slug', { url: watchedUrl });
            setAiSlugs(data.data.slugs || []);
        } catch {
            toast.error('AI slug generation failed');
        } finally {
            setAiLoading(false);
        }
    };

    const onSubmit = (formData) => {
        const payload = {
            ...formData,
            isPasswordProtected,
            isOneTime,
            expiresAt: expiresAt || null,
            utmParams: {
                source: formData.utmSource,
                medium: formData.utmMedium,
                campaign: formData.utmCampaign,
            }
        };
        delete payload.utmSource;
        delete payload.utmMedium;
        delete payload.utmCampaign;
        createMutation.mutate(payload);
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        toast.success('Copied to clipboard!');
    };

    const shortUrl = createdLink
        ? `${SHORT_URL_BASE}${createdLink.shortCode}`
        : null;

    return (
        <div className="space-y-6 max-w-2xl animate-in">
            {/* Page Header */}
            <div>
                <h1 className="page-title">Create Short Link</h1>
                <p className="page-subtitle">Shorten, customize, and track your URLs with AI-powered features</p>
            </div>

            {/* Success State */}
            <AnimatePresence>
                {createdLink && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="glass-card p-6 border-emerald-500/30 bg-emerald-500/5"
                    >
                        <div className="flex items-start gap-4">
                            <CheckCircle className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-slate-900">Link Created!</h3>
                                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
                                    <span className="text-brand-400 font-mono text-sm flex-1 truncate">{shortUrl}</span>
                                    <button type="button" onClick={() => copyToClipboard(shortUrl)} className="p-1.5 text-slate-500 hover:text-indigo-600 rounded-lg hover:bg-white transition-colors">
                                        <Copy className="w-4 h-4" />
                                    </button>
                                    <a href={shortUrl} target="_blank" rel="noopener noreferrer" className="p-1.5 text-slate-500 hover:text-indigo-600 rounded-lg hover:bg-white transition-colors">
                                        <ExternalLink className="w-4 h-4" />
                                    </a>
                                </div>
                                {createdLink.qrCode?.url && (
                                    <div className="mt-3 flex items-center gap-3">
                                        <img src={createdLink.qrCode.url} alt="QR" className="w-20 h-20 rounded-lg bg-white p-1" />
                                        <div>
                                            <p className="text-lg font-semibold text-slate-900">QR Code Generated</p>
                                            <p className="text-xs text-slate-600">Right-click to save</p>
                                        </div>
                                    </div>
                                )}
                                <div className="flex gap-3 mt-4">
                                    <button onClick={() => { setCreatedLink(null); reset(); }} className="btn-primary text-sm py-2">
                                        Create Another
                                    </button>
                                    <a href={`/dashboard/link/${createdLink._id}`} className="btn-secondary text-sm py-2">
                                        View Details
                                    </a>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {!createdLink && (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {/* Main URL Input */}
                    <div className="glass-card p-6 space-y-5">
                        <h2 className="text-lg font-semibold text-slate-900"><Link2 className="w-5 h-5 text-brand-400" />
                            URL Details
                        </h2>

                        {/* Original URL */}
                        <div>
                            <label className="input-label">Long URL *</label>
                            <input
                                {...register('originalUrl')}
                                type="url"
                                placeholder="https://your-very-long-url.com/with-lots-of-parameters"
                                className="input-field"
                            />
                            {errors.originalUrl && <p className="text-red-400 text-xs mt-1">{errors.originalUrl.message}</p>}
                        </div>

                        {/* Custom Alias + AI */}
                        <div>
                            <label className="input-label">Custom Alias (optional)</label>
                            <div className="flex gap-2">
                                <div className="flex-1 relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 text-sm whitespace-nowrap">
                                        {SHORT_URL_BASE.split('/r/')[0]?.replace('https://', '').replace('http://', '')}/r/
                                    </span>
                                    <input
                                        {...register('customAlias')}
                                        type="text"
                                        placeholder="my-custom-link"
                                        className="input-field pl-32"
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={generateAiSlugs}
                                    disabled={aiLoading}
                                    className="btn-secondary px-4 flex-shrink-0"
                                    title="Generate AI slug suggestions"
                                >
                                    {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                                    <span className="hidden sm:block">AI Suggest</span>
                                </button>
                            </div>
                            {errors.customAlias && <p className="text-red-400 text-xs mt-1">{errors.customAlias.message}</p>}

                            {/* AI Slug Suggestions */}
                            <AnimatePresence>
                                {aiSlugs.length > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="mt-3 p-3 bg-brand-600/10 border border-brand-500/20 rounded-xl"
                                    >
                                        <p className="text-xs text-brand-400 font-semibold mb-2 flex items-center gap-1">
                                            <Wand2 className="w-3 h-3" /> AI Suggestions
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            {aiSlugs.map((slug, i) => (
                                                <button
                                                    key={i}
                                                    type="button"
                                                    onClick={() => setValue('customAlias', slug)}
                                                    className="px-3 py-1 text-xs font-mono bg-brand-600/20 text-brand-300 border border-brand-500/30 rounded-lg hover:bg-brand-600/40 transition-colors"
                                                >
                                                    {slug}
                                                </button>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Title */}
                        <div>
                            <label className="input-label">Link Title</label>
                            <input {...register('title')} type="text" placeholder="My Awesome Link" className="input-field" />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="input-label">Description</label>
                            <textarea {...register('description')} rows={2} placeholder="Optional description..." className="input-field resize-none" />
                        </div>
                    </div>

                    {/* Advanced Settings */}
                    <div className="glass-card overflow-hidden">
                        <button
                            type="button"
                            onClick={() => setShowAdvanced(!showAdvanced)}
                            className="w-full flex items-center justify-between p-6 text-left hover:bg-slate-100/20 transition-colors"
                        >
                            <span>
                                <Shield className="w-5 h-5 text-brand-400" />
                                Advanced Settings
                            </span>
                            {showAdvanced ? <ChevronUp className="w-5 h-5 text-slate-600" /> : <ChevronDown className="w-5 h-5 text-slate-600" />}
                        </button>

                        <AnimatePresence>
                            {showAdvanced && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden border-t border-slate-200"
                                >
                                    <div className="p-6 space-y-5">
                                        {/* Expiry */}
                                        <div>
                                            <label className="input-label flex items-center gap-2">
                                                <Clock className="w-4 h-4" /> Expiry Date
                                            </label>
                                            <input
                                                type="datetime-local"
                                                value={expiresAt}
                                                onChange={(e) => setExpiresAt(e.target.value)}
                                                className="input-field"
                                                min={new Date().toISOString().slice(0, 16)}
                                            />
                                        </div>

                                        {/* Password Protection */}
                                        <div>
                                            <div className="flex items-center justify-between mb-3">
                                                <label className="input-label flex items-center gap-2 mb-0">
                                                    <Shield className="w-4 h-4" /> Password Protect
                                                </label>
                                                <button
                                                    type="button"
                                                    onClick={() => setIsPasswordProtected(!isPasswordProtected)}
                                                    className={`relative w-10 h-5 rounded-full transition-colors ${isPasswordProtected ? 'bg-brand-600' : 'bg-slate-200'}`}
                                                >
                                                    <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${isPasswordProtected ? 'translate-x-5' : 'translate-x-0.5'}`} />
                                                </button>
                                            </div>
                                            {isPasswordProtected && (
                                                <div className="relative">
                                                    <input
                                                        {...register('password')}
                                                        type={showPassword ? 'text' : 'password'}
                                                        placeholder="Link password"
                                                        className="input-field pr-10"
                                                    />
                                                    <button type="button" onClick={() => setShowPassword(!showPassword)}>
                                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        {/* One-time link */}
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <label className="text-sm font-medium text-slate-700">One-time Link</label>
                                                <p className="text-xs text-slate-600">Link deactivates after first click</p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setIsOneTime(!isOneTime)}
                                                className={`relative w-10 h-5 rounded-full transition-colors ${isOneTime ? 'bg-brand-600' : 'bg-slate-200'}`}
                                            >
                                                <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${isOneTime ? 'translate-x-5' : 'translate-x-0.5'}`} />
                                            </button>
                                        </div>

                                        {/* UTM Builder */}
                                        <div className="space-y-3 pt-2 border-t border-slate-200">
                                            <p className="text-lg font-semibold text-slate-900">UTM Parameters</p>
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                                <div>
                                                    <label className="input-label text-xs">Source</label>
                                                    <input {...register('utmSource')} placeholder="e.g. twitter" className="input-field text-sm py-2" />
                                                </div>
                                                <div>
                                                    <label className="input-label text-xs">Medium</label>
                                                    <input {...register('utmMedium')} placeholder="e.g. social" className="input-field text-sm py-2" />
                                                </div>
                                                <div>
                                                    <label className="input-label text-xs">Campaign</label>
                                                    <input {...register('utmCampaign')} placeholder="e.g. spring24" className="input-field text-sm py-2" />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Campaign Selection */}
                                        {campaigns?.length > 0 && (
                                            <div>
                                                <label className="input-label">Assign to Campaign</label>
                                                <select {...register('campaignId')} className="input-field">
                                                    <option value="">No Campaign</option>
                                                    {campaigns.map(c => (
                                                        <option key={c._id} value={c._id}>{c.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={createMutation.isPending}
                        className="btn-primary w-full py-4 text-base"
                    >
                        {createMutation.isPending ? (
                            <><Loader2 className="w-5 h-5 animate-spin" /> Creating with AI Analysis...</>
                        ) : (
                            <><QrCode className="w-5 h-5" /> Create Short Link & Generate QR</>
                        )}
                    </button>

                    <p className="text-xs text-slate-500 text-center">
                        AI spam detection will automatically scan your URL for safety
                    </p>
                </form>
            )}
        </div>
    );
};

export default CreateLinkPage;
