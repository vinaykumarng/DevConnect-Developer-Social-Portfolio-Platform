import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Icon, { Logo } from '../Icons';

// Only Home has a real page today. The rest open a "coming soon" page (see App.jsx).
const NAV = [
    { label: 'Home', to: '/', icon: 'home' },
    { label: 'Explore', to: '/explore', icon: 'search' },
    { label: 'Notifications', to: '/notifications', icon: 'bell' },
    { label: 'Messages', to: '/messages', icon: 'mail' },
    { label: 'Communities', to: '/communities', icon: 'users' },
    { label: 'Premium', to: '/premium', icon: 'sparkles' },
    { label: 'More', to: '/more', icon: 'more' },
];

export default function Sidebar() {
    const { isLoggedIn, user } = useAuth();
    const navigate = useNavigate();

    const startPost = () => {
        if (!isLoggedIn) return navigate('/login');
        navigate('/');
        setTimeout(() => document.getElementById('composer')?.focus(), 50);
    };

    const linkClass = ({ isActive }) =>
        `flex items-center gap-4 rounded-full px-3 py-3 text-[15px] transition-colors xl:px-4 ${
            isActive ? 'bg-blush font-semibold' : 'hover:bg-blush/60'
        }`;

    const mobileClass = ({ isActive }) =>
        `grid place-items-center rounded-full p-2.5 ${isActive ? 'bg-blush' : ''}`;

    return (
        <>
            {/* md and up: icon rail, full labels from xl */}
            <aside className="sticky top-0 hidden h-screen w-16 shrink-0 flex-col bg-page px-2 py-5 md:flex xl:w-[212px] xl:px-[18px]">
                <Link to="/" className="mb-6 px-1 xl:px-0" aria-label="DevConnect home">
                    <Logo textClass="hidden xl:inline" />
                </Link>

                <nav className="flex flex-col gap-1">
                    {NAV.map((item) => (
                        <NavLink key={item.to} to={item.to} end={item.to === '/'} className={linkClass} title={item.label}>
                            <Icon name={item.icon} className="size-6 shrink-0" />
                            <span className="hidden xl:inline">{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                <button
                    onClick={startPost}
                    className="mt-6 grid h-11 w-11 place-items-center self-center rounded-full bg-plum text-sm font-semibold text-white transition-colors hover:bg-plum-soft xl:w-full"
                    aria-label="Post"
                >
                    <Icon name="comment" className="size-5 xl:hidden" />
                    <span className="hidden xl:inline">Post</span>
                </button>
            </aside>

            {/* below md: bottom bar */}
            <nav className="fixed inset-x-0 bottom-0 z-40 flex justify-around border-t border-line bg-page py-1.5 md:hidden">
                <NavLink to="/" end className={mobileClass} aria-label="Home">
                    <Icon name="home" className="size-6" />
                </NavLink>
                <NavLink to="/explore" className={mobileClass} aria-label="Explore">
                    <Icon name="search" className="size-6" />
                </NavLink>
                <button onClick={startPost} className="grid place-items-center rounded-full bg-plum p-2.5 text-white" aria-label="Post">
                    <Icon name="comment" className="size-6" />
                </button>
                <NavLink to="/notifications" className={mobileClass} aria-label="Notifications">
                    <Icon name="bell" className="size-6" />
                </NavLink>
                <NavLink
                    to={isLoggedIn ? `/profile/${user.username}` : '/login'}
                    className={mobileClass}
                    aria-label={isLoggedIn ? 'Profile' : 'Log in'}
                >
                    <Icon name="user" className="size-6" />
                </NavLink>
            </nav>
        </>
    );
}
