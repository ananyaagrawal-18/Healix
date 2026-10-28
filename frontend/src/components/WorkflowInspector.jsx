import React, { useState } from 'react';
import { 
  Play, 
  RotateCw, 
  Flame, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Layers, 
  Database,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  Sliders
} from 'lucide-react';

export default function WorkflowInspector({
  workflow,
  onRunWorkflow,
  onSimulateFailure,
  onAutoHeal,
  onOpenDiagnosis,
  isHealing,
  isRunning
}) {
  const [selectedFailureType, setSelectedFailureType] = useState('schema_drift');

  if (!workflow) return null;

  const isFailing = workflow.status === 'failing';
  const isHealthy = workflow.status === 'healthy';

  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-md p-5 sm:p-6 mb-6">
      {/* Workflow Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h3 className="text-lg font-bold text-white">{workflow.name}</h3>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${
              isHealthy 
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/80' 
                : 'bg-rose-950 text-rose-300 border border-rose-700/80'
            }`}>
              {workflow.status}
            </span>
            <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium border border-slate-700">
              {workflow.category}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {workflow.description}
          </p>
        </div>

        {/* Metrics Pill Grid */}
        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          <div className="text-right">
            <div className="text-[11px] text-slate-400 font-medium">Health Score</div>
            <div className={`text-base font-bold font-mono ${
              workflow.health_score > 80 ? 'text-emerald-400' : 'text-rose-400'
            }`}>
              {workflow.health_score}%
            </div>
          </div>
          <div className="h-8 w-px bg-slate-800" />
          <div className="text-right">
            <div className="text-[11px] text-slate-400 font-medium">Success Rate</div>
            <div className="text-base font-bold text-slate-200 font-mono">
              {workflow.success_rate}%
            </div>
          </div>
          <div className="h-8 w-px bg-slate-800" />
          <div className="text-right">
            <div className="text-[11px] text-slate-400 font-medium">Total Runs</div>
            <div className="text-base font-bold text-slate-200 font-mono">
              {workflow.total_runs}
            </div>
          </div>
        </div>
      </div>

      {/* Step Progression Visualizer */}
      <div className="py-5">
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center justify-between">
          <span>Execution Steps Pipeline</span>
          <span className="text-[11px] font-normal text-slate-500 lowercase">
            Schedule: {workflow.schedule}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {workflow.steps.map((step, idx) => {
            const isStepFailed = step.status === 'failed';
            const isStepHealed = step.status === 'healed';
            const isStepSuccess = step.status === 'success';

            return (
              <div
                key={step.id}
                className={`p-3.5 rounded-xl border transition-all ${
                  isStepFailed
                    ? 'bg-rose-950/60 border-rose-700/80 text-rose-200'
                    : isStepHealed
                    ? 'bg-emerald-950/60 border-emerald-700/80 text-emerald-200'
                    : isStepSuccess
                    ? 'bg-slate-950 border-slate-800 text-slate-200'
                    : 'bg-slate-950/50 border-slate-850 text-slate-400'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-mono text-slate-500 uppercase">
                    Step {idx + 1}
                  </span>
                  {isStepFailed && (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-rose-400">
                      <XCircle className="w-3.5 h-3.5" /> Failed
                    </span>
                  )}
                  {isStepHealed && (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                      <Sparkles className="w-3.5 h-3.5" /> Healed
                    </span>
                  )}
                  {isStepSuccess && (
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-400">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> Success
                    </span>
                  )}
                  {step.status === 'idle' && (
                    <span className="text-[11px] text-slate-500">Standby</span>
                  )}
                </div>

                <div className="font-semibold text-xs leading-snug mb-1 text-white">
                  {step.name}
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800">
                  <span className="flex items-center gap-1 font-mono">
                    <Clock className="w-3 h-3 text-slate-500" />
                    {step.duration_ms || 120}ms
                  </span>
                  {step.error_message && (
                    <button
                      onClick={onOpenDiagnosis}
                      className="text-[10px] text-rose-400 font-semibold underline hover:text-rose-300"
                    >
                      View Error
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Control Buttons Bar */}
      <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {/* Run standard */}
          <button
            onClick={() => onRunWorkflow(workflow.id)}
            disabled={isRunning || isHealing}
            className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold shadow-xs transition-colors border border-slate-700"
          >
            <Play className={`w-3.5 h-3.5 fill-current ${isRunning ? 'animate-spin' : ''}`} />
            <span>{isRunning ? 'Running Pipeline...' : 'Run Pipeline Now'}</span>
          </button>

          {/* Self-Heal button if failed */}
          {isFailing && (
            <button
              onClick={onAutoHeal}
              disabled={isHealing}
              className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isHealing ? 'Healing Pipeline...' : 'Diagnose & Self-Heal'}</span>
            </button>
          )}
        </div>

        {/* Failure injection simulator */}
        <div className="flex items-center gap-2">
          <select
            value={selectedFailureType}
            onChange={(e) => setSelectedFailureType(e.target.value)}
            className="text-xs bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-2 text-slate-200 outline-none hover:bg-slate-850 transition-colors"
          >
            <option value="schema_drift">Schema Drift (Field Rename)</option>
            <option value="rate_limit">HTTP 429 (Rate Limit Burst)</option>
            <option value="timeout">Deadlock (Lock Timeout)</option>
            <option value="data_error">Data Error (Null Country)</option>
          </select>

          <button
            onClick={() => onSimulateFailure(selectedFailureType)}
            disabled={isRunning || isHealing}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-950/70 hover:bg-rose-900/80 text-rose-300 border border-rose-800/80 text-xs font-semibold transition-colors"
            title="Induce failure to test self-healing loop"
          >
            <Flame className="w-3.5 h-3.5 text-rose-400" />
            <span>Inject Failure</span>
          </button>
        </div>
      </div>
    </div>
  );
}
