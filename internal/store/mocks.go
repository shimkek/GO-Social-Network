package store

import (
	"context"
	"database/sql"
	"time"
)

func NewMockStore() Storage {
	return Storage{
		Users: &MockUsersStore{},
	}
}

type MockUsersStore struct{}

func (m *MockUsersStore) Create(ctx context.Context, tx *sql.Tx, u *User) error {
	return nil
}

func (m *MockUsersStore) GetByID(context.Context, int64) (*User, error) {
	return &User{}, nil
}
func (m *MockUsersStore) GetByEmail(context.Context, string) (*User, error) {
	return &User{}, nil
}
func (m *MockUsersStore) CreateAndInvite(ctx context.Context, user *User, token string, invitationExp time.Duration) error {
	return nil
}
func (m *MockUsersStore) Activate(ctx context.Context, token string) error {
	return nil
}
func (m *MockUsersStore) Delete(ctx context.Context, userID int64) error {
	return nil
}
