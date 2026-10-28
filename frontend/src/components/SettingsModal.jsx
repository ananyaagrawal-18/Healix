import React, { useState } from 'react';
import { X, Key, Sparkles, Cpu, Shield, Check, AlertCircle } from 'lucide-react';

export default function SettingsModal({
  isOpen,
  onClose,
  settings,
  onSaveKey
}) {
  const [apiKey, setApiKey] = useState('');
  const [statusMsg, setStatusMsg] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleSave = async (e) => {
    e.preventDefault();
    if (!apiKey.trim()) return;
    setIsSaving(true);
    setStatusMsg('');
    try {
      await onSaveKey(apiKey.trim());
      setStatusMsg('API Key successfully saved! Gemini diagnostics active.');
      setApiKey('');
    } catch (err) {
      setStatusMsg('Error saving key. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const isConfigured = settings?.gemini_api_configured;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                HealFlow AI Configuration
              </h3>
              <p className="text-[11px] text-slate-500">
                Manage AI Diagnostic Engine & Safety Safeguards
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

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Active Engine Card */}
          <div className={`p-4 rounded-xl border flex items-start gap-3 ${
            isConfigured 
              ? 'bg-purple-50/70 border-purple-200 text-purple-950' 
              : 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
          }`}>
            <div className="p-2 rounded-lg bg-white shadow-xs shrink-0">
              {isConfigured ? (
                <Sparkles className="w-4 h-4 text-purple-600" />
              ) : (
                <Cpu className="w-4 h-4 text-emerald-600" />
              )}
            </div>
            <div>
              <div className="font-semibold text-xs sm:text-sm">
                Active Diagnostic Engine: {isConfigured ? 'Gemini 2.5 Flash' : 'Deterministic Rule Engine (Built-in)'}
              </div>
              <p className="text-xs opacity-80 mt-0.5">
                {isConfigured 
                  ? 'LLM-powered deep reasoning is active for root cause analysis and patch generation.' 
                  : 'HealFlow is fully functional out-of-the-box using high-precision deterministic rules.'}
              </p>
            </div>
          </div>

          {/* Gemini API Key Input Form */}
          <form onSubmit={handleSave} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Gemini API Key (Optional)
              </label>
              <div className="flex gap-2">
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder={isConfigured ? "Key configured (enter to replace)" : "AIzaSy..."}
                  className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:border-emerald-500 outline-none font-mono"
                />
                <button
                  type="submit"
                  disabled={!apiKey.trim() || isSaving}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white text-xs font-semibold rounded-xl transition-colors shrink-0"
                >
                  {isSaving ? 'Saving...' : 'Save Key'}
                </button>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Never committed to git. Stored in memory / .env file.
              </p>
            </div>

            {statusMsg && (
              <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>{statusMsg}</span>
              </div>
            )}
          </form>

          {/* Safety Safeguards Policy */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
              <Shield className="w-4 h-4 text-emerald-600" />
              <span>Safety & Human-in-the-Loop Safeguards</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              HealFlow separates benign operational retries (rate limits, backoff) from risky changes (schema mappings, timeout expansions). Risky changes flag for human approval before execution.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
