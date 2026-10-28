import time
import uuid
from datetime import datetime
from typing import Dict, Any, Optional, Tuple, List
from models import Workflow, WorkflowRun, WorkflowStep, LogEntry, Incident, Diagnosis
from store import store
from diagnostics import diagnose_run

def now_str() -> str:
    return datetime.now().strftime("%Y-%m-%d %H:%M:%S")

def run_workflow_simulation(workflow_id: str, inject_failure: bool = False, failure_type: Optional[str] = None) -> WorkflowRun:
    wf = store.get_workflow(workflow_id)
    if not wf:
        raise ValueError(f"Workflow '{workflow_id}' not found")

    run_id = f"RUN-{datetime.now().strftime('%m%d')}-{uuid.uuid4().hex[:6].upper()}"
    logs: List[LogEntry] = []
    steps_state: List[WorkflowStep] = []
    
    # Check if workflow has an active patch
    active_patch = wf.current_config.get("active_patch")
    has_active_patch = active_patch is not None

    # Determine if this run will fail
    # If explicit inject_failure is requested, it fails.
    # If not requested, but there's an existing open failure without a patch, it continues failing.
    will_fail = inject_failure or (wf.status == "failing" and not has_active_patch)

    logs.append(LogEntry(
        timestamp=now_str(),
        level="INFO",
        step="Lifecycle",
        message=f"Starting scheduled execution of workflow '{wf.name}' [RunID: {run_id}]",
        context={"config": wf.current_config, "environment": "production"}
    ))

    # Determine failure scenario details based on workflow ID or custom failure_type
    f_type = failure_type
    if not f_type:
        if "customer-sync" in workflow_id:
            f_type = "schema_drift"
        elif "payment-gateway" in workflow_id:
            f_type = "rate_limit"
        elif "inventory-ledger" in workflow_id:
            f_type = "timeout"
        else:
            f_type = "data_error"

    start_time = time.time()
    failed_at_step_idx = 1  # 0-indexed step 1 (2nd step)

    if will_fail:
        # Step 0: Initial fetch/poll succeeds
        step0 = wf.steps[0]
        logs.append(LogEntry(
            timestamp=now_str(),
            level="INFO",
            step=step0.name,
            message=f"Connecting to ingress source. Successfully acquired upstream batch.",
            context={"records_received": 250, "batch_id": f"BAT-{uuid.uuid4().hex[:4].upper()}"}
        ))
        steps_state.append(WorkflowStep(id=step0.id, name=step0.name, status="success", duration_ms=step0.duration_ms))

        # Step 1: Fails with realistic error
        step1 = wf.steps[1]
        error_details = {}
        if f_type == "schema_drift":
            error_details = {
                "type": "SchemaValidationError",
                "message": "Field 'email_address' missing in 250 records. Found unexpected key 'email'.",
                "schema_version_received": "v2.4",
                "schema_version_expected": "v2.3"
            }
            logs.append(LogEntry(
                timestamp=now_str(),
                level="WARN",
                step=step1.name,
                message="Incoming JSON structure differs from schema definition v2.3.",
                context={"detected_keys": ["id", "email", "first_name", "last_name", "postal_code"]}
            ))
            logs.append(LogEntry(
                timestamp=now_str(),
                level="ERROR",
                step=step1.name,
                message="SchemaValidationError: Required property 'email_address' not found in payload at item[0].email_address",
                context=error_details
            ))
            logs.append(LogEntry(
                timestamp=now_str(),
                level="ERROR",
                step="Lifecycle",
                message="Workflow execution aborted at step 2. Pipeline health flagged as FAILING.",
                context={"exit_code": 1}
            ))

        elif f_type == "rate_limit":
            error_details = {
                "type": "HTTP 429 Too Many Requests",
                "message": "Upstream settlement API threshold exceeded (rate_limit: 50/sec, actual: 74/sec)",
                "retry_after_sec": 4
            }
            logs.append(LogEntry(
                timestamp=now_str(),
                level="WARN",
                step=step1.name,
                message="High traffic surge detected on ingestion stream.",
                context={"concurrency_in_flight": 74}
            ))
            logs.append(LogEntry(
                timestamp=now_str(),
                level="ERROR",
                step=step1.name,
                message="HTTPClientError: 429 Too Many Requests - Rate limit exceeded on target gateway.",
                context=error_details
            ))
            logs.append(LogEntry(
                timestamp=now_str(),
                level="ERROR",
                step="Lifecycle",
                message="Immediate retry failed. Webhook processing halted to prevent throttling penalty.",
                context={"exit_code": 429}
            ))

        elif f_type == "timeout":
            error_details = {
                "type": "LockAcquisitionTimeoutError",
                "message": "Distributed lock lease timed out after 3000ms. Circular wait detected on partition #04.",
                "lock_resource": "tbl_warehouse_inventory_ledger"
            }
            logs.append(LogEntry(
                timestamp=now_str(),
                level="WARN",
                step=step1.name,
                message="Lock contention high: waiting for mutex on regional cluster US-EAST-1.",
                context={"wait_time_ms": 3000}
            ))
            logs.append(LogEntry(
                timestamp=now_str(),
                level="ERROR",
                step=step1.name,
                message="LockAcquisitionTimeoutError: Could not acquire distributed sync lock within SLA limit of 3000ms.",
                context=error_details
            ))
            logs.append(LogEntry(
                timestamp=now_str(),
                level="ERROR",
                step="Lifecycle",
                message="Transaction rolled back to prevent partial stock state divergence.",
                context={"exit_code": 110}
            ))

        else:
            error_details = {
                "type": "DataValidationError",
                "message": "Null country_code passed into ISO-3166 shipping rate engine.",
                "bad_record_id": "ORD-99120"
            }
            logs.append(LogEntry(
                timestamp=now_str(),
                level="ERROR",
                step=step1.name,
                message="DataValidationError: Null country_code violates non-null constraint in rate calculation.",
                context=error_details
            ))
            logs.append(LogEntry(
                timestamp=now_str(),
                level="ERROR",
                step="Lifecycle",
                message="Order fulfillment aborted. Dispatch payload marked quarantined.",
                context={"exit_code": 2}
            ))

        steps_state.append(WorkflowStep(
            id=step1.id,
            name=step1.name,
            status="failed",
            duration_ms=step1.duration_ms + 120,
            error_message=error_details["message"]
        ))

        # Remaining steps aborted
        for step in wf.steps[2:]:
            steps_state.append(WorkflowStep(id=step.id, name=step.name, status="idle", duration_ms=0))

        run_status = "failed"
        wf.status = "failing"
        wf.health_score = max(35, wf.health_score - 25)

        # Create or update incident
        incident_id = f"INC-{uuid.uuid4().hex[:4].upper()}"
        incident = Incident(
            incident_id=incident_id,
            workflow_id=wf.id,
            workflow_name=wf.name,
            started_at=now_str(),
            status="OPEN",
            error_summary=error_details.get("message", "Workflow step execution failed"),
            run_id=run_id
        )
        store.save_incident(incident)

    else:
        # Success or Healed Execution
        is_healed = has_active_patch
        for i, step in enumerate(wf.steps):
            if is_healed and i == 1:
                logs.append(LogEntry(
                    timestamp=now_str(),
                    level="HEAL",
                    step=step.name,
                    message=f"Self-Healing active patch engaged: {active_patch.get('title', 'Applied Repair')}",
                    context={"patch_config": wf.current_config}
                ))
            
            logs.append(LogEntry(
                timestamp=now_str(),
                level="INFO",
                step=step.name,
                message=f"Step '{step.name}' completed without anomalies.",
                context={"records_processed": 250, "latency_ms": step.duration_ms}
            ))
            steps_state.append(WorkflowStep(
                id=step.id,
                name=step.name,
                status="healed" if is_healed else "success",
                duration_ms=step.duration_ms
            ))

        output_data = {
            "records_processed": 250,
            "validation_checks_passed": 12,
            "data_loss_count": 0,
            "target_state": "SYNCHRONIZED_OK",
            "healed_with_patch": active_patch.get("action_id") if is_healed else None
        }

        logs.append(LogEntry(
            timestamp=now_str(),
            level="INFO",
            step="Lifecycle",
            message=f"Workflow run completed successfully. 250/250 records synced. Status: {'RECOVERED' if is_healed else 'HEALTHY'}",
            context=output_data
        ))

        run_status = "healed" if is_healed else "success"
        wf.status = "healthy"
        wf.health_score = 100
        error_details = None

    elapsed_ms = int((time.time() - start_time) * 1000)
    wf.total_runs += 1

    run = WorkflowRun(
        run_id=run_id,
        workflow_id=wf.id,
        timestamp=now_str(),
        status=run_status,
        steps=steps_state,
        logs=logs,
        error_details=error_details,
        output_data=output_data if run_status in ["success", "healed"] else None,
        execution_time_ms=elapsed_ms
    )

    wf.last_run = run
    store.save_workflow(wf)
    store.save_run(run)

    return run

