-- +goose Up
-- +goose StatementBegin
CREATE TABLE IF NOT EXISTS user_invitations (
    token bytea PRIMARY KEY,
    user_id bigint NOT NULL
);

ALTER TABLE users 
ADD COLUMN
    is_active BOOLEAN NOT NULL DEFAULT FALSE;

-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS user_invitations;
ALTER TABLE users DROP COLUMN is_active;
-- +goose StatementEnd
