import { useState, useCallback } from 'react';
import { Mail, Lock, User, Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
import { signInWithEmail, signUpWithEmail, resetPassword } from '@/services/auth-service';
import { useGameStore } from '@/store/game-store';

type AuthMode = 'login' | 'register' | 'recover';

export function AuthScreen() {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const { bootstrapGame } = useGameStore();

  const handleLogin = useCallback(async () => {
    if (!email || !password) {
      setError('Please enter email and password');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    const result = await signInWithEmail(email, password);

    if (result.success && result.user) {
      setSuccess('Login successful!');
      await bootstrapGame();
    } else {
      setError(result.error || 'Login failed');
    }

    setLoading(false);
  }, [email, password, bootstrapGame]);

  const handleRegister = useCallback(async () => {
    if (!email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    const result = await signUpWithEmail(email, password);

    if (result.success) {
      setSuccess(result.error || 'Account created! Please log in.');
      setMode('login');
      setPassword('');
      setConfirmPassword('');
    } else {
      setError(result.error || 'Registration failed');
    }

    setLoading(false);
  }, [email, password, confirmPassword]);

  const handleRecover = useCallback(async () => {
    if (!email) {
      setError('Please enter your email');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    const result = await resetPassword(email);

    if (result.success) {
      setSuccess('Password reset email sent! Check your inbox.');
    } else {
      setError(result.error || 'Failed to send reset email');
    }

    setLoading(false);
  }, [email]);

  const handleSubmit = () => {
    setError(null);
    setSuccess(null);
    
    if (mode === 'login') {
      handleLogin();
    } else if (mode === 'register') {
      handleRegister();
    } else if (mode === 'recover') {
      handleRecover();
    }
  };

  const getButtonText = () => {
    if (loading) return 'Processing...';
    if (mode === 'login') return 'Login';
    if (mode === 'register') return 'Create Account';
    if (mode === 'recover') return 'Send Reset Link';
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-gradient-to-b from-[#1a0a05] to-[#0d0502] ui-text">
      <div className="w-full max-w-[320px] p-6">
        {/* Logo & Title */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-[#c9a872] tracking-widest ui-heading">
            ⚔️ RPG-UI ⚔️
          </h1>
          <p className="mt-2 text-[12px] text-[#8a7a6a]">
            Ragnarok Style Battle RPG
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-[#3a1a1a] border border-[#6a2a2a] rounded text-[#e8a8a8] text-[12px] flex items-center gap-2">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="mb-4 p-3 bg-[#1a3a1a] border border-[#2a6a2a] rounded text-[#a8e8a8] text-[12px]">
            {success}
          </div>
        )}

        {/* Tabs */}
        <div className="mb-4 flex border-b border-[#3a2820]">
          <button
            onClick={() => { setMode('login'); setError(null); setSuccess(null); }}
            className={`flex-1 py-2 text-[12px] font-bold ${mode === 'login' ? 'text-[#c9a872] border-b-2 border-[#c9a872]' : 'text-[#6a5a4a]'}`}
          >
            Login
          </button>
          <button
            onClick={() => { setMode('register'); setError(null); setSuccess(null); }}
            className={`flex-1 py-2 text-[12px] font-bold ${mode === 'register' ? 'text-[#c9a872] border-b-2 border-[#c9a872]' : 'text-[#6a5a4a]'}`}
          >
            Register
          </button>
        </div>

        {/* Email Input */}
        <div className="mb-4">
          <label className="mb-1 block text-[11px] text-[#8a7a6a]">Email</label>
          <div className="relative">
            <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6a5a4a]" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full bg-[#1a120a] border border-[#3a2820] rounded py-2 pl-10 pr-3 text-[14px] text-[#c9a872] placeholder-[#4a3a2a] focus:border-[#6a5040] focus:outline-none"
              autoComplete="email"
            />
          </div>
        </div>

        {/* Password Input */}
        {(mode === 'login' || mode === 'register') && (
          <div className="mb-4">
            <label className="mb-1 block text-[11px] text-[#8a7a6a]">Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6a5a4a]" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#1a120a] border border-[#3a2820] rounded py-2 pl-10 pr-3 text-[14px] text-[#c9a872] placeholder-[#4a3a2a] focus:border-[#6a5040] focus:outline-none"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              />
            </div>
          </div>
        )}

        {/* Confirm Password Input (Register only) */}
        {mode === 'register' && (
          <div className="mb-4">
            <label className="mb-1 block text-[11px] text-[#8a7a6a]">Confirm Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6a5a4a]" />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#1a120a] border border-[#3a2820] rounded py-2 pl-10 pr-3 text-[14px] text-[#c9a872] placeholder-[#4a3a2a] focus:border-[#6a5040] focus:outline-none"
                autoComplete="new-password"
              />
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full py-3 bg-gradient-to-r from-[#4a6020] via-[#6a8530] to-[#4a6020] border border-[#8aa040] rounded text-white font-bold text-[14px] hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading && <Loader2 size={16} className="animate-spin" />}
          {getButtonText()}
        </button>

        {/* Back to Login (Recover) */}
        {mode === 'recover' && (
          <button
            onClick={() => { setMode('login'); setError(null); setSuccess(null); }}
            className="mt-4 w-full py-2 text-[11px] text-[#6a5a4a] hover:text-[#8a7a6a] flex items-center justify-center gap-1"
          >
            <ArrowLeft size={12} /> Back to Login
          </button>
        )}

        {/* Forgot Password Link (Login) */}
        {mode === 'login' && (
          <button
            onClick={() => { setMode('recover'); setError(null); setSuccess(null); }}
            className="mt-4 w-full py-2 text-[11px] text-[#6a5a4a] hover:text-[#8a7a6a] text-center"
          >
            Forgot your password?
          </button>
        )}

        {/* Recover Mode Info (Recover) */}
        {mode === 'recover' && (
          <p className="mt-4 text-[11px] text-[#6a5a4a] text-center">
            Enter your email and we will send you a link to reset your password.
          </p>
        )}
      </div>
    </div>
  );
}