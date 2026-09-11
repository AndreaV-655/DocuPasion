@echo off
setlocal
chcp 65001 >nul
cd /d "%~dp0"

echo ============================================
echo   DocuPasion - Inicio del servidor
echo ============================================
echo.

where python >nul 2>nul
if errorlevel 1 (
    echo [ERROR] Python no esta instalado o no esta en el PATH.
    echo         Descarga Python 3.11 o superior desde https://python.org
    echo         y marca la casilla "Add Python to PATH" al instalarlo.
    echo.
    pause
    exit /b 1
)

if not exist ".venv" (
    echo [1/3] Creando entorno virtual...
    python -m venv .venv
    if errorlevel 1 (
        echo [ERROR] No se pudo crear el entorno virtual.
        pause
        exit /b 1
    )
)

call ".venv\Scripts\activate.bat"

echo [2/3] Instalando dependencias...
pip install -q -r requirements.txt
if errorlevel 1 (
    echo [ERROR] No se pudieron instalar las dependencias. Revisa tu internet.
    pause
    exit /b 1
)

echo [3/3] Arrancando servidor...
echo.
echo   Aplicacion:  http://localhost:8000
echo   Documentos:  http://localhost:8000/docs
echo   Admin:       admin@docupasion.com   /   Admin123456!
echo.
echo   Pulsa Ctrl+C para detener el servidor.
echo ============================================
echo.

python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

echo.
echo El servidor se detuvo.
pause