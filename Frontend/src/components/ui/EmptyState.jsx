/**
 * The honest answer to "there is nothing here".
 *
 * Distinct from ErrorState: this means the request succeeded and returned
 * nothing, which is a fact worth stating plainly. Several screens previously
 * filled that gap with invented sample rows — a fabricated device list, a
 * fabricated invoice history — which read as real data to anyone looking.
 */
const EmptyState = ({ icon = "inbox", title, body, action, compact = false }) => (
  <div
    className={`flex flex-col items-center justify-center text-center ${
      compact ? "py-[24px] px-[16px]" : "py-[48px] px-[24px]"
    }`}
  >
    <span
      className="material-symbols-outlined text-[28px] text-neutral-400 dark:text-neutral-500 mb-[10px]"
      aria-hidden="true"
    >
      {icon}
    </span>

    {title && (
      <p className="text-[14px] font-medium text-neutral-700 dark:text-neutral-200">
        {title}
      </p>
    )}

    {body && (
      <p className="text-[12px] text-neutral-500 dark:text-neutral-400 mt-[6px] max-w-[320px] leading-relaxed">
        {body}
      </p>
    )}

    {action && <div className="mt-[16px]">{action}</div>}
  </div>
);

export default EmptyState;
