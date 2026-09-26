import React from 'react';
import { TrendingUp, TrendingDown, Minus, Info, Calendar } from 'lucide-react';
import { getScoreDetails, formatDate } from '../utils/formatters';

export default function CreditScoreGauge({ score = 700, previousScore = 700, lastUpdated, onSimulateClick }) {
  const currentScore = Math.max(300, Math.min(900, Number(score) || 700));
  const prev = Number(previousScore) || currentScore;
  const delta = currentScore - prev;
  const scoreInfo = getScoreDetails(currentScore);

  // Calculate angle for 180-degree gauge (from -180 to 0 or -90 to 90)
  // 300 score is 0%, 900 score is 100%
  const percentage = (currentScore - 300) / (900 - 300);
  const rotationDegrees = percentage * 180 - 90; // -90deg to +90deg

  // SVG Gauge calculations
  const radius = 100;
  const strokeWidth = 14;
  const circumference = Math.PI * radius; // Half-circle circumference
  const strokeDashoffset = circumference * (1 - percentage);

  return (
    <div className="glass-card rounded-3xl p-6 sm:p-8 relative overflow-hidden flex flex-col justify-between">
      {/* Background radial glow */}
      <div 
        className="absolute -top-16 -right-16 w-48 h-48 rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{ backgroundColor: scoreInfo.color }}
      />

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Credit Health Indicator
          </span>
          <h2 className="text-xl font-bold text-white mt-0.5">Credit Score</h2>
        </div>
        
        {/* Score Category Badge */}
        <div className={`px-3 py-1 rounded-full text-xs font-bold border ${scoreInfo.badgeClass}`}>
          {scoreInfo.category}
        </div>
      </div>

      {/* Gauge Visualization */}
      <div className="flex flex-col items-center justify-center my-6 relative">
        <svg className="w-56 h-32 sm:w-64 sm:h-36 overflow-visible" viewBox="0 0 240 130">
          {/* Defs for gradients */}
          <defs>
            <linearGradient id="scoreGaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#EF4444" />
              <stop offset="25%" stopColor="#F97316" />
              <stop offset="50%" stopColor="#EAB308" />
              <stop offset="75%" stopColor="#3B82F6" />
              <stop offset="100%" stopColor="#10B981" />
            </linearGradient>
            <filter id="gaugeShadow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="2" stdDeviation="4" floodOpacity="0.3" />
            </filter>
          </defs>

          {/* Background Arc Track */}
          <path
            d="M 20 120 A 100 100 0 0 1 220 120"
            fill="none"
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {/* Active Colored Arc */}
          <path
            d="M 20 120 A 100 100 0 0 1 220 120"
            fill="none"
            stroke="url(#scoreGaugeGradient)"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />

          {/* Needle Indicator Pivot */}
          <g transform={`translate(120, 120) rotate(${rotationDegrees})`}>
            <polygon points="-3,-10 0,-92 3,-10" fill="#FFFFFF" opacity="0.9" />
            <circle cx="0" cy="0" r="7" fill="#6366F1" stroke="#FFFFFF" strokeWidth="2" />
          </g>
        </svg>

        {/* Center Numbers */}
        <div className="text-center -mt-8">
          <div className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white flex items-center justify-center gap-1">
            <span>{currentScore}</span>
            <span className="text-xs text-slate-400 font-normal self-end mb-1.5">/ 900</span>
          </div>

          {/* Delta Indicator */}
          <div className="flex items-center justify-center gap-2 mt-2">
            {delta > 0 ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                <TrendingUp className="w-3 h-3" />
                +{delta} pts vs prev
              </span>
            ) : delta < 0 ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30">
                <TrendingDown className="w-3 h-3" />
                {delta} pts vs prev
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700">
                <Minus className="w-3 h-3" />
                No change
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Ranges Scale Labels */}
      <div className="grid grid-cols-5 text-[10px] sm:text-[11px] font-medium text-slate-400 border-t border-slate-800/80 pt-3 text-center">
        <div className="text-rose-400">300-579<br/><span className="text-slate-400">Poor</span></div>
        <div className="text-orange-400">580-669<br/><span className="text-slate-400">Fair</span></div>
        <div className="text-yellow-400">670-739<br/><span className="text-slate-400">Good</span></div>
        <div className="text-blue-400">740-799<br/><span className="text-slate-400">V.Good</span></div>
        <div className="text-emerald-400">800-900<br/><span className="text-slate-400">Excel.</span></div>
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-800/60 text-xs text-slate-400">
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>Updated: {formatDate(lastUpdated || new Date())}</span>
        </div>
        {onSimulateClick && (
          <button
            onClick={onSimulateClick}
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 hover:underline flex items-center gap-1"
          >
            Simulate Score →
          </button>
        )}
      </div>
    </div>
  );
}
