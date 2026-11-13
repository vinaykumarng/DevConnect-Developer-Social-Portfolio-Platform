import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchComments, addComment, deleteComment } from '../services/commentService';
import { timeAgo } from '../utils/timeAgo';
import Avatar from './Avatar';

// Mounted only when the user opens a post's comments, so comments stay lazy-loaded.
export default function CommentSection({ postId, onCountChange }) {
    const { user, isLoggedIn } = useAuth();
    const [comments, setComments] = useState([]);
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        let cancelled = false;
        fetchComments(postId)
            .then((res) => {
                if (!cancelled) setComments(res.data.comments);
            })
            .catch(() => {
                if (!cancelled) setError('Could not load comments');
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, [postId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!text.trim()) return;

        setSubmitting(true);
        setError('');
        try {
            const res = await addComment(postId, text);
            setComments((prev) => [res.data.comment, ...prev]);
            setText('');
            onCountChange?.(1);
        } catch (err) {
            setError(err.response?.data?.message || 'Could not add comment');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (commentId) => {
        if (!confirm('Delete this comment?')) return;
        try {
            await deleteComment(commentId);
            setComments((prev) => prev.filter((c) => c.id !== commentId));
            onCountChange?.(-1);
        } catch {
            setError('Could not delete comment');
        }
    };

    return (
        <div className="mt-2 border-t border-line pt-3">
            {isLoggedIn && (
                <form onSubmit={handleSubmit} className="mb-3 flex items-center gap-2">
                    <Avatar user={user} className="size-7 text-[10px]" />
                    <input
                        type="text"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        maxLength={300}
                        placeholder="Post your reply"
                        aria-label="Add a comment"
                        className="min-w-0 flex-1 rounded-full border border-line bg-surface px-4 py-1.5 text-sm placeholder:text-muted/70 focus:border-link focus:outline-none"
                    />
                    <button
                        type="submit"
                        disabled={submitting || !text.trim()}
                        className="rounded-full bg-plum px-4 py-1.5 text-sm font-semibold text-white hover:bg-plum-soft disabled:cursor-not-allowed disabled:bg-blush disabled:text-muted"
                    >
                        Reply
                    </button>
                </form>
            )}

            {error && <p className="mb-2 text-xs text-danger">{error}</p>}
            {loading && <p className="text-xs text-muted">Loading comments...</p>}

            <ul className="space-y-3">
                {comments.map((comment) => (
                    <li key={comment.id} className="flex items-start gap-2 text-sm">
                        <Link to={`/profile/${comment.author?.username}`}>
                            <Avatar user={comment.author} className="size-7 text-[10px]" />
                        </Link>
                        <div className="min-w-0 flex-1">
                            <p>
                                <Link to={`/profile/${comment.author?.username}`} className="font-bold hover:underline">
                                    {comment.author?.username}
                                </Link>
                                <span className="text-xs text-muted"> · {timeAgo(comment.createdAt)}</span>
                            </p>
                            <p className="break-words">{comment.content}</p>
                        </div>
                        {user?.id === comment.author?.id && (
                            <button
                                onClick={() => handleDelete(comment.id)}
                                className="text-xs text-muted hover:text-danger"
                            >
                                Delete
                            </button>
                        )}
                    </li>
                ))}
            </ul>

            {!loading && !error && comments.length === 0 && <p className="text-xs text-muted">No replies yet.</p>}
        </div>
    );
}
