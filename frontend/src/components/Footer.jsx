import React from 'react';
import { ShieldCheck, Heart, ExternalLink, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-slate-800/80 bg-slate-950 text-slate-400 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Important Regulatory & Educational Disclaimer */}
        <div className="rounded-2xl bg-slate-900/60 border border-slate-800/80 p-5 sm:p-6 backdrop-blur-sm">
          <div className="flex items-start gap-3.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 shrink-0 mt-0.5">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Important Financial & Educational Disclaimer
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Credit Assistant provides educational information and AI-generated insights based on the data you provide. 
                It is not a bank, credit bureau, lender, or registered financial advisor. Credit scores and lending decisions 
                depend on the relevant institution and scoring model (e.g. CIBIL, Experian, CRIF High Mark, Equifax). 
                AI-generated information may contain errors and should not be treated as guaranteed financial advice.
              </p>
            </div>
          </div>
        </div>

        {/* Links & Brand */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pt-4">
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span className="font-bold text-white text-base tracking-tight">Credit Assistant</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                INDIA 🇮🇳
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-md leading-relaxed">
              Empowering consumers across India to master debt-to-income ratios, optimize revolving credit card limits, and build resilient credit health through intelligent AI guidance.
            </p>
          </div>

          <div>
            <h5 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-3">Platform</h5>
            <ul className="space-y-2 text-xs">
              <li><Link to="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
              <li><Link to="/credit-score" className="hover:text-white transition-colors">Score Simulator</Link></li>
              <li><Link to="/debts" className="hover:text-white transition-colors">Debt Management</Link></li>
              <li><Link to="/ai-advisor" className="hover:text-white transition-colors">AI Advisor</Link></li>
              <li><Link to="/roadmap" className="hover:text-white transition-colors">Credit Roadmap</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-3">Indian Ecosystem</h5>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> CIBIL Scoring Logic</li>
              <li className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-indigo-400" /> Experian India Standards</li>
              <li className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-cyan-400" /> DTI RBI Guidelines</li>
              <li className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> Google GenAI Integration</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-900 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} Credit Assistant India. All rights reserved.</p>
          <div className="flex items-center gap-1 text-slate-400">
            <span>Engineered for smart personal finance in India</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
