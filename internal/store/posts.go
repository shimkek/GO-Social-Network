package store

import (
	"context"
	"database/sql"
	"errors"
	"time"

	"github.com/lib/pq"
)

type Post struct {
	ID        int64     `json:"id"`
	Content   string    `json:"content"`
	Title     string    `json:"title"`
	UserID    int64     `json:"userid"`
	Tags      []string  `json:"tags"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
	Version   int       `json:"-"`
	Comments  []Comment `json:"comments"`
	User      User      `json:"user"`
}

type PostWithMetadata struct {
	Post         Post
	CommentCount int    `json:"comments_count"`
	Username     string `json:"username"`
}

type PostsStore struct {
	db *sql.DB
}

func (s *PostsStore) GetUserFeed(ctx context.Context, userID int64, fq PaginatedFeedQuery) (*[]PostWithMetadata, error) {
	sinceString := ""
	untilString := ""

	if fq.Since != "" {
		sinceString = "AND (p.created_at>='" + fq.Since + "') "
	}

	if fq.Until != "" {
		untilString = "AND (p.created_at<='" + fq.Until + "') "
	}

	query := `
	SELECT p.id, p.user_id, p.title, p.content, p.created_at, p.updated_at, p.tags, u.username, COUNT(c.id) as comments_count
	FROM posts p
	LEFT JOIN comments c ON p.id = c.post_id
	LEFT JOIN users u on p.user_id = u.id `

	if fq.Following {
		query += `JOIN followers f ON f.followed_id = p.user_id OR p.user_id = $1 `
	}

	query += `WHERE `

	if fq.Following {
		query += `f.follower_id = $1 AND `
	} else {
		// Add a dummy condition that's always true when not following
		// This ensures $1 is used in both branches
		query += `$1 = $1 AND `
	}

	query += `(p.title ILIKE '%' || $4 || '%' OR p.content ILIKE '%' || $4 || '%') AND
		(p.tags @> $5 OR $5 = '{}')` + sinceString + untilString +
		`GROUP BY p.id, u.username
		ORDER BY p.created_at ` + fq.Sort + `, p.id ` + fq.Sort +
		` LIMIT $2 OFFSET $3`
	ctx, cancel := context.WithTimeout(ctx, QueryTimeoutDuration)
	defer cancel()

	rows, err := s.db.QueryContext(
		ctx,
		query,
		userID,
		fq.Limit,
		fq.Offset,
		fq.Search,
		pq.Array(fq.Tags),
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var feed []PostWithMetadata
	for rows.Next() {
		var p PostWithMetadata
		err := rows.Scan(
			&p.Post.ID,
			&p.Post.UserID,
			&p.Post.Title,
			&p.Post.Content,
			&p.Post.CreatedAt,
			&p.Post.UpdatedAt,
			pq.Array(&p.Post.Tags),
			&p.Username,
			&p.CommentCount,
		)
		if err != nil {
			return nil, err
		}
		feed = append(feed, p)
	}

	return &feed, nil
}

func (s *PostsStore) Create(ctx context.Context, post *Post) error {
	query := `
	INSERT INTO posts (content, title, user_id, tags)
	VALUES ($1, $2, $3, $4) RETURNING id, created_at, updated_at`
	ctx, cancel := context.WithTimeout(ctx, QueryTimeoutDuration)
	defer cancel()
	err := s.db.QueryRowContext(
		ctx,
		query,
		post.Content,
		post.Title,
		post.UserID,
		pq.Array(post.Tags),
	).Scan(
		&post.ID,
		&post.CreatedAt,
		&post.UpdatedAt,
	)
	if err != nil {
		return err
	}
	return nil
}

func (s *PostsStore) GetByPostID(ctx context.Context, postID int64) (*Post, error) {
	query := `
		SELECT id, title, user_id, content, created_at, tags, updated_at, version
		FROM posts 
		WHERE id=$1
	`
	ctx, cancel := context.WithTimeout(ctx, QueryTimeoutDuration)
	defer cancel()

	var post Post
	err := s.db.QueryRowContext(
		ctx,
		query,
		postID,
	).Scan(
		&post.ID,
		&post.Title,
		&post.UserID,
		&post.Content,
		&post.CreatedAt,
		pq.Array(&post.Tags),
		&post.UpdatedAt,
		&post.Version,
	)
	if err != nil {
		switch {
		case errors.Is(err, sql.ErrNoRows):
			return nil, ErrNotFound
		default:
			return nil, err
		}

	}
	return &post, nil
}

func (s *PostsStore) Delete(ctx context.Context, postID int64) error {
	query := `
		DELETE FROM posts 
		WHERE id=$1;
	`
	ctx, cancel := context.WithTimeout(ctx, QueryTimeoutDuration)
	defer cancel()

	res, err := s.db.ExecContext(
		ctx,
		query,
		postID,
	)
	if err != nil {
		return err
	}

	rowsAffected, err := res.RowsAffected()
	if err != nil {
		return err
	}
	if rowsAffected == 0 {
		return ErrNotFound
	}
	return nil
}

func (s *PostsStore) Update(ctx context.Context, post *Post) error {
	query := `
		UPDATE posts
		SET content=$1, title=$2, tags=$3, updated_at= NOW(), version = version + 1
		WHERE id=$4 AND version = $5
		RETURNING version
	`
	ctx, cancel := context.WithTimeout(ctx, QueryTimeoutDuration)
	defer cancel()
	err := s.db.QueryRowContext(
		ctx,
		query,
		post.Content,
		post.Title,
		pq.Array(post.Tags),
		post.ID,
		post.Version,
	).Scan(&post.Version)

	if err != nil {
		switch {
		case errors.Is(err, sql.ErrNoRows):
			return ErrNotFound
		default:
			return err
		}
	}

	return nil
}
