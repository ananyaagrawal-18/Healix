import React from 'react';
import { Settings, Sparkles, RefreshCw, Sun, Moon } from 'lucide-react';

export default function Header({ 
  health, 
  settings, 
  onOpenSettings, 
  onRefresh, 
  isRefreshing,
  theme,
  onSetTheme
}) {
  const isDark = theme === 'dark';

  return (
    <header className="w-full bg-white/95 dark:bg-[#0b101d]/90 backdrop-blur-md border-b border-slate-200/90 dark:border-slate-800/90 sticky top-0 z-30 px-4 sm:px-8 py-3.5 shadow-xs transition-colors duration-200">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Left: Brand Identity (Healix) */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-500/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-sm transition-colors">
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
              <h1 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight leading-tight">Healix</h1>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-100/70 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50">
                AI ENGINE
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Intelligent Workflow Engineer</p>
          </div>
        </div>

        {/* Right: Status and Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* AI Engine Status Pill */}
          <div 
            className="hidden sm:flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium border bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-emerald-400"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Autonomous Intelligence Active</span>
          </div>

          {/* Monitoring Active Pill */}
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200/90 dark:border-emerald-500/40 text-xs font-semibold shadow-xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>Monitoring active</span>
          </div>

          {/* Segmented Light / Dark Theme Switcher */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800/90 p-0.5 sm:p-1 rounded-xl border border-slate-200 dark:border-slate-700 shadow-inner">
            <button
              type="button"
              onClick={() => onSetTheme('light')}
              className={`flex items-center gap-1.5 px-2 sm:px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                !isDark 
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200/90 font-bold' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
              title="Switch to Light Theme"
            >
              <Sun className={`w-3.5 h-3.5 ${!isDark ? 'text-amber-500 fill-amber-500/20' : ''}`} />
              <span className="inline">Light</span>
            </button>
            <button
              type="button"
              onClick={() => onSetTheme('dark')}
              className={`flex items-center gap-1.5 px-2 sm:px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                isDark 
                  ? 'bg-slate-700 text-white shadow-xs border border-slate-600 font-bold' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
              title="Switch to Dark Theme"
            >
              <Moon className={`w-3.5 h-3.5 ${isDark ? 'text-indigo-400 fill-indigo-400/20' : ''}`} />
              <span className="inline">Dark</span>
            </button>
          </div>

          {/* Quick Refresh */}
          <button 
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors border border-slate-200 dark:border-slate-800"
            title="Refresh System State"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-emerald-500' : ''}`} />
          </button>

          {/* Settings Trigger */}
          <button
            onClick={onOpenSettings}
            className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors border border-slate-200 dark:border-slate-800"
            title="Healix System Configuration"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
