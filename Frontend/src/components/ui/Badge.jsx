// Pill badge in one of the status tones from App.css. Pass `dot` for the
// leading status dot; the label always carries the meaning, colour only
// reinforces it.
const BADGE_TONES = {
  neutral: "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300",
  brand: "bg-brand text-white dark:text-black",
  ok: "bg-ok-soft text-ok",
  warn: "bg-warn-soft text-warn",
  err: "bg-err-soft text-err",
  info: "bg-info-soft text-info",
};

const Badge = ({ tone = "neutral", dot = false, className = "", children }) => (
  <span
    className={`inline-flex items-center gap-[6px] h-[24px] px-[10px] rounded-full text-[12px] font-medium whitespace-nowrap ${
      BADGE_TONES[tone] || BADGE_TONES.neutral
    } ${className}`}
  >
    {dot && <span aria-hidden="true" className="w-[6px] h-[6px] rounded-full bg-current" />}
    {children}
  </span>
);

export default Badge;
