import React, { useState } from 'react';
import { 
  Terminal, 
  Search, 
  Copy, 
  Check, 
  AlertCircle, 
  Sparkles, 
  ChevronRight, 
  ChevronDown,
  Filter
} from 'lucide-react';

export default function LogViewer({ logs = [], runId, workflowName }) {
  const [filterLevel, setFilterLevel] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [copied, setCopied] = useState(false);

  const filteredLogs = logs.filter((log) => {
    const matchesLevel = filterLevel === 'ALL' || log.level === filterLevel;
    const matchesSearch = searchQuery === '' || 
      log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.step.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesLevel && matchesSearch;
  });

  const handleCopyLogs = () => {
    const text = logs.map(l => `[${l.timestamp}] [${l.level}] [${l.step}] ${l.message}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getLevelBadge = (level) => {
    switch (level) {
      case 'ERROR':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-bold font-mono bg-rose-500/20 text-rose-300 border border-rose-500/30">ERROR</span>;
      case 'WARN':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-bold font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30">WARN</span>;
      case 'HEAL':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-bold font-mono bg-emerald-500/25 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">✨ HEAL</span>;
      default:
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-medium font-mono bg-slate-700/60 text-slate-300">INFO</span>;
    }
  };

  return (
    <div className="bg-slate-900 text-slate-100 rounded-2xl border border-slate-800 shadow-lg overflow-hidden mb-6">
      {/* Terminal Title Bar */}
      <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
          </div>
          <div className="flex items-center gap-2 ml-2">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span className="font-mono text-xs font-semibold text-slate-200">
              Live Execution Trace
            </span>
            {runId && (
              <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                {runId}
              </span>
            )}
          </div>
        </div>

        {/* Filter and Search Controls */}
        <div className="flex items-center gap-2">
          {/* Level Tabs */}
          <div className="flex bg-slate-800/80 rounded-lg p-0.5 border border-slate-700/60 text-[11px] font-mono">
            {['ALL', 'ERROR', 'HEAL', 'WARN', 'INFO'].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setFilterLevel(lvl)}
                className={`px-2 py-0.5 rounded transition-colors ${
                  filterLevel === lvl
                    ? 'bg-emerald-600 text-white font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search logs..."
              className="bg-slate-800/90 border border-slate-700/80 rounded-lg pl-8 pr-2.5 py-1 text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-emerald-500 w-32 sm:w-44 transition-all"
            />
          </div>

          {/* Copy Button */}
          <button
            onClick={handleCopyLogs}
            className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors border border-slate-800"
            title="Copy Logs to Clipboard"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Log Feed */}
      <div className="p-3 font-mono text-xs max-h-80 overflow-y-auto space-y-1 divide-y divide-slate-800/40">
        {filteredLogs.length === 0 ? (
          <div className="p-6 text-center text-slate-500 italic">
            No log entries match the current filter.
          </div>
        ) : (
          filteredLogs.map((log, idx) => {
            const isExpanded = expandedIndex === idx;
            const hasContext = Boolean(log.context);

            return (
              <div 
                key={idx} 
                className={`pt-1.5 pb-1 px-2 rounded hover:bg-slate-800/40 transition-colors ${
                  log.level === 'ERROR' ? 'bg-rose-950/20' : log.level === 'HEAL' ? 'bg-emerald-950/20' : ''
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <span className="text-slate-500 select-none shrink-0 text-[11px]">
                    {log.timestamp.split(' ')[1] || log.timestamp}
                  </span>
                  
                  <span className="shrink-0">{getLevelBadge(log.level)}</span>
                  
                  <span className="text-slate-400 text-[11px] shrink-0 font-medium bg-slate-800/50 px-1 rounded">
                    [{log.step}]
                  </span>

                  <span className={`flex-1 break-words leading-relaxed ${
                    log.level === 'ERROR' 
                      ? 'text-rose-200 font-semibold' 
                      : log.level === 'HEAL' 
                      ? 'text-emerald-200 font-semibold' 
                      : log.level === 'WARN'
                      ? 'text-amber-200'
                      : 'text-slate-300'
                  }`}>
                    {log.message}
                  </span>

                  {hasContext && (
                    <button
                      onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                      className="text-[10px] text-slate-400 hover:text-slate-200 flex items-center gap-0.5 shrink-0 px-1 py-0.5 bg-slate-800 rounded"
                    >
                      <span>JSON</span>
                      {isExpanded ? <ChevronDown className="w-2.5 h-2.5" /> : <ChevronRight className="w-2.5 h-2.5" />}
                    </button>
                  )}
                </div>

                {/* Expandable JSON Context Viewer */}
                {isExpanded && hasContext && (
                  <div className="mt-2 ml-10 p-2.5 rounded bg-slate-950 border border-slate-800 text-[11px] text-emerald-400 overflow-x-auto">
                    <pre>{JSON.stringify(log.context, null, 2)}</pre>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
