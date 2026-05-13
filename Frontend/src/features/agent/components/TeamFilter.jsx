const filters = ["All Agents", "Online", "Offline", "Pending"];

const TeamFilter = ({ active, onChange, search, onSearch }) => (
  <div className="flex flex-col md:flex-row md:items-center justify-between p-[16px] border-b border-neutral-200 dark:border-neutral-700 gap-4">
    <div className="flex items-center gap-1 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg w-fit">
      {filters.map((f) => (
        <button
          key={f}
          onClick={() => onChange(f)}
          className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
            active === f
              ? "bg-white dark:bg-[#1a1a1a] border border-neutral-200 dark:border-neutral-700 shadow-sm text-black dark:text-white"
              : "text-neutral-500 hover:text-black dark:hover:text-white"
          }`}
        >
          {f}
        </button>
      ))}
    </div>
    <div className="relative flex-1 max-w-sm">
      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-[20px]">
        search
      </span>
      <input
        value={search}
        onChange={(e) => onSearch(e.target.value)}
        className="w-full pl-10 pr-4 py-2 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-black dark:text-white rounded-lg text-sm placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:ring-1 focus:ring-black dark:focus:ring-white outline-none transition-all"
        placeholder="Search agents by name or ID..."
        type="text"
      />
    </div>
  </div>
);

export default TeamFilter;
