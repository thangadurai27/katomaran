import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Link2,
    Sparkles,
    Clock,
    QrCode,
    ChevronDown,
    ChevronUp,
    Loader2,
    CheckCircle,
    ExternalLink,
    Copy,
    Eye,
    EyeOff,
    Eye as EyeIcon,
    Bookmark,
    FileText,
    Calendar,
    Lock,
    Settings,
    Check,
    Download,
    Image as ImageIcon,
    Zap,
} from 'lucide-react';
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

const ALIAS_PREFIX = SHORT_URL_BASE.replace(/^https?:\/\//, '');
const DISPLAY_PREFIX = ALIAS_PREFIX.replace(/\/$/, '');

const CreateLinkPage = () => {
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [expiryEnabled, setExpiryEnabled] = useState(false);
    const [passwordEnabled, setPasswordEnabled] = useState(false);
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
        resolver: zodResolver(schema),
        defaultValues: { originalUrl: '', customAlias: '', title: '', description: '' }
    });

    const watchedUrl = watch('originalUrl');
    const watchedTitle = watch('title');
    const watchedAlias = watch('customAlias');

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
            isPasswordProtected: passwordEnabled,
            isOneTime,
            expiresAt: expiryEnabled && expiresAt ? expiresAt : null,
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

    const shortUrl = createdLink ? `${SHORT_URL_BASE}${createdLink.shortCode}` : null;

    /* ---- live preview values ---- */
    const previewTitle = watchedTitle?.trim() || 'Your Link Title';
    const previewUrl = watchedUrl?.trim() || 'https://your-long-url.com/...';
    const previewShort = `${DISPLAY_PREFIX}/${watchedAlias?.trim() || 'my-link'}`;
    const qrSrc = createdLink?.qrCode?.url
        || (watchedUrl && /^https?:\/\/.+/.test(watchedUrl)
            ? `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(watchedUrl)}`
            : null);

    return (
        <div className="max-w-6xl animate-in">
            {/* decorative background blob */}
            <div className="relative" aria-hidden="true">
                <div className="absolute -top-10 right-0 w-[420px] h-[280px] rounded-full bg-gradient-to-br from-[#8B5CF6]/15 to-[#A78BFA]/10 blur-3xl pointer-events-none" />
            </div>

            {/* ============================== PAGE HEADER ============================== */}
            <div className="relative flex items-center gap-4 mb-8">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#7C3AED] to-[#8B5CF6] flex items-center justify-center shadow-lg shadow-[#7C3AED]/30 shrink-0">
                    <Link2 className="w-7 h-7 text-white" strokeWidth={2.2} />
                </div>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-[var(--text-primary)]">Create Short Link</h1>
                    <p className="text-[var(--text-secondary)] mt-0.5">Turn a long URL into a short, trackable link in seconds.</p>
                </div>
            </div>

            {/* ============================== SUCCESS STATE ============================== */}
            <AnimatePresence>
                {createdLink && (
                    <motion.div
                        initial={{ opacity: 0, y: -16 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 dark:border-emerald-500/30 dark:bg-emerald-500/10"
                    >
                        <div className="flex items-start gap-4">
                            <CheckCircle className="w-6 h-6 text-emerald-500 shrink-0 mt-0.5" />
                            <div className="flex-1 min-w-0">
                                <h3 className="text-base font-bold text-emerald-700 dark:text-emerald-300 mb-2">Link Created!</h3>
                                <div className="flex items-center gap-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5">
                                    <span className="text-[#7C3AED] font-mono text-sm flex-1 truncate">{shortUrl}</span>
                                    <button type="button" onClick={() => copyToClipboard(shortUrl)} className="p-1.5 text-slate-500 hover:text-[#7C3AED] rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 transition-colors" aria-label="Copy">
                                        <Copy className="w-4 h-4" />
                                    </button>
                                    <a href={shortUrl} target="_blank" rel="noopener noreferrer" className="p-1.5 text-slate-500 hover:text-[#7C3AED] rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 transition-colors" aria-label="Open">
                                        <ExternalLink className="w-4 h-4" />
                                    </a>
                                </div>
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

            {/* ============================== MAIN GRID ============================== */}
            <div className="relative grid lg:grid-cols-[minmax(0,1fr)_400px] gap-6 items-start">
                {/* ------------------------------ LEFT: FORM ------------------------------ */}
                <form onSubmit={handleSubmit(onSubmit)} className="rounded-2xl bg-[var(--bg-surface)] border border-[var(--border)] shadow-[var(--shadow-soft)] p-6 sm:p-8 space-y-5">
                    <h2 className="flex items-center gap-2.5 text-lg font-bold text-[var(--text-primary)]">
                        <span className="w-8 h-8 rounded-lg bg-[#7C3AED]/10 text-[#7C3AED] flex items-center justify-center">
                            <EyeIcon className="w-4.5 h-4.5" />
                        </span>
                        Link Details
                    </h2>

                    {/* Long URL */}
                    <div>
                        <label className="input-label">Long URL <span className="text-red-500">*</span></label>
                        <div className="relative">
                            <Link2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 pointer-events-none" />
                            <input
                                {...register('originalUrl')}
                                type="url"
                                placeholder="Paste your long URL here..."
                                className="input-field pl-11"
                            />
                        </div>
                        {errors.originalUrl && <p className="text-red-500 text-xs mt-1.5">{errors.originalUrl.message}</p>}
                    </div>

                    {/* Custom Alias + AI */}
                    <div>
                        <label className="input-label">Custom Alias <span className="font-normal text-[var(--text-muted)]">(optional)</span></label>
                        <div className="flex gap-3">
                            <div className="flex-1 min-w-0 flex items-stretch rounded-xl border-[1.5px] border-[var(--border)] bg-[var(--bg-surface)] focus-within:border-[#818cf8] focus-within:shadow-[0_0_0_3px_rgba(99,102,241,0.12)] transition-all overflow-hidden">
                                <span className="flex items-center pl-3 pr-2 bg-[var(--bg-raised)] border-r border-[var(--border)] text-xs font-semibold text-[var(--text-secondary)] whitespace-nowrap max-w-[45%] truncate select-none">
                                    {DISPLAY_PREFIX}
                                </span>
                                <input
                                    {...register('customAlias')}
                                    type="text"
                                    placeholder="e.g. my-link"
                                    className="flex-1 min-w-0 px-3 py-2.5 text-sm bg-transparent border-0 focus:outline-none text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
                                />
                            </div>
                            <button
                                type="button"
                                onClick={generateAiSlugs}
                                disabled={aiLoading}
                                className="shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-[#7C3AED] bg-[#7C3AED]/10 border border-[#7C3AED]/20 hover:bg-[#7C3AED]/20 transition-all active:scale-95 disabled:opacity-60"
                                title="Generate AI slug suggestions"
                            >
                                {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                                AI Suggest
                            </button>
                        </div>
                        {errors.customAlias && <p className="text-red-500 text-xs mt-1.5">{errors.customAlias.message}</p>}

                        {/* AI Slug Suggestions */}
                        <AnimatePresence>
                            {aiSlugs.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="overflow-hidden"
                                >
                                    <div className="mt-3 p-3 bg-[#7C3AED]/5 border border-[#7C3AED]/15 rounded-xl">
                                        <p className="text-xs text-[#7C3AED] font-semibold mb-2 flex items-center gap-1.5">
                                            <Sparkles className="w-3 h-3" /> AI Suggestions
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            {aiSlugs.map((slug, i) => (
                                                <button
                                                    key={i}
                                                    type="button"
                                                    onClick={() => setValue('customAlias', slug)}
                                                    className="px-3 py-1 text-xs font-mono bg-white dark:bg-white/10 text-[#7C3AED] border border-[#7C3AED]/25 rounded-lg hover:bg-[#7C3AED]/10 transition-colors"
                                                >
                                                    {slug}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Title */}
                    <div>
                        <label className="input-label">Link Title <span className="font-normal text-[var(--text-muted)]">(optional)</span></label>
                        <div className="relative">
                            <Bookmark className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 pointer-events-none" />
                            <input
                                {...register('title')}
                                type="text"
                                placeholder="e.g. Product Page, Blog, Offer"
                                className="input-field pl-11"
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="input-label">Description <span className="font-normal text-[var(--text-muted)]">(optional)</span></label>
                        <div className="relative">
                            <FileText className="absolute left-4 top-4 w-4.5 h-4.5 text-slate-400 pointer-events-none" />
                            <textarea
                                {...register('description')}
                                rows={3}
                                placeholder="Add a short description..."
                                className="input-field pl-11 resize-y"
                            />
                        </div>
                    </div>

                    {/* Advanced Options */}
                    <div className="rounded-xl border border-[var(--border)] overflow-hidden">
                        <button
                            type="button"
                            onClick={() => setShowAdvanced(!showAdvanced)}
                            className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-[var(--bg-raised)]/60 transition-colors"
                        >
                            <span className="flex items-center gap-2.5 text-sm font-bold text-[var(--text-primary)]">
                                <span className="w-8 h-8 rounded-lg bg-[#7C3AED]/10 text-[#7C3AED] flex items-center justify-center">
                                    <Settings className="w-4 h-4" />
                                </span>
                                Advanced Options
                            </span>
                            {showAdvanced ? <ChevronUp className="w-5 h-5 text-[var(--text-muted)]" /> : <ChevronDown className="w-5 h-5 text-[var(--text-muted)]" />}
                        </button>

                        <AnimatePresence>
                            {showAdvanced && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden border-t border-[var(--border)]"
                                >
                                    <div className="p-5 space-y-5">
                                        {/* Expiry + Password toggles */}
                                        <div className="grid sm:grid-cols-2 gap-4">
                                            <div className="rounded-xl bg-[var(--bg-raised)] p-4 flex items-center justify-between gap-3">
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <div className="w-9 h-9 rounded-lg bg-white dark:bg-white/10 border border-[var(--border)] flex items-center justify-center text-[#7C3AED] shrink-0">
                                                        <Calendar className="w-4 h-4" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-semibold text-[var(--text-primary)]">Set Expiry</p>
                                                        <p className="text-xs text-[var(--text-muted)] truncate">Make the link expire on a date</p>
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => setExpiryEnabled(!expiryEnabled)}
                                                    className={`relative w-10 h-6 rounded-full transition-colors shrink-0 ${expiryEnabled ? 'bg-[#7C3AED]' : 'bg-slate-300 dark:bg-slate-600'}`}
                                                    aria-label="Toggle expiry"
                                                >
                                                    <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${expiryEnabled ? 'translate-x-[18px]' : 'translate-x-0.5'}`} />
                                                </button>
                                            </div>

                                            <div className="rounded-xl bg-[var(--bg-raised)] p-4 flex items-center justify-between gap-3">
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <div className="w-9 h-9 rounded-lg bg-white dark:bg-white/10 border border-[var(--border)] flex items-center justify-center text-[#7C3AED] shrink-0">
                                                        <Lock className="w-4 h-4" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-semibold text-[var(--text-primary)]">Password Protection</p>
                                                        <p className="text-xs text-[var(--text-muted)] truncate">Require a password to access</p>
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => setPasswordEnabled(!passwordEnabled)}
                                                    className={`relative w-10 h-6 rounded-full transition-colors shrink-0 ${passwordEnabled ? 'bg-[#7C3AED]' : 'bg-slate-300 dark:bg-slate-600'}`}
                                                    aria-label="Toggle password protection"
                                                >
                                                    <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${passwordEnabled ? 'translate-x-[18px]' : 'translate-x-0.5'}`} />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Expiry input */}
                                        <AnimatePresence>
                                            {expiryEnabled && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    className="overflow-hidden"
                                                >
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
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        {/* Password input */}
                                        <AnimatePresence>
                                            {passwordEnabled && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    className="overflow-hidden"
                                                >
                                                    <label className="input-label">Link Password</label>
                                                    <div className="relative">
                                                        <input
                                                            {...register('password')}
                                                            type={showPassword ? 'text' : 'password'}
                                                            placeholder="Enter a password"
                                                            className="input-field pr-11"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowPassword(!showPassword)}
                                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#7C3AED] transition-colors"
                                                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                                                        >
                                                            {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                                                        </button>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        {/* One-time link */}
                                        <div className="flex items-center justify-between rounded-xl bg-[var(--bg-raised)] p-4">
                                            <div>
                                                <p className="text-sm font-semibold text-[var(--text-primary)]">One-time Link</p>
                                                <p className="text-xs text-[var(--text-muted)]">Link deactivates after first click</p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setIsOneTime(!isOneTime)}
                                                className={`relative w-10 h-6 rounded-full transition-colors shrink-0 ${isOneTime ? 'bg-[#7C3AED]' : 'bg-slate-300 dark:bg-slate-600'}`}
                                                aria-label="Toggle one-time link"
                                            >
                                                <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${isOneTime ? 'translate-x-[18px]' : 'translate-x-0.5'}`} />
                                            </button>
                                        </div>

                                        {/* UTM Builder */}
                                        <div className="space-y-3 pt-1">
                                            <p className="text-sm font-bold text-[var(--text-primary)]">UTM Parameters</p>
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                                <div>
                                                    <label className="input-label text-xs">Source</label>
                                                    <input {...register('utmSource')} placeholder="e.g. twitter" className="input-field text-sm" />
                                                </div>
                                                <div>
                                                    <label className="input-label text-xs">Medium</label>
                                                    <input {...register('utmMedium')} placeholder="e.g. social" className="input-field text-sm" />
                                                </div>
                                                <div>
                                                    <label className="input-label text-xs">Campaign</label>
                                                    <input {...register('utmCampaign')} placeholder="e.g. spring24" className="input-field text-sm" />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Campaign Selection */}
                                        {campaigns?.length > 0 && (
                                            <div>
                                                <label className="input-label">Assign to Campaign</label>
                                                <select {...register('campaignId')} className="input-field">
                                                    <option value="">No Campaign</option>
                                                    {campaigns.map((c) => (
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
                        className="w-full inline-flex items-center justify-center gap-2.5 py-4 rounded-2xl text-base font-bold text-white bg-gradient-to-r from-[#7C3AED] to-[#8B5CF6] shadow-lg shadow-[#7C3AED]/30 hover:shadow-xl hover:shadow-[#7C3AED]/40 hover:-translate-y-0.5 transition-all active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                    >
                        {createMutation.isPending ? (
                            <><Loader2 className="w-5 h-5 animate-spin" /> Creating with AI Analysis...</>
                        ) : (
                            <><Link2 className="w-5 h-5" /> Create Short Link</>
                        )}
                    </button>
                </form>

                {/* ------------------------------ RIGHT: PREVIEW + QR ------------------------------ */}
                <div className="space-y-6 lg:sticky lg:top-24">
                    {/* Live Preview */}
                    <div className="rounded-2xl bg-[var(--bg-surface)] border border-[var(--border)] shadow-[var(--shadow-soft)] p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="flex items-center gap-2.5 text-lg font-bold text-[var(--text-primary)]">
                                <EyeIcon className="w-5 h-5 text-[#7C3AED]" />
                                Live Preview
                            </h2>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/30">
                                <Check className="w-3.5 h-3.5" strokeWidth={3} /> Ready
                            </span>
                        </div>

                        {/* link card preview */}
                        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-raised)]/60 p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#A78BFA]/60 to-[#7C3AED]/60 flex items-center justify-center text-white/90 shrink-0">
                                    <ImageIcon className="w-6 h-6" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-bold text-[var(--text-primary)] truncate">{previewTitle}</p>
                                    <p className="text-xs text-[var(--text-muted)] truncate">{previewUrl}</p>
                                </div>
                            </div>
                        </div>

                        {/* short url band */}
                        <div className="mt-3 rounded-xl bg-gradient-to-r from-[#7C3AED]/10 to-[#8B5CF6]/10 border border-[#7C3AED]/15 px-4 py-3.5 flex items-center justify-between gap-2">
                            <span className="text-lg font-bold text-[#7C3AED] truncate">{previewShort}</span>
                            <button
                                type="button"
                                onClick={() => copyToClipboard(createdLink ? shortUrl : previewShort)}
                                className="shrink-0 w-9 h-9 rounded-lg bg-white dark:bg-white/10 border border-[var(--border)] flex items-center justify-center text-[#7C3AED] hover:bg-[#7C3AED]/10 transition-colors"
                                aria-label="Copy short link"
                            >
                                <Copy className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* QR Code */}
                    <div className="rounded-2xl bg-[var(--bg-surface)] border border-[var(--border)] shadow-[var(--shadow-soft)] p-6">
                        <h2 className="flex items-center gap-2.5 text-lg font-bold text-[var(--text-primary)] mb-4">
                            <QrCode className="w-5 h-5 text-[#7C3AED]" />
                            QR Code
                        </h2>

                        <div className="grid grid-cols-[auto_1fr] gap-5 items-start">
                            {/* QR image */}
                            <div className="relative w-40 h-40 rounded-xl border border-[var(--border)] bg-white p-2 overflow-hidden">
                                {qrSrc ? (
                                    <>
                                        <img src={qrSrc} alt="QR code preview" className="w-full h-full object-contain" />
                                        <span className="absolute inset-0 m-auto w-9 h-9 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#8B5CF6] border-[3px] border-white flex items-center justify-center shadow">
                                            <Zap className="w-4 h-4 text-white" strokeWidth={2.5} />
                                        </span>
                                    </>
                                ) : (
                                    <div className="w-full h-full rounded-lg border-2 border-dashed border-[var(--border-strong)] flex flex-col items-center justify-center text-[var(--text-muted)] gap-1.5">
                                        <QrCode className="w-8 h-8" />
                                        <span className="text-[10px] font-medium">Paste a URL</span>
                                    </div>
                                )}
                            </div>

                            {/* checklist */}
                            <ul className="space-y-3 self-center">
                                {['Instantly share your link', 'Works on all devices', 'Great for marketing & print'].map((t) => (
                                    <li key={t} className="flex items-start gap-2 text-sm font-medium text-[var(--text-secondary)]">
                                        <Check className="w-4 h-4 text-[#7C3AED] mt-0.5 shrink-0" strokeWidth={3} /> {t}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <a
                            href={qrSrc || '#'}
                            download="snaplink-qr.png"
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => { if (!qrSrc) { e.preventDefault(); toast.error('Enter a URL first to generate a QR'); } }}
                            className={`mt-5 w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all ${qrSrc
                                ? 'text-[#7C3AED] bg-[#7C3AED]/10 border border-[#7C3AED]/20 hover:bg-[#7C3AED]/20'
                                : 'text-[var(--text-muted)] bg-[var(--bg-raised)] border border-[var(--border)] cursor-not-allowed'
                                }`}
                        >
                            <Download className="w-4 h-4" /> Download QR
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateLinkPage;
