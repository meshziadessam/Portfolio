@echo off
cd /d "%~dp0"
git add .
if errorlevel 1 goto done
git diff --cached --quiet
if errorlevel 1 (
  git diff --cached --stat
  git commit -m "Update portfolio content"
  if errorlevel 1 goto done
)
git push origin main
if errorlevel 1 goto done
echo Uploaded. Follow deployment at https://github.com/meshziadessam/Portfolio/actions
:done
pause
