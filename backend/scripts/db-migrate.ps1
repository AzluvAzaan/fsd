# Run schema migration against Supabase PostgreSQL
Write-Host "Running schema migration..." -ForegroundColor Cyan
go run ./cmd/migrate -action migrate
if ($LASTEXITCODE -ne 0) { Write-Host "Migration failed!" -ForegroundColor Red; exit 1 }
Write-Host "Migration completed." -ForegroundColor Green

