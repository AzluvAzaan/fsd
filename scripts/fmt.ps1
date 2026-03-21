# Format all Go files
Write-Host "Formatting Go source files..." -ForegroundColor Cyan
gofmt -s -w .
Write-Host "Done." -ForegroundColor Green

