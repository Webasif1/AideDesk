// Saved-view tabs. The active view's count falls back to the list's own total
// when stats can't count it (Unassigned, and every customer view).
const TicketTabs = ({ views, active, onChange, stats, activeTotal }) => (
  <div role="tablist" aria-label="Saved views" className="flex gap-1 overflow-x-auto border-b border-neutral-200 dark:border-neutral-800">
    {views.map((v) => {
      const selected = v.id === active;
      const n = v.count && stats ? v.count(stats) : selected ? activeTotal : null;
      return (
        <button
          key={v.id}
          type="button"
          role="tab"
          aria-selected={selected}
          onClick={() => onChange(v.id)}
          className={`h-10 px-3.5 flex items-center gap-2 shrink-0 text-[13px] transition-colors ${
            selected
              ? "font-semibold text-on-surface shadow-[inset_0_-2px_0_var(--color-brand)] dark:shadow-[inset_0_-2px_0_var(--color-sage)]"
              : "font-medium text-neutral-500 hover:text-on-surface"
          }`}
        >
          {v.label}
          {n != null && (
            <span
              className={`h-5 px-[7px] rounded-full text-[11px] font-semibold inline-flex items-center ${
                selected
                  ? "bg-brand text-mint dark:bg-sage dark:text-forest-950"
                  : "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
              }`}
            >
              {n.toLocaleString()}
            </span>
          )}
        </button>
      );
    })}
  </div>
);

export default TicketTabs;
