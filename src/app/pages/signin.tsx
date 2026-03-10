import { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { Cat, Mail, Lock, Eye, EyeOff, AlertCircle, TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { NeumorphicButton, NeumorphicInput } from '../components/neumorphic-card';
import { supabase } from '../../lib/supabase';

export function SignIn() {
    const navigate = useNavigate();

    // Form state
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [mode, setMode] = useState<'signin' | 'signup'>('signin');

    // Sign In handler
    const handleSignIn = async () => {
        if (!email || !password) {
            setError('Please fill in all fields.');
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            if (signInError) throw signInError;
            navigate('/');
        } catch (err: any) {
            setError(err.message ?? 'Sign in failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // Sign Up handler
    const handleSignUp = async () => {
        if (!email || !password) {
            setError('Please fill in all fields.');
            return;
        }
        if (password.length < 6) {
            setError('Password must be at least 6 characters.');
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            const { error: signUpError } = await supabase.auth.signUp({
                email,
                password,
            });
            if (signUpError) throw signUpError;
            setError(null);
            // Show success - navigate or show confirmation
            navigate('/');
        } catch (err: any) {
            setError(err.message ?? 'Sign up failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = () => {
        if (mode === 'signin') {
            handleSignIn();
        } else {
            handleSignUp();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleSubmit();
    };

    return (
        <div className="min-h-screen bg-[#E0E5EC] flex items-center justify-center p-6">
            {/* Background decorative elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {/* Top-left blob */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1.2, ease: 'easeOut' }}
                    className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#6C63FF]/10 blur-3xl"
                />
                {/* Bottom-right blob */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
                    className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-[#4ECDC4]/10 blur-3xl"
                />
                {/* Center accent */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1.5, delay: 0.6 }}
                    className="absolute top-1/4 right-1/4 w-64 h-64 rounded-full bg-[#FFB6B9]/8 blur-3xl"
                />
            </div>

            <div className="w-full max-w-5xl flex gap-12 items-center relative z-10">

                {/* ─── LEFT PANEL — Branding & Stats ─── */}
                <motion.div
                    initial={{ opacity: 0, x: -40 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.7, ease: 'easeOut' }}
                    className="hidden lg:flex flex-col flex-1 gap-8"
                >
                    {/* Logo */}
                    <div className="flex items-center gap-4">
                        <motion.div
                            whileHover={{ rotate: [0, -10, 10, 0] }}
                            transition={{ duration: 0.5 }}
                            className="w-16 h-16 bg-[#E0E5EC] rounded-2xl shadow-[8px_8px_16px_rgba(163,177,198,0.6),-8px_-8px_16px_rgba(255,255,255,0.6)] flex items-center justify-center"
                        >
                            <Cat className="text-[#6C63FF]" size={36} />
                        </motion.div>
                        <div>
                            <h1 className="text-[#3D4852] text-4xl font-semibold" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                                WaCat
                            </h1>
                            <p className="text-[#8B92A0] text-sm" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                                Finance Manager
                            </p>
                        </div>
                    </div>

                    {/* Tagline */}
                    <div>
                        <h2
                            className="text-[#3D4852] text-3xl leading-snug mb-3"
                            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                        >
                            Take control of your <br />
                            <span className="text-[#6C63FF]">financial life</span> 🐱
                        </h2>
                        <p className="text-[#8B92A0] text-base leading-relaxed" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                            Track income, expenses, debts, and subscriptions — all in one beautiful place.
                        </p>
                    </div>

                    {/* Feature cards */}
                    <div className="space-y-4">
                        {[
                            {
                                icon: TrendingUp,
                                color: '#4ECDC4',
                                bg: 'bg-[#4ECDC4]/10',
                                title: 'Income & Expense Tracking',
                                desc: 'Categorize and monitor every transaction',
                            },
                            {
                                icon: Wallet,
                                color: '#6C63FF',
                                bg: 'bg-[#6C63FF]/10',
                                title: 'Multi-Account Management',
                                desc: 'Cash, Bank, E-wallet — all in sync',
                            },
                            {
                                icon: TrendingDown,
                                color: '#FF6B6B',
                                bg: 'bg-[#FF6B6B]/10',
                                title: 'Debts & Subscriptions',
                                desc: 'Never miss a payment again',
                            },
                        ].map((feature, index) => (
                            <motion.div
                                key={feature.title}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 + index * 0.12 }}
                                className="flex items-center gap-4 p-4 bg-[#E0E5EC] rounded-2xl shadow-[4px_4px_8px_rgba(163,177,198,0.4),-4px_-4px_8px_rgba(255,255,255,0.4)]"
                            >
                                <div
                                    className={`w-11 h-11 ${feature.bg} rounded-xl flex items-center justify-center flex-shrink-0`}
                                >
                                    <feature.icon size={20} style={{ color: feature.color }} />
                                </div>
                                <div>
                                    <p
                                        className="text-[#3D4852] font-medium text-sm"
                                        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                                    >
                                        {feature.title}
                                    </p>
                                    <p
                                        className="text-[#8B92A0] text-xs"
                                        style={{ fontFamily: "'DM Sans', sans-serif" }}
                                    >
                                        {feature.desc}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* ─── RIGHT PANEL — Sign In / Sign Up Form ─── */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, ease: 'easeOut', delay: 0.1 }}
                    className="w-full max-w-md"
                >
                    <div className="bg-[#E0E5EC] rounded-[32px] shadow-[8px_8px_16px_rgba(163,177,198,0.6),-8px_-8px_16px_rgba(255,255,255,0.6)] p-8">

                        {/* Mobile Logo (only shows on small screens) */}
                        <div className="flex lg:hidden items-center gap-3 mb-8">
                            <div className="w-10 h-10 bg-[#E0E5EC] rounded-xl shadow-[6px_6px_12px_rgba(163,177,198,0.6),-6px_-6px_12px_rgba(255,255,255,0.6)] flex items-center justify-center">
                                <Cat className="text-[#6C63FF]" size={22} />
                            </div>
                            <span
                                className="text-[#3D4852] text-2xl font-semibold"
                                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                            >
                                WaCat
                            </span>
                        </div>

                        {/* Header */}
                        <div className="mb-8">
                            <h2
                                className="text-[#3D4852] text-2xl mb-1"
                                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                            >
                                {mode === 'signin' ? 'Welcome back! 👋' : 'Create account ✨'}
                            </h2>
                            <p
                                className="text-[#8B92A0] text-sm"
                                style={{ fontFamily: "'DM Sans', sans-serif" }}
                            >
                                {mode === 'signin'
                                    ? 'Sign in to continue managing your finances'
                                    : 'Start tracking your finances for free'}
                            </p>
                        </div>

                        {/* Mode Toggle Tabs */}
                        <div className="flex gap-2 p-1.5 bg-[#E0E5EC] rounded-2xl shadow-[inset_4px_4px_8px_rgba(163,177,198,0.5),inset_-4px_-4px_8px_rgba(255,255,255,0.5)] mb-8">
                            {(['signin', 'signup'] as const).map((m) => (
                                <button
                                    key={m}
                                    onClick={() => {
                                        setMode(m);
                                        setError(null);
                                    }}
                                    className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${mode === m
                                            ? 'bg-[#6C63FF] text-white shadow-[4px_4px_8px_rgba(108,99,255,0.3)]'
                                            : 'text-[#8B92A0] hover:text-[#3D4852]'
                                        }`}
                                    style={{ fontFamily: "'DM Sans', sans-serif" }}
                                >
                                    {m === 'signin' ? 'Sign In' : 'Sign Up'}
                                </button>
                            ))}
                        </div>

                        {/* Error Message */}
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -8 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mb-6 p-4 bg-[#FF6B6B]/10 rounded-2xl border-2 border-[#FF6B6B]/30 flex items-start gap-3"
                            >
                                <AlertCircle size={18} className="text-[#FF6B6B] flex-shrink-0 mt-0.5" />
                                <p
                                    className="text-[#FF6B6B] text-sm"
                                    style={{ fontFamily: "'DM Sans', sans-serif" }}
                                >
                                    {error}
                                </p>
                            </motion.div>
                        )}

                        {/* Form Fields */}
                        <div className="space-y-5" onKeyDown={handleKeyDown}>
                            {/* Email */}
                            <div>
                                <label
                                    className="block text-[#3D4852] text-sm mb-2 font-medium"
                                    style={{ fontFamily: "'DM Sans', sans-serif" }}
                                >
                                    Email address
                                </label>
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                        <Mail size={18} className="text-[#8B92A0]" />
                                    </div>
                                    <NeumorphicInput
                                        type="email"
                                        placeholder="your@email.com"
                                        value={email}
                                        onChange={(e) => {
                                            setEmail(e.target.value);
                                            setError(null);
                                        }}
                                        className="pl-11"
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div>
                                <label
                                    className="block text-[#3D4852] text-sm mb-2 font-medium"
                                    style={{ fontFamily: "'DM Sans', sans-serif" }}
                                >
                                    Password
                                    {mode === 'signup' && (
                                        <span className="text-[#8B92A0] font-normal ml-2 text-xs">(min. 6 characters)</span>
                                    )}
                                </label>
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                        <Lock size={18} className="text-[#8B92A0]" />
                                    </div>
                                    <NeumorphicInput
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => {
                                            setPassword(e.target.value);
                                            setError(null);
                                        }}
                                        className="pl-11 pr-12"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((v) => !v)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8B92A0] hover:text-[#3D4852] transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Forgot Password (sign in only) */}
                        {mode === 'signin' && (
                            <div className="flex justify-end mt-3 mb-8">
                                <button
                                    className="text-[#6C63FF] text-sm hover:underline transition-all"
                                    style={{ fontFamily: "'DM Sans', sans-serif" }}
                                >
                                    Forgot password?
                                </button>
                            </div>
                        )}

                        {mode === 'signup' && <div className="mb-8" />}

                        {/* Submit Button */}
                        <NeumorphicButton
                            variant="primary"
                            size="lg"
                            className="w-full"
                            disabled={isLoading}
                            onClick={handleSubmit}
                        >
                            {isLoading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <motion.span
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                        className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                                    />
                                    {mode === 'signin' ? 'Signing in...' : 'Creating account...'}
                                </span>
                            ) : (
                                mode === 'signin' ? 'Sign In' : 'Create Account'
                            )}
                        </NeumorphicButton>

                        {/* Divider */}
                        <div className="flex items-center gap-4 my-6">
                            <div className="flex-1 h-px bg-[#CDD2D9]/50" />
                            <span className="text-[#8B92A0] text-xs" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                                or continue with
                            </span>
                            <div className="flex-1 h-px bg-[#CDD2D9]/50" />
                        </div>

                        {/* Google OAuth Button */}
                        <button
                            onClick={async () => {
                                await supabase.auth.signInWithOAuth({
                                    provider: 'google',
                                    options: { redirectTo: window.location.origin },
                                });
                            }}
                            className="w-full flex items-center justify-center gap-3 py-3 px-6 bg-[#E0E5EC] rounded-2xl shadow-[6px_6px_12px_rgba(163,177,198,0.6),-6px_-6px_12px_rgba(255,255,255,0.6)] hover:shadow-[4px_4px_8px_rgba(163,177,198,0.4),-4px_-4px_8px_rgba(255,255,255,0.4)] transition-all min-h-[44px]"
                        >
                            {/* Google icon */}
                            <svg width="18" height="18" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            <span
                                className="text-[#3D4852] text-sm font-medium"
                                style={{ fontFamily: "'DM Sans', sans-serif" }}
                            >
                                Continue with Google
                            </span>
                        </button>

                        {/* Footer note */}
                        <p
                            className="text-center text-[#8B92A0] text-xs mt-6"
                            style={{ fontFamily: "'DM Sans', sans-serif" }}
                        >
                            By continuing, you agree to our{' '}
                            <span className="text-[#6C63FF] cursor-pointer hover:underline">Terms</span>
                            {' '}and{' '}
                            <span className="text-[#6C63FF] cursor-pointer hover:underline">Privacy Policy</span>.
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
