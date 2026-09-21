// Capability strip under the hero. Facts about the product, not performance
// figures: add real customer metrics here only once they exist.
const ITEMS = [
  { icon: "inbox", value: "One queue", label: "Email, chat and portal together" },
  { icon: "badge", value: "Three roles", label: "Admin, agent and customer views" },
  { icon: "auto_awesome", value: "AI first pass", label: "Copilot answers, people decide" },
  { icon: "bolt", value: "Live", label: "Real-time updates for every agent" },
];

const StatsSection = () => (
  <section aria-label="What AideDesk includes" className="border-b border-neutral-200 dark:border-neutral-900 bg-surface">
    <div className="max-w-[1280px] mx-auto px-6 py-10 grid grid-cols-2 lg:grid-cols-4 gap-6">
      {ITEMS.map((it) => (
        <div key={it.value} className="flex items-center gap-3.5">
          <span className="w-11 h-11 shrink-0 rounded-2xl bg-neutral-100 dark:bg-neutral-900 text-forest-700 dark:text-sage flex items-center justify-center">
            <span className="material-symbols-outlined text-[22px]">{it.icon}</span>
          </span>
          <span className="flex flex-col gap-0.5">
            <span className="font-display text-[17px] font-bold text-on-surface">{it.value}</span>
            <span className="text-[13px] text-neutral-600 dark:text-neutral-400 leading-snug">{it.label}</span>
          </span>
        </div>
      ))}
    </div>
  </section>
);

export default StatsSection;
