-- +goose Up
-- +goose StatementBegin
ALTER TABLE user_invitations
ADD COLUMN 
expiration TIMESTAMP(0) WITH TIME ZONE NOT NULL;
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
ALTER TABLE user_invitations
DROP COLUMN 
expiration;
-- +goose StatementEnd
