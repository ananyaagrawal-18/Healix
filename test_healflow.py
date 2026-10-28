import sys
import os
import json

# Ensure UTF-8 output on Windows consoles
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')


# Add backend directory to sys.path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "backend"))

from engine import run_workflow_simulation, apply_healing_action
from store import store
from diagnostics import diagnose_run
from chat_service import handle_chat_message

def run_tests():
    print("=" * 60)
    print("HEALFLOW AI — END-TO-END VERIFICATION TEST SUITE")
    print("=" * 60)

    # 1. Check Initial Workflows
    workflows = store.get_all_workflows()
    assert len(workflows) == 4, f"Expected 4 workflows, found {len(workflows)}"
    print(f"✅ [1/7] Store initialized with {len(workflows)} workflows.")

    # 2. Test Workflow Failure Injection & Error Detection (Steps 1 & 2)
    wf_id = "wf-customer-sync"
    failed_run = run_workflow_simulation(wf_id, inject_failure=True, failure_type="schema_drift")
    assert failed_run.status == "failed", "Run should have failed"
    failed_step = next(s for s in failed_run.steps if s.status == "failed")
    assert failed_step.id == "step-2", "Step 2 should have failed"
    print(f"✅ [2/7] Failure detection validated: Step '{failed_step.name}' failed with {failed_run.error_details['type']}.")

    # 3. Test Log Collection and Inspection (Step 3)
    error_logs = [l for l in failed_run.logs if l.level == "ERROR"]
    assert len(error_logs) >= 2, "Expected at least 2 error logs"
    print(f"✅ [3/7] Log inspection validated: Captured {len(failed_run.logs)} logs ({len(error_logs)} ERROR traces).")

    # 4. Test Root Cause Diagnosis & Corrective Action Generation (Steps 4 & 5)
    wf = store.get_workflow(wf_id)
    diagnosis = diagnose_run(failed_run, wf)
    assert diagnosis.error_category == "SCHEMA_DRIFT", f"Expected SCHEMA_DRIFT, got {diagnosis.error_category}"
    assert diagnosis.confidence >= 0.9, "Expected confidence >= 0.9"
    assert diagnosis.recommended_repair is not None, "Repair action must be generated"
    print(f"✅ [4/7] Root cause isolated: {diagnosis.root_cause}")
    print(f"       Engine: {diagnosis.diagnostic_type} (Confidence: {diagnosis.confidence * 100:.0f}%)")
    print(f"       Repair Action: {diagnosis.recommended_repair.title}")

    # 5. Test Repair Application, Safe Retry, and Output Validation (Steps 6, 7, 8, 9)
    retry_run, healed_diag, incident = apply_healing_action(wf_id, failed_run.run_id)
    assert retry_run.status == "healed", f"Expected healed run, got {retry_run.status}"
    assert incident.status == "RESOLVED", f"Incident must be RESOLVED, got {incident.status}"
    assert "VALIDATED" in incident.validation_status, "Post-recovery validation required"
    assert retry_run.output_data["records_processed"] == 250, "All 250 records must be processed"
    print(f"✅ [5/7] Complete self-healing feedback loop validated:")
    print(f"       Retry Status: {retry_run.status.upper()}")
    print(f"       Incident Status: {incident.status}")
    print(f"       Audit Validation: {incident.validation_status}")

    # 6. Test All Other Anomaly Scenarios (Rate Limit, Timeout, Data Validation)
    scenarios = [
        ("wf-payment-gateway", "rate_limit", "RATE_LIMIT_429"),
        ("wf-inventory-ledger", "timeout", "TIMEOUT_DEADLOCK"),
        ("wf-order-dispatch", "data_error", "DATA_VALIDATION_ERROR")
    ]
    for w_id, f_type, expected_cat in scenarios:
        r_fail = run_workflow_simulation(w_id, inject_failure=True, failure_type=f_type)
        w_obj = store.get_workflow(w_id)
        d_obj = diagnose_run(r_fail, w_obj)
        assert d_obj.error_category == expected_cat, f"Expected {expected_cat}, got {d_obj.error_category}"
        r_retry, _, inc_res = apply_healing_action(w_id, r_fail.run_id)
        assert r_retry.status == "healed", f"{w_id} healing failed"
    print(f"✅ [6/7] Multi-scenario fleet testing passed: Rate Limit (429), Lock Timeout, Data Sanitizer.")

    # 7. Test Conversational Assistant (Chat)
    chat_resp = handle_chat_message("Investigate Customer Data Sync failure", workflow_id="wf-customer-sync")
    assert "reply" in chat_resp and len(chat_resp["reply"]) > 50, "Chat reply should be detailed"
    print(f"✅ [7/7] Conversational AI Workflow Engineer validated (Source: {chat_resp['source']}).")

    print("\n" + "=" * 60)
    print("ALL TESTS PASSED! 100% RECOVERY AND VALIDATION CONFIRMED.")
    print("=" * 60)

if __name__ == "__main__":
    run_tests()
