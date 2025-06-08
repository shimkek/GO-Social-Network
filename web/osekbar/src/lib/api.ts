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
        const response = await fetchWithAuth('/authentication/user', {
            method: 'POST',
            body: JSON.stringify(payload),
        });
        return response;
    },

    async login(payload: { email: string; password: string }): Promise<Response> {
        const response = await fetchWithAuth(`/authentication/token`, {
            method: 'POST',
            body: JSON.stringify(payload),
        });
        return response;
    },

    async activateAccount(token: string): Promise<Response> {
        const response = await fetchWithAuth(`/users/activate/${token}`, {
            method: 'PUT',
        });
        return response;
    },

    async logout(): Promise<Response> {
        const response = await fetchWithAuth(`${API_BASE_URL}/authentication/logout`, {
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
        const response = await fetchWithAuth(`/users/${userID}`);
        return response;
    },
    async getProfile(): Promise<Response> {
        const response = await fetchWithAuth(`${API_BASE_URL}/profile`, { credentials: "include" });
        return response;
    },

    async followUser(userID: number): Promise<Response> {
        const response = await fetchWithAuth(`/users/${userID}/follow`, {
            method: 'PUT',
        });
        return response;
    },

    async unfollowUser(userID: number): Promise<Response> {
        const response = await fetchWithAuth(`/users/${userID}/unfollow`, {
            method: 'PUT',
        });
        return response;
    },
};

// Posts API
export const postsApi = {
    async createPost(payload: { title: string; content: string; tags?: string[] }): Promise<Response> {
        const response = await fetchWithAuth('/posts', {
            method: 'POST',
            body: JSON.stringify(payload),
        });
        const responsejson = await response.json();
        const post = responsejson.data;
        console.log(post);
        return post;
    },

    async getPost(id: number): Promise<any> {
        const response = await fetchWithAuth(`/posts/${id}`);
        return response;
    },

    async updatePost(id: number, payload: { title?: string; content?: string; tags?: string[] }): Promise<Response> {
        const response = await fetchWithAuth(`/posts/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(payload),
        });
        return response;
    },

    async deletePost(id: number): Promise<Response> {
        const response = await fetchWithAuth(`/posts/${id}`, {
            method: 'DELETE',
        });
        return response;
    },

    async createComment(postId: number, content: string): Promise<Response> {
        const response = await fetchWithAuth(`/posts/${postId}/comment`, {
            method: 'POST',
            body: JSON.stringify({ content }),
        });
        return response;
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

