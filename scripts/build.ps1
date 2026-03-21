# Build the FSD binary
Write-Host "Building fsd..." -ForegroundColor Cyan
if (-not (Test-Path "build")) { New-Item -ItemType Directory -Path "build" | Out-Null }
go build -o build/fsd ./cmd/app
if ($LASTEXITCODE -ne 0) { Write-Host "Build failed!" -ForegroundColor Red; exit 1 }
Write-Host "Done." -ForegroundColor Green

