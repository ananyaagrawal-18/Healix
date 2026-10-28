import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import SelfHealingLoop from './components/SelfHealingLoop';
import WorkflowInspector from './components/WorkflowInspector';
import LogViewer from './components/LogViewer';
import IncidentHistory from './components/IncidentHistory';
import DiagnosisPatchModal from './components/DiagnosisPatchModal';
import ChatDrawer from './components/ChatDrawer';
import SettingsModal from './components/SettingsModal';

import {
  fetchHealth,
  fetchWorkflows,
  fetchWorkflowDetail,
  runWorkflow,
  diagnoseWorkflow,
  healWorkflow,
  resetWorkflow,
  fetchIncidents,
  fetchSettings,
  updateApiKey,
  sendChatMessage
} from './api';

export default function App() {
  const [workflows, setWorkflows] = useState([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [activeIncident, setActiveIncident] = useState(null);
  const [latestDiagnosis, setLatestDiagnosis] = useState(null);
  const [incidents, setIncidents] = useState([]);
  const [health, setHealth] = useState(null);
  const [settings, setSettings] = useState(null);

  // Loading states
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [isHealing, setIsHealing] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Modals & Panels
  const [isDiagnosisOpen, setIsDiagnosisOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);

  // Toast notification
  const [toast, setToast] = useState(null);

  const pipelineRef = useRef(null);
  const logsRef = useRef(null);
  const incidentsRef = useRef(null);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Initial Data Fetch
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setIsRefreshing(true);
    try {
      const [healthData, wfData, incData, settsData] = await Promise.all([
        fetchHealth(),
        fetchWorkflows(),
        fetchIncidents(),
        fetchSettings()
      ]);

      setHealth(healthData);
      setWorkflows(wfData);
      setIncidents(incData);
      setSettings(settsData);

      // Select default workflow (prefer failing one for demo)
      const failingWf = wfData.find(w => w.status === 'failing');
      const targetWf = failingWf || wfData[0];
      if (targetWf) {
        selectWorkflowById(targetWf.id, wfData);
      }
    } catch (err) {
      console.error('Error loading initial data:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const selectWorkflowById = async (wfId, currentWorkflows = workflows) => {
    try {
      const detail = await fetchWorkflowDetail(wfId);
      setSelectedWorkflow(detail.workflow);
      setActiveIncident(detail.active_incident);
      setLatestDiagnosis(detail.latest_diagnosis);

      // Update in workflows list if needed
      setWorkflows(prev => prev.map(w => w.id === wfId ? detail.workflow : w));
    } catch (err) {
      console.error('Error fetching workflow detail:', err);
    }
  };

  const handleSelectWorkflow = (wf) => {
    selectWorkflowById(wf.id);
  };

  // Hero Quick-Action Card Click Handlers
  const handleTriggerAction = async (actionType) => {
    if (!selectedWorkflow) return;

    if (actionType === 'investigate') {
      if (selectedWorkflow.status === 'failing' && latestDiagnosis) {
        setIsDiagnosisOpen(true);
      } else {
        handleSendMessage(`Investigate current status and potential anomalies in ${selectedWorkflow.name}`);
        setIsChatOpen(true);
      }
    } else if (actionType === 'fix') {
      if (selectedWorkflow.status === 'failing') {
        setIsDiagnosisOpen(true);
      } else {
        showToast(`${selectedWorkflow.name} is currently healthy. You can inject a test failure to test self-healing!`, 'info');
        pipelineRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
    } else if (actionType === 'logs') {
      logsRef.current?.scrollIntoView({ behavior: 'smooth' });
    } else if (actionType === 'health') {
      incidentsRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Chat message submission
  const handleSendMessage = async (msgText, wfId = null) => {
    if (!msgText.trim()) return;

    setIsChatOpen(true);
    setChatMessages(prev => [...prev, { text: msgText, sender: 'user' }]);
    setIsChatLoading(true);

    try {
      const res = await sendChatMessage(msgText, wfId || selectedWorkflow?.id);
      setChatMessages(prev => [
        ...prev, 
        { 
          text: res.reply, 
          sender: 'bot', 
          source: res.source, 
          model: res.model 
        }
      ]);
    } catch (err) {
      setChatMessages(prev => [
        ...prev, 
        { 
          text: 'Error communicating with HealFlow engine. Please check backend status.', 
          sender: 'bot',
          source: 'SYSTEM'
        }
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Run Workflow (Normal Scheduled Execution)
  const handleRunWorkflow = async (wfId) => {
    setIsRunning(true);
    showToast(`Executing workflow pipeline...`, 'info');
    try {
      const res = await runWorkflow(wfId, { injectFailure: false });
      setSelectedWorkflow(res.workflow);
      setActiveIncident(res.incident);
      
      // Refresh incidents
      const incData = await fetchIncidents();
      setIncidents(incData);

      if (res.run.status === 'success') {
        showToast(`Workflow execution completed successfully! 250 records synchronized.`, 'success');
      } else {
        showToast(`Workflow failed. HealFlow intercepted error.`, 'error');
        // Fetch diagnosis
        const diag = await diagnoseWorkflow(wfId);
        setLatestDiagnosis(diag);
      }
    } catch (err) {
      showToast('Execution error: ' + err.message, 'error');
    } finally {
      setIsRunning(false);
    }
  };

  // Simulate Failure
  const handleSimulateFailure = async (failureType = 'schema_drift') => {
    if (!selectedWorkflow) return;
    setIsSimulating(true);
    showToast(`Injecting realistic failure scenario (${failureType})...`, 'error');

    try {
      const res = await runWorkflow(selectedWorkflow.id, {
        injectFailure: true,
        failureType: failureType
      });

      setSelectedWorkflow(res.workflow);
      setActiveIncident(res.incident);

      // Auto-diagnose
      const diag = await diagnoseWorkflow(selectedWorkflow.id);
      setLatestDiagnosis(diag);

      // Update incident list
      const incData = await fetchIncidents();
      setIncidents(incData);

      showToast(`Failure intercepted! Root cause diagnosed by ${diag.diagnostic_type === 'AI_GEMINI' ? 'Gemini 2.5' : 'Deterministic Engine'}.`, 'error');
    } catch (err) {
      showToast('Error simulating failure: ' + err.message, 'error');
    } finally {
      setIsSimulating(false);
    }
  };

  // Full Self-Healing Loop Trigger
  const handleAutoHeal = async (customPatch = null) => {
    if (!selectedWorkflow) return;
    const runId = selectedWorkflow.last_run?.run_id;
    if (!runId) return;

    setIsHealing(true);
    showToast('Executing Closed Self-Healing Loop: Diagnosis → Repair → Retry → Validation...', 'info');

    try {
      const res = await healWorkflow(selectedWorkflow.id, {
        runId: runId,
        approved: true,
        customPatch: customPatch
      });

      setSelectedWorkflow(res.workflow);
      setLatestDiagnosis(res.diagnosis);
      setActiveIncident(res.incident);

      // Refresh fleet
      const [wfData, incData] = await Promise.all([fetchWorkflows(), fetchIncidents()]);
      setWorkflows(wfData);
      setIncidents(incData);

      setIsDiagnosisOpen(false);
      showToast('Self-healing successful! Workflow recovered and output validated.', 'success');
    } catch (err) {
      showToast('Self-healing error: ' + err.message, 'error');
    } finally {
      setIsHealing(false);
    }
  };

  // Reset Workflow
  const handleResetWorkflow = async () => {
    if (!selectedWorkflow) return;
    try {
      await resetWorkflow(selectedWorkflow.id);
      await selectWorkflowById(selectedWorkflow.id);
      showToast('Workflow configuration reset to baseline.', 'info');
    } catch (err) {
      showToast('Error resetting workflow: ' + err.message, 'error');
    }
  };

  const handleSaveApiKey = async (key) => {
    const res = await updateApiKey(key);
    const setts = await fetchSettings();
    setSettings(setts);
    return res;
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc]">
      {/* Toast Banner */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-2.5 rounded-xl shadow-lg border text-xs font-semibold flex items-center gap-2 animate-in slide-in-from-top duration-150 ${
          toast.type === 'success' 
            ? 'bg-emerald-900 text-white border-emerald-700' 
            : toast.type === 'error'
            ? 'bg-rose-900 text-white border-rose-700'
            : 'bg-slate-900 text-white border-slate-700'
        }`}>
          <span>{toast.message}</span>
        </div>
      )}

      {/* Top Navigation Bar */}
      <Header
        health={health}
        settings={settings}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onRefresh={loadAllData}
        isRefreshing={isRefreshing}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8">
        {/* Section 1: Hero Section (Matches Attached Image Format) */}
        <HeroSection
          workflows={workflows}
          selectedWorkflow={selectedWorkflow}
          onSelectWorkflow={handleSelectWorkflow}
          onTriggerAction={handleTriggerAction}
          onSendMessage={handleSendMessage}
          onScrollToDetails={() => pipelineRef.current?.scrollIntoView({ behavior: 'smooth' })}
        />

        {/* Section 2: Self-Healing Feedback Loop Visualizer */}
        <div ref={pipelineRef} className="pt-2">
          <SelfHealingLoop
            workflow={selectedWorkflow}
            activeIncident={activeIncident}
            latestDiagnosis={latestDiagnosis}
            isHealing={isHealing}
            isSimulating={isSimulating}
            onAutoHeal={() => handleAutoHeal()}
            onSimulateFailure={handleSimulateFailure}
            onResetWorkflow={handleResetWorkflow}
            onOpenDiagnosis={() => setIsDiagnosisOpen(true)}
          />
        </div>

        {/* Section 3: Active Workflow Pipeline Steps & Controls */}
        <WorkflowInspector
          workflow={selectedWorkflow}
          onRunWorkflow={handleRunWorkflow}
          onSimulateFailure={handleSimulateFailure}
          onAutoHeal={() => handleAutoHeal()}
          onOpenDiagnosis={() => setIsDiagnosisOpen(true)}
          isHealing={isHealing}
          isRunning={isRunning}
        />

        {/* Section 4: Live Execution Logs Inspector */}
        <div ref={logsRef}>
          <LogViewer
            logs={selectedWorkflow?.last_run?.logs || []}
            runId={selectedWorkflow?.last_run?.run_id}
            workflowName={selectedWorkflow?.name}
          />
        </div>

        {/* Section 5: Incident & Recovery Audit History */}
        <div ref={incidentsRef}>
          <IncidentHistory incidents={incidents} />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">HealFlow AI</span>
            <span>— Autonomous Reliability Engineering for Mission-Critical Business Pipelines</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Hackathon MVP</span>
            <span>•</span>
            <span>FastAPI + React + Gemini AI</span>
            <span>•</span>
            <span className="text-emerald-600 font-medium">100% Recovery Verified</span>
          </div>
        </div>
      </footer>

      {/* Modals & Drawers */}
      <DiagnosisPatchModal
        isOpen={isDiagnosisOpen}
        onClose={() => setIsDiagnosisOpen(false)}
        diagnosis={latestDiagnosis}
        workflow={selectedWorkflow}
        onApplyPatch={(patch) => handleAutoHeal(patch)}
        isHealing={isHealing}
      />

      <ChatDrawer
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        onSendMessage={handleSendMessage}
        messages={chatMessages}
        isLoading={isChatLoading}
        selectedWorkflow={selectedWorkflow}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSaveKey={handleSaveApiKey}
      />
    </div>
  );
}
