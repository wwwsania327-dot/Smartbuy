"use client";

import { useState, useEffect, useRef } from 'react';
import { ArrowRight, Mail, KeyRound, AlertCircle, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<1 | 2>(1);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  
  const otpInputRef = useRef<HTMLInputElement>(null);
  const { login } = useAuth();
  const router = useRouter();

  // Handle countdown timer for Resend OTP
  useEffect(() => {
    if (timeLeft > 0) {
      const timerId = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timerId);
    }
  }, [timeLeft]);

  // Auto-focus OTP input when step changes to 2
  useEffect(() => {
    if (step === 2 && otpInputRef.current) {
      otpInputRef.current.focus();
    }
  }, [step]);

  // Using relative paths to leverage Next.js rewrites

  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError('');
    setMessage('');
    
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch(`/api/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Failed to send OTP');

      setMessage('OTP has been successfully sent to your email.');
      setStep(2);
      setTimeLeft(60); // 60 seconds cooldown for resend
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsLoading(true);

    try {
      const res = await fetch(`/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Invalid OTP');

      // Login success
      setMessage('Login successful! Redirecting...');
      
      const userData = {
        _id: data._id,
        name: data.name,
        email: data.email,
        role: data.role as 'user' | 'admin',
        token: data.token,
      };
      
      login(userData);

      if (data.role === 'admin') {
        router.replace('/admin');
      } else {
        router.replace('/');
      }
      
    } catch (err: any) {
      setError(err.message || 'Verification failed. Please check the OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[75vh] px-4 py-12 sm:px-6 lg:px-8 bg-gray-50 dark:bg-[#0a0a0a]">
      <div className="w-full max-w-md space-y-8 bg-white dark:bg-[#121212] p-8 sm:p-10 rounded-3xl border border-gray-100 dark:border-[#222] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] relative overflow-hidden transition-all duration-300">
        
        {/* Decorative Graphic */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 rounded-bl-full -z-10 dark:bg-green-900/10 transition-colors"></div>

        <div>
           <Link href="/" className="flex justify-center mb-6">
              <div className="w-14 h-14 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-white font-bold text-2xl shadow-lg hover:scale-105 transition-transform duration-300">
                S
              </div>
          </Link>
          <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Welcome Back
          </h2>
          <p className="mt-2 text-center text-sm text-gray-500 dark:text-gray-400">
            Login to continue
          </p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 text-red-600 dark:text-red-400 p-4 rounded-2xl text-sm flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {message && !error && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/30 text-green-700 dark:text-green-400 p-4 rounded-2xl text-sm flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <p>{message}</p>
          </div>
        )}

        {step === 1 ? (
          <form className="mt-8 space-y-6 animate-in slide-in-from-left-4 fade-in duration-300" onSubmit={handleSendOtp}>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 block">Email address</label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="appearance-none rounded-2xl relative block w-full px-4 py-4 border border-gray-200 dark:border-[#333] placeholder-gray-400 text-gray-900 dark:text-white bg-gray-50 dark:bg-[#1a1a1a] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent sm:text-base pl-12 transition-all duration-200"
                    placeholder="Enter your email"
                  />
                  <Mail className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !email}
              className={`group relative w-full flex justify-center py-4 px-4 rounded-2xl text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] font-bold shadow-md transition-all duration-300 ${isLoading || !email ? 'opacity-70 cursor-not-allowed' : 'hover:-translate-y-0.5'}`}
            >
              {isLoading ? 'Sending OTP...' : 'Send OTP'}
              {!isLoading && <ArrowRight className="absolute right-5 top-4 w-5 h-5 group-hover:translate-x-1 transition-transform" />}
            </button>
          </form>
        ) : (
          <form className="mt-8 space-y-6 animate-in slide-in-from-right-4 fade-in duration-300" onSubmit={handleVerifyOtp}>
             <div className="space-y-4 text-center">
              <div>
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 block">
                  Enter 6-digit OTP sent to <span className="text-[var(--color-primary)]">{email}</span>
                </label>
                <div className="relative max-w-[240px] mx-auto">
                  <input
                    ref={otpInputRef}
                    type="text"
                    required
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    className="appearance-none rounded-2xl tracking-[0.5em] font-mono font-bold text-center relative block w-full px-4 py-4 border border-gray-200 dark:border-[#333] placeholder-gray-300 dark:placeholder-gray-600 text-gray-900 dark:text-white bg-gray-50 dark:bg-[#1a1a1a] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent text-xl transition-all duration-200"
                    placeholder="••••••"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || otp.length !== 6}
              className={`group relative w-full flex justify-center py-4 px-4 rounded-2xl text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] font-bold shadow-md transition-all duration-300 ${isLoading || otp.length !== 6 ? 'opacity-70 cursor-not-allowed' : 'hover:-translate-y-0.5'}`}
            >
              {isLoading ? 'Verifying...' : 'Verify & Login'}
            </button>

            <div className="flex flex-col items-center justify-center space-y-3 pt-2">
              <button
                type="button"
                onClick={() => handleSendOtp()}
                disabled={timeLeft > 0 || isLoading}
                className={`text-sm font-semibold transition-colors ${timeLeft > 0 ? 'text-gray-400 cursor-not-allowed' : 'text-[var(--color-primary)] hover:underline'}`}
              >
                {timeLeft > 0 ? `Resend OTP in ${timeLeft}s` : 'Resend OTP'}
              </button>
              
              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setOtp('');
                  setError('');
                  setMessage('');
                }}
                className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 font-medium underline-offset-4 hover:underline"
              >
                Change Email
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
