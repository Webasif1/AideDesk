const REASONS = [
  {
    icon: "inbox",
    title: "Every channel, one queue",
    body: "Email, live chat and portal requests land in the same place, with the same owner, status and SLA timer.",
  },
  {
    icon: "auto_awesome",
    title: "AI drafts, people decide",
    body: "The copilot answers routine questions and drafts tickets for customers to confirm. Agents can take over at any moment.",
  },
  {
    icon: "schedule",
    title: "See SLA risk coming",
    body: "Timers on every ticket and a clear “needs attention” list mean nothing breaches quietly.",
  },
];

const WhySection = () => (
  <section className="max-w-[1280px] mx-auto px-6 pt-24 md:pt-28 pb-16 flex flex-col gap-12">
    <div className="flex flex-col lg:flex-row lg:items-end gap-5 lg:gap-10">
      <h2 className="lg:w-[620px] font-display text-[34px] md:text-[48px] font-extrabold tracking-[-0.035em] leading-[1.08] text-on-surface">
        One calm place for every customer conversation.
      </h2>
      <p className="flex-1 text-[16px] md:text-[17px] leading-relaxed text-neutral-700 dark:text-neutral-300">
        Stop switching between an inbox, a chat tool and a spreadsheet of SLAs. AideDesk keeps the whole picture in one view, so the next right action is always
        obvious.
      </p>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {REASONS.map((r) => (
        <div
          key={r.title}
          className="flex flex-col gap-3.5 p-7 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 transition-[transform,box-shadow] duration-200 hover:-translate-y-1 hover:shadow-lg"
        >
          <span className="w-12 h-12 rounded-[14px] bg-mint dark:bg-forest-800 text-forest-700 dark:text-sage flex items-center justify-center">
            <span className="material-symbols-outlined text-[24px]">{r.icon}</span>
          </span>
          <h3 className="font-display text-[22px] font-bold tracking-[-0.02em] text-on-surface">{r.title}</h3>
          <p className="text-[15px] leading-relaxed text-neutral-600 dark:text-neutral-400">{r.body}</p>
        </div>
      ))}
    </div>
  </section>
);

export default WhySection;
