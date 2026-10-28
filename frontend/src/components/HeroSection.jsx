import React, { useState } from 'react';
import { 
  Search, 
  Wrench, 
  FileText, 
  ShieldCheck, 
  Paperclip, 
  ArrowUp, 
  ChevronDown, 
  Check,
  HelpCircle,
  Sparkles
} from 'lucide-react';

export default function HeroSection({
  workflows,
  selectedWorkflow,
  onSelectWorkflow,
  onTriggerAction,
  onSendMessage,
  onScrollToDetails
}) {
  const [query, setQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showConceptGuide, setShowConceptGuide] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    onSendMessage(query, selectedWorkflow?.id);
    setQuery('');
  };

  const handleCardClick = (actionType) => {
    onTriggerAction(actionType);
  };

  const quickQuestions = [
    { label: "💡 What is Self-Healing?", prompt: "What is self-healing automation in plain English?" },
    { label: "🧩 What is Schema Drift?", prompt: "What is schema drift and how does Healix fix it?" },
    { label: "⚡ Why do APIs fail (429)?", prompt: "What causes HTTP 429 rate limit errors and how are they healed?" },
    { label: "🔍 Investigate Failure", prompt: `Investigate current failure in ${selectedWorkflow?.name || 'Customer Data Sync'}` },
    { label: "🛠️ How does Healix repair?", prompt: "How does Healix generate patches and validate recovery?" }
  ];

  return (
    <section className="pt-8 pb-10 px-4 sm:px-8 max-w-4xl mx-auto">
      {/* Hero Headline */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            What can I help you fix today?
          </h2>
          <p className="text-slate-400 text-sm sm:text-base mt-1.5 font-normal">
            I monitor your workflows, investigate failures, and help restore them safely.
          </p>
        </div>

        {/* Concept Explainer Toggle Button */}
        <button
          type="button"
          onClick={() => setShowConceptGuide(!showConceptGuide)}
          className="flex items-center gap-1.5 text-xs font-semibold text-emerald-300 bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-500/30 px-3 py-1.5 rounded-xl transition-all shrink-0 self-start sm:self-auto"
        >
          <HelpCircle className="w-3.5 h-3.5 text-emerald-400" />
          <span>{showConceptGuide ? "Hide Concept Guide" : "💡 What is Self-Healing?"}</span>
        </button>
      </div>

      {/* Interactive Concept Explainer Card (Dark Theme) */}
      {showConceptGuide && (
        <div className="mb-6 p-5 rounded-2xl bg-slate-900/95 border border-emerald-900/60 text-xs text-slate-300 shadow-xl animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <h4 className="font-bold text-white text-sm">
                Understanding Self-Healing Automation in 30 Seconds
              </h4>
            </div>
            <button 
              onClick={() => setShowConceptGuide(false)}
              className="text-slate-500 hover:text-slate-300"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
              <div className="font-bold text-emerald-400 text-xs mb-1 flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-emerald-950 text-emerald-300 flex items-center justify-center text-[10px] border border-emerald-700">1</span>
                What is an Automated Workflow?
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Background software pipelines that transfer, validate, and synchronize data automatically (e.g. syncing customer signups to CRM, processing Stripe payments).
              </p>
            </div>

            <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
              <div className="font-bold text-rose-400 text-xs mb-1 flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-rose-950 text-rose-300 flex items-center justify-center text-[10px] border border-rose-700">2</span>
                Why Do They Fail?
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                External APIs rename fields (<strong>schema drift</strong>), traffic surges trigger <strong>HTTP 429 rate limits</strong>, or database locks cause <strong>deadlocks</strong>.
              </p>
            </div>

            <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
              <div className="font-bold text-teal-400 text-xs mb-1 flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-teal-950 text-teal-300 flex items-center justify-center text-[10px] border border-teal-700">3</span>
                What is Self-Healing?
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Healix acts like an autonomous doctor: it <strong>detects the error</strong>, <strong>diagnoses the root cause</strong>, <strong>generates a repair patch</strong>, <strong>retries the job</strong>, and <strong>validates 100% data recovery</strong>.
              </p>
            </div>
          </div>

          <div className="mt-3.5 pt-2.5 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
            <span>💡 <strong>Quick Demo:</strong> Try asking <em>"What is self-healing?"</em> below or click <strong>"Inject Test Failure"</strong> to see it live!</span>
            <button
              onClick={() => onSendMessage("What is self-healing automation in plain English?", selectedWorkflow?.id)}
              className="text-emerald-400 font-semibold underline hover:text-emerald-300"
            >
              Ask Healix to explain →
            </button>
          </div>
        </div>
      )}

      {/* 4 Primary Action Cards Grid (Dark Theme) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4 mb-6">
        {/* Card 1: Investigate a failure */}
        <button
          onClick={() => handleCardClick('investigate')}
          className="group text-left p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-850/80 transition-all duration-200 cursor-pointer flex flex-col justify-between shadow-sm"
        >
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-emerald-400 bg-emerald-950/70 border border-emerald-800/40 mb-3 group-hover:scale-105 transition-transform">
            <Search className="w-4 h-4 stroke-[2.2]" />
          </div>
          <div>
            <h3 className="font-semibold text-white text-sm sm:text-[15px] group-hover:text-emerald-400 transition-colors">
              Investigate a failure
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Find the root cause of an error
            </p>
          </div>
        </button>

        {/* Card 2: Fix a workflow */}
        <button
          onClick={() => handleCardClick('fix')}
          className="group text-left p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-850/80 transition-all duration-200 cursor-pointer flex flex-col justify-between relative overflow-hidden shadow-sm"
        >
          {selectedWorkflow?.status === 'failing' && (
            <span className="absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-950 text-rose-300 border border-rose-800/80 animate-pulse">
              Needs Repair
            </span>
          )}
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-emerald-400 bg-emerald-950/70 border border-emerald-800/40 mb-3 group-hover:scale-105 transition-transform">
            <Wrench className="w-4 h-4 stroke-[2.2]" />
          </div>
          <div>
            <h3 className="font-semibold text-white text-sm sm:text-[15px] group-hover:text-emerald-400 transition-colors">
              Fix a workflow
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Diagnose, repair, and validate
            </p>
          </div>
        </button>

        {/* Card 3: Analyze execution logs */}
        <button
          onClick={() => handleCardClick('logs')}
          className="group text-left p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-850/80 transition-all duration-200 cursor-pointer flex flex-col justify-between shadow-sm"
        >
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-emerald-400 bg-emerald-950/70 border border-emerald-800/40 mb-3 group-hover:scale-105 transition-transform">
            <FileText className="w-4 h-4 stroke-[2.2]" />
          </div>
          <div>
            <h3 className="font-semibold text-white text-sm sm:text-[15px] group-hover:text-emerald-400 transition-colors">
              Analyze execution logs
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Understand unexpected behavior
            </p>
          </div>
        </button>

        {/* Card 4: Check workflow health */}
        <button
          onClick={() => handleCardClick('health')}
          className="group text-left p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-850/80 transition-all duration-200 cursor-pointer flex flex-col justify-between shadow-sm"
        >
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-emerald-400 bg-emerald-950/70 border border-emerald-800/40 mb-3 group-hover:scale-105 transition-transform">
            <ShieldCheck className="w-4 h-4 stroke-[2.2]" />
          </div>
          <div>
            <h3 className="font-semibold text-white text-sm sm:text-[15px] group-hover:text-emerald-400 transition-colors">
              Check workflow health
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Find issues before they escalate
            </p>
          </div>
        </button>
      </div>

      {/* Main Interactive Ask Input Box (Dark Theme) */}
      <form onSubmit={handleSubmit} className="relative">
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 shadow-md hover:border-slate-700 focus-within:border-emerald-500/80 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all p-3.5 sm:p-4">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask Healix anything (e.g. 'What is self-healing?' or 'Why did Customer Data Sync fail?')..."
            className="w-full text-slate-100 placeholder-slate-500 text-sm sm:text-base outline-none bg-transparent mb-3.5 font-normal"
          />

          <div className="flex items-center justify-between pt-1">
            {/* Workflow Context Pill Selector */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-1.5 text-xs text-slate-300 font-medium px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 border border-slate-700 transition-colors"
              >
                <Paperclip className="w-3.5 h-3.5 text-slate-400 rotate-45" />
                <span>{selectedWorkflow?.name || 'Select Workflow'}</span>
                <ChevronDown className="w-3 h-3 text-slate-400 ml-0.5" />
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute left-0 bottom-full mb-2 w-64 bg-slate-900 rounded-xl shadow-xl border border-slate-700 py-1.5 z-40 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Monitored Workflows
                  </div>
                  {workflows.map((wf) => (
                    <button
                      key={wf.id}
                      type="button"
                      onClick={() => {
                        onSelectWorkflow(wf);
                        setIsDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs hover:bg-slate-800 flex items-center justify-between text-slate-200 transition-colors"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className={`w-2 h-2 rounded-full shrink-0 ${
                          wf.status === 'healthy' ? 'bg-emerald-500' : 'bg-rose-500'
                        }`} />
                        <span className="truncate font-medium">{wf.name}</span>
                      </div>
                      {selectedWorkflow?.id === wf.id && (
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Dark Submit Arrow Button */}
            <button
              type="submit"
              disabled={!query.trim()}
              className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center hover:bg-emerald-500 disabled:opacity-30 disabled:hover:bg-emerald-600 transition-colors shadow-sm"
              title="Submit prompt to Healix"
            >
              <ArrowUp className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        </div>

        {/* Quick Suggestion Chips (Dark Theme) */}
        <div className="flex items-center gap-1.5 flex-wrap mt-2.5">
          <span className="text-[11px] font-semibold text-slate-500 mr-1">Ask:</span>
          {quickQuestions.map((q, i) => (
            <button
              key={i}
              type="button"
              onClick={() => onSendMessage(q.prompt, selectedWorkflow?.id)}
              className="text-[11px] font-medium text-slate-300 bg-slate-850 hover:bg-slate-800 hover:text-emerald-300 hover:border-emerald-500/40 border border-slate-750 px-2.5 py-1 rounded-full transition-all"
            >
              {q.label}
            </button>
          ))}
        </div>

        {/* Footnote statement */}
        <p className="text-center text-[11px] text-slate-500 mt-2.5 font-normal">
          AI recommendations are validated before execution. Risky changes require approval.
        </p>

        {/* Down Arrow / Expand button */}
        <div className="flex justify-center mt-5">
          <button
            type="button"
            onClick={onScrollToDetails}
            className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 text-slate-200 flex items-center justify-center hover:bg-slate-700 transition-transform hover:scale-105 shadow-sm"
            title="Scroll to Live Self-Healing Pipeline"
          >
            <ChevronDown className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
      </form>
    </section>
  );
}
