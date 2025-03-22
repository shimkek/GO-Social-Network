package store

import (
	"context"
	"database/sql"
)

type FollowersStore struct {
	db *sql.DB
}

type Follower struct {
	UserID     int64  `json:"user_id"`
	FollowerID int64  `json:"follower_id"`
	CreatedAt  string `json:"created_at"`
}

func (s *FollowersStore) Follow(ctx context.Context, userID int64, followerID int64) error {
	query := `
	INSERT INTO followers (user_id, follower_id)
	VALUES ($1, $2)
	ON CONFLICT (user_id, follower_id) DO NOTHING
	`

	ctx, cancel := context.WithTimeout(ctx, QueryTimeoutDuration)
	defer cancel()

	_, err := s.db.ExecContext(ctx, query, userID, followerID)
	return err
}

func (s *FollowersStore) Unfollow(ctx context.Context, userID int64, followerID int64) error {
	query := `
	DELETE FROM followers *
	WHERE user_id = $1 AND follower_id = $2
	`

	ctx, cancel := context.WithTimeout(ctx, QueryTimeoutDuration)
	defer cancel()

	_, err := s.db.ExecContext(ctx, query, userID, followerID)
	return err
}
