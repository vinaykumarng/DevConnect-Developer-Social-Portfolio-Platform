import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getFollowStatus, followUser, unfollowUser } from '../services/followService';

export default function FollowButton({ username, onCountChange }) {
    const { isLoggedIn } = useAuth();
    const [isFollowing, setIsFollowing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState(false);

    useEffect(() => {
        getFollowStatus(username)
            .then((res) => setIsFollowing(res.data.isFollowing))
            .finally(() => setLoading(false));
    }, [username]);

    const toggleFollow = async () => {
        setBusy(true);
        try {
            if (isFollowing) {
                await unfollowUser(username);
                setIsFollowing(false);
                onCountChange?.(-1);
            } else {
                await followUser(username);
                setIsFollowing(true);
                onCountChange?.(1);
            }
        } finally {
            setBusy(false);
        }
    };

    if (!isLoggedIn || loading) return null;

    return (
        <button
            onClick={toggleFollow}
            disabled={busy}
            className={`text-sm font-medium px-4 py-2 rounded-md transition-colors disabled:opacity-50 ${
                isFollowing
                    ? 'bg-gray-800 hover:bg-red-950 hover:text-red-400 text-gray-300'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white'
            }`}
        >
            {isFollowing ? 'Following' : 'Follow'}
        </button>
    );
}