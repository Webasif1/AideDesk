import { useSelector } from "react-redux";

const CustomerInsights = () => {
  const stats = useSelector((s) => s.user.stats);

  const insights = [
    {
      icon: "auto_graph",
      title: "Monthly Growth",
      body: stats ? (
        <>
          <span className="font-bold text-black dark:text-white">{stats.newThisMonth}</span>{" "}
          new customer{stats.newThisMonth === 1 ? "" : "s"} joined this month, bringing
          the workspace total to{" "}
          <span className="font-bold text-black dark:text-white">{stats.total}</span>.
        </>
      ) : (
        "Growth insights appear once customer data loads."
      ),
    },
    {
      icon: "groups",
      title: "Engagement",
      body: stats ? (
        <>
          <span className="font-bold text-black dark:text-white">{stats.active}</span> of{" "}
          {stats.total} customers were active in the last 30 days — an active rate of{" "}
          <span className="font-bold text-black dark:text-white">{stats.activeRate}%</span>.
        </>
      ) : (
        "Engagement insights appear once customer data loads."
      ),
    },
  ];

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
