// Underlined tab bar used on Home (For you / Following) and Profile (Posts / Repositories).
export default function Tabs({ tabs, value, onChange }) {
  return (
    <div role="tablist" className="flex border-b border-line">
      {tabs.map((tab) => {
        const active = tab.id === value;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab.id)}
            className="flex-1 transition-colors hover:bg-blush/40"
          >
            <span
              className={`relative inline-block py-4 text-[15px] ${
                active ? 'font-semibold text-plum' : 'text-muted'
              }`}
            >
              {tab.label}
              {active && <span className="absolute inset-x-0 bottom-0 h-1 rounded-full bg-coral" />}
            </span>
          </button>
        );
      })}
    </div>
  );
}
