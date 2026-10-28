# HealFlow AI — Intelligent Self-Healing Automation System

> **Problem Statement: AI Engineering — Intelligent Monitoring**  
> An autonomous workflow reliability engineering platform that monitors pipelines, detects failures, inspects telemetry logs, pinpoints root causes, generates precise corrective patches, and validates post-recovery execution.

---

## 🎯 The Core Differentiator: Complete Closed-Loop Feedback

Traditional monitoring stops at sending an alert or paging an on-call engineer. **HealFlow AI** completes the entire self-healing loop:

```
[ 1. FAILURE ] ──► [ 2. DETECTION ] ──► [ 3. DIAGNOSIS ] ──► [ 4. REPAIR ] ──► [ 5. RETRY ] ──► [ 6. VALIDATION ]
      │                    │                    │                   │                 │                  │
 Exception caught    Telemetry parsed    Gemini 2.5 / Rule   Unified Patch Diff   Idempotent Replay   100% Integrity Confirmed
```

1. **Failure Ingestion:** Catches runtime exceptions, API breaking changes, timeouts, and quota exhaustion.
2. **Telemetry & Log Detection:** Structures stack traces, microsecond timestamps, HTTP codes, and corrupted payload dumps.
3. **AI / Rule Root Cause Diagnosis:** Analyzes system context using Google Gemini 2.5 Flash (or high-precision deterministic fallback engine).
4. **Repair Generation:** Synthesizes unified diffs and non-destructive adaptive schema/rate configurations.
5. **Human-in-the-Loop Safeguard:** Automatically executes benign operational retries while prompting 1-click approvals for risky/schema changes.
6. **Output Validation:** Audits record throughput and error counts before marking the incident as `RESOLVED`.

---

## 📸 UI/UX Design

The interface strictly adopts the user-provided design specifications:
- **Branded Header:** Emerald-hued brand icon, clear typography, and live pulsating `Monitoring active` pill.
- **Hero Command Center:**
  - *"What can I help you fix today?"*
  - 4 Interactive Action Cards:
    1. 🔍 **Investigate a failure** (*Find the root cause of an error*)
    2. 🔧 **Fix a workflow** (*Diagnose, repair, and validate*)
    3. 📄 **Analyze execution logs** (*Understand unexpected behavior*)
    4. 🛡️ **Check workflow health** (*Find issues before they escalate*)
  - **Quick Prompt Input:** Context workflow chip (e.g. `📎 Customer Data Sync`), dark navy submit arrow button, and compliance footnote.
- **Visual Self-Healing Loop:** 6-node state diagram illustrating live progression.
- **Live Pipeline Inspector:** Multi-step pipeline progression, latency tracking, and failure injector.
- **Terminal Log Inspector:** Filterable log streams (`ALL`, `ERROR`, `HEAL`, `WARN`, `INFO`), keyword search, and JSON payload expander.
- **Audit & Recovery Trail:** Historical record of past incidents, MTTR metrics, and resolution logs.
- **Interactive Conversational Engineer:** HealFlow conversational drawer for querying pipeline status.

---

## 🛠️ Technology Stack

- **Frontend:** React 18, Vite, Tailwind CSS, Lucide React Icons
- **Backend:** Python 3.14, FastAPI, Pydantic, Uvicorn
- **AI Diagnostics:** Google Gemini API (`google.genai` SDK) + Deterministic Diagnostic Rule Engine fallback
- **Data Persistence:** In-memory + JSON-backed audit store
- **Architecture:** Unified Single-Port Serving (`http://localhost:8000`) or Decoupled Dev Mode (`:5173` + `:8000`)

---

## 🚀 Quick Start (One-Click Launch)

### Prerequisites
- Node.js & npm (v18+)
- Python (v3.10+)

### 1. Launch the Unified Application
Simply double-click `run.bat` or run:
```bash
run.bat
```
This automatically starts the FastAPI engine and opens `http://localhost:8000` in your default browser.

### 2. (Optional) Configure Gemini API Key
HealFlow works 100% out-of-the-box using built-in deterministic rules. To enable Gemini 2.5 LLM diagnostics:
1. Open `http://localhost:8000`
2. Click the gear icon (⚙️) or engine pill in the top navigation
3. Paste your Gemini API key and click **Save Key**
*(Or set `GEMINI_API_KEY=your_key` in `.env`)*

---

## 🧪 Realistic Scenarios Built-in

| Workflow | Injected Failure | Diagnosed Root Cause | Autonomous Repair Applied |
| :--- | :--- | :--- | :--- |
| **Customer Data Sync** | Schema Drift | Upstream API changed `email_address` to `email` | Dynamic schema field aliasing & adaptive key mapping |
| **Payment Webhook Gateway** | HTTP 429 Rate Limit | Ingestion burst exceeded 50 req/sec quota | Token-bucket throttling (35 req/s) & exponential backoff |
| **Inventory Ledger Pipeline** | Lock Timeout | Concurrent balance lock contention on partition | Row-level partitioned hash lock & lease expansion (7500ms) |
| **Order Dispatcher** | Data Validation | Null `country_code` in international quote | Adaptive postal-prefix country inference heuristic |

---

## 🛡️ Safety & Safeguards
- **Benign Changes (Auto-Pilot):** Backoff multipliers, jitter intervals, rate throttles run automatically.
- **Risky Changes (Human-in-the-Loop):** Schema transformations, field aliases, and timeout expansions generate a visual unified diff requiring one-click confirmation.
