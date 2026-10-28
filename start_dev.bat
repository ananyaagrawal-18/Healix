@echo off
title HealFlow AI - Development Mode
echo Starting HealFlow AI Backend on :8000 and Frontend on :5173 ...

set PYTHON_EXE=C:\Users\HP\AppData\Local\Programs\Python\Python314\python.exe
if not exist "%PYTHON_EXE%" (
    set PYTHON_EXE=python
)

start "HealFlow Backend (:8000)" cmd /k "cd backend && %PYTHON_EXE% -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload"
start "HealFlow Frontend (:5173)" cmd /k "cd frontend && npm run dev"

timeout /t 3
start http://localhost:5173
echo Both servers running!
