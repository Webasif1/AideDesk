const TeamCapacity = () => (
  <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-[24px]">
    {/* Capacity panel */}
    <div className="md:col-span-2 bg-white dark:bg-[#1a1a1a] border border-neutral-200 dark:border-neutral-700 p-[24px] rounded-xl flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h4 className="text-[18px] font-semibold text-black dark:text-white">Team Capacity</h4>
        <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
          Live Updates
        </span>
      </div>
      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="font-medium text-black dark:text-white">Active Bandwidth</span>
            <span className="text-neutral-500 dark:text-neutral-400">82%</span>
          </div>
          <div className="h-1.5 w-full bg-neutral-100 dark:bg-neutral-800 rounded-full">
            <div
              className="h-full bg-black dark:bg-white rounded-full"
              style={{ width: "82%" }}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-[16px] bg-neutral-50 dark:bg-neutral-800 rounded-xl border border-neutral-100 dark:border-neutral-700">
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">Peak Online</p>
            <p className="text-[18px] font-bold text-black dark:text-white">24 Agents</p>
          </div>
          <div className="p-[16px] bg-neutral-50 dark:bg-neutral-800 rounded-xl border border-neutral-100 dark:border-neutral-700">
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">Current Backlog</p>
            <p className="text-[18px] font-bold text-black dark:text-white">142 Tickets</p>
          </div>
        </div>
      </div>
    </div>

    {/* AI hire card */}
    <div className="bg-black text-white p-[24px] rounded-xl flex flex-col justify-between">
      <div>
        <span className="material-symbols-outlined text-[32px] mb-4 block">
          auto_awesome
        </span>
        <h4 className="text-[18px] font-bold mb-2">Hire with AI</h4>
        <p className="text-sm text-neutral-400 leading-relaxed">
          Let AideDesk analyze your ticket trends to recommend the optimal
          staffing levels for next quarter.
        </p>
      </div>
      <button className="mt-6 w-full py-2 bg-white text-black font-semibold rounded-lg text-sm hover:bg-neutral-100 transition-colors">
        Start Analysis
      </button>
    </div>
  </div>
);

export default TeamCapacity;
