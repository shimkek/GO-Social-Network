-- +goose Up
-- +goose StatementBegin
ALTER TABLE user_invitations
ADD CONSTRAINT fk_user_invitations_user
FOREIGN KEY (user_id) REFERENCES users(id)
ON DELETE CASCADE;
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
ALTER TABLE user_invitations
DROP CONSTRAINT fk_user_invitations_user;
-- +goose StatementEnd
