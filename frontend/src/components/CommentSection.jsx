import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchComments, addComment, deleteComment } from '../services/commentService';

function timeAgo(date) {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return 'just now';
    const mins = Math.floor(seconds / 60);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
}

export default function CommentSection({ postId }) {
    const { user, isLoggedIn } = useAuth();
    const [comments, setComments] = useState([]);
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [expanded, setExpanded] = useState(false);

    useEffect(() => {
        if (!expanded) return;
        fetchComments(postId)
            .then((res) => setComments(res.data.comments))
            .finally(() => setLoading(false));
    }, [postId, expanded]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!text.trim()) return;

        setSubmitting(true);
        try {
            const res = await addComment(postId, text);
            setComments((prev) => [res.data.comment, ...prev]);
            setText('');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (commentId) => {
        if (!confirm('Delete this comment?')) return;
        await deleteComment(commentId);
        setComments((prev) => prev.filter((c) => c._id !== commentId));
    };

    if (!expanded) {
        return (
            <button
                onClick={() => setExpanded(true)}
                className="text-xs text-gray-500 hover:text-indigo-400 mt-3 transition-colors"
            >
                View comments
            </button>
        );
    }

    return (
        <div className="mt-4 pt-4 border-t border-gray-800">
            {isLoggedIn && (
                <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
                    <input
                        type="text"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        maxLength={300}
                        placeholder="Add a comment..."
                        className="flex-1 bg-gray-800 text-white text-sm rounded-md px-3 py-1.5 border border-gray-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                    <button
                        type="submit"
                        disabled={submitting || !text.trim()}
                        className="text-sm text-indigo-400 hover:text-indigo-300 disabled:opacity-40 font-medium px-2"
                    >
                        Post
                    </button>
                </form>
            )}

            {loading && <p className="text-xs text-gray-500">Loading comments...</p>}

            <div className="space-y-3">
                {comments.map((comment) => (
                    <div key={comment._id} className="flex gap-2 items-start text-sm">
                        <Link to={`/profile/${comment.author?.username}`} className="font-medium text-gray-300 hover:text-indigo-400 shrink-0">
                            {comment.author?.username}
                        </Link>
                        <p className="text-gray-400 flex-1">{comment.content}</p>
                        <span className="text-xs text-gray-600 shrink-0">{timeAgo(comment.createdAt)}</span>
                        {user?._id === comment.author?._id && (
                            <button
                                onClick={() => handleDelete(comment._id)}
                                className="text-xs text-gray-600 hover:text-red-400 shrink-0"
                            >
                                Delete
                            </button>
                        )}
                    </div>
                ))}
                {!loading && comments.length === 0 && (
                    <p className="text-xs text-gray-600">No comments yet.</p>
                )}
            </div>
        </div>
    );
}