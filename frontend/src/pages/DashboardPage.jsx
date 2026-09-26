import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  ShieldCheck,
  CreditCard,
  Bot,
  Compass,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Plus,
  RefreshCw,
  Wallet,
  Calendar,
  Layers,
  CheckCircle2,
  Sliders,
  X
} from 'lucide-react';
import { profileService, creditService, debtService, aiService } from '../services';
import { useAuth } from '../context/AuthContext';
import { formatINR, getScoreDetails, getDtiDetails, getUtilizationDetails } from '../utils/formatters';
import CreditScoreGauge from '../components/CreditScoreGauge';
import CreditUtilizationDonut from '../charts/CreditUtilizationDonut';
import CreditScoreLineChart from '../charts/CreditScoreLineChart';
import DtiGaugeChart from '../charts/DtiGaugeChart';
import ScoreSimulatorModal from '../components/ScoreSimulatorModal';

export default function DashboardPage() {
  const { user } = useAuth();

  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals
  const [showSimulator, setShowSimulator] = useState(false);
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [newScoreInput, setNewScoreInput] = useState(750);
  const [scoreNote, setScoreNote] = useState('Monthly CIBIL update');
  const [isUpdatingScore, setIsUpdatingScore] = useState(false);

  const fetchDashboard = async () => {
    try {
      setIsLoading(true);
      setError('');
      const data = await profileService.getDashboardData();
      setDashboardData(data);
      if (data?.credit_summary?.current_score) {
        setNewScoreInput(data.credit_summary.current_score);
      }
    } catch (err) {
      console.error('Error fetching dashboard:', err);
      setError('Failed to load dashboard metrics. Please refresh.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleUpdateScore = async (e) => {
    e.preventDefault();
    try {
      setIsUpdatingScore(true);
      await creditService.updateScore(Number(newScoreInput), scoreNote);
      setShowScoreModal(false);
      await fetchDashboard();
    } catch (err) {
      console.error('Failed to update score:', err);
    } finally {
      setIsUpdatingScore(false);
    }
  };

  const handleApplySimulatedScore = async (simScore) => {
    try {
      await creditService.updateScore(simScore, 'Simulated What-If Milestone');
      await fetchDashboard();
    } catch (err) {
      console.error('Failed to log simulated score:', err);
    }
  };

  if (isLoading && !dashboardData) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin" />
        <p className="text-xs font-semibold text-slate-400">Loading your financial dashboard...</p>
      </div>
    );
  }

  const profile = dashboardData?.profile;
  const creditSummary = dashboardData?.credit_summary;
  const debtSummary = dashboardData?.debt_summary;
  const aiAnalysis = dashboardData?.latest_ai_analysis;
  const roadmapProgress = dashboardData?.roadmap_progress || 0;

  const scoreDetails = getScoreDetails(creditSummary?.current_score || 700);
  const dtiDetails = getDtiDetails(profile?.dti || 0);
  const utilDetails = getUtilizationDetails(profile?.credit_utilization || 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      
      {/* Top Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-800/60">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Welcome back, {user?.name || 'Friend'} 👋
            </h1>
            {user?.city && (
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-400 hidden sm:inline-block">
                📍 {user.city}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {user?.employment_status || 'Salaried'} • Real-time Indian Credit Health Tracking & AI Guidance
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setShowSimulator(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 transition-colors"
          >
            <Sliders className="w-3.5 h-3.5 text-indigo-400" />
            <span>Score Simulator</span>
          </button>
          
          <button
            onClick={() => setShowScoreModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Log Score</span>
          </button>

          <Link
            to="/ai-advisor"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 shadow-md shadow-indigo-600/20 transition-all hover:scale-[1.02]"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Advisor</span>
          </Link>
        </div>
      </div>

      {/* Credit Health Summary Metrics Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        
        {/* Metric 1: Score */}
        <div className="glass-card glass-card-interactive rounded-2xl p-4 space-y-1">
          <span className="text-[11px] text-slate-400 font-medium">Credit Score</span>
          <p className="text-xl sm:text-2xl font-extrabold text-white font-mono">
            {creditSummary?.current_score || 700}
          </p>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border inline-block ${scoreDetails.badgeClass}`}>
            {scoreDetails.category}
          </span>
        </div>

        {/* Metric 2: Utilization */}
        <div className="glass-card glass-card-interactive rounded-2xl p-4 space-y-1">
          <span className="text-[11px] text-slate-400 font-medium">Card Utilization</span>
          <p className="text-xl sm:text-2xl font-extrabold text-white font-mono">
            {profile?.credit_utilization?.toFixed(1) || 0}%
          </p>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border inline-block ${utilDetails.badgeClass}`}>
            {utilDetails.category}
          </span>
        </div>

        {/* Metric 3: DTI */}
        <div className="glass-card glass-card-interactive rounded-2xl p-4 space-y-1">
          <span className="text-[11px] text-slate-400 font-medium">DTI Ratio</span>
          <p className="text-xl sm:text-2xl font-extrabold text-white font-mono">
            {profile?.dti?.toFixed(1) || 0}%
          </p>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border inline-block ${dtiDetails.badgeClass}`}>
            {dtiDetails.category}
          </span>
        </div>

        {/* Metric 4: Monthly EMI */}
        <div className="glass-card glass-card-interactive rounded-2xl p-4 space-y-1">
          <span className="text-[11px] text-slate-400 font-medium">Monthly EMI</span>
          <p className="text-lg sm:text-xl font-extrabold text-white font-mono truncate">
            {formatINR(profile?.monthly_emi || 0)}
          </p>
          <span className="text-[10px] text-slate-400">Total EMI Outflow</span>
        </div>

        {/* Metric 5: Outstanding Debt */}
        <div className="glass-card glass-card-interactive rounded-2xl p-4 space-y-1">
          <span className="text-[11px] text-slate-400 font-medium">Outstanding Debt</span>
          <p className="text-lg sm:text-xl font-extrabold text-white font-mono truncate">
            {formatINR(profile?.outstanding_debt || 0)}
          </p>
          <span className="text-[10px] text-slate-400">{debtSummary?.debts_count || 0} active debts</span>
        </div>

        {/* Metric 6: Missed Payments */}
        <div className="glass-card glass-card-interactive rounded-2xl p-4 space-y-1">
          <span className="text-[11px] text-slate-400 font-medium">Missed Payments</span>
          <p className={`text-xl sm:text-2xl font-extrabold font-mono ${
            (profile?.missed_payments || 0) > 0 ? 'text-rose-400' : 'text-emerald-400'
          }`}>
            {profile?.missed_payments || 0}
          </p>
          <span className="text-[10px] text-slate-400">Past 12 Months</span>
        </div>

      </div>

      {/* Row 2: Main Score Gauge + Credit Utilization Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Main Credit Score Gauge */}
        <div className="lg:col-span-7">
          <CreditScoreGauge
            score={creditSummary?.current_score || 700}
            previousScore={creditSummary?.previous_score || 700}
            lastUpdated={creditSummary?.last_updated}
            onSimulateClick={() => setShowSimulator(true)}
          />
        </div>

        {/* Credit Utilization Donut */}
        <div className="lg:col-span-5">
          <CreditUtilizationDonut
            used={profile?.credit_used || 0}
            limit={profile?.total_credit_limit || 0}
            utilizationPct={profile?.credit_utilization}
          />
        </div>

      </div>

      {/* Row 3: Recharts Score Trajectory Chart + DTI Meter */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Recharts Credit Score Line Chart */}
        <div className="lg:col-span-7">
          <CreditScoreLineChart
            onUpdateScore={() => setShowScoreModal(true)}
          />
        </div>

        {/* DTI Gauge Chart */}
        <div className="lg:col-span-5">
          <DtiGaugeChart
            dti={profile?.dti || 0}
            monthlyEmi={profile?.monthly_emi || 0}
            grossIncome={(profile?.monthly_income || 0) + (profile?.other_income || 0)}
          />
        </div>

      </div>

      {/* Row 4: AI Advisor Insight Preview + Roadmap Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* AI Guidance Snippet */}
        <div className="lg:col-span-8 glass-card rounded-3xl p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">AI Financial Advisor Insights</h3>
                <p className="text-xs text-slate-400">Google Gemini tailored recommendations for Indian credit health</p>
              </div>
            </div>
            
            {aiAnalysis?.health_status && (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                Status: {aiAnalysis.health_status}
              </span>
            )}
          </div>

          {aiAnalysis ? (
            <div className="space-y-4 pt-2">
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
                "{aiAnalysis.summary}"
              </p>

              {aiAnalysis.action_plan && aiAnalysis.action_plan.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-slate-400">Top Recommended Immediate Action:</span>
                  <div className="p-3.5 rounded-2xl bg-indigo-950/20 border border-indigo-500/20 flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      1
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-bold text-white">{aiAnalysis.action_plan[0].title}</p>
                        <span className="text-[10px] font-semibold text-amber-400 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">
                          {aiAnalysis.action_plan[0].timeframe}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{aiAnalysis.action_plan[0].description}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-1">
                <Link
                  to="/ai-advisor"
                  className="text-xs font-bold text-indigo-400 hover:text-indigo-300 hover:underline flex items-center gap-1"
                >
                  View Full 5-Step Action Plan & History →
                </Link>
              </div>
            </div>
          ) : (
            <div className="p-6 text-center space-y-3 rounded-2xl bg-slate-900/60 border border-slate-800">
              <Sparkles className="w-8 h-8 text-indigo-400 mx-auto" />
              <p className="text-xs text-slate-300">No AI consultation generated yet for this session.</p>
              <Link
                to="/ai-advisor"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md"
              >
                Run Free AI Credit Health Diagnostic
              </Link>
            </div>
          )}
        </div>

        {/* Roadmap Progress Card */}
        <div className="lg:col-span-4 glass-card rounded-3xl p-6 sm:p-8 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Compass className="w-5 h-5 text-indigo-400" />
              <h3 className="text-base font-bold text-white">Credit Roadmap</h3>
            </div>
            <p className="text-xs text-slate-400">"Your Path to Better Credit" 5-stage milestone progression</p>
          </div>

          <div className="space-y-3 my-2">
            <div className="flex justify-between items-baseline text-xs">
              <span className="font-semibold text-slate-300">Overall Completion</span>
              <span className="text-lg font-extrabold text-emerald-400 font-mono">{roadmapProgress}%</span>
            </div>
            
            <div className="h-3 w-full rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 via-cyan-400 to-emerald-400 rounded-full transition-all duration-700"
                style={{ width: `${roadmapProgress}%` }}
              />
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800/80">
            <Link
              to="/roadmap"
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-xs text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-colors"
            >
              <span>Explore Milestones</span>
              <ArrowRight className="w-4 h-4 text-indigo-400" />
            </Link>
          </div>
        </div>

      </div>

      {/* Row 5: Active Debts Quick Preview */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Active Debts & Loan Accounts</h3>
              <p className="text-xs text-slate-400">Portfolio of current borrowings and recurring EMI commitments</p>
            </div>
          </div>

          <Link
            to="/debts"
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 hover:underline flex items-center gap-1"
          >
            Manage Debts →
          </Link>
        </div>

        {debtSummary?.debts && debtSummary.debts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
            {debtSummary.debts.slice(0, 4).map((d) => (
              <div key={d.id} className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between items-start">
                  <span className="font-bold text-white truncate max-w-[130px]">{d.name}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                    {d.type}
                  </span>
                </div>
                <div className="space-y-1">
                  <p className="text-slate-400">Outstanding: <span className="font-mono text-slate-200 font-bold">{formatINR(d.outstanding)}</span></p>
                  <p className="text-slate-400">Monthly EMI: <span className="font-mono text-amber-400 font-semibold">{formatINR(d.emi)}</span></p>
                  <p className="text-slate-500 text-[10px]">Due Day: {d.due_date} of month • Rate: {d.interest_rate}%</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center space-y-2 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400">
            <p>No individual debt accounts listed yet.</p>
            <Link to="/debts" className="inline-block text-indigo-400 font-semibold hover:underline">
              + Add loan or credit card account
            </Link>
          </div>
        )}
      </div>

      {/* Simulator Modal */}
      {showSimulator && (
        <ScoreSimulatorModal
          currentProfile={profile}
          onClose={() => setShowSimulator(false)}
          onApplyScore={handleApplySimulatedScore}
        />
      )}

      {/* Log Score Modal */}
      {showScoreModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-indigo-400" />
                Log Updated Credit Score
              </h3>
              <button onClick={() => setShowScoreModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateScore} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  New Credit Score (300 - 900)
                </label>
                <input
                  type="number"
                  min="300"
                  max="900"
                  required
                  value={newScoreInput}
                  onChange={(e) => setNewScoreInput(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-lg font-bold focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Note / Reason
                </label>
                <input
                  type="text"
                  value={scoreNote}
                  onChange={(e) => setScoreNote(e.target.value)}
                  placeholder="e.g. Monthly CIBIL Report update"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowScoreModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingScore}
                  className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg"
                >
                  {isUpdatingScore ? 'Saving...' : 'Save & Record Point'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
