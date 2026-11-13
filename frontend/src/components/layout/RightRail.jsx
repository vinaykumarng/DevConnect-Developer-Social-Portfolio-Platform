import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../Avatar';
import Icon from '../Icons';
import SuggestionsCard from '../SuggestionsCard';
import TrendingCard from '../TrendingCard';

function UserMenu() {
    const { isLoggedIn, user, logout } = useAuth();
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        if (!open) return;
        const close = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', close);
        return () => document.removeEventListener('mousedown', close);
    }, [open]);

    if (!isLoggedIn) {
        return (
            <div className="flex gap-2 px-4 py-4">
                <Link to="/login" className="flex-1 rounded-full border border-line py-2 text-center text-sm font-semibold hover:bg-blush/60">
                    Log in
                </Link>
                <Link to="/signup" className="flex-1 rounded-full bg-plum py-2 text-center text-sm font-semibold text-white hover:bg-plum-soft">
                    Sign up
                </Link>
            </div>
        );
    }

    const itemClass = 'flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm hover:bg-blush/60';

    return (
        <div ref={ref} className="relative px-2 py-3">
            <button
                onClick={() => setOpen((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={open}
                className="flex w-full items-center gap-3 rounded-full px-2 py-1.5 text-left hover:bg-blush/60"
            >
                <Avatar user={user} className="size-10 text-sm" />
                <span className="min-w-0 flex-1 leading-tight">
          <span className="block truncate text-sm font-bold">{user.username}</span>
          <span className="block truncate text-xs text-muted">@{user.username}</span>
        </span>
                <Icon name="chevron" className={`size-4 text-muted transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>

            {open && (
                <div role="menu" className="absolute right-2 top-full z-20 mt-1 w-56 overflow-hidden rounded-2xl border border-line bg-surface py-1 shadow-lg">
                    <Link role="menuitem" to={`/profile/${user.username}`} onClick={() => setOpen(false)} className={itemClass}>
                        <Icon name="user" className="size-4" /> View profile
                    </Link>
                    <Link role="menuitem" to="/profile/edit" onClick={() => setOpen(false)} className={itemClass}>
                        <Icon name="more" className="size-4" /> Edit profile
                    </Link>
                    <button
                        role="menuitem"
                        onClick={() => {
                            logout();
                            setOpen(false);
                            navigate('/');
                        }}
                        className={`${itemClass} text-danger`}
                    >
                        <Icon name="logout" className="size-4" /> Log out
                    </button>
                </div>
            )}
        </div>
    );
}

const FOOTER_LINKS = ['Terms of Service', 'Privacy Policy', 'Cookie Policy', 'Accessibility'];

export default function RightRail() {
    const { isLoggedIn } = useAuth();

    return (
        <aside className="sticky top-0 hidden h-screen w-[22rem] shrink-0 overflow-y-auto bg-page px-3 pb-6 lg:block xl:w-[30rem] xl:px-4">
            <UserMenu />
            <div className="space-y-4">
                {isLoggedIn && <SuggestionsCard />}
                <TrendingCard />
            </div>
            <footer className="mt-4 px-1 text-xs text-muted">
                <p className="flex flex-wrap gap-x-3 gap-y-1">
                    {FOOTER_LINKS.map((label) => (
                        <span key={label}>{label}</span>
                    ))}
                </p>
                <p className="mt-2 opacity-70">© {new Date().getFullYear()} DevConnect</p>
            </footer>
        </aside>
    );
}
