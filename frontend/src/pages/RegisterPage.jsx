import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, User, Mail, Lock, Eye, EyeOff, CheckCircle2, XCircle, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Real-time password criteria
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const passwordsMatch = password && confirmPassword && password === confirmPassword;

  const isFormValid =
    name.trim().length >= 2 &&
    email.includes('@') &&
    hasMinLength &&
    hasUppercase &&
    hasLowercase &&
    hasNumber &&
    passwordsMatch;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) {
      setError('Please satisfy all password security requirements before submitting.');
      return;
    }
    setError('');
    setIsLoading(true);

    try {
      await register({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        confirm_password: confirmPassword
      });
      navigate('/onboarding');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Registration failed. Please check your details.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        
        {/* Header */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-3 group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-0.5 shadow-xl shadow-indigo-600/30 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-indigo-400" />
              </div>
            </div>
            <div className="text-left">
              <span className="font-extrabold text-xl tracking-tight text-white block">Credit Assistant</span>
              <span className="text-[10px] text-slate-400 font-medium">Fintech Health Platform 🇮🇳</span>
            </div>
          </Link>
          <h2 className="mt-6 text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Create your account
          </h2>
          <p className="mt-2 text-xs text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-indigo-400 hover:text-indigo-300 hover:underline">
              Sign in
            </Link>
          </p>
        </div>

        {/* Card */}
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl">
            
            {error && (
              <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Email Address
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
                    placeholder="rahul@example.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                  />
                </div>
              </div>

              {/* Live Password Rules Checklist */}
              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-1.5 text-[11px]">
                <p className="font-semibold text-slate-400 mb-1">Password Requirements:</p>
                
                <div className="grid grid-cols-2 gap-1.5">
                  <div className={`flex items-center gap-1.5 ${hasMinLength ? 'text-emerald-400' : 'text-slate-400'}`}>
                    {hasMinLength ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                    <span>8+ characters</span>
                  </div>
                  
                  <div className={`flex items-center gap-1.5 ${hasUppercase ? 'text-emerald-400' : 'text-slate-400'}`}>
                    {hasUppercase ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                    <span>1 uppercase letter</span>
                  </div>

                  <div className={`flex items-center gap-1.5 ${hasLowercase ? 'text-emerald-400' : 'text-slate-400'}`}>
                    {hasLowercase ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                    <span>1 lowercase letter</span>
                  </div>

                  <div className={`flex items-center gap-1.5 ${hasNumber ? 'text-emerald-400' : 'text-slate-400'}`}>
                    {hasNumber ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                    <span>1 number</span>
                  </div>
                </div>

                {password && confirmPassword && (
                  <div className={`flex items-center gap-1.5 pt-1 border-t border-slate-800/60 ${passwordsMatch ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {passwordsMatch ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                    <span>{passwordsMatch ? 'Passwords match' : 'Passwords do not match'}</span>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading || !isFormValid}
                className="w-full mt-2 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 hover:scale-[1.01] transition-all disabled:opacity-50"
              >
                {isLoading ? (
                  <span>Creating Account...</span>
                ) : (
                  <>
                    <span>Continue to Onboarding</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

          </div>
        </div>

      </div>
    </div>
  );
}
