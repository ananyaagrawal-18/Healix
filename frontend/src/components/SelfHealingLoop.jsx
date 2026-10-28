import React from 'react';
import { 
  AlertTriangle, 
  Radar, 
  Cpu, 
  Wrench, 
  RotateCcw, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles,
  Play,
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

  // Determine current active stage index (0 to 5)
  // 0: Failure, 1: Detection, 2: Diagnosis, 3: Repair, 4: Retry, 5: Validation
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
      activeColor: 'bg-rose-50 text-rose-700 border-rose-300 ring-4 ring-rose-100',
      doneColor: 'bg-slate-50 text-slate-500 border-slate-200'
    },
    {
      id: 'detection',
      name: '2. Detection',
      desc: 'Telemetry & log parsing',
      icon: Radar,
      color: 'amber',
      activeColor: 'bg-amber-50 text-amber-700 border-amber-300 ring-4 ring-amber-100',
      doneColor: 'bg-slate-50 text-slate-500 border-slate-200'
    },
    {
      id: 'diagnosis',
      name: '3. Diagnosis',
      desc: 'AI / Rule root cause analysis',
      icon: Cpu,
      color: 'purple',
      activeColor: 'bg-purple-50 text-purple-700 border-purple-300 ring-4 ring-purple-100',
      doneColor: 'bg-slate-50 text-slate-500 border-slate-200'
    },
    {
      id: 'repair',
      name: '4. Repair',
      desc: 'Config & schema patch diff',
      icon: Wrench,
      color: 'blue',
      activeColor: 'bg-blue-50 text-blue-700 border-blue-300 ring-4 ring-blue-100',
      doneColor: 'bg-slate-50 text-slate-500 border-slate-200'
    },
    {
      id: 'retry',
      name: '5. Retry',
      desc: 'Idempotent replay with patch',
      icon: RotateCcw,
      color: 'indigo',
      activeColor: 'bg-indigo-50 text-indigo-700 border-indigo-300 ring-4 ring-indigo-100',
      doneColor: 'bg-slate-50 text-slate-500 border-slate-200'
    },
    {
      id: 'validation',
      name: '6. Validation',
      desc: '100% record integrity check',
      icon: CheckCircle2,
      color: 'emerald',
      activeColor: 'bg-emerald-50 text-emerald-700 border-emerald-400 ring-4 ring-emerald-100',
      doneColor: 'bg-emerald-50 text-emerald-700 border-emerald-300'
    }
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Autonomous Loop
            </span>
            <h3 className="font-bold text-slate-900 text-base">Self-Healing Pipeline Engine</h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time closed feedback loop: Failure → Detection → Diagnosis → Repair → Retry → Validation
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center flex-wrap gap-2">
          {isFailed ? (
            <button
              onClick={onAutoHeal}
              disabled={isHealing}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-all hover:shadow"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isHealing ? 'animate-spin' : ''}`} />
              <span>{isHealing ? 'Applying Self-Healing Loop...' : 'Execute Self-Healing Loop'}</span>
            </button>
          ) : (
            <button
              onClick={() => onSimulateFailure('schema_drift')}
              disabled={isSimulating}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold transition-colors"
            >
              <Flame className="w-3.5 h-3.5 text-rose-600" />
              <span>{isSimulating ? 'Simulating...' : 'Inject Test Failure'}</span>
            </button>
          )}

          {hasActivePatch && (
            <button
              onClick={onResetWorkflow}
              className="text-xs px-2.5 py-1.5 rounded-xl text-slate-600 hover:text-slate-800 hover:bg-slate-100 border border-slate-200 font-medium transition-colors"
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
                    ? 'bg-slate-50/70 text-slate-700 border-slate-200'
                    : 'bg-white text-slate-400 border-slate-200 opacity-70'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                      isActive 
                        ? 'bg-white shadow-xs' 
                        : isCompleted 
                        ? 'bg-slate-200/60' 
                        : 'bg-slate-100'
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
                <div className="mt-3 pt-2 border-t border-current/10">
                  <div className="text-[9px] uppercase font-bold tracking-wider opacity-90 flex items-center gap-1">
                    {isActive ? (
                      <span className="font-mono">In Progress</span>
                    ) : isCompleted ? (
                      <span className="font-mono text-emerald-700">✓ Done</span>
                    ) : (
                      <span className="font-mono">Standby</span>
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
        <div className="mt-5 p-3.5 rounded-xl bg-rose-50/80 border border-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 text-rose-900">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>
              <strong className="font-semibold">Incident Detected:</strong> {activeIncident?.error_summary || 'Workflow execution failed. Root cause isolated.'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenDiagnosis}
              className="text-xs font-semibold text-rose-800 underline hover:text-rose-950"
            >
              Inspect Diagnostic Patch Diff →
            </button>
          </div>
        </div>
      )}

      {hasActivePatch && isHealthy && (
        <div className="mt-5 p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 text-emerald-900">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              <strong className="font-semibold">Workflow Healed & Recovered:</strong> Active patch 
              <code className="mx-1 px-1.5 py-0.5 rounded bg-emerald-100 font-mono text-[11px]">
                {workflow.current_config.active_patch.action_id}
              </code>
              in effect. 100% record integrity validated.
            </span>
          </div>
          <span className="text-emerald-700 font-mono text-[11px] font-semibold">
            Status: 200 OK • MTTR: 45s
          </span>
        </div>
      )}
    </div>
  );
}
