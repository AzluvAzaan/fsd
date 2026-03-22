# Lint (requires golangci-lint: https://golangci-lint.run)
Write-Host "Running linter..." -ForegroundColor Cyan
golangci-lint run ./...
if ($LASTEXITCODE -ne 0) { Write-Host "Lint issues found!" -ForegroundColor Red; exit 1 }
Write-Host "No lint issues." -ForegroundColor Green

