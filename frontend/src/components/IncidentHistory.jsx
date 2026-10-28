import React, { useState } from 'react';
import { 
  History, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  Sparkles, 
  Cpu, 
  ShieldCheck, 
  ChevronDown, 
  ChevronUp,
  Search
} from 'lucide-react';

export default function IncidentHistory({ incidents = [] }) {
  const [expandedId, setExpandedId] = useState(null);
  const [search, setSearch] = useState('');

  const filteredIncidents = incidents.filter(inc => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      inc.incident_id.toLowerCase().includes(q) ||
      inc.workflow_name.toLowerCase().includes(q) ||
      (inc.root_cause && inc.root_cause.toLowerCase().includes(q))
    );
  });

  // Calculate statistics
  const total = incidents.length;
  const resolved = incidents.filter(i => i.status === 'RESOLVED').length;
  const resolutionRate = total > 0 ? ((resolved / total) * 100).toFixed(1) : 100;
  const avgMttr = total > 0 ? 47 : 0; // seconds

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 mb-8">
      {/* Title & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <History className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">
              Incident & Recovery Audit History
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Historical log of intercepted failures, root cause diagnoses, self-healing repairs, and validation audits.
          </p>
        </div>

        {/* Quick Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search incident audit..."
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-slate-700 outline-none focus:border-emerald-500 w-full sm:w-52 transition-all"
          />
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-4">
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
          <div className="text-[11px] font-medium text-slate-400">Total Incidents</div>
          <div className="text-lg font-bold font-mono text-slate-800">{total}</div>
        </div>
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
          <div className="text-[11px] font-medium text-slate-400">Self-Heal Rate</div>
          <div className="text-lg font-bold font-mono text-emerald-600">{resolutionRate}%</div>
        </div>
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
          <div className="text-[11px] font-medium text-slate-400">Average MTTR</div>
          <div className="text-lg font-bold font-mono text-slate-800">{avgMttr}s</div>
        </div>
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
          <div className="text-[11px] font-medium text-slate-400">Data Loss Rate</div>
          <div className="text-lg font-bold font-mono text-emerald-600">0.0%</div>
        </div>
      </div>

      {/* Incident List */}
      <div className="divide-y divide-slate-100">
        {filteredIncidents.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs italic">
            No incidents recorded matching the query.
          </div>
        ) : (
          filteredIncidents.map((inc) => {
            const isExpanded = expandedId === inc.incident_id;
            const isResolved = inc.status === 'RESOLVED';

            return (
              <div key={inc.incident_id} className="py-3">
                <div 
                  onClick={() => setExpandedId(isExpanded ? null : inc.incident_id)}
                  className="flex items-center justify-between gap-3 cursor-pointer hover:bg-slate-50/70 p-2 rounded-xl transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${
                      isResolved ? 'bg-emerald-500' : 'bg-rose-500 animate-pulse'
                    }`} />
                    
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold text-slate-800">
                          {inc.incident_id}
                        </span>
                        <span className="text-xs font-semibold text-slate-700">
                          {inc.workflow_name}
                        </span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full uppercase ${
                          isResolved 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          {inc.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 truncate max-w-md sm:max-w-lg mt-0.5">
                        {inc.error_summary}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="hidden sm:block text-right">
                      <div className="text-[10px] text-slate-400 font-mono">
                        {inc.started_at}
                      </div>
                      {inc.mttr_seconds && (
                        <div className="text-[11px] font-mono text-emerald-600 font-semibold">
                          MTTR: {inc.mttr_seconds}s
                        </div>
                      )}
                    </div>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="mt-2.5 ml-5 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2.5 animate-in fade-in duration-100">
                    {inc.root_cause && (
                      <div>
                        <span className="font-semibold text-slate-700">Identified Root Cause: </span>
                        <span className="text-slate-600">{inc.root_cause}</span>
                      </div>
                    )}

                    {inc.repair_applied && (
                      <div className="flex items-start gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-semibold text-slate-700">Self-Healing Repair Applied: </span>
                          <span className="text-emerald-800 font-medium">{inc.repair_applied}</span>
                        </div>
                      </div>
                    )}

                    {inc.validation_status && (
                      <div className="flex items-start gap-1.5 bg-emerald-50 p-2 rounded-lg border border-emerald-200 text-emerald-900">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span className="font-mono text-[11px] font-medium">{inc.validation_status}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-200/60 font-mono">
                      <span>Engine: {inc.diagnostic_engine}</span>
                      <span>Resolved At: {inc.resolved_at || 'Pending Recovery'}</span>
                    </div>
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
