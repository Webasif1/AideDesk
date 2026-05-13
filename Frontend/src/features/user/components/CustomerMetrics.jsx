const metrics = [
  {
    label: "Total Customers",
    value: "12,842",
    right: (
      <span className="text-[11px] text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-[8px] py-[2px] rounded-full font-medium">
        +12.5%
      </span>
    ),
  },
  {
    label: "Active Seats",
    value: "8,102",
    right: (
      <div className="h-1.5 w-24 bg-neutral-100 dark:bg-neutral-700 rounded-full overflow-hidden">
        <div className="h-full bg-black dark:bg-white w-2/3" />
      </div>
    ),
  },
  {
    label: "Retention Rate",
    value: "94.2%",
    right: (
      <span className="text-[11px] text-neutral-400 dark:text-neutral-500 font-medium">Global</span>
    ),
  },
  {
    label: "New This Month",
    value: "421",
    right: (
      <span className="material-symbols-outlined text-neutral-300 dark:text-neutral-600">
        trending_up
      </span>
    ),
  },
];

const CustomerMetrics = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[24px]">
      {metrics.map((m) => (
        <div
          key={m.label}
          className="bg-white dark:bg-[#1a1a1a] border border-neutral-100 dark:border-neutral-700 p-[24px] rounded-xl"
        >
          <p className="text-[11px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest mb-[8px]">
            {m.label}
          </p>
          <div className="flex items-end justify-between">
            <h3 className="text-[22px] font-bold text-black dark:text-white">{m.value}</h3>
            {m.right}
          </div>
        </div>
      ))}
    </div>
  );
};

export default CustomerMetrics;
