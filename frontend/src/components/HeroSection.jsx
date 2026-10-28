import React, { useState } from 'react';
import { Search, Wrench, FileText, ShieldCheck, Paperclip, ArrowUp, ChevronDown, Check } from 'lucide-react';

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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    onSendMessage(query, selectedWorkflow?.id);
    setQuery('');
  };

  const handleCardClick = (actionType) => {
    onTriggerAction(actionType);
  };

  return (
    <section className="pt-8 pb-10 px-4 sm:px-8 max-w-4xl mx-auto">
      {/* Hero Headline */}
      <div className="mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          What can I help you fix today?
        </h2>
        <p className="text-slate-500 text-sm sm:text-base mt-1.5 font-normal">
          I monitor your workflows, investigate failures, and help restore them safely.
        </p>
      </div>

      {/* 4 Primary Action Cards Grid (Exact match to screenshot) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4 mb-6">
        {/* Card 1: Investigate a failure */}
        <button
          onClick={() => handleCardClick('investigate')}
          className="group text-left p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 hover:border-emerald-500/70 hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between"
        >
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-emerald-700 bg-emerald-50 mb-3 group-hover:scale-105 transition-transform">
            <Search className="w-4 h-4 stroke-[2.2]" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 text-sm sm:text-[15px] group-hover:text-emerald-700 transition-colors">
              Investigate a failure
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Find the root cause of an error
            </p>
          </div>
        </button>

        {/* Card 2: Fix a workflow */}
        <button
          onClick={() => handleCardClick('fix')}
          className="group text-left p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 hover:border-emerald-500/70 hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between relative overflow-hidden"
        >
          {selectedWorkflow?.status === 'failing' && (
            <span className="absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-200 animate-pulse">
              Needs Repair
            </span>
          )}
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-emerald-700 bg-emerald-50 mb-3 group-hover:scale-105 transition-transform">
            <Wrench className="w-4 h-4 stroke-[2.2]" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 text-sm sm:text-[15px] group-hover:text-emerald-700 transition-colors">
              Fix a workflow
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Diagnose, repair, and validate
            </p>
          </div>
        </button>

        {/* Card 3: Analyze execution logs */}
        <button
          onClick={() => handleCardClick('logs')}
          className="group text-left p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 hover:border-emerald-500/70 hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between"
        >
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-emerald-700 bg-emerald-50 mb-3 group-hover:scale-105 transition-transform">
            <FileText className="w-4 h-4 stroke-[2.2]" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 text-sm sm:text-[15px] group-hover:text-emerald-700 transition-colors">
              Analyze execution logs
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Understand unexpected behavior
            </p>
          </div>
        </button>

        {/* Card 4: Check workflow health */}
        <button
          onClick={() => handleCardClick('health')}
          className="group text-left p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 hover:border-emerald-500/70 hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between"
        >
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-emerald-700 bg-emerald-50 mb-3 group-hover:scale-105 transition-transform">
            <ShieldCheck className="w-4 h-4 stroke-[2.2]" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 text-sm sm:text-[15px] group-hover:text-emerald-700 transition-colors">
              Check workflow health
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Find issues before they escalate
            </p>
          </div>
        </button>
      </div>

      {/* Main Interactive Ask Input Box (Exact match to screenshot) */}
      <form onSubmit={handleSubmit} className="relative">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/10 transition-all p-3.5 sm:p-4">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask HealFlow anything about your workflows..."
            className="w-full text-slate-800 placeholder-slate-400 text-sm sm:text-base outline-none bg-transparent mb-3.5 font-normal"
          />

          <div className="flex items-center justify-between pt-1">
            {/* Workflow Context Pill Selector */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-1.5 text-xs text-slate-600 font-medium px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200/80 transition-colors"
              >
                <Paperclip className="w-3.5 h-3.5 text-slate-400 rotate-45" />
                <span>{selectedWorkflow?.name || 'Select Workflow'}</span>
                <ChevronDown className="w-3 h-3 text-slate-400 ml-0.5" />
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute left-0 bottom-full mb-2 w-64 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-40 animate-in fade-in zoom-in-95 duration-100">
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
                      className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 flex items-center justify-between text-slate-700 transition-colors"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className={`w-2 h-2 rounded-full shrink-0 ${
                          wf.status === 'healthy' ? 'bg-emerald-500' : 'bg-rose-500'
                        }`} />
                        <span className="truncate font-medium">{wf.name}</span>
                      </div>
                      {selectedWorkflow?.id === wf.id && (
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
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
              className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-slate-900 transition-colors shadow-sm"
              title="Submit prompt to HealFlow"
            >
              <ArrowUp className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        </div>

        {/* Footnote statement (exact match to screenshot) */}
        <p className="text-center text-[11px] text-slate-400 mt-2.5 font-normal">
          AI recommendations are validated before execution. Risky changes require approval.
        </p>

        {/* Down Arrow / Expand button (exact match to screenshot) */}
        <div className="flex justify-center mt-5">
          <button
            type="button"
            onClick={onScrollToDetails}
            className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center hover:bg-slate-800 transition-transform hover:scale-105 shadow-sm"
            title="Scroll to Live Self-Healing Pipeline"
          >
            <ChevronDown className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
      </form>
    </section>
  );
}
