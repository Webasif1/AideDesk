const tabs = ["General", "Security", "Billing", "API & Integrations"];

const SettingsTabs = ({ active, onChange }) => (
  <div className="flex gap-[24px] border-b border-neutral-200 dark:border-neutral-800 mb-[32px]">
    {tabs.map((t) => (
      <button
        key={t}
        onClick={() => onChange(t)}
        className={`pb-[16px] text-sm font-medium transition-colors ${
          active === t
            ? "border-b-2 border-black dark:border-white text-black dark:text-white font-semibold"
            : "text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white"
        }`}
      >
        {t}
      </button>
    ))}
  </div>
);

export default SettingsTabs;
