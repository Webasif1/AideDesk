/**
 * Absolute overlay that marks a panel as not-yet-available. Drop it inside a
 * `relative` container; the panel content behind it should be wrapped in
 * `pointer-events-none select-none` so it reads as inactive.
 */
const ComingSoonOverlay = ({ label = "Coming Soon", sub }) => (
  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center px-6 bg-white/50 dark:bg-black/50 backdrop-blur-[3px]">
    <span className="material-symbols-outlined text-[26px] text-neutral-500 dark:text-neutral-300 mb-2">
      lock
    </span>
    <span className="px-3 py-1 rounded-full bg-black dark:bg-white text-white dark:text-black text-[11px] font-bold uppercase tracking-widest">
      {label}
    </span>
    {sub && (
      <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-2 max-w-[220px] leading-relaxed">
        {sub}
      </p>
    )}
  </div>
);

export default ComingSoonOverlay;
