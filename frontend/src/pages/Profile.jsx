import { useEffect, useState } from 'react';
import {useParams, Link} from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchUserProfile } from '../services/userService';
import { fetchUserPosts, deletePost as deletePostApi } from '../services/postService';
import PostCard from '../components/PostCard';
import { fetchGithubRepos } from '../services/githubService';
import RepoCard from '../components/RepoCard';
import FollowButton from '../components/FollowButton';
import { getFollowStatus } from '../services/followService.js';

function Avatar({ user }) {
    if (user.avatarUrl) {
        return (
            <img
                src={user.avatarUrl}
                alt={user.username}
                className="w-24 h-24 rounded-full object-cover border-2 border-gray-800"
            />
        );
    }
    const initial = user.username?.charAt(0).toUpperCase() || '?';
    return (
        <div className="w-24 h-24 rounded-full bg-indigo-600 flex items-center justify-center text-3xl font-bold text-white border-2 border-gray-800">
            {initial}
        </div>
    );
}

export default function Profile() {
    const { username } = useParams();
    const { user: currentUser } = useAuth();

    const [userPosts, setUserPosts] = useState([]);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [repos, setRepos] = useState([]);
    const [reposLoading, setReposLoading] = useState(false);
    const [reposError, setReposError] = useState('');

    const [counts, setCounts] = useState({ followersCount: 0, followingCount: 0 });

    useEffect(() => {
        if (!profile) return;
        getFollowStatus(profile.username).then((res) =>
            setCounts({ followersCount: res.data.followersCount, followingCount: res.data.followingCount })
        );
    }, [profile]);

    const handleCountChange = (delta) => {
        setCounts((prev) => ({ ...prev, followersCount: prev.followersCount + delta }));
    };

    useEffect(() => {
        if (!profile?.githubUsername) return;

        setReposLoading(true);
        setReposError('');

        fetchGithubRepos(profile.githubUsername)
            .then((res) => setRepos(res.data.repos))
            .catch((err) => setReposError(err.response?.data?.message || 'Could not load repos'))
            .finally(() => setReposLoading(false));
    }, [profile?.githubUsername]);

    useEffect(() => {
        if (!profile) return;
        fetchUserPosts(profile.username).then((res) => setUserPosts(res.data.posts));
    }, [profile]);

    const handleDeletePost = async (postId) => {
        if (!confirm('Delete this post?')) return;
        await deletePostApi(postId);
        setUserPosts((prev) => prev.filter((p) => p._id !== postId));
    };

    useEffect(() => {
        setLoading(true);
        setError('');

        fetchUserProfile(username)
            .then((res) => setProfile(res.data.user))
            .catch((err) => {
                setError(err.response?.data?.message || 'Could not load this profile');
            })
            .finally(() => setLoading(false));
    }, [username]);

    if (loading) {
        return <div className="text-center text-gray-400 py-20">Loading profile...</div>;
    }

    if (error) {
        return <div className="text-center text-red-400 py-20">{error}</div>;
    }

    const isOwnProfile = currentUser?.username === profile.username;

    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                    <Avatar user={profile} />

                    <div className="flex-1">
                        <div className="flex items-center justify-between flex-wrap gap-3">
                            <div>
                                <h1 className="text-2xl font-bold text-white">{profile.username}</h1>
                                <p className="text-sm text-gray-500">
                                    Joined {new Date(profile.createdAt).toLocaleDateString('en-US', {
                                    month: 'long',
                                    year: 'numeric',
                                })}
                                </p>
                            </div>
                            {isOwnProfile ? (
                                <Link to="/profile/edit" className="text-sm font-medium bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-md transition-colors">
                                    Edit Profile
                                </Link>
                            ) : (
                                <FollowButton username={profile.username} onCountChange={handleCountChange} />
                            )}

                            <div className="flex gap-4 text-sm text-gray-400 mt-1">
                                <span><strong className="text-white">{counts.followersCount}</strong> followers</span>
                                <span><strong className="text-white">{counts.followingCount}</strong> following</span>
                            </div>
                        </div>

                        <p className="text-gray-300 mt-3">
                            {profile.bio || <span className="text-gray-500 italic">No bio yet.</span>}
                        </p>
                        {profile.githubUsername && (
                            <a
                            href={`https://github.com/${profile.githubUsername}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-sm text-indigo-400 hover:text-indigo-300 mt-3"
                            >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.387.6.113.82-.26.82-.577 0-.285-.01-1.04-.015-2.04-3.338.725-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.757-1.333-1.757-1.09-.744.083-.729.083-.729 1.205.084 1.84 1.237 1.84 1.237 1.07 1.834 2.807 1.304 3.492.997.108-.775.42-1.305.763-1.605-2.665-.303-5.467-1.334-5.467-5.93 0-1.31.468-2.382 1.235-3.222-.123-.303-.535-1.523.117-3.176 0 0 1.008-.322 3.3 1.23A11.5 11.5 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.29-1.552 3.297-1.23 3.297-1.23.653 1.653.24 2.873.117 3.176.77.84 1.233 1.912 1.233 3.222 0 4.61-2.807 5.624-5.48 5.92.43.372.823 1.104.823 2.226 0 1.606-.015 2.902-.015 3.297 0 .32.216.694.825.576C20.565 21.795 24 17.298 24 12c0-6.63-5.37-12-12-12z" />
                            </svg>
                            @{profile.githubUsername}
                            </a>
                            )}
                    </div>
                </div>
            </div>

            {profile.githubUsername && (
                <div className="mt-8">
                    <h2 className="text-lg font-semibold text-white mb-4">Repositories</h2>

                    {reposLoading && <p className="text-gray-500 text-sm">Loading repos...</p>}
                    {reposError && <p className="text-red-400 text-sm">{reposError}</p>}

                    {!reposLoading && !reposError && repos.length === 0 && (
                        <p className="text-gray-500 text-sm">No public repositories found.</p>
                    )}

                    {!reposLoading && repos.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                        className="inline-block text-sm text-indigo-400 hover:text-indigo-300 mt-4"
                        >
                        View all {repos.length} repos on GitHub →
                        </a>
                        )}
                </div>
            )}

            <div className="mt-8">
                <h2 className="text-lg font-semibold text-white mb-4">Posts</h2>
                {userPosts.length > 0 ? (
                    <div className="space-y-4">
                        {userPosts.map((post) => (
                            <PostCard key={post._id} post={post} onDelete={handleDeletePost} />
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500 text-sm">No posts yet.</p>
                )}
            </div>
        </div>
    );
}