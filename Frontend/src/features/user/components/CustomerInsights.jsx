const insights = [
  {
    icon: "auto_graph",
    title: "Weekly Growth Insight",
    body: (
      <>
        Your customer base has grown by 12.5% this week. Most new signups are
        coming from the <span className="font-bold text-black">Enterprise</span>{" "}
        segment.
      </>
    ),
  },
  {
    icon: "security",
    title: "Account Security",
    body: (
      <>
        Currently <span className="font-bold text-black">14 accounts</span> are
        suspended due to inactivity or policy violations. Review them in the
        Suspended tab.
      </>
    ),
  },
];

const CustomerInsights = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-[24px]">
      {insights.map((i) => (
        <div
          key={i.title}
          className="p-[24px] bg-white dark:bg-[#1a1a1a] border border-neutral-100 dark:border-neutral-700 rounded-xl flex items-start gap-[16px]"
        >
          <div className="w-10 h-10 bg-neutral-50 dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700 rounded-xl flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-black dark:text-white">
              {i.icon}
            </span>
          </div>
          <div>
            <h4 className="text-[13px] font-bold text-black dark:text-white mb-[4px]">
              {i.title}
            </h4>
            <p className="text-[12px] text-neutral-500 dark:text-neutral-400 leading-relaxed">
              {i.body}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CustomerInsights;
