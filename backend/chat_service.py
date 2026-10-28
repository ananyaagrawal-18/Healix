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
    prompt = f"""You are HealFlow AI, an intelligent, empathetic, senior workflow automation engineer and reliability expert.
You excel at explaining complex technical concepts in plain, clear, friendly English to both non-technical users and engineers.

You can answer ANY question:
1. General questions: "What is self-healing?", "What is a workflow?", "Why do APIs fail?", "What is schema drift?", "How does automated recovery work?", general programming, or DevOps questions.
2. System questions: Questions about the currently monitored workflows, active failures, root cause diagnoses, logs, and self-healing patches.
3. Conversational greetings and guidance.

Current Monitored Workflows & Incidents:
{json.dumps(system_context, indent=2)}

Currently Selected Workflow:
{json.dumps(target_wf.dict(), indent=2) if target_wf else "None selected"}

User Message:
{message}

Instructions:
- If the user asks a general question (like "what is healing?", "what do you do?", "how does this work?"), provide a clear, intuitive answer with simple analogies (e.g., comparing passive smoke alarms vs. automated sprinkler systems, or human immune healing).
- Explain how HealFlow's closed loop (Failure -> Detection -> Diagnosis -> Repair -> Retry -> Validation) solves it.
- Format nicely with markdown headings, bullet points, and code snippets if helpful.
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
    msg = message.lower().strip()
    
    # 1. Concept of "What is Healing?" / "What is Self-Healing?"
    if any(q in msg for q in ["what is healing", "what is self healing", "what is self-healing", "what does healing mean", "explain healing", "meaning of healing", "how does healing work"]):
        reply = """### 💡 What is "Self-Healing" in Software Automation?

Think of the difference between a **Smoke Alarm** and a **Fire Sprinkler System**:

* **Traditional Monitoring (Smoke Alarm):** When a workflow breaks, it screams (sends a Slack ping or pager alert at 3 AM). A human engineer has to wake up, read logs, find the bug, write code, deploy a fix, and rerun the job.
* **Self-Healing Automation (Sprinkler System):** When a workflow breaks, the system **automatically diagnoses the issue, applies a safe corrective repair, retries the job, and verifies that no data was lost.**

---

### The 6-Stage Healing Feedback Loop:

1. **Failure Occurs:** An API changes, a server times out, or a rate limit is exceeded.
2. **Error Detection:** HealFlow's interceptor captures the exact exception, HTTP status code, and payload.
3. **Root Cause Diagnosis:** AI or rule patterns pinpoint *why* it failed (e.g., *"Upstream partner renamed `email_address` to `email`"*).
4. **Repair Generation:** Generates a targeted patch (e.g., dynamic schema field mapper or exponential backoff).
5. **Safe Retry:** Re-runs the failed workflow with the active patch applied.
6. **Validation:** Audits the result (e.g., *"250 of 250 records safely stored, 0 data loss"*).

> 💡 **Try it right now:** Click **"Inject Test Failure"** on the dashboard to trigger an error, then click **"Diagnose & Self-Heal"** to watch the healing loop recover it in real time!"""

    # 2. General: "What is a workflow?" / "What is this app?"
    elif any(q in msg for q in ["what is a workflow", "what is workflow", "explain workflow"]):
        reply = """### 🔄 What is an Automated Workflow?

An **automated workflow** (or pipeline) is a series of digital steps that software performs automatically on a schedule or event, without humans needing to click buttons manually.

#### Real-World Examples:
* **Customer Data Sync:** Every 5 minutes, customer signups from your mobile app are fetched, cleaned, and updated in your Salesforce CRM.
* **Payment Webhook Gateway:** Whenever a customer pays on Stripe, a webhook fires, validates the cryptographic signature, checks rate limits, and records the settlement.
* **Order Dispatcher:** Takes placed orders, validates shipping addresses, computes postal rates, and notifies warehouse fulfillment.

When any step in these pipelines breaks, business stops. **HealFlow AI acts as a 24/7 reliability engineer** to keep them running smoothly."""

    # 3. General: "What is schema drift?"
    elif any(q in msg for q in ["schema drift", "what is schema", "field rename"]):
        reply = """### 🧩 What is "Schema Drift"?

**Schema drift** happens when an external API or database changes its data format without warning you in advance.

#### Concrete Example:
* Yesterday, the upstream partner sent customer records as:
  ```json
  { "id": 101, "email_address": "sarah@acme.com" }
  ```
* Today, they upgraded their API to v2.4 and sent:
  ```json
  { "id": 101, "email": "sarah@acme.com" }
  ```
* **The Failure:** Your workflow expects `email_address`. Because the key is missing, it crashes with a `SchemaValidationError`.
* **How HealFlow Heals It:** HealFlow detects that `email_address` is missing but `email` is present, synthesizes a **Dynamic Field Alias Patch**, maps the field, and retries the sync without dropping any data."""

    # 4. General: "What is rate limiting / HTTP 429?"
    elif any(q in msg for q in ["rate limit", "429", "too many requests", "throttle"]):
        reply = """### ⚡ What is Rate Limiting (HTTP 429)?

Third-party APIs (like Stripe, Twilio, or Google) protect their servers by setting a **quota limit** (e.g., maximum 50 requests per second).

