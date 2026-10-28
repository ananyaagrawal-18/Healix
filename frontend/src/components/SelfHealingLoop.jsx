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
      activeColor: 'bg-rose-50 text-rose-700 border-rose-300 ring-2 ring-rose-200 dark:bg-rose-950/80 dark:text-rose-200 dark:border-rose-500/80 dark:ring-rose-500/30'
    },
    {
      id: 'detection',
      name: '2. Detection',
      desc: 'Telemetry & log parsing',
      icon: Radar,
      activeColor: 'bg-amber-50 text-amber-700 border-amber-300 ring-2 ring-amber-200 dark:bg-amber-950/80 dark:text-amber-200 dark:border-amber-500/80 dark:ring-amber-500/30'
    },
    {
      id: 'diagnosis',
      name: '3. Diagnosis',
      desc: 'AI root cause analysis',
      icon: Cpu,
      activeColor: 'bg-purple-50 text-purple-700 border-purple-300 ring-2 ring-purple-200 dark:bg-purple-950/80 dark:text-purple-200 dark:border-purple-500/80 dark:ring-purple-500/30'
    },
    {
      id: 'repair',
      name: '4. Repair',
      desc: 'Config & code patch diff',
      icon: Wrench,
      activeColor: 'bg-blue-50 text-blue-700 border-blue-300 ring-2 ring-blue-200 dark:bg-blue-950/80 dark:text-blue-200 dark:border-blue-500/80 dark:ring-blue-500/30'
    },
    {
      id: 'retry',
      name: '5. Retry',
      desc: 'Idempotent replay with patch',
      icon: RotateCcw,
      activeColor: 'bg-indigo-50 text-indigo-700 border-indigo-300 ring-2 ring-indigo-200 dark:bg-indigo-950/80 dark:text-indigo-200 dark:border-indigo-500/80 dark:ring-indigo-500/30'
    },
    {
      id: 'validation',
      name: '6. Validation',
      desc: '100% record integrity check',
      icon: CheckCircle2,
      activeColor: 'bg-emerald-50 text-emerald-700 border-emerald-400 ring-2 ring-emerald-200 dark:bg-emerald-950/80 dark:text-emerald-200 dark:border-emerald-500 dark:ring-emerald-500/30'
    }
  ];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs dark:shadow-md p-5 sm:p-6 mb-6 transition-colors duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800/60">
              Healix Loop
            </span>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Self-Healing Pipeline Engine</h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time closed feedback loop: Failure → Detection → Diagnosis → Repair → Retry → Validation
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center flex-wrap gap-2">
          {isFailed ? (
            <button
              onClick={onAutoHeal}
              disabled={isHealing}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 dark:hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition-all"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isHealing ? 'animate-spin' : ''}`} />
              <span>{isHealing ? 'Applying Self-Healing Loop...' : 'Execute Self-Healing Loop'}</span>
            </button>
          ) : (
            <button
              onClick={() => onSimulateFailure('schema_drift')}
              disabled={isSimulating}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/70 hover:bg-rose-100 dark:hover:bg-rose-900/70 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/70 text-xs font-semibold transition-colors"
            >
              <Flame className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
              <span>{isSimulating ? 'Simulating...' : 'Inject Test Failure'}</span>
            </button>
          )}

          {hasActivePatch && (
            <button
              onClick={onResetWorkflow}
              className="text-xs px-2.5 py-1.5 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium transition-colors"
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
                    ? 'bg-slate-50 dark:bg-slate-950/90 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-800'
                    : 'bg-white dark:bg-slate-950/40 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-850 opacity-70'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                      isActive 
                        ? 'bg-white dark:bg-slate-900 shadow-xs' 
                        : isCompleted 
                        ? 'bg-slate-200/60 dark:bg-slate-900' 
                        : 'bg-slate-100 dark:bg-slate-900/50'
                    }`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    {isActive && (
                      <span className="w-2 h-2 rounded-full bg-current animate-ping" />
                    )}
                  </div>
                  <h4 className="font-semibold text-xs leading-tight mb-0.5">{stage.name}</h4>
                  <p className="text-[10px] leading-tight opacity-80">{stage.desc}</p>
                </div>

                {/* Progress bar inside node */}
                <div className="mt-3 pt-2 border-t border-current/10 dark:border-slate-800">
                  <div className="text-[9px] uppercase font-bold tracking-wider opacity-90 flex items-center gap-1 font-mono">
                    {isActive ? (
                      <span className="text-amber-600 dark:text-amber-400">In Progress</span>
                    ) : isCompleted ? (
                      <span className="text-emerald-700 dark:text-emerald-400">✓ Done</span>
                    ) : (
                      <span className="text-slate-400 dark:text-slate-500">Standby</span>
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
        <div className="mt-5 p-3.5 rounded-xl bg-rose-50/80 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 text-rose-900 dark:text-rose-200">
            <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
            <span>
              <strong className="font-semibold text-rose-950 dark:text-white">Incident Detected:</strong> {activeIncident?.error_summary || 'Workflow execution failed. Root cause isolated.'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenDiagnosis}
              className="text-xs font-semibold text-rose-800 dark:text-rose-300 underline hover:text-rose-950 dark:hover:text-white"
            >
              Inspect Diagnostic Patch Diff →
            </button>
          </div>
        </div>
      )}

      {hasActivePatch && isHealthy && (
        <div className="mt-5 p-3.5 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 text-emerald-900 dark:text-emerald-200">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>
              <strong className="font-semibold text-emerald-950 dark:text-white">Workflow Healed & Recovered:</strong> Active patch 
              <code className="mx-1 px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 font-mono text-[11px] border border-emerald-200 dark:border-emerald-700/60">
                {workflow.current_config.active_patch.action_id}
              </code>
              in effect. 100% record integrity validated.
            </span>
          </div>
          <span className="text-emerald-700 dark:text-emerald-300 font-mono text-[11px] font-semibold">
            Status: 200 OK • MTTR: 45s
          </span>
        </div>
      )}
    </div>
  );
}
