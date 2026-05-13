const tabs = [
  { label: "All Tickets", dot: false },
  { label: "Unassigned", dot: false },
  { label: "Recently Updated", dot: false },
  { label: "SLA Warnings", dot: true },
];

const TicketTabs = ({ active, onChange }) => (
  <div className="border-b border-neutral-200 dark:border-neutral-800 mb-6 flex items-center justify-between">
    <div className="flex gap-8">
      {tabs.map((t) => (
        <button
          key={t.label}
          onClick={() => onChange(t.label)}
          className={`pb-4 text-sm font-medium transition-colors relative ${
            active === t.label
              ? "text-black dark:text-white border-b-2 border-black dark:border-white font-semibold"
              : "text-neutral-400 hover:text-black dark:hover:text-white"
          }`}
        >
          {t.label}
          {t.dot && (
            <span className="absolute top-0 -right-2 w-1.5 h-1.5 bg-red-500 rounded-full" />
          )}
        </button>
      ))}
    </div>

    <div className="flex items-center gap-3 pb-4">
      <button className="flex items-center gap-2 px-3 py-1.5 border border-neutral-200 dark:border-neutral-700 rounded text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
        <span className="material-symbols-outlined text-sm">filter_list</span>
        Filters
      </button>
      <button className="flex items-center gap-2 px-3 py-1.5 border border-neutral-200 dark:border-neutral-700 rounded text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
        <span className="material-symbols-outlined text-sm">download</span>
        Export
      </button>
    </div>
  </div>
);

export default TicketTabs;
