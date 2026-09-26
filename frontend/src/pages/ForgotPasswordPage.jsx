import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Mail, Lock, KeyRound, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { authService } from '../services/authService';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [step, setStep] = useState(1); // 1 = Request, 2 = Reset
  const [resetCode, setResetCode] = useState('123456');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleRequestCode = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const res = await authService.forgotPassword(email);
      setMessage(res.message);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to send recovery code.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters with uppercase, lowercase, and number.');
      return;
    }
    setError('');
    setIsLoading(true);
    try {
      const res = await authService.resetPassword({
        email,
        reset_code: resetCode,
        new_password: newPassword
      });
      setIsSuccess(true);
      setMessage(res.message);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to reset password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        
        {/* Header */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-3 group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-400 p-0.5 shadow-xl">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-indigo-400" />
              </div>
            </div>
            <div className="text-left">
              <span className="font-extrabold text-xl text-white block">Credit Assistant</span>
              <span className="text-[10px] text-slate-400 font-medium">Security Recovery</span>
            </div>
          </Link>
          <h2 className="mt-6 text-2xl font-extrabold text-white">
            Reset Account Password
          </h2>
          <p className="mt-2 text-xs text-slate-400">
            Remembered your credentials?{' '}
            <Link to="/login" className="font-semibold text-indigo-400 hover:text-indigo-300 hover:underline">
              Back to sign in
            </Link>
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl">
            
            {message && (
              <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{message}</span>
              </div>
            )}

            {error && (
              <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {isSuccess ? (
              <div className="text-center py-4 space-y-4">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <p className="text-xs text-slate-300">Your password has been successfully updated. You can now log in with your new credentials.</p>
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center w-full py-3 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-xl"
                >
                  Sign In Now
                </Link>
              </div>
            ) : step === 1 ? (
              <form onSubmit={handleRequestCode} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Account Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-xl flex items-center justify-center gap-2"
                >
                  {isLoading ? 'Sending...' : 'Send Recovery Code'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Verification / Reset Code (Demo: 123456)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <KeyRound className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      value={resetCode}
                      onChange={(e) => setResetCode(e.target.value)}
                      placeholder="123456"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    New Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-xl flex items-center justify-center gap-2"
                >
                  {isLoading ? 'Updating...' : 'Set New Password'}
                </button>
              </form>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}
