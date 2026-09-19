# Refresh alias seduhinkopi.vercel.app ke production deployment terbaru.
# Vercel alias nempel ke deployment ID, bukan hostname, jadi tiap git push / deploy
# mesti dijalankan lagi kalau mau domain ini nyajikan build terbaru.
# Ponytail: sampai Vercel kasih alias yang ngikut production otomatis, ini manual.
$projectId = "prj_wUE5oW8pI1j6KOBIQ8YdDzRBRq8z"
$alias = "seduhinkopi"

$dep = vercel api "/v6/deployments?projectId=$projectId&target=production&limit=1" --raw 2>$null |
    Out-String | ConvertFrom-Json

if (-not $dep.deployments -or $dep.deployments.Count -eq 0) {
    Write-Host "Production deployment tidak ketemu." -ForegroundColor Red
    exit 1
}

$latest = $dep.deployments[0]
if ($latest.readyState -ne "READY") {
    Write-Host "Deployment terbaru state=$($latest.readyState). Tunggu sampai READY." -ForegroundColor Yellow
    exit 1
}

Write-Host "Production terbaru: https://$($latest.url)" -ForegroundColor Gray
vercel alias set "https://$($latest.url)" $alias
Write-Host ""
Write-Host "https://$alias.vercel.app nyajin build terbaru." -ForegroundColor Green
