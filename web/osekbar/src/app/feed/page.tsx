"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from 'next/navigation'
import { feedApi, postsApi } from "@/lib/api";
import PostCard from "@/components/ui/postCard";
import { Button } from "@/components/ui/button";
import { useInView } from 'react-intersection-observer'
import { AuthProvider, useAuth } from "../context/AuthContext";

export default function FeedPage() {
    // State for the feed
    // This will be used to store the posts fetched from the API
    // and the loading state while the posts are being fetched
    const [feed, setFeed] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // State for creating a new post
    // This will be used to manage the form inputs for creating a new post
    // and the loading state while the post is being created
    const [creatingPost, setCreatingPost] = useState(false);
    const [newPost, setNewPost] = useState({ title: "", content: "", tags: "" });

    const [showForm, setShowForm] = useState(false);

    const searchParams = useSearchParams();
    const [offset, setOffset] = useState(0);

    // Intersection Observer for infinite scroll
    // This will trigger when the user scrolls to the bottom of the page
    // and will load more posts if available
    const { ref, inView } = useInView();
    const [hasMore, setHasMore] = useState(true);

    const { isLoggedIn } = useAuth();

    useEffect(() => {
        const run = async () => {
            setLoading(true);
            setHasMore(true);
            setOffset(0);
            const response = await feedApi.getUserFeed({
                search: searchParams.get('search') ?? undefined,
                since: searchParams.get('since') ?? undefined,
                until: searchParams.get('until') ?? undefined,
                tags: searchParams.get('tags') ?? undefined,
                offset: 0,
            });

            const data = await response.json();
            const posts = data["data"];
            if (!posts) {
                setHasMore(false); // no more posts to load
            }
            setFeed(posts); // fresh feed on param change
            setOffset(20);  // next offset
            setLoading(false);
        };

        run();
    }, [searchParams.toString()]);

    useEffect(() => {
        if (inView && hasMore) {
            fetchFeed();
        }
    }, [inView]);

    async function fetchFeed(offsetToUse = offset) {
        try {
            const search = searchParams.get('search');
            const until = searchParams.get('until');
            const since = searchParams.get('since');
            const tags = searchParams.get('tags');

            const response = await feedApi.getUserFeed({
                search: search ?? undefined,
                since: since ?? undefined,
                until: until ?? undefined,
                tags: tags ?? undefined,
                offset: offsetToUse,
            });

            const data = await response.json();
            const posts = data["data"];

            setOffset(offsetToUse + 20); // update to new offset
            if (!posts) {
                setHasMore(false); // no more posts to load
            }
            setFeed([...feed, ...posts ? posts : []]);

        } catch (error) {
            console.error("Failed to fetch feed:", error);
        }
    }

    async function handleCreatePost(e: React.FormEvent) {
        e.preventDefault();
        setCreatingPost(true);

        try {
            var tagsArray: string[] = [];
            //check if the tags are empty
            if (newPost.tags.trim() === "") {
                setNewPost({ ...newPost, tags: "" });
            } else { tagsArray = newPost.tags.split(",").map(tag => tag.trim()); }
            const response = await postsApi.createPost({
                title: newPost.title,
                content: newPost.content,
                tags: tagsArray,
            });

            const createdPost = await response;
            setFeed([createdPost, ...feed]); // Add the new post to the top of the feed
            setNewPost({ title: "", content: "", tags: "" }); // Reset the form
        } catch (error) {
            console.error("Failed to create post:", error);
        } finally {
            setCreatingPost(false);
        }
    }

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const title = e.target.value;
        setNewPost({ ...newPost, title });
        setShowForm(title.trim() !== ""); // Show form if title is not empty
    };

    if (loading) return <div className="text-center py-4">Loading...</div>;

    return (
        <div className="bg-muted">
            <div className="w-full max-w-3xl mx-auto px-4 py-6 space-y-6">
                {/* Create Post Form */}
                {isLoggedIn && (
                    <form onSubmit={handleCreatePost}  className="space-y-4 p-4 bg-white rounded shadow">
                        <input
                            type="text"
                            placeholder="Enter your new post's title"
                            value={newPost.title}
                            onFocus={() => setShowForm(true)}
                            onChange={handleTitleChange}
                            className="w-full p-2 border rounded"
                            required
                        />
                        {showForm && (
                            <>
                                <textarea
                                    placeholder="Content"
                                    value={newPost.content}
                                    onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                                    className="w-full p-2 border rounded"
                                    rows={4}
                                    required
                                />
                                <input
                                    type="text"
                                    placeholder="Tags (comma-separated)"
                                    value={newPost.tags}
                                    onChange={(e) => setNewPost({ ...newPost, tags: e.target.value })}
                                    className="w-full p-2 border rounded"
                                />
                                <Button type="submit" disabled={creatingPost}>
                                    {creatingPost ? "Creating..." : "Create Post"}
                                </Button>
                            </>
                        )}
                    </form>
                )}


                {/* Feed */}
                {!isLoggedIn && <div className="flex justify-center min-h-screen">Please login to view feed</div>}
                {isLoggedIn && (feed.length > 0 ? (
                    <>
                        {feed.map((post) => (
                            <PostCard
                                key={'post' + post.Post.id}
                                id={post.Post.id}
                                title={post.Post.title}
                                content={post.Post.content}
                                created_at={post.Post.created_at}
                                tags={post.Post.tags}
                                username={post.username}
                                comments_count={post.comments_count}
                            />
                        ))}
                        <div ref={ref} className="h-10" />
                        {loading && <p className="text-center">Loading...</p>}
                    </>
                ) : (
                    <p>No posts</p>
                ))}

            </div>
        </div>
    );
}