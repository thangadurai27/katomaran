import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '@/stores/authStore';
import AuthLayout from '@/components/auth/AuthLayout';
import { Input, Button } from '@/components/ui';
import { Eye, EyeOff, Loader2, User, Mail, Lock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const FieldLabel = ({ icon: Icon, htmlFor, children }) => (
    <label htmlFor={htmlFor} className="mb-1.5 flex items-center gap-1.5 text-[13px] font-semibold text-[#3F3C56]">
        <Icon className="h-3.5 w-3.5 text-[#8B5CF6]" /> {children}
    </label>
);

const SignupPage = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const { signup, isLoading } = useAuthStore();
    const navigate = useNavigate();
    const { register, handleSubmit, formState: { errors }, getValues } = useForm({
        mode: 'onChange',
    });

    const onSubmit = async (data) => {
        const { name, email, password } = data;
        const result = await signup({ name, email, password });
        if (result.success) {
            navigate('/dashboard/overview', { replace: true });
            toast.success('Account created! Welcome to SnapLink AI');
        } else {
            toast.error(result.error);
        }
    };

    const passwordToggle = (show, setShow, id) => (
        <button
            type="button"
            onClick={() => setShow(!show)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9A97AC] transition-colors hover:text-[#6B6880]"
            aria-label={show ? 'Hide password' : 'Show password'}
            aria-controls={id}
        >
            {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
    );

    return (
        <AuthLayout variant="signup">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
                {/* Name */}
                <div>
                    <FieldLabel icon={User} htmlFor="name">Full Name</FieldLabel>
                    <Input
                        id="name"
                        {...register('name', { required: 'Full name is required' })}
                        type="text"
                        placeholder="Enter your full name"
                        className="input-field w-full rounded-xl border-[#E7E1F2] bg-white py-3 shadow-none"
                        autoComplete="name"
                    />
                    {errors.name && <p className="mt-1 text-[12.5px] font-medium text-red-500">{errors.name.message}</p>}
                </div>

                {/* Email */}
                <div>
                    <FieldLabel icon={Mail} htmlFor="email">Email address</FieldLabel>
                    <Input
                        id="email"
                        {...register('email', { required: 'Email is required', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Please enter a valid email address' } })}
                        type="email"
                        placeholder="Enter your email address"
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
                            {...register('password', { required: 'Password is required', minLength: { value: 8, message: 'Password must be at least 8 characters' } })}
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Create a password (8+ characters)"
                            className="input-field w-full rounded-xl border-[#E7E1F2] bg-white py-3 pr-11 shadow-none"
                            autoComplete="new-password"
                        />
                        {passwordToggle(showPassword, setShowPassword, 'password')}
                    </div>
                    {errors.password && <p className="mt-1 text-[12.5px] font-medium text-red-500">{errors.password.message}</p>}
                </div>

                {/* Confirm Password */}
                <div>
                    <FieldLabel icon={Lock} htmlFor="confirmPassword">Confirm Password</FieldLabel>
                    <div className="relative">
                        <Input
                            id="confirmPassword"
                            {...register('confirmPassword', {
                                required: 'Please confirm your password',
                                validate: (value) => value === getValues('password') || 'Passwords do not match',
                            })}
                            type={showConfirmPassword ? 'text' : 'password'}
                            placeholder="Re-enter your password"
                            className="input-field w-full rounded-xl border-[#E7E1F2] bg-white py-3 pr-11 shadow-none"
                            autoComplete="new-password"
                        />
                        {passwordToggle(showConfirmPassword, setShowConfirmPassword, 'confirmPassword')}
                    </div>
                    {errors.confirmPassword && <p className="mt-1 text-[12.5px] font-medium text-red-500">{errors.confirmPassword.message}</p>}
                </div>

                {/* Terms */}
                <div>
                    <label className="flex cursor-pointer select-none items-start gap-2.5 text-[13px] leading-relaxed text-[#5C5975]">
                        <input
                            type="checkbox"
                            {...register('terms', { required: 'Please accept the terms to continue' })}
                            className="mt-0.5 h-4 w-4 shrink-0 rounded border-[#D6D0E4] accent-[#7C3AED]"
                        />
                        <span>
                            By creating an account, you agree to our{' '}
                            <Link to="/terms" className="font-semibold text-[#7C3AED] hover:underline">Terms of Service</Link> and{' '}
                            <Link to="/privacy-policy" className="font-semibold text-[#7C3AED] hover:underline">Privacy Policy</Link>.
                        </span>
                    </label>
                    {errors.terms && <p className="mt-1 text-[12.5px] font-medium text-red-500">{errors.terms.message}</p>}
                </div>

                {/* Submit */}
                <Button type="submit" disabled={isLoading} className="btn-primary h-[52px] w-full text-[15px]">
                    {isLoading ? (
                        <><Loader2 className="animate-spin" /> Creating account…</>
                    ) : (
                        <>Get Started Free <ArrowRight className="h-4 w-4" /></>
                    )}
                </Button>
            </form>
        </AuthLayout>
    );
};

export default SignupPage;
