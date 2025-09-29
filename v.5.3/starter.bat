@echo off
REM Εκκίνηση τοπικού server με Python (πρέπει να υπάρχει εγκατεστημένος Python)
cd /d "%~dp0"
start "" http://localhost:8080/index.html
python -m http.server 8080
pause
