import React, { useState, useEffect } from 'react';
import {
  Compass,
  CheckCircle2,
  Circle,
  Lock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Award,
  Zap
} from 'lucide-react';
import { profileService } from '../services';

export default function RoadmapPage() {
  const [roadmap, setRoadmap] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadRoadmap() {
      try {
        setIsLoading(true);
        const data = await profileService.getRoadmap();
        setRoadmap(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    loadRoadmap();
  }, []);

  if (isLoading && !roadmap) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin" />
        <p className="text-xs font-semibold text-slate-400">Loading your credit roadmap...</p>
      </div>
    );
  }

  const stages = roadmap?.stages || [];
  const overallProgress = roadmap?.overall_progress || 0;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/60">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Your Path to Better Credit
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                A 5-stage progressive masterplan to build, optimize, and maintain top-tier credit health.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Overall Progress Hero Banner */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-4 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Progress Milestones
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-white">Overall Roadmap Completion</h2>
            <p className="text-xs text-slate-400">
              Stage {roadmap?.current_stage || 1} of 5 active • Verified via live profile & loan data
            </p>
          </div>

          <div className="text-right">
            <span className="text-4xl sm:text-5xl font-extrabold text-emerald-400 font-mono">
              {overallProgress}%
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-4 w-full rounded-full bg-slate-900 border border-slate-800 overflow-hidden p-0.5">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 via-cyan-400 to-emerald-400 rounded-full transition-all duration-700 shadow-lg"
            style={{ width: `${overallProgress}%` }}
          />
        </div>
      </div>

      {/* 5 Stages List */}
      <div className="space-y-6">
        {stages.map((st) => {
          const isCompleted = st.status === 'completed';
          const isInProgress = st.status === 'in_progress';
          const isLocked = st.status === 'locked';

          return (
            <div
              key={st.stage_number}
              className={`rounded-3xl border transition-all p-6 sm:p-8 ${
                isCompleted
                  ? 'bg-slate-900/60 border-emerald-500/30'
                  : isInProgress
                  ? 'bg-slate-900/90 border-indigo-500/50 shadow-xl shadow-indigo-500/10 ring-1 ring-indigo-500/20'
                  : 'bg-slate-950/40 border-slate-800/80 opacity-60'
              }`}
            >
              {/* Stage Top Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center font-extrabold text-sm shadow-md ${
                      isCompleted
                        ? 'bg-emerald-500 text-slate-950'
                        : isInProgress
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : isLocked ? <Lock className="w-4 h-4" /> : st.stage_number}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base sm:text-lg font-bold text-white">
                        Stage {st.stage_number}: {st.title}
                      </h3>
                      <span className="text-xs text-slate-400 hidden sm:inline">— {st.subtitle}</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{st.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold border ${
                      isCompleted
                        ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
                        : isInProgress
                        ? 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30 animate-pulse'
                        : 'text-slate-500 bg-slate-900 border-slate-800'
                    }`}
                  >
                    {isCompleted ? 'Completed ✓' : isInProgress ? 'In Progress' : 'Locked'}
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-300">
                    {st.completion_percentage}%
                  </span>
                </div>
              </div>

              {/* Stage Tasks Checklist */}
              <div className="mt-5 space-y-3">
                {st.tasks.map((task) => (
                  <div
                    key={task.id}
                    className={`p-3.5 rounded-2xl border flex items-start gap-3 transition-colors ${
                      task.is_completed
                        ? 'bg-emerald-950/10 border-emerald-500/20 text-slate-200'
                        : 'bg-slate-950/40 border-slate-800/80 text-slate-400'
                    }`}
                  >
                    {task.is_completed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <Circle className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
                    )}

                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-semibold ${task.is_completed ? 'text-white' : 'text-slate-300'}`}>
                        {task.title}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                        {task.description}
                      </p>
                    </div>

                    {task.is_completed && (
                      <span className="text-[10px] font-bold text-emerald-400 shrink-0">Done</span>
                    )}
                  </div>
                ))}
              </div>

            </div>
          );
        })}
      </div>

      {/* Educational Disclaimer */}
      <div className="rounded-2xl bg-slate-900/60 border border-slate-800/80 p-5 text-xs text-slate-400 leading-relaxed">
        ℹ️ <strong className="text-slate-300">Roadmap Disclaimer:</strong> Completing roadmap stages is an educational progression framework designed to encourage disciplined borrowing and repayment habits. It does not legally guarantee loan approvals or a specific credit score from third-party bureaus.
      </div>

    </div>
  );
}
