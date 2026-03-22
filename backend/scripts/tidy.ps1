# Tidy Go modules
Write-Host "Tidying Go modules..." -ForegroundColor Cyan
go mod tidy
if ($LASTEXITCODE -ne 0) { Write-Host "go mod tidy failed!" -ForegroundColor Red; exit 1 }
Write-Host "Done." -ForegroundColor Green

