# Run all tests
Write-Host "Running tests..." -ForegroundColor Cyan
go test ./... -v -count=1
if ($LASTEXITCODE -ne 0) { Write-Host "Tests failed!" -ForegroundColor Red; exit 1 }
Write-Host "All tests passed." -ForegroundColor Green

