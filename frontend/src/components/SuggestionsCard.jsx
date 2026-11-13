import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchSuggestions } from '../services/userService';
import Avatar from './Avatar';
import FollowButton from './FollowButton';

export default function SuggestionsCard() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    let cancelled = false;
    fetchSuggestions()
      .then((res) => {
        if (!cancelled) setUsers(res.data.users);
      })
      .catch(() => {}); // the card is optional; stay hidden if it fails
    return () => {
      cancelled = true;
    };
  }, []);

  if (users.length === 0) return null;

  return (
    <section className="overflow-hidden rounded-2xl border border-line bg-surface">
      <h2 className="border-b border-line px-4 py-3 text-[15px] font-bold">Suggestions For You</h2>
      <ul className="divide-y divide-line">
        {users.map((u) => (
          <li key={u.id} className="flex items-center gap-3 px-4 py-3">
            <Link to={`/profile/${u.username}`}>
              <Avatar user={u} className="size-9 text-xs" />
            </Link>
            <Link to={`/profile/${u.username}`} className="min-w-0 flex-1 leading-tight">
              <span className="block truncate text-sm font-bold hover:underline">{u.username}</span>
              <span className="block truncate text-xs text-muted">
                {u.followsYou ? 'Follows you' : 'Suggested for you'}
              </span>
            </Link>
            <FollowButton username={u.username} initialIsFollowing={false} compact />
          </li>
        ))}
      </ul>
    </section>
  );
}
