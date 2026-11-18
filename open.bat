@echo off
cd /d "%~dp0"
powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "$secret = Read-Host 'Editor password (at least 10 characters)' -AsSecureString; $env:PORTFOLIO_ADMIN_PASSWORD = [System.Net.NetworkCredential]::new('', $secret).Password; if ($env:PORTFOLIO_ADMIN_PASSWORD.Length -lt 10) { Write-Error 'Password must contain at least 10 characters'; exit 1 }; npx.cmd --yes pnpm@11.25.0 admin; exit $LASTEXITCODE"
pause
