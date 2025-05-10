"use client";

import PostCard from "@/components/ui/postCard";
import { postsApi, usersApi } from "@/lib/api";
import { useEffect, useState } from "react";

export default function Page({ params }: { params: Promise<{ id: string }> }) {
    const [post, setPost] = useState({
        id: 0,
        title: "",
        content: "",
        userid: 0,
        created_at: "",
        updated_at: "",
        tags: [],
        comments: [],
        username: "",
        comments_count: 0,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [id, setId] = useState<string | null>(null);

    useEffect(() => {
        const unwrapParams = async () => {

            try {
                const resolvedParams = await params;
                setId(resolvedParams.id);
            } catch (err) {
                console.error("Failed to unwrap params:", err);
                setError("Failed to load the page. Please try again later.");
                setLoading(false);
            }
        };

        unwrapParams();
    }, [params]);

    useEffect(() => {
        fetchPost();
    }, [id]);

    useEffect(() => {
        if (post.userid !== 0) {
            fetchUser();
        }
    }, [post.userid]);

    async function fetchPost(): Promise<void> {
        if (!id) return;
        console.log("Fetching post");
        setLoading(true);
        const postId = parseInt(id);
        if (isNaN(postId)) {
            console.error("Invalid post ID");
            setError("Invalid post ID");
            setLoading(false);
            return;
        }

        try {
            const response = await postsApi.getPost(postId);
            const post = await response.json();

            if (!post) {
                console.error("Post not found");
                setError("Post not found");
                setLoading(false);
                return;
            }
            console.log(post.data);
            setPost(post.data);
        } catch (err) {
            console.error("Failed to fetch post:", err);
            setLoading(false);
            setError("Failed to fetch the post. Please try again later.");
        }
    };

    async function fetchUser(): Promise<void> {
        console.log("Fetching user");
        setError("");
        try {
            const response = await usersApi.getUserProfile(post.userid);
            const user = await response.json();
            if (!user) {
                console.error("User not found");
                setError("User not found");
                setLoading(false);
                return;
            }
            console.log(user.data);
            setPost((prevPost) => ({
                ...prevPost,
                username: user.data.username,
            }));
        } catch (err) {
            console.error("Failed to fetch user:", err);
            setLoading(false);
            setError("Failed to fetch the user. Please try again later.");
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="flex flex-col items-center justify-start py-5 px-4 max-w-4xl mx-auto">
            {loading && <p>Loading...</p>}
            {error && <p className="text-red-500">{error}</p>}
            {!loading && !error && (
                <>
                    <PostCard
                        id={post.id}
                        title={post.title}
                        content={post.content}
                        created_at={post.created_at}
                        tags={post.tags}
                        username={post.username}
                        comments_count={post.comments.length}
                    />
                    <div className="w-full max-w-3xl mt-6">
                        <h2 className="text-lg font-semibold mb-4">Comments</h2>
                        {post.comments.length > 0 ? (
                            <div className="space-y-4">
                                {post.comments.map((comment: any) => (
                                    <div
                                        key={comment.id}
                                        className="p-4 bg-white rounded shadow-md"
                                    >
                                        <div className="text-sm text-gray-500 flex justify-between">
                                            <div>@{comment.user.username}</div>
                                            <div>
                                                {new Date(comment.created_at).toLocaleString()}</div>
                                        </div>
                                        <p className="text-gray-800 mt-2">{comment.content}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500">No comments yet.</p>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}