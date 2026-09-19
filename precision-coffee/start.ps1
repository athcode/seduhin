$root = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "========================================" -ForegroundColor Cyan
Write-Host " Seduhin v2.11" -ForegroundColor Yellow
Write-Host " 12 Brewing Methods | Localhost Edition" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$backendDir = Join-Path $root "backend"
$frontendDir = Join-Path $root "frontend"

Write-Host "[1/2] Starting Backend (FastAPI)..." -ForegroundColor Green
$pyProc = Start-Process -FilePath "python" `
    -ArgumentList "main.py" `
    -WorkingDirectory $backendDir `
    -PassThru `
    -WindowStyle Normal
Write-Host "       PID: $($pyProc.Id) | http://127.0.0.1:8000" -ForegroundColor Gray
Write-Host "       Endpoints: /api/health /api/presets /api/taste-match /api/recipe /api/feedback" -ForegroundColor Gray

Write-Host "[2/2] Starting Frontend (Vite + React)..." -ForegroundColor Green
$viteBin = Join-Path $frontendDir "node_modules\.bin\vite.cmd"
$feProc = Start-Process -FilePath "cmd.exe" `
    -ArgumentList "/c", "`"$viteBin`" --host 127.0.0.1 --port 5173" `
    -WorkingDirectory $frontendDir `
    -PassThru `
    -WindowStyle Normal
Write-Host "       PID: $($feProc.Id) | http://localhost:5173" -ForegroundColor Gray

Start-Sleep -Seconds 4

try {
    Invoke-WebRequest -Uri "http://127.0.0.1:8000/api/health" -TimeoutSec 5 -UseBasicParsing | Out-Null
    Write-Host ""
    Write-Host " Backend:  ONLINE" -ForegroundColor Green
} catch {
    Write-Host " Backend:  STARTING (wait few more seconds)" -ForegroundColor Yellow
}

try {
    Invoke-WebRequest -Uri "http://127.0.0.1:5173" -TimeoutSec 5 -UseBasicParsing | Out-Null
    Write-Host " Frontend: ONLINE" -ForegroundColor Green
} catch {
    Write-Host " Frontend: STARTING (wait few more seconds)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " Opening browser..." -ForegroundColor White
Start-Process "http://localhost:5173"
Write-Host ""
Write-Host " Press Ctrl+C to STOP all servers" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan

$cleanup = {
    Write-Host "`nShutting down..." -ForegroundColor Red
    # uvicorn --reload spawn child reloader: kill process tree, bukan parent saja
    foreach ($p in @($pyProc, $feProc)) {
        if ($p -and !$p.HasExited) {
            try { taskkill /F /T /PID $p.Id | Out-Null } catch { }
            Write-Host " Stopped PID $($p.Id)" -ForegroundColor Gray
        }
    }
    Write-Host "Done." -ForegroundColor Green
}

try {
    while ($true) {
        if ($pyProc.HasExited -or $feProc.HasExited) {
            Write-Host "A server process exited." -ForegroundColor Red
            & $cleanup
            break
        }
        Start-Sleep -Seconds 2
    }
} finally {
    & $cleanup
}