-- +goose Up
-- +goose StatementBegin
ALTER TABLE comments ADD CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id);
ALTER TABLE comments ADD CONSTRAINT fk_post FOREIGN KEY (post_id) REFERENCES posts(id);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
ALTER TABLE comments
DROP CONSTRAINT fk_user;
ALTER TABLE comments
DROP CONSTRAINT fk_post;
-- +goose StatementEnd
