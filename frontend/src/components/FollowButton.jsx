import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getFollowStatus, followUser, unfollowUser } from '../services/followService';

// Pass `initialIsFollowing` when the parent already knows the state (skips the status request).
export default function FollowButton({ username, onCountChange, initialIsFollowing, compact = false }) {
    const { isLoggedIn } = useAuth();
    const known = initialIsFollowing !== undefined;
    const [isFollowing, setIsFollowing] = useState(initialIsFollowing ?? false);
    const [loading, setLoading] = useState(!known);
    const [busy, setBusy] = useState(false);

    useEffect(() => {
        if (known) return;
        let cancelled = false;
        getFollowStatus(username)
            .then((res) => {
                if (!cancelled) setIsFollowing(res.data.isFollowing);
            })
            .catch(() => {})
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, [username, known]);

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
        } catch {
            // leave the button as it was; the next click retries
        } finally {
            setBusy(false);
        }
    };

    if (!isLoggedIn || loading) return null;

    const size = compact ? 'px-3.5 py-1.5 text-xs' : 'px-5 py-2 text-sm';

    return (
        <button
            onClick={toggleFollow}
            disabled={busy}
            className={`group rounded-full font-semibold transition-colors disabled:opacity-50 ${size} ${
                isFollowing
                    ? 'border border-line bg-surface text-plum hover:border-danger hover:text-danger'
                    : 'bg-plum text-white hover:bg-plum-soft'
            }`}
        >
            {isFollowing ? (
                <>
                    <span className="group-hover:hidden">Following</span>
                    <span className="hidden group-hover:inline">Unfollow</span>
                </>
            ) : (
                'Follow'
            )}
        </button>
    );
}
