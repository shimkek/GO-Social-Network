-- +goose Up
-- +goose StatementBegin
ALTER TABLE comments
DROP CONSTRAINT fk_user,
ADD CONSTRAINT fk_user
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE comments
DROP CONSTRAINT fk_post,
ADD CONSTRAINT fk_post
FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE;
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
ALTER TABLE comments DROP CONSTRAINT fk_user, ADD CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id);
ALTER TABLE comments DROP CONSTRAINT fk_post, ADD CONSTRAINT fk_post FOREIGN KEY (post_id) REFERENCES posts(id);
-- +goose StatementEnd
