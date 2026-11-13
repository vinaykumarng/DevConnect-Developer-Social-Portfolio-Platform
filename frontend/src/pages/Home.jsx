import { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchFeed, createPost as createPostApi, deletePost as deletePostApi } from '../services/postService';
import PostCard from '../components/PostCard';
import CreatePostForm from '../components/CreatePostForm';
import Tabs from '../components/Tabs';
import Icon from '../components/Icons';
import { PostSkeleton } from '../components/Skeletons';

export default function Home() {
    const { isLoggedIn } = useAuth();
    const [tab, setTab] = useState('forYou');
    const [posts, setPosts] = useState([]);
    const [pagination, setPagination] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const pageRef = useRef(1);

    // Logged-out visitors only see the public feed.
    const activeTab = isLoggedIn ? tab : 'forYou';

    // First page: reloads whenever the tab changes. `cancelled` drops stale responses if you switch quickly.
    useEffect(() => {
        let cancelled = false;
        fetchFeed(1, activeTab === 'following')
            .then((res) => {
                if (cancelled) return;
                setPosts(res.data.posts);
                setPagination(res.data.pagination);
                pageRef.current = 1;
                setError('');
            })
            .catch((err) => {
                if (!cancelled) setError(err.response?.data?.message || 'Could not load the feed');
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, [activeTab]);

    const loadMore = async () => {
        setLoading(true);
        try {
            const next = pageRef.current + 1;
            const res = await fetchFeed(next, activeTab === 'following');
            setPosts((prev) => [...prev, ...res.data.posts]);
            setPagination(res.data.pagination);
            pageRef.current = next;
        } catch (err) {
            setError(err.response?.data?.message || 'Could not load more posts');
        } finally {
            setLoading(false);
        }
    };

    const changeTab = (next) => {
        if (next === tab) return;
        setPosts([]);
        setPagination(null);
        setError('');
        setLoading(true);
        setTab(next);
    };

    const handlePostCreated = async (formData) => {
        const res = await createPostApi(formData);
        setPosts((prev) => [res.data.post, ...prev]);
    };

    const handleDelete = async (postId) => {
        if (!confirm('Delete this post?')) return;
        try {
            await deletePostApi(postId);
            setPosts((prev) => prev.filter((p) => p.id !== postId));
        } catch {
            setError('Could not delete the post');
        }
    };

    const tabs = [{ id: 'forYou', label: 'For you' }, ...(isLoggedIn ? [{ id: 'following', label: 'Following' }] : [])];

    return (
        <div>
            <div className="sticky top-0 z-10 bg-surface/90 backdrop-blur">
                {/* Search is UI only for now (real search is on the roadmap) */}
                <div className="px-4 pt-3">
                    <label className="flex items-center gap-3 rounded-full border border-line bg-surface px-4 py-2.5 focus-within:border-link">
                        <Icon name="search" className="size-4 text-muted" />
                        <input
                            type="search"
                            placeholder="Search"
                            aria-label="Search"
                            className="w-full bg-transparent text-sm placeholder:text-muted focus:outline-none"
                        />
                    </label>
                </div>
                <Tabs tabs={tabs} value={activeTab} onChange={changeTab} />
            </div>

            {isLoggedIn && <CreatePostForm onPostCreated={handlePostCreated} />}

            {posts.map((post) => (
                <PostCard key={post.id} post={post} onDelete={handleDelete} />
            ))}

            {loading && posts.length === 0 && [0, 1, 2].map((i) => <PostSkeleton key={i} />)}
            {loading && posts.length > 0 && <p className="py-6 text-center text-sm text-muted">Loading...</p>}

            {error && <p className="px-4 py-6 text-center text-sm text-danger">{error}</p>}

            {!loading && pagination?.hasMore && (
                <div className="py-6 text-center">
                    <button
                        onClick={loadMore}
                        className="rounded-full border border-line px-5 py-2 text-sm font-semibold hover:bg-blush/60"
                    >
                        Load more
                    </button>
                </div>
            )}

            {!loading && !error && posts.length === 0 && (
                <p className="px-6 py-16 text-center text-sm text-muted">
                    {activeTab === 'following'
                        ? 'Nothing here yet. Follow some developers to fill this feed.'
                        : 'No posts yet. Be the first!'}
                </p>
            )}
        </div>
    );
}
