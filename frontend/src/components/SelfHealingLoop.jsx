import React from 'react';
import { 
  AlertTriangle, 
  Radar, 
  Cpu, 
  Wrench, 
  RotateCcw, 
  CheckCircle2, 
  Sparkles,
  Flame,
  ShieldCheck
} from 'lucide-react';

export default function SelfHealingLoop({
  workflow,
  activeIncident,
  latestDiagnosis,
  isHealing,
  isSimulating,
  onAutoHeal,
  onSimulateFailure,
  onResetWorkflow,
  onOpenDiagnosis
}) {
  const isFailed = workflow?.status === 'failing';
  const isHealthy = workflow?.status === 'healthy';
  const hasActivePatch = Boolean(workflow?.current_config?.active_patch);

  let currentStage = 5; // Default healthy
  if (isSimulating) currentStage = 0;
  else if (isFailed && !latestDiagnosis) currentStage = 1;
  else if (isFailed && latestDiagnosis && !isHealing) currentStage = 2;
  else if (isHealing) currentStage = 3;
  else if (isHealthy && hasActivePatch) currentStage = 5;

  const stages = [
    {
      id: 'failure',
      name: '1. Failure',
      desc: 'Step exception intercepted',
      icon: AlertTriangle,
      color: 'rose',
      activeColor: 'bg-rose-950/80 text-rose-200 border-rose-500/80 ring-2 ring-rose-500/30',
      doneColor: 'bg-slate-950 text-slate-400 border-slate-800'
    },
    {
      id: 'detection',
      name: '2. Detection',
      desc: 'Telemetry & log parsing',
      icon: Radar,
      color: 'amber',
      activeColor: 'bg-amber-950/80 text-amber-200 border-amber-500/80 ring-2 ring-amber-500/30',
      doneColor: 'bg-slate-950 text-slate-400 border-slate-800'
    },
    {
      id: 'diagnosis',
      name: '3. Diagnosis',
      desc: 'AI root cause analysis',
      icon: Cpu,
      color: 'purple',
      activeColor: 'bg-purple-950/80 text-purple-200 border-purple-500/80 ring-2 ring-purple-500/30',
      doneColor: 'bg-slate-950 text-slate-400 border-slate-800'
    },
    {
      id: 'repair',
      name: '4. Repair',
      desc: 'Config & code patch diff',
      icon: Wrench,
      color: 'blue',
      activeColor: 'bg-blue-950/80 text-blue-200 border-blue-500/80 ring-2 ring-blue-500/30',
      doneColor: 'bg-slate-950 text-slate-400 border-slate-800'
    },
    {
      id: 'retry',
      name: '5. Retry',
      desc: 'Idempotent replay with patch',
      icon: RotateCcw,
      color: 'indigo',
      activeColor: 'bg-indigo-950/80 text-indigo-200 border-indigo-500/80 ring-2 ring-indigo-500/30',
      doneColor: 'bg-slate-950 text-slate-400 border-slate-800'
    },
    {
      id: 'validation',
      name: '6. Validation',
      desc: '100% record integrity check',
      icon: CheckCircle2,
      color: 'emerald',
      activeColor: 'bg-emerald-950/80 text-emerald-200 border-emerald-500 ring-2 ring-emerald-500/30',
      doneColor: 'bg-emerald-950/50 text-emerald-300 border-emerald-800/60'
    }
  ];

  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-md p-5 sm:p-6 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/60">
              Healix Loop
            </span>
            <h3 className="font-bold text-white text-base">Self-Healing Pipeline Engine</h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time closed feedback loop: Failure → Detection → Diagnosis → Repair → Retry → Validation
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center flex-wrap gap-2">
          {isFailed ? (
            <button
              onClick={onAutoHeal}
              disabled={isHealing}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition-all"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isHealing ? 'animate-spin' : ''}`} />
              <span>{isHealing ? 'Applying Self-Healing Loop...' : 'Execute Self-Healing Loop'}</span>
            </button>
          ) : (
            <button
              onClick={() => onSimulateFailure('schema_drift')}
              disabled={isSimulating}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-950/70 hover:bg-rose-900/70 text-rose-300 border border-rose-800/70 text-xs font-semibold transition-colors"
            >
              <Flame className="w-3.5 h-3.5 text-rose-400" />
              <span>{isSimulating ? 'Simulating...' : 'Inject Test Failure'}</span>
            </button>
          )}

          {hasActivePatch && (
            <button
              onClick={onResetWorkflow}
              className="text-xs px-2.5 py-1.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700 font-medium transition-colors"
              title="Reset configuration and remove active patch"
            >
              Reset Baseline
            </button>
          )}
        </div>
      </div>

      {/* 6-Stage Loop Visualizer */}
      <div className="pt-6 pb-2">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          {stages.map((stage, idx) => {
            const Icon = stage.icon;
            const isActive = isFailed ? currentStage === idx : (idx === 5 && isHealthy);
            const isCompleted = isHealthy || (isFailed && idx < currentStage);

            return (
              <div
                key={stage.id}
                className={`p-3 rounded-xl border transition-all text-left relative flex flex-col justify-between ${
                  isActive
                    ? stage.activeColor
                    : isCompleted
                    ? 'bg-slate-950/90 text-slate-200 border-slate-800'
                    : 'bg-slate-950/40 text-slate-500 border-slate-850 opacity-60'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                      isActive 
                        ? 'bg-slate-900 shadow-xs' 
                        : isCompleted 
                        ? 'bg-slate-900' 
                        : 'bg-slate-900/50'
                    }`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    {isActive && (
                      <span className="w-2 h-2 rounded-full bg-current animate-ping" />
                    )}
                  </div>
                  <h4 className="font-semibold text-xs leading-tight mb-0.5">{stage.name}</h4>
                  <p className="text-[10px] leading-tight opacity-75">{stage.desc}</p>
                </div>

                {/* Progress bar inside node */}
                <div className="mt-3 pt-2 border-t border-slate-800">
                  <div className="text-[9px] uppercase font-bold tracking-wider opacity-90 flex items-center gap-1 font-mono">
                    {isActive ? (
                      <span className="text-amber-400">In Progress</span>
                    ) : isCompleted ? (
                      <span className="text-emerald-400">✓ Done</span>
                    ) : (
                      <span className="text-slate-500">Standby</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Dynamic Status Banner */}
      {isFailed && (
        <div className="mt-5 p-3.5 rounded-xl bg-rose-950/50 border border-rose-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 text-rose-200">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>
              <strong className="font-semibold text-white">Incident Detected:</strong> {activeIncident?.error_summary || 'Workflow execution failed. Root cause isolated.'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenDiagnosis}
              className="text-xs font-semibold text-rose-300 underline hover:text-white"
            >
              Inspect Diagnostic Patch Diff →
            </button>
          </div>
        </div>
      )}

      {hasActivePatch && isHealthy && (
        <div className="mt-5 p-3.5 rounded-xl bg-emerald-950/50 border border-emerald-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 text-emerald-200">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              <strong className="font-semibold text-white">Workflow Healed & Recovered:</strong> Active patch 
              <code className="mx-1 px-1.5 py-0.5 rounded bg-emerald-900/60 text-emerald-300 font-mono text-[11px] border border-emerald-700/60">
                {workflow.current_config.active_patch.action_id}
              </code>
              in effect. 100% record integrity validated.
            </span>
          </div>
          <span className="text-emerald-300 font-mono text-[11px] font-semibold">
            Status: 200 OK • MTTR: 45s
          </span>
        </div>
      )}
    </div>
  );
}
