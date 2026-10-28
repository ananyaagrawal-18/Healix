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
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 mb-6">
      {/* Workflow Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h3 className="text-lg font-bold text-slate-900">{workflow.name}</h3>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${
              isHealthy 
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                : 'bg-rose-50 text-rose-700 border border-rose-200'
            }`}>
              {workflow.status}
            </span>
            <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium border border-slate-200">
              {workflow.category}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {workflow.description}
          </p>
        </div>

        {/* Metrics Pill Grid */}
        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          <div className="text-right">
            <div className="text-[11px] text-slate-400 font-medium">Health Score</div>
            <div className={`text-base font-bold font-mono ${
              workflow.health_score > 80 ? 'text-emerald-600' : 'text-rose-600'
            }`}>
              {workflow.health_score}%
            </div>
          </div>
          <div className="h-8 w-px bg-slate-200" />
          <div className="text-right">
            <div className="text-[11px] text-slate-400 font-medium">Success Rate</div>
            <div className="text-base font-bold text-slate-800 font-mono">
              {workflow.success_rate}%
            </div>
          </div>
          <div className="h-8 w-px bg-slate-200" />
          <div className="text-right">
            <div className="text-[11px] text-slate-400 font-medium">Total Runs</div>
            <div className="text-base font-bold text-slate-800 font-mono">
              {workflow.total_runs}
            </div>
          </div>
        </div>
      </div>

      {/* Step Progression Visualizer */}
      <div className="py-5">
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center justify-between">
          <span>Execution Steps Pipeline</span>
          <span className="text-[11px] font-normal text-slate-400 lowercase">
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
                    ? 'bg-rose-50/70 border-rose-300 text-rose-900'
                    : isStepHealed
                    ? 'bg-emerald-50/70 border-emerald-300 text-emerald-900'
                    : isStepSuccess
                    ? 'bg-slate-50 border-slate-200 text-slate-800'
                    : 'bg-white border-slate-200 text-slate-600'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">
                    Step {idx + 1}
                  </span>
                  {isStepFailed && (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-rose-600">
                      <XCircle className="w-3.5 h-3.5" /> Failed
                    </span>
                  )}
                  {isStepHealed && (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                      <Sparkles className="w-3.5 h-3.5" /> Healed
                    </span>
                  )}
                  {isStepSuccess && (
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-500">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Success
                    </span>
                  )}
                  {step.status === 'idle' && (
                    <span className="text-[11px] text-slate-400">Standby</span>
                  )}
                </div>

                <div className="font-semibold text-xs leading-snug mb-1">
                  {step.name}
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-current/10">
                  <span className="flex items-center gap-1 font-mono">
                    <Clock className="w-3 h-3 text-slate-400" />
                    {step.duration_ms || 120}ms
                  </span>
                  {step.error_message && (
                    <button
                      onClick={onOpenDiagnosis}
                      className="text-[10px] text-rose-600 font-semibold underline"
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
      <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {/* Run standard */}
          <button
            onClick={() => onRunWorkflow(workflow.id)}
            disabled={isRunning || isHealing}
            className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <Play className={`w-3.5 h-3.5 fill-current ${isRunning ? 'animate-spin' : ''}`} />
            <span>{isRunning ? 'Running Pipeline...' : 'Run Pipeline Now'}</span>
          </button>

          {/* Self-Heal button if failed */}
          {isFailing && (
            <button
              onClick={onAutoHeal}
              disabled={isHealing}
              className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-colors"
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
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-slate-700 outline-none hover:bg-slate-100 transition-colors"
          >
            <option value="schema_drift">Schema Drift (Field Rename)</option>
            <option value="rate_limit">HTTP 429 (Rate Limit Burst)</option>
            <option value="timeout">Deadlock (Lock Timeout)</option>
            <option value="data_error">Data Error (Null Country)</option>
          </select>

          <button
            onClick={() => onSimulateFailure(selectedFailureType)}
            disabled={isRunning || isHealing}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold transition-colors"
            title="Induce failure to test self-healing loop"
          >
            <Flame className="w-3.5 h-3.5 text-rose-600" />
            <span>Inject Failure</span>
          </button>
        </div>
      </div>
    </div>
  );
}
