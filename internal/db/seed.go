package db

import (
	"context"
	"database/sql"
	"log"
	"math/rand"
	"slices"

	"github.com/brianvoe/gofakeit/v7"
	"github.com/shimkek/GO-Social-Network/internal/store"
)

var tagList = []string{}

func initTags() {
	for i := 0; i < 20; i++ {
		tag := gofakeit.Word()
		if !slices.Contains(tagList, tag) {
			tagList = append(tagList, gofakeit.Word())
		}
	}
}

func Seed(store store.Storage, db *sql.DB) {
	ctx := context.Background()

	tx, _ := db.BeginTx(ctx, nil)

	users := generateUsers(100)
	for _, user := range users {
		if err := store.Users.Create(ctx, tx, user); err != nil {
			log.Println("error creating user: ", err)
			return
		}
	}
	tx.Commit()
	posts := generatePosts(200, users)
	for _, post := range posts {
		if err := store.Posts.Create(ctx, post); err != nil {
			log.Println("error creating post: ", err)
			return
		}
	}
	comments := generateComments(300, users, posts)
	for _, comment := range comments {
		if err := store.Comments.Create(ctx, comment); err != nil {
			log.Println("error creating comment: ", err)
			return
		}
	}
	log.Println("Seeding completed")
}

func generateUsers(num int) []*store.User {
	users := make([]*store.User, num)

	for i := 0; i < num; i++ {
		users[i] = &store.User{
			Username: gofakeit.Username(),
			Email:    gofakeit.Email(),
			Role: store.Role{
				Name: "user",
			},
		}
	}

	return users
}

func generatePosts(num int, users []*store.User) []*store.Post {
	for _, user := range users {
		log.Printf("User ID: %d, Username: %s\n", user.ID, user.Username)
	}
	posts := make([]*store.Post, num)
	for i := 0; i < num; i++ {
		user := users[rand.Intn(len(users))]
		sentenceCount := []int{3, 4, 5}
		wordCount := []int{5, 7, 10}
		initTags()
		tagCount := rand.Intn(5)
		tags := []string{}
		for i := 0; i < tagCount; i++ {
			tag := tagList[rand.Intn(20)]
			if !slices.Contains(tags, tag) {
				tags = append(tags, tag)
			}
		}

		posts[i] = &store.Post{
			Content: gofakeit.Paragraph(rand.Intn(4), gofakeit.RandomInt(sentenceCount), gofakeit.RandomInt(wordCount), "\n"),
			Title:   gofakeit.SentenceSimple(),
			UserID:  user.ID,
			Tags:    tags,
		}
	}
	return posts
}

func generateComments(num int, users []*store.User, posts []*store.Post) []*store.Comment {
	comments := make([]*store.Comment, num)
	for i := 0; i < num; i++ {
		comments[i] = &store.Comment{
			PostID:  posts[rand.Intn(len(posts))].ID,
			UserID:  users[rand.Intn(len(users))].ID,
			Content: gofakeit.SentenceSimple(),
		}
	}
	return comments
}