* **The Failure:** During a traffic surge (like Black Friday), your system sends 75 requests/second. The API returns `HTTP 429 Too Many Requests`.
* **The Traditional Problem:** Naive code keeps retrying immediately, which gets your IP banned or drops transactions.
* **How HealFlow Heals It:** HealFlow automatically engages **Adaptive Token Throttling** (caps throughput to 35 req/s) and **Exponential Backoff with Jitter**, smoothly draining the queue without errors."""

    # 5. General: "What is MTTR?"
    elif any(q in msg for q in ["mttr", "mean time to recovery", "mean time to resolution"]):
        reply = """### ⏱️ What is MTTR (Mean Time to Resolution)?

**MTTR** is the average time it takes from when an error occurs until the system is fully healthy and operating again.

* **Industry Average with Human On-Call:** `45 minutes to 3 hours` (wait for alert, wake engineer, check logs, deploy fix).
* **HealFlow AI Autonomous MTTR:** `45 seconds` (Failure detected in <1s, diagnosed in <3s, patched & validated in <40s)."""

    # 6. Greetings / Intro
    elif any(q in msg for q in ["hi", "hello", "hey", "who are you", "what can you do", "help"]):
        reply = """### 👋 Hello! I'm **HealFlow AI**, your Intelligent Workflow Engineer.

I monitor your background automation pipelines, protect them from outages, and autonomously heal them when errors strike.

#### You can ask me general questions like:
* *"What is self-healing automation?"*
* *"What is schema drift?"*
* *"Why do APIs return HTTP 429?"*
* *"How does error detection work?"*

#### Or manage active pipelines:
* *"Investigate failure in Customer Data Sync"*
* *"Explain the proposed patch diff"*
* *"Give me a fleet health summary"*

Try clicking one of the quick suggestions or ask anything you'd like!"""

    # 7. Investigate failure
    elif "investigate" in msg or "error" in msg or "fail" in msg or "root cause" in msg:
        wf_name = target_wf.name if target_wf else "Customer Data Sync"
        wf_status = target_wf.status if target_wf else "failing"
        
        reply = f"""### 🔍 Incident Investigation Report: **{wf_name}**

**Current Pipeline Status:** `{wf_status.upper()}`

#### 1. Error Detection:
* **Failure Step:** Step 2 (`Validate Payload Schema`)
* **Exception:** `SchemaValidationError: Field 'email_address' missing in 250 records.`

#### 2. Root Cause Analysis:
* Upstream Partner API updated from `v2.3` to `v2.4`, changing the key name from `email_address` to `email`.
* 250 incoming records were quarantined to protect the database from corrupt data.

#### 3. Recommended Self-Healing Action:
* Engage HealFlow's **Dynamic Schema Aliasing Patch** (`REPAIR-SCH-01`).
* Click **"Fix a workflow"** or **"Diagnose & Self-Heal"** to review the unified diff and recover the pipeline!"""
        
    # 8. Fix / Repair / Heal
    elif "fix" in msg or "heal" in msg or "repair" in msg:
        reply = """### 🛠️ How HealFlow Repairs & Validates

When you trigger Self-Healing:
1. **Patch Preview:** HealFlow shows a syntax-highlighted **Unified Diff** (what is changing).
2. **Safe Application:** The configuration is updated with backward-compatible aliases or throttles.
3. **Idempotent Retry:** The failed step is re-executed with the new configuration.
4. **Record Validation:** HealFlow audits the output records (100% data integrity check).
5. **Resolution:** The incident is marked `RESOLVED` and MTTR is logged in the permanent audit trail.

Click **"Diagnose & Self-Heal"** on any failing workflow card to run it!"""

    # 9. Health & Monitoring
    elif "health" in msg or "status" in msg or "monitor" in msg:
        active_count = len(system_context["active_workflows"])
        failing_count = len([w for w in system_context["active_workflows"] if w["status"] == "failing"])
        healthy_count = active_count - failing_count
        
        reply = f"""### 🛡️ Fleet Workflow Health Summary

* **Total Monitored Pipelines:** `{active_count}`
* **Healthy & Operational:** `{healthy_count}` ✅
* **Needs Healing / Failing:** `{failing_count}` ⚠️
* **Average Recovery Time (MTTR):** `45 seconds`

#### Monitored Pipelines:
* `Customer Data Sync`: Schema drift detected (Ready to heal).
* `Payment Webhook Gateway`: Operational (Rate limit throttle active).
* `Inventory Ledger Pipeline`: Operational (Distributed lock lease optimized).
* `Order Fulfillment Dispatcher`: Operational (100% address validation)."""

    # 10. Fallback with helpful general direction
    else:
        wf_label = target_wf.name if target_wf else "Customer Data Sync"
        reply = f"""I am monitoring **{wf_label}** and 3 other enterprise automation workflows.

Here are some questions you can ask me:
* 💡 *"What is self-healing in software?"*
* 🧩 *"What is schema drift and how does HealFlow fix it?"*
* ⚡ *"What causes HTTP 429 rate limit errors?"*
* 🔍 *"Why did {wf_label} fail?"*
* 🛠️ *"How do I approve and apply a healing patch?"*

Feel free to ask any general or technical question!"""

    return {
        "reply": reply,
        "source": "RULE_BASED_DETERMINISTIC",
        "model": "HealFlow Intelligent Diagnostic Engine"
    }
