import os
import json
from typing import List, Dict, Optional
from store import store
from diagnostics import get_gemini_client

def handle_chat_message(message: str, workflow_id: Optional[str] = None, history: Optional[List[Dict[str, str]]] = None) -> Dict[str, str]:
    workflows = store.get_all_workflows()
    incidents = store.get_all_incidents()
    target_wf = store.get_workflow(workflow_id) if workflow_id else None
    
    # Gather system context
    system_context = {
        "active_workflows": [
            {
                "id": w.id,
                "name": w.name,
                "status": w.status,
                "health_score": w.health_score,
                "last_run_status": w.last_run.status if w.last_run else "no_runs",
                "active_patch": w.current_config.get("active_patch")
            }
            for w in workflows
        ],
        "recent_incidents": [
            {
                "id": inc.incident_id,
                "workflow": inc.workflow_name,
                "status": inc.status,
                "root_cause": inc.root_cause,
                "repair": inc.repair_applied
            }
            for inc in incidents[:4]
        ]
    }
    
    client = get_gemini_client()
    if client:
        try:
            return _chat_with_gemini(client, message, target_wf, system_context, history)
        except Exception as e:
            print(f"Gemini chat failed ({e}), falling back to deterministic engineer.")
            return _chat_deterministic(message, target_wf, system_context)
    else:
        return _chat_deterministic(message, target_wf, system_context)

def _chat_with_gemini(client, message: str, target_wf, system_context: dict, history: Optional[List[Dict[str, str]]]) -> Dict[str, str]:
    prompt = f"""You are HealFlow AI, an intelligent, senior workflow automation engineer and incident responder.
You speak clearly, professionally, and concisely.

Current System Context:
{json.dumps(system_context, indent=2)}

Target Workflow Selected by User:
{json.dumps(target_wf.dict(), indent=2) if target_wf else "None specifically selected"}

User Question/Prompt:
{message}

Answer the user directly and helpfully. If they ask to investigate, explain the root cause and how HealFlow's self-healing loop resolves it.
Highlight that risky changes require approval while standard healing can be auto-piloted.
Keep the answer formatted nicely with markdown bullet points and code blocks if appropriate.
"""
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt
    )
    return {
        "reply": response.text.strip(),
        "source": "AI_GEMINI",
        "model": "Gemini 2.5 Flash"
    }

def _chat_deterministic(message: str, target_wf, system_context: dict) -> Dict[str, str]:
    msg = message.lower()
    
    if "investigate" in msg or "error" in msg or "fail" in msg or "root cause" in msg:
        wf_name = target_wf.name if target_wf else "Customer Data Sync"
        wf_status = target_wf.status if target_wf else "failing"
        
        reply = f"""### 🔍 Incident Investigation Report: **{wf_name}**

**Current Status:** `{wf_status.upper()}`

#### Key Findings:
1. **Root Cause Identified:** Payload schema drift detected between upstream Partner API (v2.4) and Enterprise CRM schema definition (v2.3).
2. **Failure Point:** Step 2 (`Validate Payload Schema`). The upstream payload renamed required field `email_address` to `email`.
3. **Blast Radius:** 250 records quarantined to prevent downstream CRM database pollution.

#### Recommended Action:
- Engage HealFlow's **Dynamic Schema Aliasing Patch** (`REPAIR-SCH-01`).
- This adds backward-compatible alias mappings (`email -> email_address`) and enables adaptive payload tolerance.
- Click **"Fix a workflow"** or use the **"Auto-Heal"** button to execute repair, retry the run, and validate output records."""
        
    elif "fix" in msg or "heal" in msg or "repair" in msg:
        reply = """### 🛠️ HealFlow Self-Healing Action Engine

HealFlow executes an automated 6-stage closed loop:
1. **Failure Ingestion:** Real-time log capture & exception parsing.
2. **Root Cause Isolation:** Differentiating schema drift, rate-limits, deadlocks, and bad data.
3. **Patch Generation:** Generating exact config diffs or transformer rules.
4. **Human-in-the-Loop Safeguard:** Flagging schema/breaking edits for 1-click human approval.
5. **Safe Retry:** Executing idempotent replay with exponential backoff.
6. **Output Validation:** Confirming 100% record integrity before closing the incident.

You can click **"Fix a workflow"** on any active failure card to review the proposed patch diff and apply it immediately!"""

    elif "health" in msg or "status" in msg or "monitor" in msg:
        active_count = len(system_context["active_workflows"])
        failing_count = len([w for w in system_context["active_workflows"] if w["status"] == "failing"])
        healthy_count = active_count - failing_count
        
        reply = f"""### 🛡️ Fleet Workflow Health Summary

- **Total Monitored Workflows:** `{active_count}`
- **Healthy:** `{healthy_count}` ✅
- **Under Investigation / Failing:** `{failing_count}` ⚠️
- **Average MTTR:** `47 seconds` (Self-healing enabled)

**Active Monitoring Status:**
- `Customer Data Sync`: Schema drift anomaly detected (Ready to Heal).
- `Payment Webhook Gateway`: Operational (Rate limit throttle active).
- `Inventory Ledger Pipeline`: Healthy (Distributed lock lease optimized).
- `Order Fulfillment Dispatcher`: Operational (100% address validation)."""

    elif "log" in msg or "trace" in msg:
        reply = """### 📄 Execution Logs Intelligence

HealFlow continuously inspects structured pipeline logs across all stages:
- **Level filtering:** `INFO`, `WARN`, `ERROR`, `HEAL`
- **Context Extraction:** JSON payloads, HTTP headers, retry latency, and database lock leases
- **Anomaly Correlation:** Grouping correlated error cascades into a single root cause incident

Select **"Analyze execution logs"** from the top dashboard to inspect real-time log traces with full syntax highlighting."""

    else:
        wf_label = target_wf.name if target_wf else "Customer Data Sync"
        reply = f"""I am actively monitoring **{wf_label}** and 3 other enterprise automation workflows.

Here is what I can do for you right now:
- 🔍 **Investigate a failure:** Pinpoint why a step broke and inspect stack traces.
- 🔧 **Fix a workflow:** Review unified diff patches and trigger self-healing retry.
- 📄 **Analyze execution logs:** Inspect live timestamps, error codes, and payload dumps.
- 🛡️ **Check workflow health:** View uptime metrics, SLA health scores, and MTTR records.

Try clicking any action card above or ask me: *"Why did Customer Data Sync fail?"*"""

    return {
        "reply": reply,
        "source": "RULE_BASED_DETERMINISTIC",
        "model": "HealFlow Intelligent Diagnostic Engine"
    }
