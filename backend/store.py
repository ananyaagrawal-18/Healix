import json
import os
from datetime import datetime
from typing import Dict, List, Optional
from models import Workflow, WorkflowStep, WorkflowRun, Incident, Diagnosis, RepairAction, LogEntry

DATA_FILE = os.path.join(os.path.dirname(__file__), "data_store.json")

INITIAL_WORKFLOWS = [
    {
        "id": "wf-customer-sync",
        "name": "Customer Data Sync",
        "description": "Bi-directional customer profile synchronization between Partner API and Enterprise CRM",
        "status": "healthy",
        "category": "Data Integration",
        "schedule": "Every 5 minutes",
        "health_score": 98,
        "success_rate": 99.1,
        "total_runs": 1248,
        "auto_heal_enabled": True,
        "current_config": {
            "endpoint": "https://api.partner-crm.internal/v2/customers",
            "batch_size": 250,
            "timeout_ms": 5000,
            "schema_version": "2.4",
            "field_mapping": {
                "id": "customer_id",
                "email": "email",
                "first_name": "firstName",
                "last_name": "lastName",
                "postal_code": "zip_code"
            },
            "error_handling": "strict_validation",
            "active_patch": None
        },
        "steps": [
            {"id": "step-1", "name": "Fetch Upstream Records", "status": "idle", "duration_ms": 140},
            {"id": "step-2", "name": "Validate Payload Schema", "status": "idle", "duration_ms": 45},
            {"id": "step-3", "name": "Transform Contact Normalization", "status": "idle", "duration_ms": 82},
            {"id": "step-4", "name": "Upsert Enterprise CRM Records", "status": "idle", "duration_ms": 210}
        ]
    },
    {
        "id": "wf-payment-gateway",
        "name": "Payment Webhook Gateway",
        "description": "Ingests real-time Stripe/Adyen transaction webhooks and dispatches settlement events",
        "status": "healthy",
        "category": "Financial Services",
        "schedule": "Continuous Streaming",
        "health_score": 99,
        "success_rate": 99.8,
        "total_runs": 4820,
        "auto_heal_enabled": True,
        "current_config": {
            "webhook_path": "/webhooks/v1/payments",
            "rate_limit_per_sec": 60,
            "retry_policy": "immediate",
            "backoff_multiplier": 1.0,
            "max_retries": 2,
            "active_patch": None
        },
        "steps": [
            {"id": "step-1", "name": "Verify HMAC Cryptographic Signature", "status": "idle", "duration_ms": 15},
            {"id": "step-2", "name": "Token Rate Limiting Guard", "status": "idle", "duration_ms": 25},
            {"id": "step-3", "name": "Idempotent Transaction Dedup", "status": "idle", "duration_ms": 38},
            {"id": "step-4", "name": "Dispatch Settlement Event", "status": "idle", "duration_ms": 115}
        ]
    },
    {
        "id": "wf-inventory-ledger",
        "name": "Inventory Ledger Pipeline",
        "description": "Multi-region warehouse inventory reconciliation and distributed ledger balancing",
        "status": "healthy",
        "category": "Supply Chain",
        "schedule": "Every 15 minutes",
        "health_score": 95,
        "success_rate": 97.4,
        "total_runs": 892,
        "auto_heal_enabled": True,
        "current_config": {
            "lock_timeout_ms": 3000,
            "lock_mode": "table_level",
            "isolation_level": "SERIALIZABLE",
            "max_concurrency": 16,
            "active_patch": None
        },
        "steps": [
            {"id": "step-1", "name": "Poll Regional Fulfillment Nodes", "status": "idle", "duration_ms": 190},
            {"id": "step-2", "name": "Acquire Distributed Sync Lock", "status": "idle", "duration_ms": 85},
            {"id": "step-3", "name": "Reconcile Stock Delta Quantities", "status": "idle", "duration_ms": 320},
            {"id": "step-4", "name": "Commit Ledger Transaction Block", "status": "idle", "duration_ms": 145}
        ]
    },
    {
        "id": "wf-order-dispatch",
        "name": "Order Fulfillment Dispatcher",
        "description": "Processes ready orders, resolves 3PL carrier rates, and issues dispatch notices",
        "status": "healthy",
        "category": "Logistics",
        "schedule": "Every 2 minutes",
        "health_score": 100,
        "success_rate": 99.5,
        "total_runs": 2150,
        "auto_heal_enabled": True,
        "current_config": {
            "carrier_api": "https://api.logistics-hub.com/v3/quotes",
            "fallback_country": None,
            "strict_geo_validation": True,
            "active_patch": None
        },
        "steps": [
            {"id": "step-1", "name": "Query Ready Order Queue", "status": "idle", "duration_ms": 65},
            {"id": "step-2", "name": "Validate Address & Postal Geo", "status": "idle", "duration_ms": 90},
            {"id": "step-3", "name": "Generate Carrier Routing Label", "status": "idle", "duration_ms": 180},
            {"id": "step-4", "name": "Emit Dispatch Notification Event", "status": "idle", "duration_ms": 70}
        ]
    }
]

