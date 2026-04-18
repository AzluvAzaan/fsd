package main

import (
	"context"
	"database/sql"
	"flag"
	"fmt"
	"log"
	"net/url"
	"os"
	"path/filepath"
	"sort"
	"time"

	"github.com/fsd-group/fsd/internal/infrastructure/persistence"
	"github.com/fsd-group/fsd/pkg/utils"
)

// buildDatabaseURL constructs a connection string from DB_* env vars,
// falling back to DATABASE_URL if DB_HOST is not set.
func buildDatabaseURL() string {
	if dbURL := os.Getenv("DATABASE_URL"); dbURL != "" {
		return dbURL
	}

	host := os.Getenv("DB_HOST")
	if host == "" {
		return ""
	}
	port := os.Getenv("DB_PORT")
	if port == "" {
		port = "6543"
	}
	user := os.Getenv("DB_USER")
	if user == "" {
		user = "postgres"
	}
	pass := os.Getenv("DB_PASSWORD")
	name := os.Getenv("DB_NAME")
	if name == "" {
		name = "postgres"
	}
	sslMode := os.Getenv("DB_SSLMODE")
	if sslMode == "" {
		sslMode = "require"
	}

	u := &url.URL{
		Scheme:   "postgresql",
		User:     url.UserPassword(user, pass),
		Host:     fmt.Sprintf("%s:%s", host, port),
		Path:     name,
		RawQuery: fmt.Sprintf("sslmode=%s", sslMode),
	}
	return u.String()
}

func main() {
	action := flag.String("action", "migrate", "Action to perform: migrate, seed, drop, reset")
	flag.Parse()

	// Load .env file from project root
	if err := utils.LoadEnvFile(".env"); err != nil {
		log.Printf("warning: could not load .env file: %v", err)
	}

	dbURL := buildDatabaseURL()
	if dbURL == "" {
		log.Fatal("Database not configured. Set DATABASE_URL or DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME in your .env file.")
	}

	db, err := persistence.NewPostgresDBNoMigrate(dbURL)
	if err != nil {
		log.Fatalf("failed to connect to db: %v", err)
	}
	defer db.Close()

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	fmt.Println("✓ Connected to PostgreSQL")

	switch *action {
	case "migrate":
		runMigrations(ctx, db)
	case "seed":
		runSQL(ctx, db, "migrations/002_seed_data.sql", "Seed data")
	case "drop":
		runSQL(ctx, db, "migrations/001_initial_schema.down.sql", "Drop tables")
	case "reset":
		runSQL(ctx, db, "migrations/001_initial_schema.down.sql", "Drop tables")
		runMigrations(ctx, db)
		runSQL(ctx, db, "migrations/002_seed_data.sql", "Seed data")
	default:
		log.Fatalf("unknown action: %s (use: migrate, seed, drop, reset)", *action)
	}
}

// runMigrations applies all *.up.sql files in migrations/ in alphabetical order,
// skipping the seed file (002_seed_data.sql).
func runMigrations(ctx context.Context, db *sql.DB) {
	files, err := filepath.Glob("migrations/*.up.sql")
	if err != nil {
		log.Fatalf("failed to list migration files: %v", err)
	}
	sort.Strings(files)

	for _, f := range files {
		runSQL(ctx, db, f, filepath.Base(f))
	}
}

func runSQL(ctx context.Context, db *sql.DB, path, label string) {
	data, err := os.ReadFile(path)
	if err != nil {
		log.Fatalf("failed to read %s: %v", path, err)
	}
	if _, err := db.ExecContext(ctx, string(data)); err != nil {
		log.Fatalf("failed to execute %s: %v", label, err)
	}
	fmt.Printf("✓ %s completed (%s)\n", label, path)
}
