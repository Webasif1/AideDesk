const DangerZone = () => (
  <section className="border border-red-200 dark:border-red-900 bg-red-50/30 dark:bg-red-950/30 rounded-xl p-[24px]">
    <div className="flex items-center justify-between">
      <div>
        <h3 className="text-sm font-bold text-red-600 dark:text-red-500">Danger Zone</h3>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
          Permanently delete this workspace and all associated data.
        </p>
      </div>
      <button className="px-[24px] py-[8px] border border-red-500 dark:border-red-700 text-red-600 dark:text-red-500 text-sm font-semibold rounded-lg hover:bg-red-600 dark:hover:bg-red-700 hover:text-white transition-all">
        Delete Workspace
      </button>
    </div>
  </section>
);

export default DangerZone;
