import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, ArrowLeft, Home } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center text-center p-6 space-y-6">
      <div className="w-16 h-16 rounded-3xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center">
        <ShieldCheck className="w-8 h-8" />
      </div>
      
      <div className="space-y-2 max-w-md">
        <h1 className="text-4xl font-extrabold text-white">404</h1>
        <h2 className="text-xl font-bold text-slate-200">Page Not Found</h2>
        <p className="text-xs text-slate-400">
          The page you are looking for doesn't exist or has been moved.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <Link
          to="/"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-colors"
        >
          <Home className="w-4 h-4" />
          Home
        </Link>
        <Link
          to="/dashboard"
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/30 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Dashboard
        </Link>
      </div>
    </div>
  );
}
