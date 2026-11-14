import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '@/stores/authStore';
import { Container } from '@/components/layout';
import { Input, Button } from '@/components/ui';
import { Zap, Eye, EyeOff, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const SignupPage = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const { signup, isLoading } = useAuthStore();
    const navigate = useNavigate();
    const { register, handleSubmit, formState: { errors } } = useForm();

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
        <div className="min-h-screen flex flex-col bg-background">
            {/* Navbar */}
            <nav className="navbar-auth border-b border-border bg-background">
                <div className="navbar-auth-logo flex items-center gap-3 px-6 py-4">
                    <Link to="/" className="flex items-center gap-2">
                        <Zap className="w-6 h-6 text-primary" strokeWidth={2} />
                        <span className="font-bold font-display text-primary-text">SnapLink AI</span>
                    </Link>
                </div>
                <ul className="navbar-auth-links hidden md:flex items-center gap-8 px-6 py-2">
                    <li><Link to="/features" className="text-secondary-text hover:text-primary transition-colors">Features</Link></li>
                    <li><Link to="/pricing" className="text-secondary-text hover:text-primary transition-colors">Pricing</Link></li>
                </ul>
            </nav>

            <main className="flex-1 flex items-center justify-center py-12 px-4 bg-background">
                <Container maxW="420" className="auth-card w-full p-8 sm:p-12 max-w-full">
                    <div className="text-center mb-8">
                        <Zap className="w-10 h-10 mx-auto mb-4 bg-primary/10 rounded-xl flex items-center justify-center" strokeWidth={2} />
                        <h1 className="text-3xl font-bold font-display text-primary-text mb-2">Create account</h1>
                        <p className="text-secondary-text">Start for free — no credit card required</p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        {/* Name */}
                        <div className="space-y-2">
                            <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
                            <Input
                                id="name"
                                {...register('name')}
                                type="text"
                                placeholder="John Doe"
                                className="input-field w-full"
                                autoComplete="name"
                            />
                            {errors.name && <p className="text-danger text-sm mt-0.5">{errors.name.message}</p>}
                        </div>

                        {/* Email */}
                        <div className="space-y-2">
                            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">Email address</label>
                            <Input
                                id="email"
                                {...register('email')}
                                type="email"
                                placeholder="you@example.com"
                                className="input-field w-full"
                                autoComplete="email"
                            />
                            {errors.email && <p className="text-danger text-sm mt-0.5">{errors.email.message}</p>}
                        </div>

                        {/* Password */}
                        <div className="space-y-2">
                            <div className="relative">
                                <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
                                <Input
                                    id="password"
                                    {...register('password')}
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="8+ characters with numbers"
                                    className="input-field w-full pr-16"
                                    autoComplete="new-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                                    style={{ color: 'var(--muted)' }}
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                            {errors.password && <p className="text-danger text-sm mt-0.5">{errors.password.message}</p>}
                        </div>

                        {/* Confirm Password */}
                        <div className="space-y-2">
                            <div className="relative">
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-1.5">Confirm Password</label>
                                <Input
                                    id="confirmPassword"
                                    {...register('confirmPassword')}
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    className="input-field w-full pr-16"
                                    autoComplete="new-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                                    style={{ color: 'var(--muted)' }}
                                >
                                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                            {errors.confirmPassword && <p className="text-danger text-sm mt-0.5">{errors.confirmPassword.message}</p>}
                        </div>

                        {/* Terms */}
                        <p className="text-xs text-secondary-text">
                            By signing up, you agree to our <Link to="/terms" className="font-medium hover:underline text-primary">Terms of Service</Link> and <Link to="/privacy-policy" className="font-medium hover:underline text-primary">Privacy Policy</Link>
                        </p>

                        {/* Submit */}
                        <Button type="submit" disabled={isLoading} className="w-full">
                            {isLoading ? (<><Loader2 className="mr-2 animate-spin" /> Creating account...</>) : 'Get started free →'}
                        </Button>
                    </form>

                    {/* Feature highlights / Already have account */}
                    <p className="text-center text-sm mt-6 text-secondary-text">
                        Already have an account? <Link to="/login" className="font-medium hover:underline text-primary">Sign in</Link>
                    </p>
                </Container>
            </main>
        </div>
    );
};

export default SignupPage;
