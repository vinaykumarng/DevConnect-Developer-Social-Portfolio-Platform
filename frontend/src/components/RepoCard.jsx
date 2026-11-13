const languageColors = {
    JavaScript: 'bg-yellow-400',
    TypeScript: 'bg-blue-400',
    Python: 'bg-green-400',
    Java: 'bg-orange-400',
    HTML: 'bg-red-400',
    CSS: 'bg-purple-400',
    Go: 'bg-cyan-400',
    Rust: 'bg-orange-600',
};

export default function RepoCard({ repo }) {
    return (
        <a
            href={repo.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-2xl border border-line bg-surface p-4 transition-colors hover:border-plum"
        >
            <div className="flex items-center justify-between">
                <h3 className="truncate text-sm font-bold">{repo.name}</h3>
                <div className="ml-2 flex shrink-0 items-center gap-1 text-xs text-muted">
                    <svg className="size-3.5 text-coral" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.958a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.368 2.447a1 1 0 00-.363 1.118l1.287 3.957c.3.922-.755 1.688-1.538 1.118l-3.367-2.446a1 1 0 00-1.176 0l-3.367 2.446c-.783.57-1.838-.196-1.538-1.118l1.287-3.957a1 1 0 00-.363-1.118L2.813 9.385c-.784-.57-.38-1.81.588-1.81h4.162a1 1 0 00.951-.69l1.286-3.958z" />
                    </svg>
                    {repo.stars}
                </div>
            </div>

            <p className="mt-1.5 line-clamp-2 min-h-[2rem] text-xs text-muted">{repo.description || 'No description'}</p>

            <div className="mt-3 flex items-center gap-3 text-xs text-muted">
                {repo.language && (
                    <span className="flex items-center gap-1">
                        <span className={`size-2 rounded-full ${languageColors[repo.language] || 'bg-muted'}`} />
                        {repo.language}
                    </span>
                )}
                {repo.forks > 0 && <span>{repo.forks} forks</span>}
            </div>
        </a>
    );
}
