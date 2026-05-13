const metrics = [
  {
    label: "Total Tickets",
    value: "1,284",
    badge: "+12%",
    badgeColor: "text-green-600",
    icon: "confirmation_number",
  },
  {
    label: "Avg Response",
    value: "1.4h",
    badge: "-0.2h",
    badgeColor: "text-green-600",
    icon: "schedule",
  },
  {
    label: "Resolution Rate",
    value: "94.2%",
    badge: "Flat",
    badgeColor: "text-neutral-400",
    icon: "check_circle",
  },
  {
    label: "New This Week",
    value: "312",
    badge: "+4%",
    badgeColor: "text-red-600",
    icon: "trending_up",
  },
];

const TicketMetrics = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[24px] mb-10">
    {metrics.map((m) => (
      <div
        key={m.label}
        className="p-[24px] border border-neutral-200 dark:border-neutral-700 rounded-xl bg-white dark:bg-[#1a1a1a] hover:border-neutral-300 dark:hover:border-neutral-600 transition-colors"
      >
        <div className="flex items-center justify-between mb-[16px]">
          <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
            {m.label}
          </span>
          <span className="material-symbols-outlined text-neutral-400 dark:text-neutral-500 text-[20px]">
            {m.icon}
          </span>
        </div>
        <div className="flex items-baseline gap-[8px]">
          <span className="text-[24px] font-bold text-black dark:text-white">{m.value}</span>
          <span className={`text-[10px] font-semibold ${m.badgeColor}`}>
            {m.badge}
          </span>
        </div>
      </div>
    ))}
  </div>
);

export default TicketMetrics;
