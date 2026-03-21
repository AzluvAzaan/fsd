# Run the FSD application
Write-Host "Starting fsd..." -ForegroundColor Cyan
go run ./cmd/app
if ($LASTEXITCODE -ne 0) { Write-Host "Run failed!" -ForegroundColor Red; exit 1 }

