import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import CommentSection from './CommentSection';

function timeAgo(date) {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    const intervals = [
        { label: 'y', secs: 31536000 },
        { label: 'mo', secs: 2592000 },
        { label: 'd', secs: 86400 },
        { label: 'h', secs: 3600 },
        { label: 'm', secs: 60 },
    ];
    for (const i of intervals) {
        const count = Math.floor(seconds / i.secs);
        if (count >= 1) return `${count}${i.label} ago`;
    }
    return 'just now';
}

export default function PostCard({ post, onDelete }) {
    const { user } = useAuth();
    const isAuthor = user?._id === post.author?._id;

    return (
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
            <div className="flex items-start justify-between">
                <Link to={`/profile/${post.author?.username}`} className="flex items-center gap-3 group">
                    {post.author?.avatarUrl ? (
                        <img
                            src={post.author.avatarUrl}
                            alt={post.author.username}
                            className="w-10 h-10 rounded-full object-cover"
                        />
                    ) : (
                        <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-sm font-bold text-white">
                            {post.author?.username?.charAt(0).toUpperCase()}
                        </div>
                    )}
                    <div>
                        <p className="text-sm font-medium text-white group-hover:text-indigo-400 transition-colors">
                            {post.author?.username}
                        </p>
                        <p className="text-xs text-gray-500">{timeAgo(post.createdAt)}</p>
                    </div>
                </Link>

                {isAuthor && (
                    <button
                        onClick={() => onDelete(post._id)}
                        className="text-xs text-gray-500 hover:text-red-400 transition-colors"
                    >
                        Delete
                    </button>
                )}
            </div>

            <p className="text-gray-200 text-sm mt-3 whitespace-pre-wrap">{post.content}</p>

            {post.imageUrl && (
                <img
                    src={post.imageUrl}
                    alt="Post attachment"
                    className="mt-3 rounded-md w-full max-h-96 object-cover border border-gray-800"
                />
            )}
            <CommentSection postId={post._id} />
        </div>
    );
}