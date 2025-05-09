package main

import (
	"context"
	"encoding/base64"
	"fmt"
	"net/http"
	"strconv"
	"strings"

	"github.com/golang-jwt/jwt/v5"
	"github.com/shimkek/GO-Social-Network/internal/store"
)

func (app *application) BasicAuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		//read auth header
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			app.unauthorizedBasicError(w, r, fmt.Errorf("authorization header is missing"))
			return
		}
		//parse base64
		parts := strings.Split(authHeader, " ")
		if parts[0] != "Basic" || len(parts) != 2 {
			app.unauthorizedBasicError(w, r, fmt.Errorf("authorization header is malformed"))
			return
		}
		//decode
		decoded, err := base64.StdEncoding.DecodeString(parts[1])
		if err != nil {
			app.unauthorizedBasicError(w, r, err)
			return
		}
		//check the credentials
		username := app.config.auth.basic.user
		pass := app.config.auth.basic.pass

		creds := strings.SplitN(string(decoded), ":", 2)
		if len(creds) != 2 || creds[0] != username || creds[1] != pass {
			app.unauthorizedBasicError(w, r, fmt.Errorf("invalid credentials"))
			return
		}

		next.ServeHTTP(w, r)
	})
}

func (app *application) TokenAuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		var token string

		authHeader := r.Header.Get("Authorization")
		if authHeader != "" {
			// If Authorization header is present, parse the Bearer token
			parts := strings.Split(authHeader, " ")
			if parts[0] != "Bearer" || len(parts) != 2 {
				app.unauthorizedError(w, r, fmt.Errorf("authorization header is malformed"))
				return
			}
			token = parts[1]
		} else {
			// If Authorization header is missing, check for JWT token in cookies
			cookie, err := r.Cookie("jwt")
			if err != nil {
				if err == http.ErrNoCookie {
					app.unauthorizedError(w, r, fmt.Errorf("no JWT token found in cookie and authorization header"))
				} else {
					app.unauthorizedError(w, r, fmt.Errorf("error retrieving cookie: %v", err))
				}
				return
			}
			token = cookie.Value
		}

		jwtToken, err := app.authenticator.ValidateToken(token)
		if err != nil {
			app.unauthorizedError(w, r, err)
			return
		}

		claims, _ := jwtToken.Claims.(jwt.MapClaims)

		userID, err := strconv.ParseInt(fmt.Sprintf("%.f", claims["sub"]), 10, 64)
		if err != nil {
			app.unauthorizedError(w, r, err)
			return
		}

		ctx := r.Context()

		user, err := app.getUserWithCache(ctx, userID)
		if err != nil {
			app.unauthorizedError(w, r, err)
			return
		}

		ctx = context.WithValue(ctx, userCtx, user)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

func (app *application) checkPermissions(role string, next http.HandlerFunc) http.HandlerFunc {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		user := getUserFromCtx(r)
		post := getPostFromCtx(r)

		//if the user owns post
		if post.UserID == user.ID {
			next.ServeHTTP(w, r)
			return
		}

		//check the role precedence
		allowed, err := app.checkRolePrecedence(r.Context(), user, role)
		if err != nil {
			app.internalServerError(w, r, err)
			return
		}
		if !allowed {
			app.forbiddenResponse(w, r)
			return
		}

		next.ServeHTTP(w, r)
	})
}

func (app *application) checkRolePrecedence(ctx context.Context, user *store.User, roleName string) (bool, error) {
	neededRole, err := app.store.Roles.GetByName(ctx, roleName)
	if err != nil {
		return false, err
	}

	return user.Role.Level >= neededRole.Level, nil
}

func (app *application) getUserWithCache(ctx context.Context, userID int64) (*store.User, error) {
	if !app.config.redisCfg.enabled {
		user, err := app.store.Users.GetByID(ctx, userID)
		if err != nil {
			return nil, err
		}
		return user, nil
	}

	user, err := app.cacheStorage.Users.Get(ctx, userID)
	if err != nil {
		return nil, err
	}

	if user == nil {
		user, err = app.store.Users.GetByID(ctx, userID)
		if err != nil {
			return nil, err
		}
		if err := app.cacheStorage.Users.Set(ctx, user); err != nil {
			return nil, err
		}
	}
	return user, nil
}

func (app *application) RateLimitMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if app.config.rateLimiter.Enabled {
			if allow, retryAfter := app.rateLimiter.Allow(r.RemoteAddr); !allow {
				app.rateLimitExceededResponse(w, r, retryAfter.String())
				return
			}
		}

		next.ServeHTTP(w, r)
	})
}
