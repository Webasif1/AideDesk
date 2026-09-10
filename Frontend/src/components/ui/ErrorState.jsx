/**
 * Shown when a request failed and there is nothing trustworthy to display.
 *
 * The point is to never let a failure look like data. Tiles that coerced a
 * failed fetch to `?? 0` told operators there were zero agents and zero open
 * tickets, which is indistinguishable from a genuinely empty tenant — and the
 * only visible difference between "nothing is wrong" and "we cannot reach the
 * server" was that the number happened to be zero.
 */
const ErrorState = ({
  title = "Couldn't load this",
  message,
  onRetry,
  compact = false,
}) => (
  <div
    role="alert"
    className={`flex flex-col items-center justify-center text-center ${
      compact ? "py-[20px] px-[12px]" : "py-[40px] px-[24px]"
    }`}
  >
    <span
      className="material-symbols-outlined text-[26px] text-red-500 dark:text-red-400 mb-[8px]"
      aria-hidden="true"
    >
      error_outline
    </span>

    <p className="text-[14px] font-medium text-neutral-800 dark:text-neutral-100">
      {title}
    </p>

    {message && (
      <p className="text-[12px] text-neutral-500 dark:text-neutral-400 mt-[6px] max-w-[320px] leading-relaxed">
        {message}
      </p>
    )}

    {onRetry && (
      <button
        type="button"
        onClick={onRetry}
        className="mt-[14px] inline-flex items-center gap-[6px] px-[14px] py-[7px] rounded-lg border border-neutral-300 dark:border-neutral-600 text-[12px] font-medium text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
      >
        <span className="material-symbols-outlined text-[15px]" aria-hidden="true">
          refresh
        </span>
        Try again
      </button>
    )}
  </div>
);

export default ErrorState;
