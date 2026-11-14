import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { Input, Button } from '@/components/ui';
import { Zap, Eye, EyeOff } from 'lucide-react';

const LoginPage = () => {
    const [showPassword, setShowPassword] = useState(false);
    const { login, isLoading } = useAuthStore();
    const navigate = useNavigate();
    const { register, handleSubmit, formState: { errors } } = useForm();

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

            <main class="flex-1 flex items-center justify-center py-12 px-4 bg-background">
                <Container maxW="420" className="auth-card p-8 sm:p-12 max-w-full">
                    <div className="text-center mb-8">
                        <Zap className="w-10 h-10 mx-auto mb-4 bg-primary/10 rounded-xl flex items-center justify-center" strokeWidth={2} />
                        <h1 className="text-3xl font-bold font-display text-primary-text mb-2">Welcome back</h1>
                        <p className="text-secondary-text">Sign in to your account to continue</p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        {/* Email */}
                        <div>
                            <InputLabel htmlFor="email">Email address</InputLabel>
                            <Input
                                id="email"
                                type="email"
                                {...register('email')}
                                placeholder="you@example.com"
                                className="input-field w-full"
                                autoComplete="email"
                            />
                            {errors.email && <p className="text-danger text-sm mt-1.5">⚠ {errors.email.message}</p>}
                        </div>

                        {/* Password */}
                        <div className="relative">
                            <InputLabel htmlFor="password">Password</InputLabel>
                            <Input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                {...register('password')}
                                placeholder="••••••••••"
                                className="input-field w-full pr-16"
                                autoComplete="current-password"
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
                        {errors.password && <p className="text-danger text-sm mt-1.5">⚠ {errors.password.message}</p>}

                        {/* Remember & Forgot */}
                        <div className="flex items-between text-xs text-secondary-text">
                            <label className="flex items-center gap-2 cursor-pointer select-none">
                                <input type="checkbox" {...register('rememberMe')} className="w-4 h-4 rounded border-primary focus:ring-primary" />
                                Remember me
                            </label>
                            <Link to="/forgot-password" className="hover:underline text-sm">Forgot password?</Link>
                        </div>

                        {/* Submit */}
                        <Button type="submit" disabled={isLoading} className="w-full">
                            {isLoading
                                ? '<Loader2 className="mr-2 animate-spin" /> Signing in...'
                                : 'Sign in →'
                            }
                        </Button>
                    </form>

                    {/* Divider / Account creation */}
                    <p className="text-center text-sm mt-6 text-secondary-text">
                        Don't have an account? <Link to="/signup" className="font-medium hover:underline text-primary">Sign up free</Link>
                    </p>
                </Container>
            </main>
        </div>
    );
};

// Zod schema for form validation
const zodSchema = z.object({
    email: z.string().email('Please enter a valid email'),
    password: z.string().min(8, 'Password must be at least 8 characters')
});

LoginPage.schema = zodSchema;

export default LoginPage;