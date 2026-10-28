import React from 'react';
import { Activity, ShieldCheck, Settings, Sparkles, Cpu, RefreshCw } from 'lucide-react';

export default function Header({ 
  health, 
  settings, 
  onOpenSettings, 
  onRefresh, 
  isRefreshing 
}) {
  const isAi = settings?.gemini_api_configured;

  return (
    <header className="w-full bg-white border-b border-slate-200/80 sticky top-0 z-30 px-4 sm:px-8 py-3.5 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Left: Brand Identity (exact match to user UI) */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200/70 flex items-center justify-center text-emerald-600 shadow-sm">
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
              <h1 className="text-lg font-bold text-slate-900 tracking-tight leading-tight">HealFlow AI</h1>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                MVP
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">Intelligent Workflow Engineer</p>
          </div>
        </div>

        {/* Right: Status and Controls */}
        <div className="flex items-center gap-2.5 sm:gap-3.5">
          {/* AI Engine Provider Pill */}
          <button 
            onClick={onOpenSettings}
            className={`hidden sm:flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium border transition-colors ${
              isAi 
                ? 'bg-purple-50 text-purple-700 border-purple-200/70 hover:bg-purple-100' 
                : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
            }`}
            title="Click to configure Gemini API Key"
          >
            {isAi ? <Sparkles className="w-3.5 h-3.5 text-purple-600" /> : <Cpu className="w-3.5 h-3.5 text-slate-600" />}
            <span>{isAi ? 'Gemini 2.5 AI' : 'Rule-Based Engine'}</span>
          </button>

          {/* Monitoring Active Pill (exact match to user UI) */}
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/80 text-xs font-semibold shadow-xs">
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
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            title="Refresh System State"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-emerald-600' : ''}`} />
          </button>

          {/* Settings Trigger */}
          <button
            onClick={onOpenSettings}
            className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
            title="HealFlow Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
