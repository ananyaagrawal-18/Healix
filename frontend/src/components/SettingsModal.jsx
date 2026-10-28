import React, { useState } from 'react';
import { X, Settings2, Sparkles, Cpu, Shield, Check, Activity, Database, Server } from 'lucide-react';

export default function SettingsModal({
  isOpen,
  onClose,
  settings
}) {
  const [autoPilot, setAutoPilot] = useState(true);
  const [telemetryFrequency, setTelemetryFrequency] = useState('5s');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-slate-900 rounded-2xl max-w-lg w-full shadow-2xl border border-slate-800 overflow-hidden text-slate-100">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-950/80 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
              <Settings2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm sm:text-base">
                Healix System Configuration
              </h3>
              <p className="text-[11px] text-slate-400">
                Autonomous Engine & Reliability Safeguards
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Active Engine Card */}
          <div className="p-4 rounded-xl border bg-emerald-950/40 border-emerald-500/30 text-emerald-200">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-slate-900/80 border border-emerald-500/40 text-emerald-400 shadow-xs shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <div className="font-semibold text-xs sm:text-sm text-white flex items-center gap-2">
                  <span>Healix Autonomous Intelligence Engine</span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-mono border border-emerald-500/30">
                    OPERATIONAL
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Deep root cause diagnosis, runtime AST analysis, and automated code/config patch generation are fully active.
                </p>
              </div>
            </div>
          </div>

          {/* Autonomous Policy Toggle */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-white">
                <Shield className="w-4 h-4 text-emerald-400" />
                <span>Self-Healing Policy Mode</span>
              </div>
              <button
                type="button"
                onClick={() => setAutoPilot(!autoPilot)}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  autoPilot ? 'bg-emerald-600' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    autoPilot ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              {autoPilot
                ? "Auto-Pilot: Low-risk operational repairs (rate limiting, exponential backoff, key aliases) execute automatically. Risky schema changes prompt 1-click confirmation."
                : "Manual Approval: All repairs require explicit human approval before hot-patching."}
            </p>
          </div>

          {/* System Telemetry & Monitor Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mb-1">
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
                <span>Telemetry Poll Rate</span>
              </div>
              <div className="font-mono text-sm font-bold text-white">Continuous (Streaming)</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mb-1">
                <Database className="w-3.5 h-3.5 text-cyan-400" />
                <span>Validation Audit</span>
              </div>
              <div className="font-mono text-sm font-bold text-emerald-400">100% Integrity Guarantee</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-950/80 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
