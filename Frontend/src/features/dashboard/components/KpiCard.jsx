const KpiCard = ({ icon, label, value, badge, badgeType = "success" }) => {
  const badgeStyles = {
    success: "text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950",
    neutral: "text-neutral-400 bg-neutral-50 dark:text-neutral-400 dark:bg-neutral-900",
  };

  return (
    <div className="bg-white dark:bg-[#1a1a1a] border border-neutral-200 dark:border-neutral-700 rounded-xl p-[24px] transition-all hover:border-black/20 dark:hover:border-white/20">
      <div className="flex justify-between items-start mb-[16px]">
        <div className="p-[8px] bg-neutral-50 dark:bg-neutral-700 rounded-lg text-black dark:text-white">
          <span className="material-symbols-outlined">{icon}</span>
        </div>
        <span
          className={`text-[11px] font-semibold px-[8px] py-[4px] rounded-full ${badgeStyles[badgeType]}`}
        >
          {badge}
        </span>
      </div>
      <p className="text-neutral-500 dark:text-neutral-400 text-[13px] font-medium">{label}</p>
      <h3 className="text-[30px] font-bold mt-[4px] tracking-tight text-black dark:text-white">{value}</h3>
    </div>
  );
};

export default KpiCard;
