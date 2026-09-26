import React from 'react';
import { formatINR, getDtiDetails } from '../utils/formatters';
import { Percent, ShieldAlert, CheckCircle2, ArrowRight } from 'lucide-react';

export default function DtiGaugeChart({ dti = 0, monthlyEmi = 0, grossIncome = 50000 }) {
  const dtiValue = Math.max(0, Number(dti) || 0);
  const emi = Number(monthlyEmi) || 0;
  const income = Math.max(1, Number(grossIncome) || 1);
  const dtiInfo = getDtiDetails(dtiValue);

  // Position on scale up to 60%
  const barWidth = Math.min(100, (dtiValue / 60) * 100);

  return (
    <div className="glass-card rounded-3xl p-6 sm:p-8 flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Debt Burden Ratio
          </span>
          <h3 className="text-lg font-bold text-white mt-0.5">Debt-to-Income (DTI)</h3>
        </div>
        <div className={`px-2.5 py-1 rounded-full text-xs font-bold border ${dtiInfo.badgeClass}`}>
          {dtiInfo.category}
        </div>
      </div>

      {/* Numerical Hero */}
      <div className="my-3">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            {dtiValue.toFixed(1)}%
          </span>
          <span className="text-xs text-slate-400">of gross monthly income committed to EMIs</span>
        </div>

        {/* Progress Bar / Threshold Meter */}
        <div className="mt-4 space-y-1.5">
          <div className="h-3 w-full rounded-full bg-slate-800 relative overflow-hidden flex">
            {/* Zones */}
            <div className="w-[50%] h-full bg-emerald-500/20 border-r border-slate-900" title="Low zone (<30%)" />
            <div className="w-[21.6%] h-full bg-yellow-500/20 border-r border-slate-900" title="Moderate zone (30-43%)" />
            <div className="w-[28.4%] h-full bg-rose-500/20" title="High risk zone (>43%)" />

            {/* User Indicator Fill */}
            <div
              className="absolute top-0 bottom-0 left-0 rounded-full transition-all duration-700 ease-out shadow-lg"
              style={{
                width: `${barWidth}%`,
                backgroundColor: dtiInfo.color
              }}
            />
          </div>

          {/* Threshold Markings */}
          <div className="flex justify-between text-[10px] text-slate-400 font-mono pt-1">
            <span>0%</span>
            <span className="text-emerald-400">30% (Low)</span>
            <span className="text-yellow-400">43% (Moderate Max)</span>
            <span className="text-rose-400">60%+</span>
          </div>
        </div>
      </div>

      {/* Income vs Debt Breakdown Card */}
      <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800/80 my-3 text-xs space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-slate-400">Total Monthly EMIs</span>
          <span className="font-bold text-slate-200 font-mono">{formatINR(emi)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-slate-400">Gross Monthly Income</span>
          <span className="font-bold text-slate-200 font-mono">{formatINR(income)}</span>
        </div>
        <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-[11px] text-slate-400">
          <span>Remaining Cash Flow</span>
          <span className="font-bold text-emerald-400 font-mono">{formatINR(Math.max(0, income - emi))}</span>
        </div>
      </div>

      {/* Educational Note */}
      <p className="text-xs text-slate-400 leading-relaxed mt-1">
        {dtiInfo.description}
      </p>
    </div>
  );
}
