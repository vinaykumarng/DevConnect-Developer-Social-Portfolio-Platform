import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchUserProfile } from '../services/userService';
import { fetchUserPosts, deletePost as deletePostApi } from '../services/postService';
import { fetchGithubRepos } from '../services/githubService';
import { getFollowStatus } from '../services/followService';
import PostCard from '../components/PostCard';
import RepoCard from '../components/RepoCard';
import FollowButton from '../components/FollowButton';
import Avatar from '../components/Avatar';
import Tabs from '../components/Tabs';
import { GithubIcon } from '../components/Icons';
import { PostSkeleton } from '../components/Skeletons';

// `key={username}` resets all state when you navigate from one profile to another.
export default function ProfileRoute() {
    const { username } = useParams();
    return <Profile key={username} username={username} />;
}

function Profile({ username }) {
    const { user: currentUser, logout } = useAuth();
    const navigate = useNavigate();

    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [tab, setTab] = useState('posts');

    const [posts, setPosts] = useState([]);
    const [postsPagination, setPostsPagination] = useState(null);
    const [postsPage, setPostsPage] = useState(1);
    const [postsLoading, setPostsLoading] = useState(true);

    const [repos, setRepos] = useState([]);
    const [reposLoading, setReposLoading] = useState(true); // only shown when a GitHub username exists
    const [reposError, setReposError] = useState('');

    const [counts, setCounts] = useState({ followersCount: 0, followingCount: 0 });

    useEffect(() => {
        let cancelled = false;
        fetchUserProfile(username)
            .then((res) => {
                if (!cancelled) setProfile(res.data.user);
            })
            .catch((err) => {
                if (!cancelled) setError(err.response?.data?.message || 'Could not load this profile');
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, [username]);

    useEffect(() => {
        if (!profile) return;
        let cancelled = false;
        getFollowStatus(profile.username)
            .then((res) => {
                if (!cancelled)
                    setCounts({ followersCount: res.data.followersCount, followingCount: res.data.followingCount });
            })
            .catch(() => {});
        fetchUserPosts(profile.username, 1)
            .then((res) => {
                if (cancelled) return;
                setPosts(res.data.posts);
                setPostsPagination(res.data.pagination);
            })
            .catch(() => {})
            .finally(() => {
                if (!cancelled) setPostsLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, [profile]);

    useEffect(() => {
        if (!profile?.githubUsername) return;
        let cancelled = false;
        fetchGithubRepos(profile.githubUsername)
            .then((res) => {
                if (!cancelled) setRepos(res.data.repos);
            })
            .catch((err) => {
                if (!cancelled) setReposError(err.response?.data?.message || 'Could not load repos');
            })
            .finally(() => {
                if (!cancelled) setReposLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, [profile?.githubUsername]);

    const loadMorePosts = async () => {
        const next = postsPage + 1;
        const res = await fetchUserPosts(profile.username, next);
        setPosts((prev) => [...prev, ...res.data.posts]);
        setPostsPagination(res.data.pagination);
        setPostsPage(next);
    };

    const handleDeletePost = async (postId) => {
        if (!confirm('Delete this post?')) return;
        await deletePostApi(postId);
        setPosts((prev) => prev.filter((p) => p.id !== postId));
    };

    const handleCountChange = (delta) =>
        setCounts((prev) => ({ ...prev, followersCount: prev.followersCount + delta }));

    if (loading) return <div className="py-20 text-center text-muted">Loading profile...</div>;
    if (error) return <div className="py-20 text-center text-danger">{error}</div>;

    const isOwnProfile = currentUser?.id === profile.id;
    const tabs = [
        { id: 'posts', label: 'Posts' },
        ...(profile.githubUsername ? [{ id: 'repos', label: 'Repositories' }] : []),
    ];

    return (
        <div>
            <header className="px-4 pb-5 pt-6 sm:px-6">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                    <Avatar user={profile} className="size-28 text-3xl sm:size-36 sm:text-4xl" />

                    <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                            <div className="min-w-0">
                                <h1 className="truncate text-2xl font-bold">{profile.username}</h1>
                                <p className="text-muted">@{profile.username}</p>
                            </div>

                            {isOwnProfile ? (
                                <div className="flex items-center gap-2">
                                    <Link
                                        to="/profile/edit"
                                        className="rounded-full border border-line px-5 py-2 text-sm font-semibold hover:bg-blush/60"
                                    >
                                        Edit profile
                                    </Link>
                                    <button
                                        onClick={() => {
                                            logout();
                                            navigate('/');
                                        }}
                                        className="rounded-full px-3 py-2 text-sm font-semibold text-danger hover:bg-blush/60"
                                    >
                                        Log out
                                    </button>
                                </div>
                            ) : (
                                <FollowButton username={profile.username} onCountChange={handleCountChange} />
                            )}
                        </div>

                        {profile.bio ? (
                            <p className="mt-3 whitespace-pre-wrap break-words text-[15px]">{profile.bio}</p>
                        ) : (
                            isOwnProfile && <p className="mt-3 text-sm italic text-muted">Add a bio in Edit profile.</p>
                        )}

                        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted">
                            {profile.githubUsername && (
                                <a
                                    href={`https://github.com/${profile.githubUsername}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 text-link hover:underline"
                                >
                                    <GithubIcon /> {profile.githubUsername}
                                </a>
                            )}
                            <span>
                                Joined{' '}
                                {new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                            </span>
                        </div>

                        <div className="mt-3 flex gap-5 text-sm text-muted">
                            <span>
                                <strong className="text-plum">{counts.followersCount}</strong> followers
                            </span>
                            <span>
                                <strong className="text-plum">{counts.followingCount}</strong> following
                            </span>
                        </div>
                    </div>
                </div>
            </header>

            <Tabs tabs={tabs} value={tab} onChange={setTab} />

            {tab === 'posts' && (
                <div>
                    {postsLoading && [0, 1].map((i) => <PostSkeleton key={i} />)}
                    {posts.map((post) => (
                        <PostCard key={post.id} post={post} onDelete={handleDeletePost} />
                    ))}
                    {!postsLoading && posts.length === 0 && (
                        <p className="px-6 py-12 text-center text-sm text-muted">No posts yet.</p>
                    )}
                    {postsPagination?.hasMore && (
                        <div className="py-6 text-center">
                            <button
                                onClick={loadMorePosts}
                                className="rounded-full border border-line px-5 py-2 text-sm font-semibold hover:bg-blush/60"
                            >
                                Load more
                            </button>
                        </div>
                    )}
                </div>
            )}

            {tab === 'repos' && profile.githubUsername && (
                <div className="p-4 sm:p-6">
                    {reposLoading && <p className="text-sm text-muted">Loading repos...</p>}
                    {reposError && <p className="text-sm text-danger">{reposError}</p>}
                    {!reposLoading && !reposError && repos.length === 0 && (
                        <p className="text-sm text-muted">No public repositories found.</p>
                    )}
                    {repos.length > 0 && (
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            {repos.slice(0, 6).map((repo) => (
                                <RepoCard key={repo.id} repo={repo} />
                            ))}
                        </div>
                    )}
                    {repos.length > 6 && (
                        <a
                            href={`https://github.com/${profile.githubUsername}?tab=repositories`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-4 inline-block text-sm text-link hover:underline"
                        >
                            View all {repos.length} repos on GitHub →
                        </a>
                    )}
                </div>
            )}
        </div>
    );
}
