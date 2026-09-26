import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine
} from 'recharts';
import { creditService } from '../services';
import { getScoreDetails } from '../utils/formatters';
import { TrendingUp, Filter, Sparkles } from 'lucide-react';

export default function CreditScoreLineChart({ initialHistory = [], onUpdateScore }) {
  const [timeframe, setTimeframe] = useState('all');
  const [data, setData] = useState(initialHistory);
  const [isLoading, setIsLoading] = useState(false);

  const filters = [
    { label: '1M', value: '1m' },
    { label: '3M', value: '3m' },
    { label: '6M', value: '6m' },
    { label: '1Y', value: '1y' },
    { label: 'All', value: 'all' },
  ];

  useEffect(() => {
    async function loadHistory() {
      try {
        setIsLoading(true);
        const res = await creditService.getHistory(timeframe);
        setData(res.history || []);
      } catch (err) {
        console.error('Failed to load credit history:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadHistory();
  }, [timeframe]);

  // Format chart data points
  const chartData = data.map((item, idx) => ({
    name: item.formatted_date || `Point ${idx + 1}`,
    score: item.credit_score,
    utilization: item.credit_utilization,
    dti: item.dti,
    note: item.note,
    recorded_at: item.recorded_at
  }));

  const minScore = chartData.length > 0
    ? Math.max(300, Math.min(...chartData.map(d => d.score)) - 30)
    : 600;
  const maxScore = chartData.length > 0
    ? Math.min(900, Math.max(...chartData.map(d => d.score)) + 30)
    : 850;

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const current = payload[0].payload;
      const details = getScoreDetails(current.score);
      return (
        <div className="rounded-xl bg-slate-900/95 border border-slate-700 p-3 shadow-2xl backdrop-blur-md">
          <p className="text-xs text-slate-400 font-medium mb-1">{label}</p>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-lg font-bold text-white">{current.score}</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${details.badgeClass}`}>
              {details.category}
            </span>
          </div>
          <div className="text-[11px] text-slate-300 space-y-0.5 border-t border-slate-800 pt-1.5">
            <p>Utilization: <span className="font-semibold text-slate-200">{current.utilization}%</span></p>
            <p>DTI Ratio: <span className="font-semibold text-slate-200">{current.dti}%</span></p>
            {current.note && <p className="text-slate-400 italic text-[10px] mt-1">{current.note}</p>}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-card rounded-3xl p-6 sm:p-8 flex flex-col justify-between">
      {/* Header with Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-400" />
            <h3 className="text-lg font-bold text-white">Credit Score History</h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real historical score trajectory over time
          </p>
        </div>

        {/* Timeframe Filter Buttons */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-900 border border-slate-800 self-start sm:self-auto">
          {filters.map((f) => (
            <button
              key={f.value}
              onClick={() => setTimeframe(f.value)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                timeframe === f.value
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart Area */}
      <div className="h-64 sm:h-72 w-full">
        {chartData.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-500">
            <Sparkles className="w-8 h-8 mb-2 opacity-50" />
            <p className="text-sm">No historical score points recorded yet.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="scoreAreaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#6366F1" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
              <XAxis
                dataKey="name"
                stroke="#64748B"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#334155' }}
              />
              <YAxis
                domain={[minScore, maxScore]}
                stroke="#64748B"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#334155' }}
              />
              <Tooltip content={<CustomTooltip />} />
              
              {/* Prime Score Benchmark (750) */}
              <ReferenceLine
                y={750}
                stroke="#10B981"
                strokeDasharray="4 4"
                label={{ value: 'Prime Benchmark (750)', fill: '#10B981', fontSize: 10, position: 'insideTopRight' }}
              />

              <Area
                type="monotone"
                dataKey="score"
                stroke="#6366F1"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#scoreAreaGradient)"
                dot={{ fill: '#818CF8', stroke: '#312E81', strokeWidth: 2, r: 4 }}
                activeDot={{ fill: '#C7D2FE', stroke: '#4F46E5', strokeWidth: 3, r: 6 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Footer Benchmark Note */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-800/80 text-xs text-slate-400">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
            <span>Score History</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-1 bg-emerald-400 rounded-full" />
            <span className="text-emerald-400">750+ Prime Tier</span>
          </div>
        </div>
        {onUpdateScore && (
          <button
            onClick={onUpdateScore}
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 hover:underline"
          >
            + Log New Score
          </button>
        )}
      </div>
    </div>
  );
}
