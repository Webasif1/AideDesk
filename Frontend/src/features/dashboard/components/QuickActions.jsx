import { useNavigate } from "react-router-dom";

const QuickActions = () => {
  const navigate = useNavigate();

  const actions = [
    {
      label: "Invite Agent",
      icon: "person_add",
      onClick: () => navigate("/dashboard/team"),
    },
  ];

  return (
    <div className="bg-white dark:bg-[#1a1a1a] border border-neutral-200 dark:border-neutral-700 rounded-xl p-[24px] flex flex-col">
      <h4 className="font-bold text-black dark:text-white mb-[24px]">Quick Actions</h4>

      <div className="flex flex-col gap-[12px]">
        {actions.map((a) => (
          <button
            key={a.label}
            onClick={a.onClick}
            className="w-full flex items-center justify-between p-[16px] bg-neutral-50 dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-xl border border-neutral-100 dark:border-neutral-700 transition-all duration-200 group active:scale-[0.98]"
          >
            <div className="flex items-center gap-[12px]">
              <span className="material-symbols-outlined text-neutral-400 dark:text-neutral-500 group-hover:text-black dark:group-hover:text-white transition-colors">
                {a.icon}
              </span>
              <span className="text-[13px] font-semibold text-black dark:text-white">
                {a.label}
              </span>
            </div>
            <span className="material-symbols-outlined text-[18px] text-neutral-300 dark:text-neutral-600">
              chevron_right
            </span>
          </button>
        ))}
      </div>

      {/* Upgrade card */}
      <div className="mt-auto pt-[24px]">
        <div className="bg-neutral-900 dark:bg-black border border-transparent dark:border-neutral-800 text-white rounded-xl p-[16px] relative overflow-hidden">
          <div className="relative z-10">
            <h5 className="text-[10px] font-bold uppercase tracking-widest mb-[4px] text-neutral-300">
              Support Tier
            </h5>
            <p className="text-[17px] font-bold mb-[12px]">Enterprise Plus</p>
            <button
              onClick={() => navigate("/dashboard/billing")}
              className="text-[10px] font-bold bg-white text-black px-[12px] py-[6px] rounded-lg uppercase hover:opacity-90 transition-opacity active:scale-95"
            >
              Upgrade
            </button>
          </div>
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/5 rounded-full blur-2xl" />
        </div>
      </div>
    </div>
  );
};

export default QuickActions;
