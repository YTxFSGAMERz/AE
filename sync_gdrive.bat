@echo off
setlocal
title AE Google Drive Sync Engine
cd /d "%~dp0"

echo =================================================================
echo  AE REPOSITORY - GOOGLE DRIVE SYNC ENGINE
echo  Target: My Drive ^> AE (18jb20pW3S-KNLwWrvanW9UChR7b9WCg_)
echo =================================================================
echo.

set "PYTHON_EXEC=C:\Python315\python.exe"
if not exist "%PYTHON_EXEC%" (
    set "PYTHON_EXEC=python"
)

if "%~1"=="" (
    "%PYTHON_EXEC%" scripts\studio\gdrive_sync.py --git
) else (
    if "%~1"=="--no-pause" (
        "%PYTHON_EXEC%" scripts\studio\gdrive_sync.py --git
    ) else (
        "%PYTHON_EXEC%" scripts\studio\gdrive_sync.py %*
    )
)

echo.
echo =================================================================
echo  Sync process finished.
echo =================================================================
echo.

if not "%~1"=="--no-pause" (
    pause
)
