import os
from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from typing import Optional, Dict, Any, List
from dotenv import load_dotenv

# Load .env file
load_dotenv()

from models import (
    Workflow, WorkflowRun, Incident, Diagnosis, 
    RunWorkflowRequest, HealWorkflowRequest, ChatRequest
)
from store import store
from engine import run_workflow_simulation, apply_healing_action
from diagnostics import diagnose_run, get_gemini_client
from chat_service import handle_chat_message

app = FastAPI(
    title="HealFlow AI - Intelligent Self-Healing Automation API",
    version="1.0.0",
    description="Backend engine for HealFlow AI intelligent monitoring and automated self-healing."
)

# CORS middleware for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_event():
    # Initialize one simulated run for the initial workflows so UI has immediate rich data
    customer_wf = store.get_workflow("wf-customer-sync")
    if customer_wf and not customer_wf.last_run:
        # Generate an initial failed run for demo purposes so user can immediately investigate and heal!
        run_workflow_simulation("wf-customer-sync", inject_failure=True, failure_type="schema_drift")
    
    # Also run success runs for others
    for wf_id in ["wf-payment-gateway", "wf-inventory-ledger", "wf-order-dispatch"]:
        wf = store.get_workflow(wf_id)
        if wf and not wf.last_run:
            run_workflow_simulation(wf_id, inject_failure=False)

@app.get("/api/health")
def get_health():
    api_key_configured = bool(os.getenv("GEMINI_API_KEY"))
    return {
        "status": "healthy",
        "monitoring": "active",
        "gemini_api_configured": api_key_configured,
        "ai_engine": "Gemini 2.5 Flash" if api_key_configured else "Deterministic Diagnostic Rule Engine",
        "active_workflows": len(store.get_all_workflows()),
        "open_incidents": len([i for i in store.get_all_incidents() if i.status in ["OPEN", "DIAGNOSING", "HEALING"]])
    }

@app.get("/api/settings")
def get_settings():
    api_key = os.getenv("GEMINI_API_KEY", "")
    masked_key = f"{api_key[:6]}...{api_key[-4:]}" if len(api_key) > 10 else ("Configured" if api_key else "Not Configured")
    return {
        "gemini_api_configured": bool(api_key),
        "masked_key": masked_key,
        "ai_provider": "Google Gemini" if api_key else "Deterministic Rule Engine (Fallback)",
        "auto_pilot_default": True
    }

@app.post("/api/settings/key")
def update_api_key(payload: Dict[str, str] = Body(...)):
    new_key = payload.get("api_key", "").strip()
    if new_key:
        os.environ["GEMINI_API_KEY"] = new_key
        return {"success": True, "message": "Gemini API Key updated successfully"}
    return {"success": False, "message": "No key provided"}

@app.get("/api/workflows")
def list_workflows():
    return store.get_all_workflows()

@app.get("/api/workflows/{workflow_id}")
def get_workflow_detail(workflow_id: str):
    wf = store.get_workflow(workflow_id)
    if not wf:
        raise HTTPException(status_code=404, detail=f"Workflow '{workflow_id}' not found")
    
    # Attach diagnosis if last run failed
    diagnosis = None
    if wf.last_run and wf.last_run.status == "failed":
        diagnosis = store.get_diagnosis(wf.last_run.run_id)
        if not diagnosis:
            diagnosis = diagnose_run(wf.last_run, wf)
            store.save_diagnosis(diagnosis)

    return {
        "workflow": wf,
        "active_incident": store.get_active_incident(wf.id),
        "latest_diagnosis": diagnosis
    }

@app.post("/api/workflows/{workflow_id}/run")
def run_workflow(workflow_id: str, req: RunWorkflowRequest = Body(default=RunWorkflowRequest())):
    try:
        run = run_workflow_simulation(
            workflow_id=workflow_id,
            inject_failure=req.inject_failure,
            failure_type=req.failure_type
        )
        wf = store.get_workflow(workflow_id)
        return {
            "run": run,
            "workflow": wf,
            "incident": store.get_active_incident(workflow_id)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/workflows/{workflow_id}/diagnose")
def trigger_diagnosis(workflow_id: str):
    wf = store.get_workflow(workflow_id)
    if not wf or not wf.last_run:
        raise HTTPException(status_code=400, detail="Workflow has no recent run to diagnose")
    
    diagnosis = diagnose_run(wf.last_run, wf)
    store.save_diagnosis(diagnosis)
    return diagnosis

@app.post("/api/workflows/{workflow_id}/heal")
def heal_workflow(workflow_id: str, req: HealWorkflowRequest = Body(...)):
    try:
        retry_run, diagnosis, incident = apply_healing_action(
            workflow_id=workflow_id,
            run_id=req.run_id,
            approved=req.approved,
            custom_patch=req.custom_patch
        )
        wf = store.get_workflow(workflow_id)
        return {
            "success": retry_run.status in ["success", "healed"],
            "workflow": wf,
            "retry_run": retry_run,
            "diagnosis": diagnosis,
            "incident": incident
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/workflows/{workflow_id}/reset")
def reset_workflow(workflow_id: str):
    """Resets workflow back to clean configuration and removes active patches"""
    wf = store.get_workflow(workflow_id)
    if not wf:
        raise HTTPException(status_code=404, detail="Workflow not found")
    
    wf.current_config["active_patch"] = None
    wf.status = "healthy"
    wf.health_score = 100
    for s in wf.steps:
        s.status = "idle"
        s.error_message = None
    
    store.save_workflow(wf)
    return {"success": True, "workflow": wf}

@app.get("/api/incidents")
def list_incidents():
    return store.get_all_incidents()

@app.get("/api/runs/{run_id}")
def get_run(run_id: str):
    run = store.get_run(run_id)
    if not run:
        raise HTTPException(status_code=404, detail="Run not found")
    return run

@app.post("/api/chat")
def chat(req: ChatRequest = Body(...)):
    result = handle_chat_message(
        message=req.message,
        workflow_id=req.workflow_id,
        history=req.history
    )
    return result

# Serve Frontend SPA static assets if built
frontend_dist = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend", "dist"))
if os.path.exists(frontend_dist):
    assets_dir = os.path.join(frontend_dist, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/{full_path:path}")
    def serve_spa(full_path: str):
        # Don't intercept API routes
        if full_path.startswith("api"):
            raise HTTPException(status_code=404, detail="API route not found")
        file_path = os.path.join(frontend_dist, full_path)
        if os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(frontend_dist, "index.html"))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
