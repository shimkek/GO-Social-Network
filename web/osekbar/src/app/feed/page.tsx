"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from 'next/navigation'
import { feedApi } from "@/lib/api";
import PostCard from "@/components/ui/postCard";
import { Button } from "@/components/ui/button";
import { useInView } from 'react-intersection-observer'


export default function FeedPage() {
    const [feed, setFeed] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const searchParams = useSearchParams();
    const [offset, setOffset] = useState(0);
    const { ref, inView } = useInView()
    const [hasMore, setHasMore] = useState(true);


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
            console.log(posts ? posts : []);
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

    if (loading) return <div className="text-center py-4">Loading...</div>;

    return (
        <div className="bg-muted"><div className="w-full max-w-3xl mx-auto px-4 py-6 space-y-6 ">
            {feed ? feed.map((post) => (
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
            )) : <p>No posts</p>}
            <div ref={ref} className="h-10" />
            {loading && <p className="text-center">Loading...</p>}
        </div></div>
    );
}
