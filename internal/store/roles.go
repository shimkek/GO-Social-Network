package store

import (
	"context"
	"database/sql"
)

type Role struct {
	ID          int64  `json:"id"`
	Name        string `json:"name"`
	Level       int    `json:"level"`
	Description string `json:"description"`
}

type RolesStore struct {
	db *sql.DB
}

func (s *RolesStore) GetByName(ctx context.Context, roleName string) (*Role, error) {
	query := `
	SELECT id, name, level, description
	FROM roles
	WHERE name=$1
	`

	ctx, cancel := context.WithTimeout(ctx, QueryTimeoutDuration)
	defer cancel()

	var role Role

	err := s.db.QueryRowContext(
		ctx,
		query,
		roleName,
	).Scan(
		&role.ID,
		&role.Name,
		&role.Level,
		&role.Description)

	if err != nil {
		switch err {
		case sql.ErrNoRows:
			return nil, ErrNotFound
		default:
			return nil, err
		}

	}

	return &role, nil
}

func (s *RolesStore) GetByID(ctx context.Context, roleID int) (*Role, error) {
	query := `
	SELECT id, name, level, description
	FROM roles
	WHERE id = $1
	`

	ctx, cancel := context.WithTimeout(ctx, QueryTimeoutDuration)
	defer cancel()

	var role Role

	err := s.db.QueryRowContext(
		ctx,
		query,
		roleID,
	).Scan(
		&role.ID,
		&role.Name,
		&role.Level,
		&role.Description)

	if err != nil {
		switch err {
		case sql.ErrNoRows:
			return nil, ErrNotFound
		default:
			return nil, err
		}

	}

	return &role, nil
}
