package user

import "context"

// Repository defines the persistence contract for users.
type Repository interface {
	// FindByID retrieves a user by their internal ID.
	FindByID(ctx context.Context, id string) (*User, error)

	// FindByEmail retrieves a user by their Gmail address.
	FindByEmail(ctx context.Context, email string) (*User, error)

	// Upsert creates or updates a user (used after Google OAuth).
	Upsert(ctx context.Context, u *User) error

	// Delete removes a user from the system.
	Delete(ctx context.Context, id string) error
}
