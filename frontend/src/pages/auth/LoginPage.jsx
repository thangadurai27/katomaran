import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Zap, Mail, Lock, Eye, EyeOff, Loader2, ArrowRight, Shield } from 'lucide-react';
import { useState } from 'react';
import useAuthStore from '@/stores/authStore';
import toast from 'react-hot-toast';

const schema = z.object({
    email: z.string().email('Please enter a valid email'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    rememberMe: z.boolean().optional()
});

const LoginPage = () => {
    const [showPassword, setShowPassword] = useState(false);
    const { login, isLoading } = useAuthStore();
    const navigate = useNavigate();

    const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) });

    const onSubmit = async (data) => {
        const result = await login(data);
        if (result.success) {
            navigate('/dashboard/overview', { replace: true });
            toast.success('Welcome back!');
        } else {
            toast.error(result.error);
        }
    };

    return (
        <div className="min-h-screen flex" style={{ background: 'var(--bg-base)' }}>
            {/* Left decorative panel */}
            <div className="hidden lg:flex flex-col justify-between w-[42%] bg-gradient-to-br from-indigo-600 to-purple-700 p-12 relative overflow-hidden">
                {/* Orbs */}
                <div className="absolute -top-20 -left-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-purple-400/20 rounded-full blur-3xl" />
                <div className="absolute inset-0 grid-bg opacity-20" />

                {/* Logo */}
                <Link to="/" className="relative flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                        <Zap className="w-5 h-5 text-white" strokeWidth={2.5} />
                    </div>
                    <span className="text-xl font-bold text-white tracking-tight">SnapLink AI</span>
                </Link>

                {/* Middle content */}
                <div className="relative">
                    <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center mb-6">
                        <Shield className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-3xl font-black text-white mb-4 leading-tight">
                        Secure & Smart<br />Link Management
                    </h2>
                    <p className="text-indigo-200 leading-relaxed mb-8">
                        Join 5,000+ teams using AI-powered analytics to track, optimize, and grow their links.
                    </p>
                    <div className="space-y-3">
                        {['Real-time click analytics', 'AI spam detection', 'Custom branded domains', 'Team collaboration'].map((f, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <span className="text-indigo-100 text-sm">{f}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bottom quote */}
                <div className="relative bg-white/10 rounded-2xl p-5 backdrop-blur-sm border border-white/20">
                    <p className="text-white text-sm italic leading-relaxed mb-3">
                        "SnapLink AI transformed how we track campaigns. The AI insights are absolutely mind-blowing."
                    </p>
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-xs font-bold">SC</div>
                        <div>
                            <p className="text-white text-xs font-semibold">Sarah Chen</p>
                            <p className="text-indigo-300 text-xs">Growth Manager @ TechCorp</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right form panel */}
            <div className="auth-form-panel">
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="auth-card"
                >
                    {/* Mobile logo */}
                    <Link to="/" className="lg:hidden inline-flex items-center gap-2 mb-8">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center shadow-brand">
                            <Zap className="w-4.5 h-4.5 text-white" strokeWidth={2.5} />
                        </div>
                        <span className="text-lg font-bold gradient-text-brand">SnapLink AI</span>
                    </Link>

                    <div className="mb-8">
                        <h1 className="text-3xl font-bold font-display mb-2 text-slate-900">Welcome back</h1>
                        <p className="text-base text-slate-500">Sign in to your account to continue</p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="card-elevated p-6 sm:p-8 space-y-5 pb-24 sm:pb-8">
                        {/* Email */}
                        <div>
                            <label className="input-label flex items-center gap-1.5">
                                <Mail className="w-3.5 h-3.5" /> Email address
                            </label>
                            <input
                                {...register('email')}
                                type="email"
                                placeholder="you@example.com"
                                className="input-field"
                                autoComplete="email"
                            />
                            {errors.email && <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">⚠ {errors.email.message}</p>}
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
                                    placeholder="••••••••••"
                                    className="input-field pr-10"
                                    autoComplete="current-password"
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                                    style={{ color: 'var(--text-muted)' }}
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            {errors.password && <p className="text-red-500 text-xs mt-1.5">⚠ {errors.password.message}</p>}
                        </div>

                        {/* Remember / Forgot */}
                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 cursor-pointer select-none">
                                <input type="checkbox" {...register('rememberMe')}
                                    className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Remember me</span>
                            </label>
                            <Link to="/forgot-password" className="text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors">
                                Forgot password?
                            </Link>
                        </div>

                        <div className="sticky-form-actions sm:relative sm:mt-0 -mx-6 sm:mx-0 px-6 sm:px-0 pt-2">
                            <button type="submit" disabled={isLoading} className="btn-primary w-full py-3.5 text-base rounded-xl shadow-brand">
                                {isLoading
                                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in...</>
                                    : <>Sign in <ArrowRight className="w-4 h-4" /></>
                                }
                            </button>
                        </div>
                    </form>

                    <p className="text-center text-sm mt-6" style={{ color: 'var(--text-muted)' }}>
                        Don't have an account?{' '}
                        <Link to="/signup" className="text-indigo-600 hover:text-indigo-700 font-semibold transition-colors">
                            Sign up free
                        </Link>
                    </p>
                </motion.div>
            </div>
        </div>
    );
};

export default LoginPage;
