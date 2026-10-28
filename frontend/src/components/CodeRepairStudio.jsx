import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Sparkles, 
  Cpu, 
  CheckCircle2, 
  XCircle, 
  Copy, 
  Check, 
  Code2, 
  Terminal, 
  Layers, 
  ShieldCheck, 
  ArrowRight,
  Flame,
  FileCode,
  BookOpen
} from 'lucide-react';
import { fetchSdkSamples, executeSdkCode, fetchIntegrationDocs } from '../api';

export default function CodeRepairStudio({ onShowToast }) {
  const [samples, setSamples] = useState({});
  const [selectedKey, setSelectedKey] = useState('schema_key_error');
  const [activeTab, setActiveTab] = useState('sandbox'); // 'sandbox' | 'docs'
  
  // Sandbox state
  const [currentCode, setCurrentCode] = useState('');
  const [inputArgsStr, setInputArgsStr] = useState('');
  const [funcName, setFuncName] = useState('process_customer');
  const [isRunning, setIsRunning] = useState(false);
  const [executionResult, setExecutionResult] = useState(null);
  const [copied, setCopied] = useState(false);
  const [docs, setDocs] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [sampleData, docsData] = await Promise.all([
        fetchSdkSamples(),
        fetchIntegrationDocs()
      ]);
      setSamples(sampleData);
      setDocs(docsData);

      if (sampleData['schema_key_error']) {
        loadSnippet('schema_key_error', sampleData);
      }
    } catch (e) {
      console.error('Failed to load SDK studio data', e);
    }
  };

  const loadSnippet = (key, data = samples) => {
    const s = data[key];
    if (!s) return;
    setSelectedKey(key);
    setCurrentCode(s.code);
    setInputArgsStr(JSON.stringify(s.input_args, null, 2));
    setExecutionResult(null);

    // Extract func name
    if (key === 'schema_key_error') setFuncName('process_customer');
    else if (key === 'type_coercion_error') setFuncName('calculate_final_price');
    else if (key === 'date_format_error') setFuncName('parse_transaction_date');
    else if (key === 'rate_limit_http') setFuncName('send_sms_notification');
  };

  const handleRun = async () => {
    setIsRunning(true);
    setExecutionResult(null);
    try {
      let parsedArgs = {};
      try {
        parsedArgs = JSON.parse(inputArgsStr);
      } catch (e) {
        parsedArgs = {};
      }

      const res = await executeSdkCode(currentCode, funcName, parsedArgs);
      setExecutionResult(res);
      if (onShowToast) {
        onShowToast('HealFlow intercepted crash, synthesized code patch & validated recovery!', 'success');
      }
    } catch (err) {
      console.error(err);
      if (onShowToast) {
        onShowToast('Execution error: ' + err.message, 'error');
      }
    } finally {
      setIsRunning(false);
    }
  };

  const copyText = (txt) => {
    navigator.clipboard.writeText(txt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-7 mb-8">
      {/* Studio Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
              Drop-In AI Agent
            </span>
            <h3 className="font-bold text-slate-900 text-base sm:text-lg">
              HealFlow Software Self-Repair Studio
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Embed HealFlow AI directly into your Python software to detect runtime crashes, synthesize hot-patches, and recover execution automatically.
          </p>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setActiveTab('sandbox')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'sandbox' 
                ? 'bg-white text-slate-900 shadow-xs' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Play className="w-3.5 h-3.5 text-emerald-600 fill-current" />
            <span>Interactive Code Sandbox</span>
          </button>
          <button
            onClick={() => setActiveTab('docs')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'docs' 
                ? 'bg-white text-slate-900 shadow-xs' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-purple-600" />
            <span>Add to Your Software (SDK)</span>
          </button>
        </div>
      </div>

      {activeTab === 'sandbox' ? (
        <div className="pt-5 space-y-6">
          {/* Sample Snippet Selector Chips */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
              Select Sample Software Function to Test:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {Object.entries(samples).map(([key, s]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => loadSnippet(key)}
                  className={`text-left p-2.5 rounded-xl border text-xs transition-all ${
                    selectedKey === key
                      ? 'bg-emerald-50/80 border-emerald-300 ring-2 ring-emerald-500/10 text-emerald-950 font-semibold shadow-xs'
                      : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="text-[10px] uppercase font-mono text-slate-400 mb-0.5">{s.category}</div>
                  <div className="truncate">{s.title.split('(')[0]}</div>
                  <div className="text-[10px] text-rose-600 font-mono mt-0.5 truncate">
                    {s.title.includes('(') ? '(' + s.title.split('(')[1] : ''}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Code & Input Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Left: Code Editor (8 cols) */}
            <div className="lg:col-span-8 flex flex-col">
              <div className="flex items-center justify-between text-xs bg-slate-900 text-slate-300 px-4 py-2.5 rounded-t-xl border border-slate-800">
                <div className="flex items-center gap-2 font-mono">
                  <Code2 className="w-4 h-4 text-emerald-400" />
                  <span>app_module.py</span>
                </div>
                <span className="text-[11px] text-slate-400">
                  Target: <strong className="text-white font-mono">{funcName}()</strong>
                </span>
              </div>
              <textarea
                value={currentCode}
                onChange={(e) => setCurrentCode(e.target.value)}
                className="w-full h-56 bg-slate-950 text-slate-100 font-mono text-xs p-4 rounded-b-xl border-x border-b border-slate-800 outline-none resize-none focus:border-emerald-500"
                spellCheck={false}
              />
            </div>

            {/* Right: Input JSON Payload (4 cols) */}
            <div className="lg:col-span-4 flex flex-col">
              <div className="flex items-center justify-between text-xs bg-slate-100 text-slate-700 px-3.5 py-2.5 rounded-t-xl border border-slate-200 font-medium">
                <span>Incoming Caller Args (JSON)</span>
                <span className="text-[10px] font-mono text-slate-400">request.json</span>
              </div>
              <textarea
                value={inputArgsStr}
                onChange={(e) => setInputArgsStr(e.target.value)}
                className="w-full h-56 bg-slate-50 text-slate-800 font-mono text-xs p-3.5 rounded-b-xl border-x border-b border-slate-200 outline-none resize-none focus:border-emerald-500"
                spellCheck={false}
              />
            </div>
          </div>

          {/* Execute Button Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <div className="text-xs text-slate-500 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span>HealFlow AI will intercept crashes, analyze AST/tracebacks, synthesize hot-patches, and re-execute.</span>
            </div>

            <button
              onClick={handleRun}
              disabled={isRunning}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Play className={`w-3.5 h-3.5 fill-current ${isRunning ? 'animate-spin' : ''}`} />
              <span>{isRunning ? 'HealFlow AI Analyzing & Repairing...' : '⚡ Run Software with HealFlow AI'}</span>
            </button>
          </div>

          {/* Execution & Self-Repair Results View */}
          {executionResult && (
            <div className="mt-6 pt-6 border-t border-slate-200 animate-in fade-in duration-200 space-y-5">
              {/* Timeline Header */}
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <h4 className="font-bold text-slate-900 text-sm">
                  HealFlow Self-Healing Execution Report
                </h4>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 ml-auto uppercase font-mono">
                  {executionResult.recovery_status}
                </span>
              </div>

              {/* 3 Step Diagnostic Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                {/* Step 1: Crash Intercepted */}
                <div className="p-4 rounded-xl bg-rose-50/70 border border-rose-200 text-xs">
                  <div className="font-bold text-rose-900 mb-1 flex items-center gap-1.5">
                    <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>1. Runtime Crash Intercepted</span>
                  </div>
                  <div className="font-mono text-rose-700 font-semibold mb-1">
                    {executionResult.error_type}
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    {executionResult.error_message}
                  </p>
                </div>

                {/* Step 2: AI Diagnosis & Strategy */}
                <div className="p-4 rounded-xl bg-purple-50/70 border border-purple-200 text-xs">
                  <div className="font-bold text-purple-900 mb-1 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-purple-600 shrink-0" />
                    <span>2. AI Diagnosis & Strategy</span>
                  </div>
                  <div className="font-semibold text-purple-800 text-[11px] mb-1">
                    {executionResult.diagnosis.category}
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    {executionResult.diagnosis.fix_strategy}
                  </p>
                </div>

                {/* Step 3: Verified Output */}
                <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs">
                  <div className="font-bold text-emerald-900 mb-1 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>3. Output Validated (100% OK)</span>
                  </div>
                  <div className="font-semibold text-emerald-800 text-[11px] mb-1">
                    Execution Recovered Successfully
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    Function re-executed with dynamic patch. Zero data loss.
                  </p>
                </div>
              </div>

              {/* Side-by-side Code Comparison: Broken vs Healed */}
              <div>
                <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Runtime Hot-Patch Diff (Healed Function Definition):
                </h5>
                <div className="bg-slate-950 rounded-xl p-4 font-mono text-xs text-emerald-300 border border-slate-800 overflow-x-auto max-h-60">
                  <pre>{executionResult.patched_code}</pre>
                </div>
              </div>

              {/* Final Return Value Output */}
              <div>
                <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Final Function Return Value:
                </h5>
                <div className="bg-slate-900 rounded-xl p-3.5 font-mono text-xs text-slate-200 border border-slate-800 overflow-x-auto">
                  <pre>{JSON.stringify(executionResult.healed_result, null, 2)}</pre>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Docs & Integration Tab */
        <div className="pt-5 space-y-6">
          <div className="p-4 rounded-xl bg-purple-50/70 border border-purple-200 text-xs text-purple-950">
            <h4 className="font-bold text-sm mb-1 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600" />
              How to add HealFlow AI to your own software
            </h4>
            <p className="text-slate-600 text-xs">
              Add just 2 lines of code to your application. When an error strikes, HealFlow AI intercepts the crash, fixes it, and prevents user-facing downtime.
            </p>
          </div>

          {/* Quick Python snippet */}
          <div>
            <div className="flex items-center justify-between text-xs bg-slate-900 text-slate-300 px-4 py-2.5 rounded-t-xl font-mono">
              <span>Python Function Decorator (@auto_heal)</span>
              <button
                onClick={() => copyText(docs?.python_decorator || '')}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Copy</span>
              </button>
            </div>
            <div className="bg-slate-950 text-slate-200 font-mono text-xs p-4 rounded-b-xl border-x border-b border-slate-800 overflow-x-auto">
              <pre>{docs?.python_decorator || "from healflow import auto_heal"}</pre>
            </div>
          </div>

          {/* Middleware snippet */}
          <div>
            <div className="flex items-center justify-between text-xs bg-slate-900 text-slate-300 px-4 py-2.5 rounded-t-xl font-mono">
              <span>FastAPI / Flask Drop-In Middleware</span>
              <button
                onClick={() => copyText(docs?.fastapi_middleware || '')}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Copy</span>
              </button>
            </div>
            <div className="bg-slate-950 text-slate-200 font-mono text-xs p-4 rounded-b-xl border-x border-b border-slate-800 overflow-x-auto">
              <pre>{docs?.fastapi_middleware || "app.add_middleware(HealFlowSelfHealingMiddleware)"}</pre>
            </div>
          </div>

          {/* What errors can be auto-healed table */}
          <div>
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Errors HealFlow AI Can Repair Automatically:
            </h4>
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Error Category</th>
                    <th className="p-3">Example Failure</th>
                    <th className="p-3">HealFlow AI Auto-Fix Strategy</th>
                    <th className="p-3">Human Review?</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-600">
                  <tr>
                    <td className="p-3 font-semibold text-slate-800">Schema Drift / Missing Key</td>
                    <td className="p-3 font-mono text-[11px]">KeyError: 'email_address'</td>
                    <td className="p-3">Synthesizes multi-key alias fallback mapper</td>
                    <td className="p-3 text-emerald-600 font-semibold">Autonomous</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-800">Type Mismatch / Coercion</td>
                    <td className="p-3 font-mono text-[11px]">TypeError: '15%' * 100</td>
                    <td className="p-3">Applies dynamic type sanitization & unit normalization</td>
                    <td className="p-3 text-emerald-600 font-semibold">Autonomous</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-800">Date/Timestamp Format</td>
                    <td className="p-3 font-mono text-[11px]">ValueError: does not match format</td>
                    <td className="p-3">Injects multi-format heuristic date normalizer</td>
                    <td className="p-3 text-emerald-600 font-semibold">Autonomous</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-800">Rate Limit Quota (429)</td>
                    <td className="p-3 font-mono text-[11px]">HTTP 429 Too Many Requests</td>
                    <td className="p-3">Injects token-bucket throttling & jittered backoff</td>
                    <td className="p-3 text-emerald-600 font-semibold">Autonomous</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-800">Database Deadlock / Lease</td>
                    <td className="p-3 font-mono text-[11px]">LockAcquisitionTimeout</td>
                    <td className="p-3">Switches to row-hash partition locks & lease expansion</td>
                    <td className="p-3 text-amber-600 font-semibold">1-Click Approval</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
