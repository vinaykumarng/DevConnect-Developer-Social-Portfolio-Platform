import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchFeed, createPost as createPostApi, deletePost as deletePostApi } from '../services/postService';
import PostCard from '../components/PostCard';
import CreatePostForm from '../components/CreatePostForm';

export default function Home() {
    const { isLoggedIn } = useAuth();
    const [posts, setPosts] = useState([]);
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState(null);
    const [loading, setLoading] = useState(true);

    const loadFeed = useCallback(async (pageNum) => {
        setLoading(true);
        const res = await fetchFeed(pageNum);
        setPosts((prev) => (pageNum === 1 ? res.data.posts : [...prev, ...res.data.posts]));
        setPagination(res.data.pagination);
        setLoading(false);
    }, []);

    useEffect(() => {
        loadFeed(1);
    }, [loadFeed]);

    const handlePostCreated = async (formData) => {
        const res = await createPostApi(formData);
        setPosts((prev) => [res.data.post, ...prev]);
    };

    const handleDelete = async (postId) => {
        if (!confirm('Delete this post?')) return;
        await deletePostApi(postId);
        setPosts((prev) => prev.filter((p) => p._id !== postId));
    };

    const loadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        loadFeed(nextPage);
    };

    return (
        <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {isLoggedIn && <CreatePostForm onPostCreated={handlePostCreated} />}

            <div className="space-y-4">
                {posts.map((post) => (
                    <PostCard key={post._id} post={post} onDelete={handleDelete} />
                ))}
            </div>

            {loading && <p className="text-center text-gray-500 text-sm mt-6">Loading...</p>}

            {!loading && pagination?.hasMore && (
                <div className="text-center mt-6">
                    <button
                        onClick={loadMore}
                        className="text-sm text-indigo-400 hover:text-indigo-300 font-medium"
                    >
                        Load more
                    </button>
                </div>
            )}

            {!loading && posts.length === 0 && (
                <p className="text-center text-gray-500 text-sm mt-10">No posts yet. Be the first!</p>
            )}
        </div>
    );
}