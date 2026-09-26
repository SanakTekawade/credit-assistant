import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  BadgeIndianRupee,
  Wallet,
  CreditCard,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Edit3,
  ShieldCheck,
  Building2,
  Briefcase
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { profileService } from '../services';
import { formatINR } from '../utils/formatters';
import confetti from 'canvas-confetti';

export default function OnboardingPage() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    // Step 1: Personal
    name: user?.name || '',
    age: 28,
    city: 'Bengaluru',
    employment_status: 'Salaried',

    // Step 2: Income
    monthly_income: 75000,
    other_income: 5000,

    // Step 3: Expenses
    rent: 18000,
    utilities: 3500,
    food: 8000,
    transport: 3000,
    other_expenses: 2500,

    // Step 4: Credit Information
    credit_score: 720,
    total_credit_limit: 150000,
    credit_used: 35000,
    active_credit_cards: 2,
    active_loans: 1,
    outstanding_debt: 250000,
    monthly_emi: 12000,
    missed_payments: 0,
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const totalMonthlyExpenses =
    Number(formData.rent || 0) +
    Number(formData.utilities || 0) +
    Number(formData.food || 0) +
    Number(formData.transport || 0) +
    Number(formData.other_expenses || 0);

  const totalMonthlyGrossIncome =
    Number(formData.monthly_income || 0) + Number(formData.other_income || 0);

  const estimatedDti = totalMonthlyGrossIncome > 0
    ? ((Number(formData.monthly_emi || 0) / totalMonthlyGrossIncome) * 100).toFixed(1)
    : 0;

  const estimatedUtil = Number(formData.total_credit_limit || 0) > 0
    ? ((Number(formData.credit_used || 0) / Number(formData.total_credit_limit)) * 100).toFixed(1)
    : 0;

  const handleSubmit = async () => {
    setIsLoading(true);
    setError('');

    try {
      await profileService.completeOnboarding({
        age: Number(formData.age),
        city: formData.city,
        employment_status: formData.employment_status,
        monthly_income: Number(formData.monthly_income),
        other_income: Number(formData.other_income),
        rent: Number(formData.rent),
        utilities: Number(formData.utilities),
        food: Number(formData.food),
        transport: Number(formData.transport),
        other_expenses: Number(formData.other_expenses),
        credit_score: Number(formData.credit_score),
        total_credit_limit: Number(formData.total_credit_limit),
        credit_used: Number(formData.credit_used),
        active_credit_cards: Number(formData.active_credit_cards),
        active_loans: Number(formData.active_loans),
        outstanding_debt: Number(formData.outstanding_debt),
        monthly_emi: Number(formData.monthly_emi),
        missed_payments: Number(formData.missed_payments)
      });

      // Trigger celebratory confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      updateUser({ is_onboarded: true, city: formData.city, employment_status: formData.employment_status });
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Failed to complete financial onboarding. Please review your entries.');
    } finally {
      setIsLoading(false);
    }
  };

  const stepsList = [
    { num: 1, title: 'Personal Info', icon: User },
    { num: 2, title: 'Monthly Income', icon: BadgeIndianRupee },
    { num: 3, title: 'Living Expenses', icon: Wallet },
    { num: 4, title: 'Credit & Debts', icon: CreditCard },
    { num: 5, title: 'Confirmation', icon: CheckCircle2 },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      
      {/* Background radial */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-3xl mx-auto relative z-10 space-y-8">
        
        {/* Wizard Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Financial Baseline Setup</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Set Up Your Financial Profile
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
            Provide accurate metrics so our AI advisor can deliver precise DTI calculations, credit utilization analysis, and customized roadmaps.
          </p>
        </div>

        {/* Wizard Step Progress Tracker */}
        <div className="grid grid-cols-5 gap-2 p-2 rounded-2xl bg-slate-900 border border-slate-800">
          {stepsList.map((s) => {
            const Icon = s.icon;
            const isDone = currentStep > s.num;
            const isCurrent = currentStep === s.num;
            return (
              <button
                key={s.num}
                type="button"
                onClick={() => isDone && setCurrentStep(s.num)}
                disabled={!isDone && !isCurrent}
                className={`flex flex-col items-center gap-1.5 py-2.5 px-1 rounded-xl transition-all ${
                  isCurrent
                    ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/30'
                    : isDone
                    ? 'text-emerald-400 hover:bg-slate-800/60 cursor-pointer'
                    : 'text-slate-500 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center gap-1">
                  <Icon className="w-3.5 h-3.5" />
                  <span className="text-[11px] font-bold hidden sm:inline">{s.title}</span>
                </div>
                <span className="text-[10px] font-mono opacity-80">Step {s.num}</span>
              </button>
            );
          })}
        </div>

        {/* Wizard Card Body */}
        <div className="glass-card rounded-3xl p-6 sm:p-10 shadow-2xl space-y-6">
          
          {error && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300">
              {error}
            </div>
          )}

          {/* STEP 1: PERSONAL INFORMATION */}
          {currentStep === 1 && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <User className="w-5 h-5 text-indigo-400" />
                  Step 1: Personal Information
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Demographics help tailor regional banking norms and tenure benchmarks.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Full Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Age</label>
                  <input
                    type="number"
                    min="18"
                    max="100"
                    value={formData.age}
                    onChange={(e) => handleChange('age', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => handleChange('city', e.target.value)}
                    placeholder="e.g. Mumbai, Bengaluru, Delhi NCR"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Employment Status</label>
                  <select
                    value={formData.employment_status}
                    onChange={(e) => handleChange('employment_status', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Salaried">Salaried (Private / MNC)</option>
                    <option value="Govt Salaried">Salaried (Public Sector / Govt)</option>
                    <option value="Self-Employed Professional">Self-Employed Professional (Doctor, CA, etc.)</option>
                    <option value="Business Owner">Business Owner / Merchant</option>
                    <option value="Freelancer / Consultant">Freelancer / Independent Consultant</option>
                    <option value="Student">Student</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: INCOME */}
          {currentStep === 2 && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <BadgeIndianRupee className="w-5 h-5 text-indigo-400" />
                  Step 2: Monthly Income
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Enter your steady monthly gross income (before deductions).</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Primary Monthly Income (INR ₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={formData.monthly_income}
                    onChange={(e) => handleChange('monthly_income', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm font-mono focus:outline-none focus:border-indigo-500"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">Formatted: {formatINR(formData.monthly_income)}</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Other Monthly Income (Rentals, Dividends, Freelance ₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={formData.other_income}
                    onChange={(e) => handleChange('other_income', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm font-mono focus:outline-none focus:border-indigo-500"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">Formatted: {formatINR(formData.other_income)}</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex justify-between items-center text-xs">
                <span className="text-slate-400">Total Combined Monthly Income:</span>
                <span className="text-base font-bold text-emerald-400 font-mono">
                  {formatINR(totalMonthlyGrossIncome)}
                </span>
              </div>
            </div>
          )}

          {/* STEP 3: LIVING EXPENSES */}
          {currentStep === 3 && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-indigo-400" />
                  Step 3: Monthly Living Expenses
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Itemize recurring household expenses to calculate discretionary cash flow.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Monthly Rent / Housing (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.rent}
                    onChange={(e) => handleChange('rent', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Utilities (Electricity, WiFi, Water ₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.utilities}
                    onChange={(e) => handleChange('utilities', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Groceries & Food (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.food}
                    onChange={(e) => handleChange('food', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Transportation & Fuel (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.transport}
                    onChange={(e) => handleChange('transport', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Other Lifestyle / Misc Expenses (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.other_expenses}
                    onChange={(e) => handleChange('other_expenses', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex justify-between items-center text-xs">
                <span className="text-slate-400">Total Monthly Living Expenses:</span>
                <span className="text-base font-bold text-amber-400 font-mono">
                  {formatINR(totalMonthlyExpenses)}
                </span>
              </div>
            </div>
          )}

          {/* STEP 4: CREDIT & DEBTS */}
          {currentStep === 4 && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-indigo-400" />
                  Step 4: Credit Information & Active Debts
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Enter details from your latest credit bureau report or banking statements.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Credit Score (300 - 900)
                  </label>
                  <input
                    type="number"
                    min="300"
                    max="900"
                    value={formData.credit_score}
                    onChange={(e) => handleChange('credit_score', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Total Credit Card Limit (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.total_credit_limit}
                    onChange={(e) => handleChange('total_credit_limit', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Current Credit Card Outstanding (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.credit_used}
                    onChange={(e) => handleChange('credit_used', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Active Credit Cards Count
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.active_credit_cards}
                    onChange={(e) => handleChange('active_credit_cards', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Total Outstanding Loans (Principal ₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.outstanding_debt}
                    onChange={(e) => handleChange('outstanding_debt', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Total Monthly EMI Outflow (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.monthly_emi}
                    onChange={(e) => handleChange('monthly_emi', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Active Loans Count (Home, Car, Personal)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.active_loans}
                    onChange={(e) => handleChange('active_loans', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Missed Payments (Last 12 Months)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.missed_payments}
                    onChange={(e) => handleChange('missed_payments', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Real-time Indicator Preview */}
              <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-900 border border-slate-800 text-xs">
                <div>
                  <span className="text-slate-400">Estimated DTI:</span>
                  <p className="text-sm font-bold text-indigo-400 font-mono">{estimatedDti}%</p>
                </div>
                <div>
                  <span className="text-slate-400">Credit Card Utilization:</span>
                  <p className="text-sm font-bold text-cyan-400 font-mono">{estimatedUtil}%</p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: CONFIRMATION & SUMMARY REVIEW */}
          {currentStep === 5 && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  Step 5: Review & Confirm Profile
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Verify your entered information. You can edit any section before finalizing.
                </p>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Personal Section */}
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2 text-xs">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="font-bold text-slate-200">Personal Info</span>
                    <button onClick={() => setCurrentStep(1)} className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                      <Edit3 className="w-3 h-3" /> Edit
                    </button>
                  </div>
                  <p className="text-slate-400">Name: <span className="text-slate-200 font-medium">{formData.name}</span></p>
                  <p className="text-slate-400">Age / City: <span className="text-slate-200 font-medium">{formData.age} yrs • {formData.city}</span></p>
                  <p className="text-slate-400">Employment: <span className="text-slate-200 font-medium">{formData.employment_status}</span></p>
                </div>

                {/* Income Section */}
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2 text-xs">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="font-bold text-slate-200">Income Overview</span>
                    <button onClick={() => setCurrentStep(2)} className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                      <Edit3 className="w-3 h-3" /> Edit
                    </button>
                  </div>
                  <p className="text-slate-400">Primary Monthly: <span className="text-slate-200 font-mono">{formatINR(formData.monthly_income)}</span></p>
                  <p className="text-slate-400">Other Income: <span className="text-slate-200 font-mono">{formatINR(formData.other_income)}</span></p>
                  <p className="text-slate-400 font-semibold">Total Gross: <span className="text-emerald-400 font-mono">{formatINR(totalMonthlyGrossIncome)}</span></p>
                </div>

                {/* Expenses Section */}
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2 text-xs">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="font-bold text-slate-200">Living Expenses</span>
                    <button onClick={() => setCurrentStep(3)} className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                      <Edit3 className="w-3 h-3" /> Edit
                    </button>
                  </div>
                  <p className="text-slate-400">Rent / Utilities: <span className="text-slate-200 font-mono">{formatINR(Number(formData.rent) + Number(formData.utilities))}</span></p>
                  <p className="text-slate-400">Food & Transit: <span className="text-slate-200 font-mono">{formatINR(Number(formData.food) + Number(formData.transport))}</span></p>
                  <p className="text-slate-400 font-semibold">Total Monthly: <span className="text-amber-400 font-mono">{formatINR(totalMonthlyExpenses)}</span></p>
                </div>

                {/* Credit Section */}
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2 text-xs">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="font-bold text-slate-200">Credit & Debt Metrics</span>
                    <button onClick={() => setCurrentStep(4)} className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                      <Edit3 className="w-3 h-3" /> Edit
                    </button>
                  </div>
                  <p className="text-slate-400">Credit Score: <span className="text-white font-bold">{formData.credit_score}</span></p>
                  <p className="text-slate-400">Total Limit: <span className="text-slate-200 font-mono">{formatINR(formData.total_credit_limit)}</span> (Used: {formatINR(formData.credit_used)})</p>
                  <p className="text-slate-400">Monthly EMI Burden: <span className="text-rose-400 font-mono font-semibold">{formatINR(formData.monthly_emi)}</span></p>
                  <p className="text-slate-400">Missed Payments (12m): <span className="text-slate-200 font-medium">{formData.missed_payments}</span></p>
                </div>

              </div>

              {/* Calculated Indicators Badge */}
              <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-400" />
                  <div>
                    <p className="font-bold text-white">Baseline Calculations Ready</p>
                    <p className="text-slate-400">Projected DTI: {estimatedDti}% • Projected Card Utilization: {estimatedUtil}%</p>
                  </div>
                </div>
                <div className="text-[11px] text-slate-400 text-center sm:text-right">
                  Ready to activate dashboard & AI advisor
                </div>
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={() => setCurrentStep(prev => prev - 1)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Previous Step
              </button>
            ) : <div />}

            {currentStep < 5 ? (
              <button
                type="button"
                onClick={() => setCurrentStep(prev => prev + 1)}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.01]"
              >
                Next Step
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isLoading}
                className="flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 shadow-xl shadow-emerald-600/30 transition-all hover:scale-[1.01] disabled:opacity-50"
              >
                {isLoading ? (
                  <span>Activating Profile...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Complete & Launch Dashboard</span>
                  </>
                )}
              </button>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
