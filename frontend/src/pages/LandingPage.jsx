import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  TrendingUp,
  Bot,
  PieChart as PieIcon,
  Compass,
  Lock,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Zap,
  Award,
  Layers,
  BarChart3,
  BadgeIndianRupee
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import CreditScoreGauge from '../components/CreditScoreGauge';
import Footer from '../components/Footer';

export default function LandingPage() {
  const { isAuthenticated, demoLogin } = useAuth();
  const navigate = useNavigate();

  const handleDemoClick = async () => {
    try {
      await demoLogin();
      navigate('/dashboard');
    } catch (err) {
      console.error('Demo error:', err);
    }
  };

  const steps = [
    {
      number: '01',
      title: 'Enter Financial Metrics',
      desc: 'Quickly input income, living expenses, existing credit card limits, and active loan EMIs.'
    },
    {
      number: '02',
      title: 'Analyze Credit Health',
      desc: 'Automatically calculate real Debt-to-Income (DTI), credit utilization ratios, and score benchmarks.'
    },
    {
      number: '03',
      title: 'Get AI Guidance',
      desc: 'Receive a personalized 5-step action plan powered by Google Gemini AI tailored to Indian credit norms.'
    },
    {
      number: '04',
      title: 'Track Your Progress',
      desc: 'Monitor real historical momentum, log score improvements, and follow your 5-stage credit roadmap.'
    }
  ];

  const features = [
    {
      icon: TrendingUp,
      title: 'Credit Score Tracking',
      desc: 'Visualize your score gauge, track monthly history with interactive filters, and calculate improvement deltas.',
      color: 'from-indigo-500 to-cyan-400'
    },
    {
      icon: Bot,
      title: 'AI Financial Advisor',
      desc: 'Gemini-powered personalized diagnosis identifying financial bottlenecks with conservative 5-step action plans.',
      color: 'from-purple-500 to-indigo-500'
    },
    {
      icon: PieIcon,
      title: 'Credit Utilization Monitoring',
      desc: 'Interactive donut breakdown comparing revolving credit dues against total card limits in Indian Rupees (₹).',
      color: 'from-emerald-500 to-teal-400'
    },
    {
      icon: Layers,
      title: 'Debt & Loan Portfolio',
      desc: 'Track home loans, car loans, personal loans, and credit cards with monthly EMI burden analysis.',
      color: 'from-amber-500 to-orange-400'
    },
    {
      icon: Compass,
      title: '5-Stage Credit Roadmap',
      desc: 'Step-by-step milestone checklist from Understand to Maintain, with real-time completion tracking.',
      color: 'from-blue-500 to-indigo-500'
    },
    {
      icon: Lock,
      title: 'Bank-Grade Privacy & Security',
      desc: 'Protected with JWT authentication, secure password hashing, and zero hardcoded secrets.',
      color: 'from-rose-500 to-pink-500'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28 border-b border-slate-900">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 sm:w-[600px] h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold tracking-wide">
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI-Powered Financial Intelligence for India 🇮🇳</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.15]">
                Take Control of Your{' '}
                <span className="bg-gradient-to-r from-indigo-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
                  Credit Health
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
                Understand your credit profile, calculate Debt-to-Income (DTI), monitor credit card utilization, and receive personalized AI-generated 5-step financial guidance.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
                {isAuthenticated ? (
                  <Link
                    to="/dashboard"
                    className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 hover:scale-[1.02] transition-all"
                  >
                    Open Dashboard
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/register"
                      className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 hover:scale-[1.02] transition-all"
                    >
                      Get Started Free
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={handleDemoClick}
                      className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-bold text-slate-200 bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 shadow-lg flex items-center justify-center gap-2 transition-all"
                    >
                      <Sparkles className="w-4 h-4 text-emerald-400" />
                      Try Demo Account
                    </button>
                  </>
                )}
              </div>

              {/* Trust Badges */}
              <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs text-slate-400">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>CIBIL & Experian scoring models</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                  <span>RBI DTI guidelines</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                  <span>Google GenAI Powered</span>
                </div>
              </div>

            </div>

            {/* Right Live Preview Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md">
                <CreditScoreGauge
                  score={742}
                  previousScore={718}
                  lastUpdated={new Date()}
                />

                {/* Floating Metric Card 1 */}
                <div className="absolute -bottom-6 -left-6 hidden sm:flex items-center gap-3 p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-xl animate-float">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-medium">Credit Utilization</p>
                    <p className="text-sm font-bold text-white">28% (Optimal)</p>
                  </div>
                </div>

                {/* Floating Metric Card 2 */}
                <div className="absolute -top-6 -right-6 hidden sm:flex items-center gap-3 p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-xl">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-medium">AI Action Plan</p>
                    <p className="text-sm font-bold text-white">5 Steps Ready</p>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-slate-950/60 border-b border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">Step-by-Step Flow</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">How Credit Assistant Works</h2>
            <p className="text-sm text-slate-400">Four straightforward steps to demystify and transform your credit health.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((s) => (
              <div key={s.number} className="glass-card glass-card-interactive rounded-3xl p-6 relative">
                <span className="text-3xl font-extrabold text-slate-700 block mb-3 font-mono">{s.number}</span>
                <h3 className="text-base font-bold text-white mb-2">{s.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-slate-950 border-b border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">Key Features</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">Everything You Need to Master Your Credit</h2>
            <p className="text-sm text-slate-400">Designed specifically for Indian salaried professionals, self-employed individuals, and borrowers.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, idx) => {
              const Icon = f.icon;
              return (
                <div key={idx} className="glass-card glass-card-interactive rounded-3xl p-6 sm:p-7 space-y-4">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${f.color} p-0.5 shadow-lg`}>
                    <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white mb-1">{f.title}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Security & Reliability Section */}
      <section className="py-20 bg-slate-950/40 border-b border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-950 border border-slate-800 p-8 sm:p-12 relative overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-8 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-bold border border-indigo-500/20">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Privacy & Security First</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Your Financial Data is Fully Protected</h2>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
                  We use secure JWT tokens, industry-standard password hashing, and encrypted session management. 
                  Users can only access their own private financial records, and sensitive AI API keys are strictly secured on backend servers.
                </p>
              </div>
              <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3">
                <Link
                  to="/register"
                  className="w-full text-center px-6 py-3.5 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-xl shadow-indigo-600/30 transition-all"
                >
                  Create Your Account
                </Link>
                <button
                  onClick={handleDemoClick}
                  className="w-full text-center px-6 py-3.5 rounded-xl font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-all"
                >
                  Explore Demo First
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
