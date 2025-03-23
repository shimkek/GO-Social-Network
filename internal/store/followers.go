package store

import (
	"context"
	"database/sql"
)

type FollowersStore struct {
	db *sql.DB
}

type Follower struct {
	FollowedID int64  `json:"followed_id"`
	FollowerID int64  `json:"follower_id"`
	CreatedAt  string `json:"created_at"`
}

func (s *FollowersStore) Follow(ctx context.Context, followedID int64, followerID int64) error {
	query := `
	INSERT INTO followers (followed_id, follower_id)
	VALUES ($1, $2)
	ON CONFLICT (followed_id, follower_id) DO NOTHING
	`

	ctx, cancel := context.WithTimeout(ctx, QueryTimeoutDuration)
	defer cancel()

	_, err := s.db.ExecContext(ctx, query, followedID, followerID)
	return err
}

func (s *FollowersStore) Unfollow(ctx context.Context, followedID int64, followerID int64) error {
	query := `
	DELETE FROM followers *
	WHERE followed_id = $1 AND follower_id = $2
	`

	ctx, cancel := context.WithTimeout(ctx, QueryTimeoutDuration)
	defer cancel()

	_, err := s.db.ExecContext(ctx, query, followedID, followerID)
	return err
}
