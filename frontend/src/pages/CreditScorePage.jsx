import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  ShieldCheck,
  Calendar,
  Sliders,
  Plus,
  HelpCircle,
  CheckCircle2,
  AlertCircle,
  Zap,
  Info,
  Layers,
  Sparkles,
  X
} from 'lucide-react';
import { creditService, profileService } from '../services';
import { formatINR, getScoreDetails, formatDate } from '../utils/formatters';
import CreditScoreGauge from '../components/CreditScoreGauge';
import CreditScoreLineChart from '../charts/CreditScoreLineChart';
import ScoreSimulatorModal from '../components/ScoreSimulatorModal';

export default function CreditScorePage() {
  const [summary, setSummary] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [showSimulator, setShowSimulator] = useState(false);
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [newScoreInput, setNewScoreInput] = useState(740);
  const [scoreNote, setScoreNote] = useState('Quarterly review update');
  const [isUpdating, setIsUpdating] = useState(false);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [sumData, profData] = await Promise.all([
        creditService.getSummary(),
        profileService.getFinancialProfile()
      ]);
      setSummary(sumData);
      setProfile(profData);
      setNewScoreInput(sumData.current_score);
    } catch (err) {
      console.error('Failed to load credit score details:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateScore = async (e) => {
    e.preventDefault();
    try {
      setIsUpdating(true);
      await creditService.updateScore(Number(newScoreInput), scoreNote);
      setShowScoreModal(false);
      await loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleApplySimulatedScore = async (simScore) => {
    try {
      await creditService.updateScore(simScore, 'Simulated Goal Milestone');
      await loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const scoreFactors = [
    {
      factor: 'Payment History',
      weight: '35%',
      status: (profile?.missed_payments || 0) === 0 ? 'Optimal' : 'Needs Attention',
      statusColor: (profile?.missed_payments || 0) === 0 ? 'text-emerald-400' : 'text-rose-400',
      description: 'Your track record of paying EMIs and credit card minimum dues before due dates.'
    },
    {
      factor: 'Credit Utilization Ratio',
      weight: '30%',
      status: (profile?.credit_utilization || 0) <= 30 ? 'Optimal (<30%)' : 'High',
      statusColor: (profile?.credit_utilization || 0) <= 30 ? 'text-emerald-400' : 'text-amber-400',
      description: 'The proportion of your total revolving credit card limits currently drawn.'
    },
    {
      factor: 'Credit History Length',
      weight: '15%',
      status: 'Moderate',
      statusColor: 'text-indigo-400',
      description: 'Average age of all your active borrowing accounts. Older accounts provide stability.'
    },
    {
      factor: 'Credit Mix',
      weight: '10%',
      status: (profile?.active_loans || 0) > 0 ? 'Balanced' : 'Card Focused',
      statusColor: 'text-cyan-400',
      description: 'Healthy blend of secured facilities (Home/Vehicle) vs unsecured lines (Cards/Personal).'
    },
    {
      factor: 'New Hard Inquiries',
      weight: '10%',
      status: 'Low Inquiries',
      statusColor: 'text-emerald-400',
      description: 'Number of recent formal loan or card applications initiated in the last 6 months.'
    }
  ];

  const bureaus = [
    {
      name: 'TransUnion CIBIL',
      range: '300 - 900',
      prime: '750+',
      desc: 'Most widely consulted credit bureau for prime home loan and retail credit underwriting in India.'
    },
    {
      name: 'Experian India',
      range: '300 - 900',
      prime: '740+',
      desc: 'Popular among fintech lenders, private banks, and modern digital lending apps.'
    },
    {
      name: 'CRIF High Mark',
      range: '300 - 900',
      prime: '730+',
      desc: 'Comprehensive coverage across microfinance, NBFCs, two-wheeler loans, and retail banking.'
    },
    {
      name: 'Equifax India',
      range: '300 - 900',
      prime: '740+',
      desc: 'Utilized across diverse private lenders and credit card issuing banks for consumer risk indexing.'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/60">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-7 h-7 text-indigo-400" />
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Credit Score Intelligence
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real historical trajectory, factor weighting diagnostics, and predictive scoring tools.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowSimulator(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 transition-colors"
          >
            <Sliders className="w-3.5 h-3.5 text-indigo-400" />
            <span>Open Simulator</span>
          </button>
          <button
            onClick={() => setShowScoreModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/30 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Update Score</span>
          </button>
        </div>
      </div>

      {/* Row 1: Gauge + Trajectory Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5">
          <CreditScoreGauge
            score={summary?.current_score || 700}
            previousScore={summary?.previous_score || 700}
            lastUpdated={summary?.last_updated}
            onSimulateClick={() => setShowSimulator(true)}
          />
        </div>

        <div className="lg:col-span-7">
          <CreditScoreLineChart
            onUpdateScore={() => setShowScoreModal(true)}
          />
        </div>
      </div>

      {/* Row 2: Credit Scoring Factors Weighting */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-5">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-indigo-400" />
            Key Factors Impacting Your Credit Score
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Understanding standard credit bureau weighting algorithms helps prioritize your financial habits.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {scoreFactors.map((f, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="font-extrabold text-sm text-indigo-400 font-mono">{f.weight}</span>
                <span className={`font-bold text-[11px] ${f.statusColor}`}>
                  {f.status}
                </span>
              </div>
              <h4 className="font-bold text-white text-sm">{f.factor}</h4>
              <p className="text-slate-400 leading-relaxed text-[11px]">{f.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Row 3: Indian Bureau Landscape Guide */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-400" />
              Indian Credit Bureau Ecosystem Overview
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              RBI-authorized Credit Information Companies (CICs) operating in India.
            </p>
          </div>
          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-400 hidden sm:block">
            RBI Authorized CICs
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {bureaus.map((b, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="font-bold text-white text-sm">{b.name}</span>
              </div>
              <div className="space-y-1 py-1">
                <p className="text-slate-400">Scale: <span className="text-slate-200 font-mono">{b.range}</span></p>
                <p className="text-slate-400">Prime Benchmark: <span className="text-emerald-400 font-bold font-mono">{b.prime}</span></p>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed pt-1 border-t border-slate-800">{b.desc}</p>
            </div>
          ))}
        </div>
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
                Record Updated Score
              </h3>
              <button onClick={() => setShowScoreModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateScore} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Credit Score (300 - 900)
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
                  Update Note
                </label>
                <input
                  type="text"
                  value={scoreNote}
                  onChange={(e) => setScoreNote(e.target.value)}
                  placeholder="e.g. Monthly bureau refresh"
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
                  disabled={isUpdating}
                  className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg"
                >
                  {isUpdating ? 'Saving...' : 'Save & Record Point'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