def apply_healing_action(workflow_id: str, run_id: str, approved: bool = True, custom_patch: Optional[Dict[str, Any]] = None) -> Tuple[WorkflowRun, Diagnosis, Incident]:
    """
    Applies the corrective repair action, retries the workflow, and validates recovery.
    Implements: FAILURE -> DETECTION -> DIAGNOSIS -> REPAIR -> RETRY -> VALIDATION
    """
    wf = store.get_workflow(workflow_id)
    if not wf:
        raise ValueError(f"Workflow '{workflow_id}' not found")
        
    last_run = store.get_run(run_id)
    if not last_run:
        # Fallback to wf.last_run
        last_run = wf.last_run
        
    if not last_run:
        raise ValueError("No prior run found to heal")

    # 1. Diagnose if not already diagnosed
    diagnosis = store.get_diagnosis(last_run.run_id)
    if not diagnosis:
        diagnosis = diagnose_run(last_run, wf)
        store.save_diagnosis(diagnosis)

    incident = store.get_active_incident(wf.id)
    if not incident:
        # Create incident reference if needed
        incident = Incident(
            incident_id=f"INC-{uuid.uuid4().hex[:4].upper()}",
            workflow_id=wf.id,
            workflow_name=wf.name,
            started_at=last_run.timestamp,
            status="HEALING",
            error_summary=diagnosis.root_cause,
            run_id=last_run.run_id
        )

    incident.status = "HEALING"
    incident.root_cause = diagnosis.root_cause
    incident.diagnostic_engine = diagnosis.diagnostic_type
    incident.repair_applied = diagnosis.recommended_repair.title

    # 2. Apply Repair to Workflow Configuration
    patch = custom_patch if custom_patch else diagnosis.recommended_repair.patch_config
    wf.current_config.update(patch)
    wf.current_config["active_patch"] = {
        "action_id": diagnosis.recommended_repair.action_id,
        "title": diagnosis.recommended_repair.title,
        "applied_at": now_str(),
        "patch_config": patch
    }
    wf.status = "healing"
    store.save_workflow(wf)

    # 3. Retry Workflow Execution with patched config
    retry_run = run_workflow_simulation(wf.id, inject_failure=False)

    # 4. Validate output
    if retry_run.status in ["success", "healed"]:
        incident.status = "RESOLVED"
        incident.resolved_at = now_str()
        incident.mttr_seconds = 45  # simulated MTTR
        incident.validation_status = "VALIDATED: 250/250 records successfully synchronized. 0 errors detected. Full recovery confirmed."
        wf.status = "healthy"
        wf.health_score = 100
    else:
        incident.status = "FAILED"
        incident.validation_status = "VALIDATION_FAILED: Retried run also failed."

    store.save_incident(incident)
    store.save_workflow(wf)

    return retry_run, diagnosis, incident
