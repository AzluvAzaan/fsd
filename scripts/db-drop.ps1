# Drop all tables on Supabase PostgreSQL
Write-Host "Dropping all tables..." -ForegroundColor Cyan
go run ./cmd/migrate -action drop
if ($LASTEXITCODE -ne 0) { Write-Host "Drop failed!" -ForegroundColor Red; exit 1 }
Write-Host "Tables dropped." -ForegroundColor Green

