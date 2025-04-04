package cache

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/redis/go-redis/v9"
	"github.com/shimkek/GO-Social-Network/internal/store"
)

type UsersStore struct {
	rdb *redis.Client
}

const UserExpTime = time.Minute

func (s *UsersStore) Get(ctx context.Context, userID int64) (*store.User, error) {

	cacheKey := fmt.Sprintf("user-%v", userID)

	data, err := s.rdb.Get(ctx, cacheKey).Result()
	if err == redis.Nil {
		return nil, nil
	} else if err != nil {
		return nil, err
	}

	if data == "" {
		return nil, nil
	}

	var user store.User
	if err := json.Unmarshal([]byte(data), &user); err != nil {
		return nil, err
	}
	return &user, nil
}

func (s *UsersStore) Set(ctx context.Context, user *store.User) error {

	if user.ID == 0 {
		return fmt.Errorf("no user_id in set user cache")
	}
	cacheKey := fmt.Sprintf("user-%v", user.ID)

	jsonUser, err := json.Marshal(user)
	if err != nil {
		return err
	}

	err = s.rdb.Set(ctx, cacheKey, jsonUser, UserExpTime).Err()
	if err != nil {
		return err
	}

	return nil
}
