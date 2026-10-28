"""
Healix — Autonomous AI Engineering & Self-Healing SDK for Python Applications

Problem Statement: AI Engineering — Intelligent Monitoring
Author: Ananya Agrawal & Healix Team

Usage:
    from healix import auto_heal

    @auto_heal
    def process_customer(payload):
        # Even if payload schema drifts from 'email_address' to 'email',
        # Healix intercepts the KeyError, synthesizes an adaptive alias patch,
        # re-executes the function, and returns verified valid output.
        return {"id": payload["id"], "email": payload["email_address"]}
"""

import os
import sys
import inspect
from functools import wraps

# Ensure backend directory is in path for module imports
BACKEND_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "backend")
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

try:
    from sdk import auto_heal_agent, HealixAutoHealAgent
except ImportError:
    try:
        from backend.sdk import auto_heal_agent, HealixAutoHealAgent
    except ImportError:
        auto_heal_agent = None
        HealixAutoHealAgent = None


def auto_heal(func):
    """
    Decorator that attaches autonomous error interception and runtime healing to any Python function.
    
    When an unhandled exception occurs (e.g. KeyError, TypeError, ValueError, HTTP 429):
    1. Intercepts the exception and captures full stack trace & AST source.
    2. Runs AI root cause analysis (Gemini 2.5 Flash / Deterministic Fallback).
    3. Synthesizes an adaptive code patch and hot-swaps execution environment.
    4. Re-executes the function and verifies data integrity.
    5. Returns verified output with zero developer downtime.
    """
    @wraps(func)
    def wrapper(*args, **kwargs):
        try:
            return func(*args, **kwargs)
        except Exception as ex:
            if auto_heal_agent is None:
                raise ex

            try:
                func_name = func.__name__
                try:
                    code = inspect.getsource(func)
                except Exception:
                    code = f"def {func_name}(payload): pass"

                input_args = args[0] if args and isinstance(args[0], dict) else {"args": list(args), "kwargs": kwargs}
                recovery = auto_heal_agent.heal_function_execution(code, func_name, input_args)

                if recovery.get("recovery_status") == "RECOVERED_100_PERCENT":
                    print(f"✅ [Healix SDK] Auto-healed '{func_name}' after {recovery.get('error_type')}: {recovery.get('diagnosis', {}).get('root_cause')}")
                    return recovery.get("healed_result")
            except Exception as inner_ex:
                print(f"⚠️ [Healix SDK] Auto-heal fallback error: {inner_ex}")

            # Re-raise original exception if healing fails
            raise ex

    return wrapper


__all__ = ["auto_heal", "auto_heal_agent", "HealixAutoHealAgent"]
