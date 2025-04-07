package cache

import (
	"context"

	"github.com/shimkek/GO-Social-Network/internal/store"
	"github.com/stretchr/testify/mock"
)

func NewMockStore() Storage {
	return Storage{
		Users: &MockUsersStore{},
	}
}

type MockUsersStore struct {
	mock.Mock
}

func (m *MockUsersStore) Get(ctx context.Context, userID int64) (*store.User, error) {
	args := m.Called(userID)
	return nil, args.Error(1)
}

func (m *MockUsersStore) Set(ctx context.Context, user *store.User) error {
	args := m.Called(user)
	return args.Error(0)
}
