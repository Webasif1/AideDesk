import { useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { SEGMENTS } from "./solutions.data";

// WAI-ARIA tabs: arrow keys move between segments, Home/End jump to the ends.
const SolutionsExplorer = ({ selected, onSelect }) => {
  const tabRefs = useRef([]);
  const cur = SEGMENTS[selected];

  const onKeyDown = (e) => {
    const last = SEGMENTS.length - 1;
    const next = { ArrowRight: selected + 1, ArrowLeft: selected - 1, Home: 0, End: last }[e.key];
    if (next === undefined) return;
    e.preventDefault();
    const i = next < 0 ? last : next > last ? 0 : next;
    onSelect(i);
    tabRefs.current[i]?.focus();
  };

  return (
    <section className="flex flex-col gap-6">
      <div
        role="tablist"
        aria-label="Solutions by team"
        onKeyDown={onKeyDown}
        className="flex gap-2 p-1.5 rounded-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 self-start max-w-full overflow-x-auto"
      >
        {SEGMENTS.map((s, i) => {
          const on = i === selected;
          return (
            <button
              key={s.id}
              ref={(el) => (tabRefs.current[i] = el)}
              type="button"
              role="tab"
              id={`tab-${s.id}`}
              aria-selected={on}
              aria-controls="solution-panel"
              tabIndex={on ? 0 : -1}
              onClick={() => onSelect(i)}
              className={`h-[42px] px-[18px] rounded-full text-[14px] font-semibold whitespace-nowrap transition-colors ${
                on ? "bg-forest-900 text-mint" : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              }`}
            >
              {s.short}
            </button>
          );
        })}
      </div>

      {/* Keyed so each segment remounts and fades in; no exit phase, so the
          new content is in the DOM immediately even if animation frames stall. */}
      <motion.div
        key={cur.id}
        id="solution-panel"
        role="tabpanel"
        aria-labelledby={`tab-${cur.id}`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.24, ease: [0.2, 0.8, 0.2, 1] }}
        className="grid grid-cols-1 lg:grid-cols-[400px_minmax(0,1fr)] gap-6"
      >
        <div className="flex flex-col gap-5 p-8 md:p-10 rounded-[32px] bg-forest-900 text-mint">
          <span className="w-14 h-14 rounded-[18px] bg-sage text-forest-950 flex items-center justify-center">
            <span className="material-symbols-outlined text-[28px]">{cur.icon}</span>
          </span>
          <h2 className="font-display text-[30px] md:text-[34px] font-extrabold tracking-[-0.03em] leading-[1.1]">{cur.name}</h2>
          <div className="flex flex-col gap-2">
            <span className="text-[12px] font-semibold tracking-[0.08em] uppercase text-sage">The problem</span>
            <p className="text-[16px] leading-relaxed">{cur.problem}</p>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-[12px] font-semibold tracking-[0.08em] uppercase text-sage">How AideDesk helps</span>
            <p className="text-[16px] leading-relaxed text-[#b9d6c0]">{cur.solution}</p>
          </div>
          <Link
            to={cur.cta.to}
            className="mt-auto self-start h-12 px-[22px] rounded-full bg-sage text-forest-950 text-[15px] font-semibold flex items-center hover:bg-mint transition-colors"
          >
            {cur.cta.label}
          </Link>
        </div>

        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-4 p-7 md:p-8 rounded-[28px] bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
            <h3 className="font-display text-[20px] font-bold text-on-surface">Expected workflow</h3>
            <ol className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
              {cur.flow.map(([t, b], i) => (
                <li key={t} className="flex flex-col gap-2.5 p-[18px] rounded-[18px] bg-neutral-50 dark:bg-neutral-950">
                  <span className="w-[30px] h-[30px] rounded-full bg-brand text-white dark:text-black text-[13px] font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                  <span className="text-[14px] font-semibold leading-snug text-on-surface">{t}</span>
                  <span className="text-[13px] leading-relaxed text-neutral-600 dark:text-neutral-400">{b}</span>
                </li>
              ))}
            </ol>
          </div>
          <div className="flex flex-col gap-4 p-7 md:p-8 rounded-[28px] bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
            <h3 className="font-display text-[20px] font-bold text-on-surface">Features you'll lean on</h3>
            <ul className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {cur.features.map((f) => (
                <li key={f} className="flex items-center gap-2.5 px-4 py-3.5 rounded-2xl border border-neutral-200 dark:border-neutral-800 text-[14px] font-medium text-on-surface">
                  <span className="material-symbols-outlined text-[18px] text-ok">check</span>
                  {f}
                </li>
              ))}
            </ul>
            <p className="text-[13px] text-neutral-500">
              Suggested plan: <b className="text-on-surface">{cur.plan}</b>
            </p>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default SolutionsExplorer;
