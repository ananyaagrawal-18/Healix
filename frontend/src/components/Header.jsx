import React from 'react';
import { Activity, ShieldCheck, Settings, Sparkles, Cpu, RefreshCw } from 'lucide-react';

export default function Header({ 
  health, 
  settings, 
  onOpenSettings, 
  onRefresh, 
  isRefreshing 
}) {
  return (
    <header className="w-full bg-[#0b101d]/90 backdrop-blur-md border-b border-slate-800/90 sticky top-0 z-30 px-4 sm:px-8 py-3.5 shadow-md transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Left: Brand Identity (Healix) */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-sm shadow-emerald-950">
            <svg 
              className="w-5 h-5 stroke-[2.2]" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <rect width="18" height="18" x="3" y="3" rx="4" />
              <path d="m9 14 2-2 3 3 5-5" />
              <circle cx="8" cy="9" r="1" fill="currentColor" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-white tracking-tight leading-tight">Healix</h1>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800/50">
                AI ENGINE
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">Intelligent Workflow Engineer</p>
          </div>
        </div>

        {/* Right: Status and Controls */}
        <div className="flex items-center gap-2.5 sm:gap-3.5">
          {/* AI Engine Status Pill */}
          <div 
            className="hidden sm:flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium border bg-slate-900 border-slate-700/80 text-emerald-400"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Autonomous Intelligence Active</span>
          </div>

          {/* Monitoring Active Pill */}
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 text-xs font-semibold shadow-xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>Monitoring active</span>
          </div>

          {/* Quick Refresh */}
          <button 
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors border border-slate-800"
            title="Refresh System State"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`} />
          </button>

          {/* Settings Trigger */}
          <button
            onClick={onOpenSettings}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors border border-slate-800"
            title="Healix System Configuration"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
