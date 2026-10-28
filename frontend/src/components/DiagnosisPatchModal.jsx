import React from 'react';
import { 
  X, 
  Sparkles, 
  Cpu, 
  CheckCircle2, 
  AlertTriangle, 
  FileCode, 
  ArrowRight,
  ShieldCheck,
  Check
} from 'lucide-react';

export default function DiagnosisPatchModal({
  isOpen,
  onClose,
  diagnosis,
  workflow,
  onApplyPatch,
  isHealing
}) {
  if (!isOpen || !diagnosis) return null;

  const repair = diagnosis.recommended_repair;
  const isAi = diagnosis.diagnostic_type === 'AI_GEMINI';

  // Format diff lines with colors
  const diffLines = repair?.patch_diff ? repair.patch_diff.split('\n') : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-xs z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                HealFlow Root Cause & Corrective Action
              </h3>
              <p className="text-xs text-slate-500">
                Target Workflow: {workflow?.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Engine & Confidence Banner */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <div className="flex items-center gap-2">
              {isAi ? (
                <span className="flex items-center gap-1 font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                  <Sparkles className="w-3 h-3 text-purple-600" />
                  {diagnosis.model_name || 'Gemini 2.5 Flash'}
                </span>
              ) : (
                <span className="flex items-center gap-1 font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                  <Cpu className="w-3 h-3 text-slate-600" />
                  Deterministic Rule Engine
                </span>
              )}
              <span className="text-slate-500">•</span>
              <span className="font-mono text-slate-600">
                Confidence: <strong className="text-slate-900">{(diagnosis.confidence * 100).toFixed(0)}%</strong>
              </span>
            </div>

            <span className="text-[11px] font-mono font-bold text-slate-600 uppercase tracking-wider bg-white px-2 py-0.5 rounded border border-slate-200">
              {diagnosis.error_category}
            </span>
          </div>

          {/* Root Cause Box */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Identified Root Cause
            </h4>
            <div className="p-3.5 rounded-xl bg-rose-50/70 border border-rose-200 text-xs sm:text-sm font-medium text-rose-950">
              {diagnosis.root_cause}
            </div>
          </div>

          {/* Explanation */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Engineering Diagnostic Analysis
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed bg-slate-50/70 p-3.5 rounded-xl border border-slate-200">
              {diagnosis.explanation}
            </p>
          </div>

          {/* Recommended Repair Action & Patch Diff */}
          {repair && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <FileCode className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Proposed Patch Diff</span>
                </h4>
                {repair.requires_approval ? (
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                    Human Approval Required
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Low-Risk Auto-Healable
                  </span>
                )}
              </div>

              <div className="mb-2 text-xs font-semibold text-slate-800">
                {repair.title}
              </div>
              <p className="text-xs text-slate-500 mb-3">
                {repair.description}
              </p>

              {/* Code Diff Display */}
              <div className="bg-slate-950 rounded-xl p-3 font-mono text-[11px] text-slate-200 overflow-x-auto border border-slate-800 max-h-52">
                {diffLines.map((line, i) => {
                  let lineStyle = 'text-slate-400';
                  if (line.startsWith('+')) lineStyle = 'text-emerald-400 bg-emerald-950/40 font-semibold';
                  else if (line.startsWith('-')) lineStyle = 'text-rose-400 bg-rose-950/40 line-through';
                  else if (line.startsWith('@')) lineStyle = 'text-cyan-400 font-bold';

                  return (
                    <div key={i} className={`px-1 py-0.5 rounded ${lineStyle}`}>
                      {line}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between rounded-b-2xl">
          <p className="text-[11px] text-slate-400 hidden sm:block">
            Approve repair to execute retry and validate 100% record integrity.
          </p>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 transition-colors"
            >
              Dismiss
            </button>

            <button
              onClick={() => onApplyPatch(repair?.patch_config)}
              disabled={isHealing}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-all hover:shadow"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{isHealing ? 'Applying & Validating...' : 'Approve & Self-Heal'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
