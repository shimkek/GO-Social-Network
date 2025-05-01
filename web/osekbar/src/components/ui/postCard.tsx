import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

interface PostCardProps {
    id: number;
    title: string;
    content: string;
    created_at: string;
    tags: string[];
    username: string;
    comments_count: number;
}

export default function PostCard({
    id,
    title,
    content,
    created_at,
    tags,
    username,
    comments_count,
}: PostCardProps) {
    return (
        <Card className="w-full rounded-2xl shadow-md p-4">
            <CardContent className="space-y-2">
                <div className="flex justify-between text-sm text-gray-500">
                    <span>@{username}</span>
                    <span>{new Date(created_at).toLocaleDateString()}</span>
                </div>

                <h2 className="text-xl font-semibold">{title}</h2>

                <p className="text-gray-800 whitespace-pre-line">{content}</p>

                <div className="flex flex-wrap gap-2 mt-2">
                    {tags.map((tag) => (
                        <Link
                            key={id + tag}
                            href={"/feed?tags=" + tag}
                            prefetch={false}
                            className="text-sm bg-gray-100 text-gray-700 px-2 py-1 rounded"
                        >
                            #{tag}
                        </Link>
                    ))}
                </div>

                <div className="text-sm text-gray-500 mt-2">
                    {comments_count} comment{comments_count !== 1 ? "s" : ""}
                </div>
            </CardContent>
        </Card>
    );
}