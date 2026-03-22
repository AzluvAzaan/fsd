# Clean build artifacts
Write-Host "Cleaning build artifacts..." -ForegroundColor Cyan
if (Test-Path "build") { Remove-Item -Recurse -Force "build" }
Write-Host "Done." -ForegroundColor Green

