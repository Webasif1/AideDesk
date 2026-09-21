import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { MODULES } from "./platform.data";

const TONES = {
  ok: "bg-ok-soft text-ok",
  warn: "bg-warn-soft text-warn",
  err: "bg-err-soft text-err",
  info: "bg-info-soft text-info",
  neutral: "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300",
};

// WAI-ARIA tabs (arrow keys, Home/End) with a product preview panel. The list
// is vertical on desktop and scrolls horizontally on phones, so both arrow
// axes move the selection. The preview re-keys per module so its rows stagger
// in on each switch.
const ModuleExplorer = () => {
  const [sel, setSel] = useState(0);
  const tabRefs = useRef([]);
  const cur = MODULES[sel];

  const onKeyDown = (e) => {
    const last = MODULES.length - 1;
    const next = { ArrowDown: sel + 1, ArrowRight: sel + 1, ArrowUp: sel - 1, ArrowLeft: sel - 1, Home: 0, End: last }[e.key];
    if (next === undefined) return;
    e.preventDefault();
    const i = next < 0 ? last : next > last ? 0 : next;
    setSel(i);
    tabRefs.current[i]?.focus();
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-stretch">
      <div
        role="tablist"
        aria-label="Platform modules"
        aria-orientation="vertical"
        onKeyDown={onKeyDown}
        className="lg:w-[320px] shrink-0 flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-1 lg:pb-0"
      >
        {MODULES.map((m, i) => {
          const on = i === sel;
          return (
            <button
              key={m.id}
              ref={(el) => (tabRefs.current[i] = el)}
              type="button"
              role="tab"
              id={`mod-${m.id}`}
              aria-selected={on}
              aria-controls="module-panel"
              tabIndex={on ? 0 : -1}
              onClick={() => setSel(i)}
              className={`flex items-center gap-3 h-[54px] px-4 rounded-2xl text-[15px] font-semibold text-left whitespace-nowrap transition-[background-color,color,transform] duration-150 lg:hover:translate-x-[3px] ${
                on ? "bg-forest-900 text-mint" : "text-on-surface hover:bg-neutral-100 dark:hover:bg-neutral-900"
              }`}
            >
              <span
                className={`w-8 h-8 rounded-[10px] flex items-center justify-center shrink-0 ${
                  on ? "bg-sage text-forest-950" : "bg-neutral-100 dark:bg-neutral-800 text-forest-700 dark:text-sage"
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">{m.icon}</span>
              </span>
              <span className="flex-1">{m.name}</span>
              {m.soon && (
                <span className={`h-5 px-2 rounded-full border text-[11px] font-medium flex items-center ${on ? "border-forest-700" : "border-neutral-300 dark:border-neutral-700"}`}>
                  Soon
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div
        id="module-panel"
        role="tabpanel"
        aria-labelledby={`mod-${cur.id}`}
        className="flex-1 flex flex-col xl:flex-row gap-8 p-7 md:p-10 rounded-[32px] bg-forest-900 text-mint"
      >
        <div className="xl:w-[320px] shrink-0 flex flex-col gap-4">
          <span className="w-[52px] h-[52px] rounded-2xl bg-sage text-forest-950 flex items-center justify-center">
            <span className="material-symbols-outlined text-[26px]">{cur.icon}</span>
          </span>
          <h3 className="font-display text-[28px] md:text-[30px] font-extrabold tracking-[-0.03em] leading-[1.12]">{cur.tagline}</h3>
          <p className="text-[15px] leading-relaxed text-[#b9d6c0]">{cur.desc}</p>
          <ul className="flex flex-col gap-2.5">
            {cur.points.map((p) => (
              <li key={p} className="flex gap-2.5 text-[14px] leading-snug">
                <span className="material-symbols-outlined text-[18px] text-sage">check</span>
                {p}
              </li>
            ))}
          </ul>
        </div>
        <div className="flex-1 min-w-0 flex flex-col rounded-[22px] bg-neutral-50 dark:bg-neutral-950 text-on-surface shadow-[0_30px_60px_rgba(0,0,0,0.35)] overflow-hidden">
          <div className="flex items-center gap-2.5 h-14 px-5 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
            <span className="flex-1 font-display text-[15px] font-bold">{cur.preview.title}</span>
            <span className="h-6 px-2.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-forest-700 dark:text-sage text-[12px] font-semibold flex items-center">
              {cur.preview.chip}
            </span>
          </div>
          <div key={cur.id} className="flex flex-col gap-2.5 p-5">
            {cur.preview.rows.map(([i, a, b, pill, tone], n) => (
              <motion.div
                key={a}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: n * 0.05, ease: [0.2, 0.8, 0.2, 1] }}
                className="flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800"
              >
                <span className="w-9 h-9 shrink-0 rounded-full bg-neutral-100 dark:bg-neutral-800 text-forest-700 dark:text-sage text-[12px] font-bold flex items-center justify-center">
                  {i}
                </span>
                <span className="flex-1 min-w-0 flex flex-col gap-0.5">
                  <span className="text-[14px] font-semibold truncate">{a}</span>
                  <span className="text-[12px] text-neutral-500 truncate">{b}</span>
                </span>
                <span className={`h-6 px-2.5 rounded-full text-[12px] font-semibold whitespace-nowrap flex items-center ${TONES[tone]}`}>{pill}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModuleExplorer;
