import { Link } from 'react-router-dom';
import { Logo } from '../Icons';

// Centered card used by Login and Signup. Pass `onGoogle` once Google login exists;
// until then the button is shown but disabled. To add Phone / Apple, add entries here.
export default function AuthLayout({ title, onGoogle, children, footer }) {
    const providers = [
        {
            key: 'google',
            label: 'Continue with Google',
            icon: <span className="text-base font-bold text-[#4285f4]">G</span>,
            onClick: onGoogle,
        },
    ];

    return (
        <div className="min-h-screen bg-page px-4 py-10 sm:py-20">
            <div className="mx-auto w-full max-w-[507px] bg-surface px-6 pb-16 pt-10 shadow-sm ring-1 ring-black/5 sm:px-[117px]">
                <Link to="/" className="flex justify-center" aria-label="DevConnect home">
                    <Logo />
                </Link>

                <h1 className="mb-12 mt-16 text-center text-5xl font-light tracking-tight sm:text-6xl">{title}</h1>

                <div className="mx-auto w-full max-w-[300px]">
                    <div className="space-y-3">
                        {providers.map((p) => (
                            <button
                                key={p.key}
                                type="button"
                                onClick={p.onClick}
                                disabled={!p.onClick}
                                title={p.onClick ? undefined : 'Coming soon'}
                                className="flex h-10 w-full items-center justify-center gap-3 rounded-full bg-plum text-sm font-bold text-white transition-colors hover:bg-plum-soft disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                <span className="grid size-5 place-items-center rounded-full bg-white">{p.icon}</span>
                                {p.label}
                            </button>
                        ))}
                    </div>

                    {children}

                    <div className="mt-6 space-y-3 text-xs text-muted">{footer}</div>
                </div>
            </div>
        </div>
    );
}

export function OrDivider() {
    return (
        <div className="my-5 flex items-center gap-3 text-sm text-muted" role="separator">
            <span className="h-px flex-1 bg-muted/60" />
            or
            <span className="h-px flex-1 bg-muted/60" />
        </div>
    );
}
