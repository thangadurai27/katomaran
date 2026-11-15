import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuthStore } from '@/stores/authStore';
import AuthLayout from '@/components/auth/AuthLayout';
import { Input, Button } from '@/components/ui';
import { Eye, EyeOff, Loader2, Mail, Lock, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

const zodSchema = z.object({
    email: z.string().email('Please enter a valid email'),
    password: z.string().min(8, 'Password must be at least 8 characters')
});

const FieldLabel = ({ icon: Icon, htmlFor, children }) => (
    <label htmlFor={htmlFor} className="mb-1.5 flex items-center gap-1.5 text-[13px] font-semibold text-[#3F3C56]">
        <Icon className="h-3.5 w-3.5 text-[#8B5CF6]" /> {children}
    </label>
);

const LoginPage = () => {
    const [showPassword, setShowPassword] = useState(false);
    const { login, isLoading } = useAuthStore();
    const navigate = useNavigate();
    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(zodSchema),
    });

    const onSubmit = async (data) => {
        const result = await login(data);
        if (result.success) {
            navigate('/dashboard/overview', { replace: true });
            toast.success('Welcome back!');
        } else {
            toast.error(result.error);
        }
    };

    const handleDemoLogin = async () => {
        const result = await login({ email: 'demo@gmail.com', password: 'demo123' });
        if (result.success) {
            toast.success('Welcome to SnapLink AI Demo!');
            navigate('/dashboard/overview', { replace: true });
        } else {
            toast.error(result.error || 'Demo login is temporarily unavailable. Please try again.');
        }
    };

    return (
        <AuthLayout variant="login">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
                {/* Email */}
                <div>
                    <FieldLabel icon={Mail} htmlFor="email">Email address</FieldLabel>
                    <Input
                        id="email"
                        {...register('email')}
                        type="email"
                        placeholder="Enter your email"
                        className="input-field w-full rounded-xl border-[#E7E1F2] bg-white py-3 shadow-none"
                        autoComplete="email"
                    />
                    {errors.email && <p className="mt-1 text-[12.5px] font-medium text-red-500">{errors.email.message}</p>}
                </div>

                {/* Password */}
                <div>
                    <FieldLabel icon={Lock} htmlFor="password">Password</FieldLabel>
                    <div className="relative">
                        <Input
                            id="password"
                            {...register('password')}
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Enter your password"
                            className="input-field w-full rounded-xl border-[#E7E1F2] bg-white py-3 pr-11 shadow-none"
                            autoComplete="current-password"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9A97AC] transition-colors hover:text-[#6B6880]"
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                            aria-controls="password"
                        >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                    </div>
                    {errors.password && <p className="mt-1 text-[12.5px] font-medium text-red-500">{errors.password.message}</p>}
                </div>

                {/* Remember & Forgot */}
                <div className="flex items-center justify-between text-[13px] text-[#5C5975]">
                    <label className="flex cursor-pointer select-none items-center gap-2">
                        <input
                            type="checkbox"
                            {...register('rememberMe')}
                            className="h-4 w-4 rounded border-[#D6D0E4] accent-[#7C3AED]"
                        />
                        Remember me
                    </label>
                    <Link to="/forgot-password" className="font-semibold text-[#7C3AED] transition-colors hover:text-[#6D28D9]">
                        Forgot password?
                    </Link>
                </div>

                {/* Submit */}
                <Button type="submit" disabled={isLoading} className="btn-primary h-[52px] w-full text-[15px]">
                    {isLoading ? (
                        <><Loader2 className="animate-spin" /> Signing in…</>
                    ) : (
                        <>Sign In <ArrowRight className="h-4 w-4" /></>
                    )}
                </Button>

                {/* Demo account */}
                <div className="pt-1">
                    <div className="flex items-center gap-3">
                        <span className="h-px flex-1 bg-[#EDE8F6]" />
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-[#9A97AC]">or</span>
                        <span className="h-px flex-1 bg-[#EDE8F6]" />
                    </div>

                    <div className="mt-4 rounded-2xl border border-[#EBE3FA] bg-[#F8F5FE] p-5 text-center">
                        <h3 className="font-display text-[16px] font-bold text-[#17153A]">Explore SnapLink AI</h3>
                        <p className="mt-1.5 text-[12.5px] leading-relaxed text-[#6B6880]">
                            New to SnapLink AI? Explore all features instantly with our demo account. No registration required.
                        </p>
                        <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                            <span className="rounded-lg bg-white px-2.5 py-1.5 font-mono text-[11.5px] text-[#5C5975] shadow-sm">demo@gmail.com</span>
                            <span className="rounded-lg bg-white px-2.5 py-1.5 font-mono text-[11.5px] text-[#5C5975] shadow-sm">demo123</span>
                        </div>
                        <button
                            type="button"
                            onClick={handleDemoLogin}
                            disabled={isLoading}
                            className="btn-primary mt-4 h-11 w-full text-[14px]"
                        >
                            {isLoading ? (
                                <><Loader2 className="animate-spin" /> Starting demo…</>
                            ) : (
                                <>🚀 Try Demo Account</>
                            )}
                        </button>
                    </div>
                </div>
            </form>
        </AuthLayout>
    );
};

export default LoginPage;
