# Full reset: drop → migrate → seed on Supabase PostgreSQL
Write-Host "Resetting database (drop → migrate → seed)..." -ForegroundColor Cyan
go run ./cmd/migrate -action reset
if ($LASTEXITCODE -ne 0) { Write-Host "Reset failed!" -ForegroundColor Red; exit 1 }
Write-Host "Database reset completed." -ForegroundColor Green

