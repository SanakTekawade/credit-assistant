import React, { useState, useEffect } from 'react';
import {
  Bot,
  Sparkles,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Zap,
  ArrowRight,
  HelpCircle,
  FileText,
  Calendar
} from 'lucide-react';
import { aiService, profileService } from '../services';
import { formatDate } from '../utils/formatters';

export default function AIAdvisorPage() {
  const [analysis, setAnalysis] = useState(null);
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);
  const [error, setError] = useState('');

  const loadLatestAndHistory = async () => {
    try {
      setIsHistoryLoading(true);
      const histData = await aiService.getHistory();
      setHistory(histData || []);
      if (histData && histData.length > 0) {
        setAnalysis(histData[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsHistoryLoading(false);
    }
  };

  useEffect(() => {
    loadLatestAndHistory();
  }, []);

  const handleRunAnalysis = async () => {
    try {
      setIsLoading(true);
      setError('');
      const data = await aiService.runAnalysis(true);
      setAnalysis(data);
      await loadLatestAndHistory();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Failed to generate AI analysis. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
      case 'medium':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      default:
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
    }
  };

  const getHealthBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'excellent':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
      case 'good':
        return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
      case 'fair':
        return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
      case 'needs attention':
        return 'text-orange-400 bg-orange-500/10 border-orange-500/30';
      default:
        return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/60">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                AI Financial Advisor
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Intelligent diagnostic analysis powered by Google GenAI tailored for Indian retail banking.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleRunAnalysis}
          disabled={isLoading}
          className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 shadow-xl shadow-indigo-600/30 transition-all hover:scale-[1.02] disabled:opacity-50 self-start sm:self-auto"
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Analyzing Your Metrics...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Generate New AI Analysis</span>
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Analysis Display */}
      {analysis ? (
        <div className="space-y-8">
          
          {/* Health Summary Card */}
          <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-5 relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Credit Health Evaluation
                </span>
                <h3 className="text-xl font-bold text-white mt-0.5">Diagnostic Summary</h3>
              </div>

              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getHealthBadge(analysis.health_status)}`}>
                  Status: {analysis.health_status}
                </span>
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {formatDate(analysis.created_at || new Date())}
                </span>
              </div>
            </div>

            <p className="text-sm sm:text-base text-slate-200 leading-relaxed bg-slate-900/60 p-5 rounded-2xl border border-slate-800/80">
              {analysis.summary}
            </p>

            {/* Key Bottlenecks List */}
            {analysis.key_issues && analysis.key_issues.length > 0 && (
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  Key Financial Bottlenecks Identified
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {analysis.key_issues.map((issue, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-start gap-2.5 text-xs text-slate-300"
                    >
                      <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0 mt-1.5" />
                      <span>{issue}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 5-Step Action Plan Section */}
          <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-6">
            <div>
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-indigo-400" />
                <h3 className="text-xl font-bold text-white">Your 5-Step Action Plan</h3>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Prioritized sequential steps designed to strengthen credit profile resilience and improve borrowing terms.
              </p>
            </div>

            <div className="space-y-4">
              {analysis.action_plan && analysis.action_plan.map((stepItem) => (
                <div
                  key={stepItem.step}
                  className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-4">
                    {/* Step Number Circle */}
                    <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white font-extrabold text-sm flex items-center justify-center shrink-0 shadow-md">
                      {stepItem.step}
                    </div>

                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-white">{stepItem.title}</h4>
                      <p className="text-xs text-slate-400 leading-relaxed">{stepItem.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${getPriorityBadge(stepItem.priority)}`}>
                      {stepItem.priority} Priority
                    </span>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold text-slate-300 bg-slate-800 border border-slate-700 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-indigo-400" />
                      {stepItem.timeframe}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Warnings & Best Practices */}
          {analysis.warnings && analysis.warnings.length > 0 && (
            <div className="rounded-3xl bg-slate-900/40 border border-slate-800 p-6 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Guiding Principles & Important Cautions
              </h4>
              <ul className="space-y-2 text-xs text-slate-400 list-disc list-inside">
                {analysis.warnings.map((w, idx) => (
                  <li key={idx} className="leading-relaxed">{w}</li>
                ))}
              </ul>
            </div>
          )}

        </div>
      ) : (
        <div className="glass-card rounded-3xl p-12 text-center space-y-4">
          <Bot className="w-12 h-12 text-indigo-400 mx-auto" />
          <h3 className="text-lg font-bold text-white">No AI Consultations Yet</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Click the "Generate New AI Analysis" button above to evaluate your income, DTI, revolving limits, and loan repayment track record.
          </p>
        </div>
      )}

      {/* Past Consultations History */}
      {history.length > 1 && (
        <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-indigo-400" />
            Previous AI Diagnostics History
          </h3>

          <div className="space-y-3">
            {history.slice(1).map((h) => (
              <div
                key={h.id}
                onClick={() => setAnalysis(h)}
                className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 cursor-pointer transition-all flex items-center justify-between gap-4 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getHealthBadge(h.health_status)}`}>
                      {h.health_status}
                    </span>
                    <span className="text-slate-400">{formatDate(h.created_at)}</span>
                  </div>
                  <p className="text-slate-300 mt-1 line-clamp-1">{h.summary}</p>
                </div>
                <button className="text-indigo-400 font-semibold hover:underline shrink-0">
                  View Analysis →
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
