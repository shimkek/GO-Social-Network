-- +goose Up
-- +goose StatementBegin
ALTER TABLE followers DROP CONSTRAINT followers_pkey;
ALTER TABLE followers DROP CONSTRAINT followers_user_id_fkey;

ALTER TABLE followers RENAME COLUMN user_id TO followed_id;

ALTER TABLE followers 
ADD PRIMARY KEY (followed_id, follower_id);

ALTER TABLE followers 
ADD CONSTRAINT followers_followed_id_fkey 
FOREIGN KEY (followed_id) REFERENCES users(id) ON DELETE CASCADE;
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
ALTER TABLE followers DROP CONSTRAINT followers_pkey;
ALTER TABLE followers DROP CONSTRAINT followers_followed_id_fkey;

ALTER TABLE followers RENAME COLUMN followed_id TO user_id;

ALTER TABLE followers 
ADD PRIMARY KEY (user_id, follower_id);

ALTER TABLE followers 
ADD CONSTRAINT followers_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
-- +goose StatementEnd