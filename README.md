### README for GO Social Network

# GO Social Network

GO Social Network is a scalable and feature-rich social networking platform built using Go. It provides users with the ability to create posts, comment, follow/unfollow other users, and interact with a personalized feed. The platform is designed with modern web technologies and includes robust authentication, authorization, and caching mechanisms.

---

## Features

### Core Features
- **User Registration and Activation**: Users can register and activate their accounts via email confirmation.
- **Authentication and Authorization**: Secure authentication using JWT tokens and role-based access control.
- **Post Management**: Create, update, delete, and fetch posts with metadata such as tags and comments.
- **Comments**: Add comments to posts and view comments associated with posts.
- **User Feed**: Personalized feed with filtering options (tags, search, pagination).
- **Follow/Unfollow**: Follow and unfollow users to curate your feed.
- **Profile Management**: View and manage user profiles.

### Technical Features
- **Swagger Documentation**: Comprehensive API documentation generated using `swag`.
- **Redis Caching**: Optimized user profile retrieval with Redis caching.
- **Rate Limiting**: Fixed-window rate limiter to prevent abuse.
- **Database Indexing**: Efficient querying with indexed database tables.
- **Structured Logging**: Detailed logging using `zap` for debugging and monitoring.
- **Docker Support**: Dockerfile for containerized deployment.

---

## Installation

### Prerequisites
- **Go**: Version 1.20 or higher.
- **PostgreSQL**: Database for storing user, post, and comment data.
- **Redis**: Optional, for caching user profiles.
- **Docker**: Optional, for containerized deployment.

### Steps
1. Clone the repository:
   ```bash
   git clone https://github.com/shimkek/GO-Social-Network.git
   cd GO-Social-Network
   ```

2. Install dependencies:
   ```bash
   go mod tidy
   ```

3. Set up environment variables:
   Create a .env file in the root directory with the following variables:
   ```env
   DB_ADDR=postgres://admin:adminpassword@localhost/gosocial?sslmode=disable
   REDIS_ADDR=localhost:6379(optional)
   AUTH_TOKEN_SECRET=example
   MAILTRAP_API_KEY=your-mailtrap-api-key(optional)
   ```

4. Seed the database (optional):
   ```bash
   go run cmd/migrate/seed/main.go
   ```

5. Run the application:
   ```bash
   go run cmd/api/main.go
   ```

---

## API Documentation

The API is documented using Swagger. After starting the server, you can access the Swagger UI at:
```
http://localhost:8080/swagger/index.html
```

### Example Endpoints
- **User Registration**: `POST /v1/authentication/user`
- **Create Post**: `POST /v1/posts`
- **Get Post by ID**: `GET /v1/posts/{postID}`
- **Follow User**: `PUT /v1/users/{userID}/follow`
- **Get User Feed**: `GET /v1/users/feed`

---

## Project Structure

```
cmd/
├── api/                # Main API server
├── migrate/seed/       # Database seeding scripts
internal/
├── auth/               # Authentication logic
├── db/                 # Database connection and seeding
├── env/                # Environment variable management
├── mailer/             # Email client for user activation
├── ratelimiter/        # Rate limiting middleware
├── store/              # Data models and database queries
├── store/cache/        # Redis caching logic
web/
├── osekbar/            # Frontend application
```

---

## Development

### Running Tests
Run unit tests using:
```bash
go test ./...
```

### Generating Swagger Documentation
Install `swag` if not already installed:
```bash
go install github.com/swaggo/swag/cmd/swag@latest
```

Generate documentation:
```bash
swag init
```

---