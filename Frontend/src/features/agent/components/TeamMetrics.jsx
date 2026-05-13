const metrics = [
  {
    label: "Total Agents",
    value: "42",
    sub: (
      <span className="text-xs text-green-600 font-medium pb-1 flex items-center">
        <span className="material-symbols-outlined text-xs">arrow_upward</span>{" "}
        4%
      </span>
    ),
  },
  {
    label: "Active Now",
    value: "18",
    sub: <span className="w-2 h-2 rounded-full bg-green-500 mb-1" />,
  },
  {
    label: "Avg Performance",
    value: "94%",
    sub: (
      <span className="text-xs text-neutral-400 font-medium pb-1">
        CSAT score
      </span>
    ),
  },
  {
    label: "Open Seats",
    value: "3",
    sub: (
      <span className="text-xs text-neutral-400 font-medium pb-1">
        out of 45
      </span>
    ),
  },
];

const TeamMetrics = () => (
  <div className="grid grid-cols-1 md:grid-cols-4 gap-[24px] mb-8">
    {metrics.map((m) => (
      <div
        key={m.label}
        className="bg-white dark:bg-[#1a1a1a] border border-neutral-200 dark:border-neutral-700 p-[24px] rounded-xl"
      >
        <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-500 dark:text-neutral-400 mb-1">
          {m.label}
        </p>
        <div className="flex items-end gap-2">
          <span className="text-[24px] font-bold text-black dark:text-white">{m.value}</span>
          {m.sub}
        </div>
      </div>
    ))}
  </div>
);

export default TeamMetrics;
