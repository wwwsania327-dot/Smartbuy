@echo off
echo Starting SmartBuy...

echo Starting Backend Server...
start cmd /k "cd /d c:\Users\Acer\OneDrive\Desktop\SmartBuy\backend && node server.js"

echo Starting Frontend Server...
start cmd /k "cd /d c:\Users\Acer\OneDrive\Desktop\SmartBuy\frontend && npm run dev"

echo Both servers are starting up. 
echo Frontend will be available at http://localhost:3000
echo Backend API will be available at http://localhost:5000
