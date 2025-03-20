-- +goose Up
-- +goose StatementBegin
ALTER TABLE posts ADD version int DEFAULT 0;
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
ALTER TABLE POSTS DROP version;
-- +goose StatementEnd
