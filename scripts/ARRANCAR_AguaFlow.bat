@echo off
title 🌊 AguaFlow — Iniciando...
color 09
cls

echo.
echo  █████╗  ██████╗ ██╗   ██╗ █████╗     ███████╗██╗      ██████╗ ██╗    ██╗
echo  ██╔══██╗██╔════╝ ██║   ██║██╔══██╗    ██╔════╝██║     ██╔═══██╗██║    ██║
echo  ███████║██║  ███╗██║   ██║███████║    █████╗  ██║     ██║   ██║██║ █╗ ██║
echo  ██╔══██║██║   ██║██║   ██║██╔══██║    ██╔══╝  ██║     ██║   ██║██║███╗██║
echo  ██║  ██║╚██████╔╝╚██████╔╝██║  ██║    ██║     ███████╗╚██████╔╝╚███╔███╔╝
echo  ╚═╝  ╚═╝ ╚═════╝  ╚═════╝ ╚═╝  ╚═╝    ╚═╝     ╚══════╝ ╚═════╝  ╚══╝╚══╝
echo.
echo  ████████████████████████████████████████████████████████████
echo   AGUA FLOW — Plataforma de Análisis Empresarial Inteligente
echo   A-Agilidad  G-Crecimiento  U-Unidad  A-Adaptabilidad  F-Flujo
echo   by DEVBU93 - rubenrodriguez.f.93@gmail.com
echo  ████████████████████████████████████████████████████████████
echo.

set "PROJECT_DIR=%~dp0"
if exist "%PROJECT_DIR%backend\package.json" (
    set "ROOT=%PROJECT_DIR%"
) else if exist "%PROJECT_DIR%..\backend\package.json" (
    set "ROOT=%PROJECT_DIR%.."
) else (
    echo [ERROR] No se encuentra la carpeta del proyecto AguaFlow.
    pause
    exit /b 1
)

echo  [1/5] Comprobando requisitos...
docker --version >nul 2>&1
if errorlevel 1 (
    echo  [!] Docker no instalado. Descargalo en https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)
node --version >nul 2>&1
if errorlevel 1 (
    echo  [!] Node.js no instalado. Descargalo en https://nodejs.org
    pause
    exit /b 1
)
echo  [OK] Docker y Node.js detectados

echo.
echo  [2/5] Arrancando PostgreSQL para AguaFlow (puerto 5433)...
cd /d "%ROOT%"
docker-compose up -d postgres >nul 2>&1
if errorlevel 1 (
    echo  [!] Error con Docker. Asegurate de que Docker Desktop esta abierto.
    pause
    exit /b 1
)
echo  [OK] PostgreSQL AguaFlow arrancado (puerto 5433)
timeout /t 5 /nobreak >nul

echo.
echo  [3/5] Preparando backend AguaFlow...
cd /d "%ROOT%\backend"
if not exist "node_modules" (
    echo  [..] Instalando dependencias (primera vez, ~2 min)...
    call npm install --silent
)
call npx prisma migrate deploy --schema=prisma/schema.prisma >nul 2>&1
if errorlevel 1 (
    call npx prisma migrate dev --name init --schema=prisma/schema.prisma >nul 2>&1
)
echo  [OK] Backend y base de datos listos

echo.
echo  [4/5] Preparando frontend AguaFlow...
cd /d "%ROOT%\frontend-web"
if not exist "node_modules" (
    echo  [..] Instalando dependencias frontend...
    call npm install --silent
)
echo  [OK] Frontend listo

echo.
echo  [5/5] Arrancando servidores AguaFlow...

start "🌊 AguaFlow — BACKEND (API :3002)" cmd /k "color 01 && echo AGUAFLOW BACKEND && echo Puerto: 3002 && echo Endpoints: POST /api/analysis/start, GET /api/analysis && echo. && cd /d "%ROOT%\backend" && npm run dev"

timeout /t 3 /nobreak >nul

start "🌊 AguaFlow — FRONTEND (Web :5174)" cmd /k "color 03 && echo AGUAFLOW FRONTEND && echo Puerto: 5174 && echo. && cd /d "%ROOT%\frontend-web" && npm run dev -- --port 5174"

echo  [..] Esperando 8 segundos...
timeout /t 8 /nobreak >nul

start "" "http://localhost:5174"

echo.
echo  ████████████████████████████████████████████
echo   ✅ AGUA FLOW ARRANCADO CORRECTAMENTE
echo  ████████████████████████████████████████████
echo.
echo   🌐 Dashboard:  http://localhost:5174
echo   🔌 API REST:   http://localhost:3002
echo   🗄  PostgreSQL: localhost:5433
echo.
echo   📊 Para analizar tu empresa:
echo   1. Abre http://localhost:5174
echo   2. Clic en "Nuevo Analisis"
echo   3. Introduce los tokens de tus herramientas
echo   4. Obtén tu puntuación AGUA FLOW
echo.
timeout /t 10 /nobreak >nul
exit
