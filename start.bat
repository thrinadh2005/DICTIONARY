@echo off
echo Starting Dictionary App...

REM Start backend server in background
start cmd /k "cd backend && node server.js"

REM Wait a bit for backend to start
timeout /t 3 /nobreak > nul

REM Start frontend in the same terminal
cd frontend && npm start
