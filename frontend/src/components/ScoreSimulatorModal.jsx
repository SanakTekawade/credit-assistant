import React, { useState } from 'react';
import { X, Sparkles, Sliders, ArrowRight, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';
import { formatINR, getScoreDetails } from '../utils/formatters';

export default function ScoreSimulatorModal({ currentProfile, onClose, onApplyScore }) {
  const baseScore = currentProfile?.credit_score || 700;
  const baseUsed = currentProfile?.credit_used || 50000;
  const baseLimit = currentProfile?.total_credit_limit || 150000;
  const baseIncome = (currentProfile?.monthly_income || 60000) + (currentProfile?.other_income || 0);
  const baseEmi = currentProfile?.monthly_emi || 12000;
  const baseMissed = currentProfile?.missed_payments || 0;

  // Simulator controls
  const [paydownAmount, setPaydownAmount] = useState(0);
  const [limitIncrease, setLimitIncrease] = useState(0);
  const [newEmi, setNewEmi] = useState(0);
  const [clearMissed, setClearMissed] = useState(false);

  // Simulated metrics
  const simUsed = Math.max(0, baseUsed - paydownAmount);
  const simLimit = baseLimit + limitIncrease;
  const simUtil = simLimit > 0 ? (simUsed / simLimit) * 100 : 0;
  const simEmi = baseEmi + newEmi;
  const simDti = baseIncome > 0 ? (simEmi / baseIncome) * 100 : 0;

  // Score simulation algorithm (conservative educational model)
  let scoreDelta = 0;

  // 1. Utilization impact:
  const baseUtil = baseLimit > 0 ? (baseUsed / baseLimit) * 100 : 0;
  const utilDiff = baseUtil - simUtil;
  if (utilDiff > 0) {
    scoreDelta += Math.round(utilDiff * 0.7); // paying down utilization gives boost
  } else if (utilDiff < 0) {
    scoreDelta += Math.round(utilDiff * 0.8);
  }

  // 2. Limit increase bonus (lowers utilization):
  if (limitIncrease > 0) {
    scoreDelta += Math.min(15, Math.round((limitIncrease / baseLimit) * 10));
  }

  // 3. Resolving missed payment history:
  if (clearMissed && baseMissed > 0) {
    scoreDelta += baseMissed * 35;
  }

  // 4. Adding new loan / EMI burden:
  if (newEmi > 0) {
    scoreDelta -= Math.min(30, Math.round((newEmi / 5000) * 8));
  }

  const simulatedScore = Math.max(300, Math.min(900, baseScore + scoreDelta));
  const simDetails = getScoreDetails(simulatedScore);
  const baseDetails = getScoreDetails(baseScore);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-2xl rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Credit Score What-If Simulator</h3>
              <p className="text-xs text-slate-400">Experiment with financial decisions to project potential score momentum</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Comparison Preview Banner */}
          <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950/40 border border-slate-800 text-center items-center">
            <div>
              <p className="text-xs text-slate-400">Current Score</p>
              <p className="text-2xl font-extrabold text-slate-300 mt-0.5">{baseScore}</p>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${baseDetails.badgeClass}`}>
                {baseDetails.category}
              </span>
            </div>

            <div className="flex flex-col items-center">
              <ArrowRight className="w-5 h-5 text-indigo-400 my-1 animate-pulse" />
              <span className={`text-xs font-bold ${scoreDelta >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {scoreDelta >= 0 ? `+${scoreDelta}` : scoreDelta} pts
              </span>
            </div>

            <div>
              <p className="text-xs text-slate-400">Simulated Score</p>
              <p className="text-2xl font-extrabold text-white mt-0.5">{simulatedScore}</p>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${simDetails.badgeClass}`}>
                {simDetails.category}
              </span>
            </div>
          </div>

          {/* Controls */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Simulate Action Scenarios
            </h4>

            {/* Slider 1: Pay down credit card debt */}
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-200">Pay Down Credit Card Balances</span>
                <span className="font-bold text-indigo-400 font-mono">{formatINR(paydownAmount)}</span>
              </div>
              <input
                type="range"
                min="0"
                max={baseUsed}
                step="5000"
                value={paydownAmount}
                onChange={(e) => setPaydownAmount(Number(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>₹0</span>
                <span>Simulated Card Balance: {formatINR(simUsed)} (Util: {simUtil.toFixed(0)}%)</span>
                <span>{formatINR(baseUsed)}</span>
              </div>
            </div>

            {/* Slider 2: Request Credit Limit Enhancement */}
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-200">Request Credit Limit Increase</span>
                <span className="font-bold text-indigo-400 font-mono">+{formatINR(limitIncrease)}</span>
              </div>
              <input
                type="range"
                min="0"
                max="200000"
                step="25000"
                value={limitIncrease}
                onChange={(e) => setLimitIncrease(Number(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>+₹0</span>
                <span>Simulated Total Limit: {formatINR(simLimit)}</span>
                <span>+₹2,00,000</span>
              </div>
            </div>

            {/* Toggle: 12 Months Perfect Payment Track Record */}
            {baseMissed > 0 && (
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-200">Complete 12-Month On-Time Payment Streak</p>
                  <p className="text-[11px] text-slate-400">Simulate effect of seasoning out past {baseMissed} missed payment(s)</p>
                </div>
                <button
                  type="button"
                  onClick={() => setClearMissed(!clearMissed)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
                    clearMissed
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  {clearMissed ? 'Applied ✓' : 'Enable'}
                </button>
              </div>
            )}

            {/* Slider 3: Adding New Loan EMI */}
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-200">Take a New Loan (Added Monthly EMI)</span>
                <span className="font-bold text-rose-400 font-mono">+{formatINR(newEmi)}/mo</span>
              </div>
              <input
                type="range"
                min="0"
                max="25000"
                step="2500"
                value={newEmi}
                onChange={(e) => setNewEmi(Number(e.target.value))}
                className="w-full accent-rose-500 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>+₹0</span>
                <span>Simulated DTI: {simDti.toFixed(1)}%</span>
                <span>+₹25,000/mo</span>
              </div>
            </div>
          </div>

          {/* Educational Disclaimer */}
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400">
            ⚠️ This simulation is an educational projection based on credit scoring principles. Exact scoring algorithms vary across bureaus (CIBIL, Experian, CRIF) and bank underwriting models.
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <button
            onClick={() => {
              setPaydownAmount(0);
              setLimitIncrease(0);
              setNewEmi(0);
              setClearMissed(false);
            }}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-400 hover:text-white"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reset Simulator
          </button>
          
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 rounded-xl"
            >
              Close
            </button>
            {onApplyScore && (
              <button
                onClick={() => {
                  onApplyScore(simulatedScore);
                  onClose();
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-md"
              >
                Log Simulated Score ({simulatedScore})
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
