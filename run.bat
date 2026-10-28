@echo off
title HealFlow AI - Intelligent Self-Healing Automation Platform
echo ========================================================
echo       HealFlow AI - Intelligent Workflow Engineer
echo ========================================================
echo.
echo Starting HealFlow AI Unified Platform at http://localhost:8000 ...
echo.

set PYTHON_EXE=C:\Users\HP\AppData\Local\Programs\Python\Python314\python.exe
if not exist "%PYTHON_EXE%" (
    set PYTHON_EXE=python
)

cd backend
start http://localhost:8000
"%PYTHON_EXE%" -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
pause
