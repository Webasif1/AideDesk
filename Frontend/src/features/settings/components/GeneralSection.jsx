const GeneralSection = () => (
  <section className="bg-white dark:bg-[#1a1a1a] border border-neutral-200 dark:border-neutral-700 rounded-xl overflow-hidden">
    <div className="px-[24px] py-[16px] border-b border-neutral-100 dark:border-neutral-800">
      <h3 className="text-[18px] font-semibold text-black dark:text-white">
        General Workspace
      </h3>
    </div>
    <div className="p-[24px] space-y-[24px]">
      {/* Workspace Name */}
      <div className="grid grid-cols-12 gap-[24px] items-center">
        <div className="col-span-4">
          <label className="text-[12px] font-semibold uppercase tracking-widest text-neutral-500 dark:text-neutral-400 block">
            Workspace Name
          </label>
          <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">
            Visible to all team members.
          </p>
        </div>
        <div className="col-span-8">
          <input
            type="text"
            defaultValue="AideDesk Corp"
            className="w-full px-[16px] py-[8px] bg-neutral-50 dark:bg-[#111] border border-neutral-200 dark:border-neutral-600 text-black dark:text-white rounded-lg text-sm focus:border-black dark:focus:border-white focus:ring-0 outline-none transition-colors"
          />
        </div>
      </div>

      {/* Logo */}
      <div className="grid grid-cols-12 gap-[24px] items-center">
        <div className="col-span-4">
          <label className="text-[12px] font-semibold uppercase tracking-widest text-neutral-500 dark:text-neutral-400 block">
            Workspace Logo
          </label>
          <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">
            Max 2MB. Recommended 512×512.
          </p>
        </div>
        <div className="col-span-8 flex items-center gap-[16px]">
          <div className="w-16 h-16 bg-neutral-100 dark:bg-neutral-800 border border-dashed border-neutral-300 dark:border-neutral-700 rounded-xl flex items-center justify-center">
            <span className="material-symbols-outlined text-neutral-400 dark:text-neutral-600">
              upload_file
            </span>
          </div>
          <button className="px-[16px] py-[8px] border border-neutral-200 dark:border-neutral-700 text-black dark:text-white rounded-lg text-sm font-medium hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
            Update Logo
          </button>
          <button className="text-xs font-medium text-red-600 dark:text-red-500 hover:underline">
            Remove
          </button>
        </div>
      </div>

      {/* Timezone */}
      <div className="grid grid-cols-12 gap-[24px] items-center">
        <div className="col-span-4">
          <label className="text-[12px] font-semibold uppercase tracking-widest text-neutral-500 dark:text-neutral-400 block">
            Timezone
          </label>
        </div>
        <div className="col-span-8">
          <select className="w-full px-[16px] py-[8px] bg-neutral-50 dark:bg-[#111] border border-neutral-200 dark:border-neutral-600 text-black dark:text-white rounded-lg text-sm focus:border-black dark:focus:border-white focus:ring-0 outline-none transition-colors">
            <option>(GMT-08:00) Pacific Time (US & Canada)</option>
            <option>(GMT-05:00) Eastern Time (US & Canada)</option>
            <option>(GMT+00:00) UTC</option>
          </select>
        </div>
      </div>

      {/* Save */}
      <div className="flex justify-end pt-[8px]">
        <button className="bg-black dark:bg-white text-white dark:text-black px-[24px] py-[8px] rounded-lg text-sm font-medium hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors active:scale-95">
          Save Changes
        </button>
      </div>
    </div>
  </section>
);

export default GeneralSection;
