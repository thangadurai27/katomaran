import { useState } from 'react';
import { Mail, ArrowRight, Loader2, CheckCircle } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import AuthLayout from '@/components/auth/AuthLayout';

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email) return;
        setIsLoading(true);
        try {
            await api.post('/auth/forgot-password', { email });
            setSent(true);
            toast.success('Reset link sent!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to send reset email');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout variant="forgot">
            {sent ? (
                <div className="flex flex-col items-center py-6 text-center">
                    <span className="grid h-16 w-16 place-items-center rounded-full bg-emerald-50">
                        <CheckCircle className="h-9 w-9 text-emerald-500" />
                    </span>
                    <h3 className="mt-5 font-display text-[20px] font-bold text-[#17153A]">Check your inbox</h3>
                    <p className="mt-2 text-[14px] leading-relaxed text-[#6B6880]">
                        We sent a password reset link to{' '}
                        <span className="font-semibold text-[#17153A]">{email}</span>
                    </p>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label htmlFor="forgot-email" className="mb-1.5 flex items-center gap-1.5 text-[13px] font-semibold text-[#3F3C56]">
                            <Mail className="h-3.5 w-3.5 text-[#8B5CF6]" /> Email address
                        </label>
                        <input
                            id="forgot-email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            className="input-field w-full rounded-xl border-[#E7E1F2] bg-white py-3 shadow-none"
                            required
                        />
                    </div>
                    <button type="submit" disabled={isLoading || !email} className="btn-primary h-[52px] w-full text-[15px]">
                        {isLoading ? (
                            <><Loader2 className="animate-spin" /> Sending…</>
                        ) : (
                            <>Send Reset Link <ArrowRight className="h-4 w-4" /></>
                        )}
                    </button>
                </form>
            )}
        </AuthLayout>
    );
};

export default ForgotPasswordPage;
