import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { formatINR, getUtilizationDetails } from '../utils/formatters';
import { CreditCard, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function CreditUtilizationDonut({ used = 0, limit = 100000, utilizationPct }) {
  const creditLimit = Math.max(0, Number(limit) || 0);
  const creditUsed = Math.max(0, Number(used) || 0);
  const available = Math.max(0, creditLimit - creditUsed);
  const calculatedPct = creditLimit > 0 ? (creditUsed / creditLimit) * 100 : 0;
  const pct = utilizationPct !== undefined ? Number(utilizationPct) : calculatedPct;
  const pctRounded = Math.round(pct * 10) / 10;

  const utilInfo = getUtilizationDetails(pctRounded);

  const data = [
    { name: 'Used Credit', value: creditUsed, color: utilInfo.color },
    { name: 'Available Credit', value: available, color: '#1E293B' }, // slate-800
  ];

  // If credit limit is 0
  if (creditLimit === 0) {
    data[0] = { name: 'No Active Cards', value: 1, color: '#334155' };
  }

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const item = payload[0];
      return (
        <div className="rounded-xl bg-slate-900 border border-slate-700 p-2.5 shadow-xl text-xs">
          <p className="font-semibold text-white">{item.name}</p>
          <p className="text-slate-300 font-mono mt-0.5">{formatINR(item.value)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-card rounded-3xl p-6 sm:p-8 flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Revolving Limit Health
          </span>
          <h3 className="text-lg font-bold text-white mt-0.5">Credit Utilization</h3>
        </div>
        <div className={`px-2.5 py-1 rounded-full text-xs font-bold border ${utilInfo.badgeClass}`}>
          {pctRounded}% Used
        </div>
      </div>

      {/* Donut Chart with Center Text */}
      <div className="relative h-48 sm:h-52 flex items-center justify-center my-2">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius="70%"
              outerRadius="90%"
              startAngle={90}
              endAngle={-270}
              paddingAngle={3}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>

        {/* Center Label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {pctRounded}%
          </span>
          <span className="text-[11px] text-slate-400 font-medium">Revolving Dues</span>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800/80 my-3 text-xs">
        <div>
          <p className="text-slate-400">Used Credit</p>
          <p className="text-sm font-bold text-slate-100 font-mono mt-0.5">{formatINR(creditUsed)}</p>
        </div>
        <div>
          <p className="text-slate-400">Available Credit</p>
          <p className="text-sm font-bold text-emerald-400 font-mono mt-0.5">{formatINR(available)}</p>
        </div>
        <div className="col-span-2 pt-2 border-t border-slate-800 flex justify-between items-center text-[11px] text-slate-400">
          <span>Total Combined Limit</span>
          <span className="font-semibold text-slate-200 font-mono">{formatINR(creditLimit)}</span>
        </div>
      </div>

      {/* Advice Note */}
      <div className="flex items-start gap-2 text-xs text-slate-400 mt-2">
        {pctRounded <= 30 ? (
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
        ) : (
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        )}
        <p className="leading-relaxed">{utilInfo.description}</p>
      </div>
    </div>
  );
}
