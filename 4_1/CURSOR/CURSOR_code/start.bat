@echo off
echo CleanBoost 앱을 시작합니다...
echo.

REM 현재 스크립트가 있는 디렉토리로 이동
cd /d "%~dp0"

REM Python이 설치되어 있는지 확인
python --version >nul 2>&1
if errorlevel 1 (
    echo Python이 설치되어 있지 않습니다.
    echo https://python.org에서 Python을 설치해주세요.
    pause
    exit /b 1
)

REM Node.js가 설치되어 있는지 확인
node --version >nul 2>&1
if errorlevel 1 (
    echo Node.js가 설치되어 있지 않습니다.
    echo https://nodejs.org에서 Node.js를 설치해주세요.
    pause
    exit /b 1
)

echo Python과 Node.js가 설치되어 있습니다.
echo.

REM 앱 시작
python start_app.py

pause


