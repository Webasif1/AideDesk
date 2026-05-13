const tabs = [
  { label: "All Customers", count: null },
  { label: "Active", count: null },
  { label: "Suspended", count: 14 },
  { label: "Pending Review", count: null },
];

const CustomerTabs = ({ active, onChange }) => {
  return (
    <div className="flex items-center border-b border-neutral-100 dark:border-neutral-800">
      {tabs.map((t) => (
        <button
          key={t.label}
          onClick={() => onChange(t.label)}
          className={`px-[24px] py-[16px] text-[13px] font-medium transition-colors flex items-center gap-[8px] -mb-[2px] ${
            active === t.label
              ? "font-semibold text-black dark:text-white border-b-2 border-black dark:border-white"
              : "text-neutral-400 dark:text-neutral-500 hover:text-black dark:hover:text-white"
          }`}
        >
          {t.label}
          {t.count && (
            <span className="bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 text-[10px] px-[6px] py-[2px] rounded-full">
              {t.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
};

export default CustomerTabs;
