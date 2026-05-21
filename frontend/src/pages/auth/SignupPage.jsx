import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Zap, Mail, Lock, User, Eye, EyeOff, Loader2, CheckCircle, ArrowRight, Sparkles } from 'lucide-react';
import useAuthStore from '@/stores/authStore';
import toast from 'react-hot-toast';

const schema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(100),
    email: z.string().email('Please enter a valid email'),
    password: z.string().min(8, 'Password must be at least 8 characters')
        .regex(/(?=.*[0-9])/, 'Must contain at least one number')
        .regex(/(?=.*[a-z])/, 'Must contain at least one lowercase letter'),
    confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword']
});

const FEATURES = [
    'Unlimited short links',
    'AI-powered analytics',
    'Custom branded domains',
    'Team collaboration',
];

const SignupPage = () => {
    const [showPassword, setShowPassword] = useState(false);
    const { signup, isLoading } = useAuthStore();
    const navigate = useNavigate();

    const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) });

    const onSubmit = async ({ name, email, password }) => {
        const result = await signup({ name, email, password });
        if (result.success) {
            navigate('/dashboard/overview', { replace: true });
            toast.success('Account created! Welcome to SnapLink AI');
        } else {
            toast.error(result.error);
        }
    };

    return (
        <div className="min-h-screen flex" style={{ background: 'var(--bg-base)' }}>
            {/* Left decorative panel */}
            <div className="hidden lg:flex flex-col justify-between w-[42%] bg-gradient-to-br from-indigo-600 to-purple-700 p-12 relative overflow-hidden">
                <div className="absolute -top-20 -left-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-purple-400/20 rounded-full blur-3xl" />
                <div className="absolute inset-0 grid-bg opacity-20" />

                <Link to="/" className="relative flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                        <Zap className="w-5 h-5 text-white" strokeWidth={2.5} />
                    </div>
                    <span className="text-xl font-bold text-white tracking-tight">SnapLink AI</span>
                </Link>

                <div className="relative">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/15 rounded-full border border-white/20 mb-6">
                        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                        <span className="text-white text-xs font-semibold">Google Gemini AI Powered</span>
                    </div>
                    <h2 className="text-3xl font-black text-white mb-4 leading-tight">
                        The smartest URL<br />shortener alive
                    </h2>
                    <p className="text-indigo-200 leading-relaxed mb-8">
                        Get deep analytics, AI spam detection, insights, and everything you need to grow your audience.
                    </p>
                    <div className="space-y-3">
                        {FEATURES.map((f, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <div className="w-5 h-5 rounded-full bg-emerald-400/20 border border-emerald-400/40 flex items-center justify-center flex-shrink-0">
                                    <svg className="w-3 h-3 text-emerald-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <span className="text-indigo-100 text-sm">{f}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Stats bar */}
                <div className="relative grid grid-cols-3 gap-3">
                    {[['50K+', 'Links'], ['2M+', 'Clicks'], ['99.9%', 'Uptime']].map(([val, lbl]) => (
                        <div key={lbl} className="bg-white/10 rounded-xl p-3 text-center border border-white/15">
                            <p className="text-white font-black text-lg">{val}</p>
                            <p className="text-indigo-300 text-xs">{lbl}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Right form panel */}
            <div className="auth-form-panel overflow-y-auto">
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="auth-card py-8"
                >
                    <Link to="/" className="lg:hidden inline-flex items-center gap-2 mb-8">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center shadow-brand">
                            <Zap className="w-4.5 h-4.5 text-white" strokeWidth={2.5} />
                        </div>
                        <span className="text-lg font-bold gradient-text-brand">SnapLink AI</span>
                    </Link>

                    <div className="mb-8">
                        <h1 className="text-3xl font-bold font-display mb-2 text-slate-900">Create account</h1>
                        <p className="text-base text-slate-500">Start for free — no credit card required</p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="card-elevated p-6 sm:p-8 space-y-4">
                        {/* Name */}
                        <div>
                            <label className="input-label flex items-center gap-1.5">
                                <User className="w-3.5 h-3.5" /> Full Name
                            </label>
                            <input {...register('name')} type="text" placeholder="John Doe" className="input-field" autoComplete="name" />
                            {errors.name && <p className="text-red-500 text-xs mt-1.5">⚠ {errors.name.message}</p>}
                        </div>

                        {/* Email */}
                        <div>
                            <label className="input-label flex items-center gap-1.5">
                                <Mail className="w-3.5 h-3.5" /> Email address
                            </label>
                            <input {...register('email')} type="email" placeholder="you@example.com" className="input-field" autoComplete="email" />
                            {errors.email && <p className="text-red-500 text-xs mt-1.5">⚠ {errors.email.message}</p>}
                        </div>

                        {/* Password */}
                        <div>
                            <label className="input-label flex items-center gap-1.5">
                                <Lock className="w-3.5 h-3.5" /> Password
                            </label>
                            <div className="relative">
                                <input
                                    {...register('password')}
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="8+ characters with numbers"
                                    className="input-field pr-10"
                                    autoComplete="new-password"
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                                    style={{ color: 'var(--text-muted)' }}>
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            {errors.password && <p className="text-red-500 text-xs mt-1.5">⚠ {errors.password.message}</p>}
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="input-label flex items-center gap-1.5">
                                <Lock className="w-3.5 h-3.5" /> Confirm Password
                            </label>
                            <input {...register('confirmPassword')} type="password" placeholder="••••••••••" className="input-field" autoComplete="new-password" />
                            {errors.confirmPassword && <p className="text-red-500 text-xs mt-1.5">⚠ {errors.confirmPassword.message}</p>}
                        </div>

                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                            By signing up, you agree to our{' '}
                            <Link to="/terms" className="text-indigo-600 hover:underline">Terms of Service</Link> and{' '}
                            <Link to="/privacy-policy" className="text-indigo-600 hover:underline">Privacy Policy</Link>
                        </p>

                        <button type="submit" disabled={isLoading} className="btn-primary w-full py-3 text-base rounded-xl">
                            {isLoading
                                ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating account...</>
                                : <>Get started free <ArrowRight className="w-4 h-4" /></>
                            }
                        </button>
                    </form>

                    <p className="text-center text-sm mt-6" style={{ color: 'var(--text-muted)' }}>
                        Already have an account?{' '}
                        <Link to="/login" className="text-indigo-600 hover:text-indigo-700 font-semibold transition-colors">Sign in</Link>
                    </p>
                </motion.div>
            </div>
        </div>
    );
};

export default SignupPage;