INITIAL_INCIDENTS = [
    {
        "incident_id": "INC-8491",
        "workflow_id": "wf-customer-sync",
        "workflow_name": "Customer Data Sync",
        "started_at": "2026-10-28 08:42:15",
        "resolved_at": "2026-10-28 08:43:08",
        "status": "RESOLVED",
        "error_summary": "SchemaValidationError: Missing required attribute 'email_address' in customer payload batch",
        "root_cause": "Upstream partner API updated from v2.3 to v2.4 changing field 'email_address' to 'email'",
        "mttr_seconds": 53,
        "repair_applied": "Dynamic Schema Aliasing: Added backward-compatible fallback field mapper",
        "diagnostic_engine": "AI_GEMINI",
        "validation_status": "VALIDATED: 250/250 records successfully synchronized with 0 errors"
    },
    {
        "incident_id": "INC-8488",
        "workflow_id": "wf-payment-gateway",
        "workflow_name": "Payment Webhook Gateway",
        "started_at": "2026-10-28 06:15:30",
        "resolved_at": "2026-10-28 06:16:12",
        "status": "RESOLVED",
        "error_summary": "HTTP 429 Too Many Requests: Ingestion threshold exceeded (limit=50 req/sec)",
        "root_cause": "Black Friday flash surge generated burst of 78 req/sec exhausting upstream worker pool",
        "mttr_seconds": 42,
        "repair_applied": "Auto-throttling & Exponential Backoff with Jitter (Base: 250ms, Factor: 1.8x)",
        "diagnostic_engine": "RULE_BASED_DETERMINISTIC",
        "validation_status": "VALIDATED: Webhook queue drained smoothly. Zero dropped transactions."
    }
]

class MemoryStore:
    def __init__(self):
        self.workflows: Dict[str, Workflow] = {}
        self.runs: Dict[str, WorkflowRun] = {}
        self.incidents: Dict[str, Incident] = {}
        self.diagnoses: Dict[str, Diagnosis] = {}
        self.active_incident_by_wf: Dict[str, str] = {}
        self.load_initial()

    def load_initial(self):
        for wf_data in INITIAL_WORKFLOWS:
            wf = Workflow(**wf_data)
            self.workflows[wf.id] = wf

        for inc_data in INITIAL_INCIDENTS:
            inc = Incident(**inc_data)
            self.incidents[inc.incident_id] = inc

    def get_all_workflows(self) -> List[Workflow]:
        return list(self.workflows.values())

    def get_workflow(self, wf_id: str) -> Optional[Workflow]:
        return self.workflows.get(wf_id)

    def save_workflow(self, wf: Workflow):
        self.workflows[wf.id] = wf

    def save_run(self, run: WorkflowRun):
        self.runs[run.run_id] = run
        if run.workflow_id in self.workflows:
            self.workflows[run.workflow_id].last_run = run

    def get_run(self, run_id: str) -> Optional[WorkflowRun]:
        return self.runs.get(run_id)

    def get_runs_for_workflow(self, wf_id: str) -> List[WorkflowRun]:
        return [r for r in self.runs.values() if r.workflow_id == wf_id]

    def save_incident(self, incident: Incident):
        self.incidents[incident.incident_id] = incident
        if incident.status in ["OPEN", "DIAGNOSING", "PENDING_APPROVAL", "HEALING"]:
            self.active_incident_by_wf[incident.workflow_id] = incident.incident_id
        elif incident.workflow_id in self.active_incident_by_wf:
            del self.active_incident_by_wf[incident.workflow_id]

        if incident.workflow_id in self.workflows:
            self.workflows[incident.workflow_id].last_incident = incident

    def get_incident(self, incident_id: str) -> Optional[Incident]:
        return self.incidents.get(incident_id)

    def get_active_incident(self, wf_id: str) -> Optional[Incident]:
        inc_id = self.active_incident_by_wf.get(wf_id)
        if inc_id:
            return self.incidents.get(inc_id)
        return None

    def get_all_incidents(self) -> List[Incident]:
        return sorted(list(self.incidents.values()), key=lambda x: x.started_at, reverse=True)

    def save_diagnosis(self, diagnosis: Diagnosis):
        self.diagnoses[diagnosis.run_id] = diagnosis

    def get_diagnosis(self, run_id: str) -> Optional[Diagnosis]:
        return self.diagnoses.get(run_id)

store = MemoryStore()
