import React, { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Building2,
  Briefcase,
  Calendar,
  Save,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  BadgeIndianRupee
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authService, profileService } from '../services';
import { formatINR, formatDate } from '../utils/formatters';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [age, setAge] = useState(user?.age || 28);
  const [city, setCity] = useState(user?.city || 'Bengaluru');
  const [employmentStatus, setEmploymentStatus] = useState(user?.employment_status || 'Salaried');

  const [profile, setProfile] = useState(null);
  const [monthlyIncome, setMonthlyIncome] = useState(75000);
  const [otherIncome, setOtherIncome] = useState(5000);
  const [totalCreditLimit, setTotalCreditLimit] = useState(200000);
  const [creditUsed, setCreditUsed] = useState(50000);

  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    async function loadProfile() {
      try {
        const prof = await profileService.getFinancialProfile();
        setProfile(prof);
        setMonthlyIncome(prof.monthly_income);
        setOtherIncome(prof.other_income);
        setTotalCreditLimit(prof.total_credit_limit);
        setCreditUsed(prof.credit_used);
      } catch (err) {
        console.error(err);
      }
    }
    loadProfile();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      // 1. Update personal details
      const updatedUser = await authService.updateProfile({
        name: name.trim(),
        age: Number(age),
        city: city.trim(),
        employment_status: employmentStatus
      });
      updateUser(updatedUser);

      // 2. Update financial parameters
      await profileService.updateFinancialProfile({
        monthly_income: Number(monthlyIncome),
        other_income: Number(otherIncome),
        total_credit_limit: Number(totalCreditLimit),
        credit_used: Number(creditUsed)
      });

      setSuccessMsg('Profile and financial parameters updated successfully!');
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.detail || 'Failed to update profile.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex items-center gap-3 pb-2 border-b border-slate-800/60">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-white font-extrabold text-xl shadow-lg">
          {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-white">{user?.name || 'My Profile'}</h1>
          <p className="text-xs text-slate-400">
            Account created: {formatDate(user?.created_at || new Date())}
          </p>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-8">
        
        {/* Personal Details Section */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-5">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <User className="w-5 h-5 text-indigo-400" />
            Personal Details
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Registered Email (Read-only)</label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 text-sm cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Age</label>
              <input
                type="number"
                min="18"
                max="100"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Employment Category</label>
              <input
                type="text"
                value={employmentStatus}
                onChange={(e) => setEmploymentStatus(e.target.value)}
                placeholder="e.g. Salaried (Senior Software Engineer)"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Primary Financial Parameters */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-5">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <BadgeIndianRupee className="w-5 h-5 text-indigo-400" />
            Core Income & Credit Limits
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Monthly Gross Salary / Primary Income (₹)
              </label>
              <input
                type="number"
                min="0"
                value={monthlyIncome}
                onChange={(e) => setMonthlyIncome(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Other Monthly Income (₹)
              </label>
              <input
                type="number"
                min="0"
                value={otherIncome}
                onChange={(e) => setOtherIncome(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Total Combined Credit Card Limit (₹)
              </label>
              <input
                type="number"
                min="0"
                value={totalCreditLimit}
                onChange={(e) => setTotalCreditLimit(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Current Credit Card Outstanding Balance (₹)
              </label>
              <input
                type="number"
                min="0"
                value={creditUsed}
                onChange={(e) => setCreditUsed(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-500 shadow-xl shadow-indigo-600/30 transition-all hover:scale-[1.01] disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {isLoading ? 'Saving Changes...' : 'Save Profile Changes'}
          </button>
        </div>

      </form>

    </div>
  );
}
