# Seed sample data into Supabase PostgreSQL
Write-Host "Seeding sample data..." -ForegroundColor Cyan
go run ./cmd/migrate -action seed
if ($LASTEXITCODE -ne 0) { Write-Host "Seeding failed!" -ForegroundColor Red; exit 1 }
Write-Host "Seeding completed." -ForegroundColor Green

