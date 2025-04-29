import { useAuth } from "@/app/context/AuthContext";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/v1';

async function fetchWithAuth(url: string, params?: any) {
    var res = await fetch(`${API_BASE_URL}${url}`, { ...params, credentials: "include" });
    if (res.status == 401) {
        window.localStorage.setItem("isLoggedIn", "false");
    }
    return res;
}


export const authApi = {

    async register(payload: {
        email: string;
        password: string;
        username: string;
    }): Promise<Response> {
        const response = await fetch('/authentication/user', {
            method: 'POST',
            body: JSON.stringify(payload),
        });
        return response.json();
    },

    async login(payload: { email: string; password: string }): Promise<Response> {
        const response = await fetchWithAuth(`/authentication/token`, {
            method: 'POST',
            body: JSON.stringify(payload),
        });
        return response;
    },

    async activateAccount(token: string): Promise<{ message: string }> {
        const response = await fetch(`/users/activate/${token}`, {
            method: 'PUT',
        });
        return response.json();
    },

    async logout(): Promise<Response> {
        const response = await fetch(`${API_BASE_URL}/authentication/logout`, {
            method: 'POST',
            credentials: "include"
        });
        if (response.ok) {
            localStorage.removeItem("isLoggedIn");
        }
        return response;
    },
};

// Users API
export const usersApi = {
    async getUserProfile(userID: number): Promise<Response> {
        const response = await fetch(`/users/${userID}`);
        return response.json();
    },
    async getProfile(): Promise<Response> {
        const response = await fetch(`${API_BASE_URL}/profile`, { credentials: "include" });
        return response;
    },

    async followUser(userID: number): Promise<Response> {
        const response = await fetch(`/users/${userID}/follow`, {
            method: 'PUT',
        });
        return response.json();
    },

    async unfollowUser(userID: number): Promise<Response> {
        const response = await fetch(`/users/${userID}/unfollow`, {
            method: 'PUT',
        });
        return response.json();
    },
};

// Posts API
export const postsApi = {
    async createPost(payload: { title: string; content: string; tags?: string[] }): Promise<Response> {
        const response = await fetch('/posts', {
            method: 'POST',
            body: JSON.stringify(payload),
        });
        return response.json();
    },

    async getPost(id: number): Promise<Response> {
        const response = await fetch(`/posts/${id}`);
        return response.json();
    },

    async updatePost(id: number, payload: { title?: string; content?: string; tags?: string[] }): Promise<Response> {
        const response = await fetch(`/posts/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(payload),
        });
        return response.json();
    },

    async deletePost(id: number): Promise<void> {
        await fetch(`/posts/${id}`, {
            method: 'DELETE',
        });
    },

    async createComment(postId: number, content: string): Promise<Comment> {
        const response = await fetch(`/posts/${postId}/comment`, {
            method: 'POST',
            body: JSON.stringify({ content }),
        });
        return response.json();
    },
};

// Feed API
export const feedApi = {
    async getUserFeed(params?: {
        since?: string;
        until?: string;
        limit?: number;
        offset?: number;
        tags?: string;
        search?: string;
    }): Promise<Response> {
        const queryParams = new URLSearchParams();

        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined) {
                    queryParams.append(key, String(value));
                }
            });
        }

        const response = await fetchWithAuth(`/users/feed?${queryParams.toString()}`);
        return response;
    },
};

