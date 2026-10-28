from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime

class LogEntry(BaseModel):
    timestamp: str
    level: str  # INFO, WARN, ERROR, DEBUG, HEAL
    step: str
    message: str
    context: Optional[Dict[str, Any]] = None

class WorkflowStep(BaseModel):
    id: str
    name: str
    status: str = "idle"  # idle, running, success, failed, healed
    duration_ms: int = 0
    error_message: Optional[str] = None

class WorkflowRun(BaseModel):
    run_id: str
    workflow_id: str
    timestamp: str
    status: str  # success, failed, healed
    trigger: str = "manual"  # manual, scheduled, webhook, retry
    steps: List[WorkflowStep] = []
    logs: List[LogEntry] = []
    error_details: Optional[Dict[str, Any]] = None
    output_data: Optional[Dict[str, Any]] = None
    execution_time_ms: int = 0

class RepairAction(BaseModel):
    action_id: str
    title: str
    description: str
    repair_type: str  # SCHEMA_PATCH, RATE_LIMIT_BACKOFF, TOKEN_REFRESH, TIMEOUT_EXPANSION, FALLBACK_SANITIZER
    requires_approval: bool = False
    patch_diff: str
    patch_config: Dict[str, Any]

class Diagnosis(BaseModel):
    run_id: str
    workflow_id: str
    root_cause: str
    error_category: str  # SCHEMA_DRIFT, RATE_LIMIT_429, AUTH_EXPIRED, TIMEOUT_DEADLOCK, DATA_VALIDATION_ERROR
    confidence: float
    diagnostic_type: str  # AI_GEMINI, RULE_BASED_DETERMINISTIC
    model_name: Optional[str] = None
    explanation: str
    affected_step: str
    recommended_repair: RepairAction

class Incident(BaseModel):
    incident_id: str
    workflow_id: str
    workflow_name: str
    started_at: str
    resolved_at: Optional[str] = None
    status: str  # OPEN, DIAGNOSING, PENDING_APPROVAL, HEALING, RESOLVED, FAILED
    error_summary: str
    root_cause: Optional[str] = None
    mttr_seconds: Optional[int] = None
    repair_applied: Optional[str] = None
    diagnostic_engine: str = "RULE_BASED_DETERMINISTIC"
    validation_status: Optional[str] = None
    run_id: Optional[str] = None

class Workflow(BaseModel):
    id: str
    name: str
    description: str
    status: str = "healthy"  # healthy, failing, healing, warning
    category: str
    schedule: str
    health_score: int = 100
    success_rate: float = 98.5
    total_runs: int = 142
    auto_heal_enabled: bool = True
    steps: List[WorkflowStep]
    current_config: Dict[str, Any]
    last_run: Optional[WorkflowRun] = None
    last_incident: Optional[Incident] = None

class RunWorkflowRequest(BaseModel):
    inject_failure: bool = False
    failure_type: Optional[str] = None  # schema_drift, rate_limit, auth_expired, timeout, data_error

class HealWorkflowRequest(BaseModel):
    run_id: str
    approved: bool = True
    custom_patch: Optional[Dict[str, Any]] = None

class ChatRequest(BaseModel):
    message: str
    workflow_id: Optional[str] = None
    history: Optional[List[Dict[str, str]]] = []
