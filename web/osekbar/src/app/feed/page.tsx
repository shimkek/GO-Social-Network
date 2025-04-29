"use client";

import { useEffect, useState } from "react";
import { feedApi } from "@/lib/api";
import PostCard from "@/components/ui/postCard";

export default function FeedPage() {
    const [feed, setFeed] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchFeed() {
            try {
                const response = await feedApi.getUserFeed();
                const data = await response.json();
                console.log(data["data"]);
                setFeed(data["data"]);
            } catch (error) {
                console.error("Failed to fetch feed:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchFeed();
    }, []);

    if (loading) return <div className="text-center py-4">Loading...</div>;

    return (
        <div className="bg-muted"><div className="w-full max-w-3xl mx-auto px-4 py-6 space-y-6 ">
            {feed ? feed.map((post) => (
                <PostCard
                    key={post.Post.id}
                    id={post.Post.id}
                    title={post.Post.title}
                    content={post.Post.content}
                    created_at={post.Post.created_at}
                    tags={post.Post.tags}
                    username={post.username}
                    comments_count={post.comments_count}
                />
            )) : <p>No posts</p>}
        </div></div>
    );
}
