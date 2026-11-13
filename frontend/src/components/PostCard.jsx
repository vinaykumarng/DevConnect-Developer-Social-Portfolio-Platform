import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { timeAgo } from '../utils/timeAgo';
import Avatar from './Avatar';
import Icon from './Icons';
import CommentSection from './CommentSection';

export default function PostCard({ post, onDelete }) {
    const { user } = useAuth();
    const [showComments, setShowComments] = useState(false);
    const [commentCount, setCommentCount] = useState(post._count?.comments ?? 0);

    const isAuthor = user?.id === post.author?.id;
    const profileLink = `/profile/${post.author?.username}`;

    return (
        <article className="flex gap-3 border-b border-line px-4 py-4">
            <Link to={profileLink} aria-label={`${post.author?.username}'s profile`}>
                <Avatar user={post.author} />
            </Link>

            <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                    <p className="min-w-0 truncate text-[15px]">
                        <Link to={profileLink} className="font-bold hover:underline">
                            {post.author?.username}
                        </Link>
                        <span className="text-muted"> · {timeAgo(post.createdAt)}</span>
                    </p>

                    {isAuthor && (
                        <button
                            onClick={() => onDelete(post.id)}
                            aria-label="Delete post"
                            className="-mr-1.5 -mt-1 grid size-8 shrink-0 place-items-center rounded-full text-muted transition-colors hover:bg-blush hover:text-danger"
                        >
                            <Icon name="trash" className="size-4" />
                        </button>
                    )}
                </div>

                <p className="mt-0.5 whitespace-pre-wrap break-words text-[15px] leading-relaxed">{post.content}</p>

                {post.imageUrl && (
                    <img
                        src={post.imageUrl}
                        alt="Post attachment"
                        className="mt-3 max-h-[28rem] w-full rounded-2xl border border-line object-cover"
                    />
                )}

                <div className="mt-2 flex items-center text-muted">
                    <button
                        onClick={() => setShowComments((v) => !v)}
                        aria-expanded={showComments}
                        aria-label="Comments"
                        className={`-ml-2 flex items-center gap-2 rounded-full px-2 py-1.5 text-sm transition-colors hover:bg-tint/50 hover:text-coral ${
                            showComments ? 'text-coral' : ''
                        }`}
                    >
                        <Icon name="comment" className="size-[18px]" />
                        {commentCount}
                    </button>
                </div>

                {showComments && (
                    <CommentSection postId={post.id} onCountChange={(d) => setCommentCount((c) => c + d)} />
                )}
            </div>
        </article>
    );
}
