import { TRENDING } from '../data/trending';

// Placeholder content: see data/trending.js
export default function TrendingCard() {
  return (
    <section className="overflow-hidden rounded-2xl border border-line bg-surface">
      <h2 className="border-b border-line px-4 py-3 text-[15px] font-bold">Trending in Tech</h2>
      <ul className="divide-y divide-line">
        {TRENDING.map((item, i) => (
          <li key={item.tag} className="px-4 py-2.5">
            <p className="text-xs text-muted">
              {item.category} · {i + 1}
            </p>
            <p className="text-sm font-bold">{item.tag}</p>
            <p className="text-xs text-muted">{item.posts}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
