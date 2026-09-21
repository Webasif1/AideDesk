import Badge from "../../../components/ui/Badge";

// badgeType maps onto the shared Badge tones; "success" is kept for callers
// written before the design-system tones existed.
const TONE = { success: "ok", neutral: "neutral", warn: "warn", err: "err", info: "info", ok: "ok" };

const KpiCard = ({ icon, label, value, badge, badgeType = "neutral" }) => (
  <div className="flex flex-col gap-3 p-5 rounded-[20px] bg-white dark:bg-[#0b2b26] border border-neutral-200 dark:border-neutral-800 transition-shadow hover:shadow-md">
    <div className="flex items-center justify-between gap-2">
      <span className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-neutral-900 text-forest-700 dark:text-sage flex items-center justify-center">
        <span className="material-symbols-outlined text-[20px]">{icon}</span>
      </span>
      {badge && <Badge tone={TONE[badgeType] || "neutral"}>{badge}</Badge>}
    </div>
    <div className="flex flex-col gap-0.5">
      <p className="text-[13px] font-medium text-neutral-600 dark:text-neutral-400">{label}</p>
      <p className="font-display text-[30px] font-bold tracking-[-0.03em] text-on-surface">{value}</p>
    </div>
  </div>
);

export default KpiCard;
