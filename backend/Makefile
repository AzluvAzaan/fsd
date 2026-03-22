.PHONY: build run test clean fmt lint

# ============================================================
# FSD — Free Slot Detector
# ============================================================

APP_NAME   := fsd
BUILD_DIR  := ./build
MAIN_PATH  := ./cmd/app

# Build the binary
build:
	@echo "Building $(APP_NAME)..."
	@mkdir -p $(BUILD_DIR)
	go build -o $(BUILD_DIR)/$(APP_NAME) $(MAIN_PATH)

# Run the application (loads .env automatically if you use direnv or similar)
run:
	go run $(MAIN_PATH)

# Run all tests
test:
	go test ./... -v -count=1

# Format all Go files
fmt:
	gofmt -s -w .

# Lint (requires golangci-lint: https://golangci-lint.run)
lint:
	golangci-lint run ./...

# Clean build artifacts
clean:
	rm -rf $(BUILD_DIR)

# Tidy Go modules
tidy:
	go mod tidy

# ---- Database (reads DB_* vars from .env) ----

# Run schema migration (creates all tables)
db-migrate:
	@echo "Running schema migration..."
	go run ./cmd/migrate -action migrate

# Tear down schema (drops all tables)
db-drop:
	@echo "Dropping all tables..."
	go run ./cmd/migrate -action drop

# Seed sample data
db-seed:
	@echo "Seeding sample data..."
	go run ./cmd/migrate -action seed

# Full reset: drop → migrate → seed
db-reset:
	@echo "Resetting database..."
	go run ./cmd/migrate -action reset

