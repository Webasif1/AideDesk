import { useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { FAQS } from "./pricing.data";

const PricingFAQ = () => {
  const [open, setOpen] = useState(0);

  return (
    <section className="grid grid-cols-1 lg:grid-cols-[380px_minmax(0,1fr)] gap-10 lg:gap-16 mb-24">
      <div className="flex flex-col gap-3.5">
        <h2 className="font-display text-[30px] md:text-[36px] font-extrabold tracking-[-0.03em] text-on-surface">Questions, answered</h2>
        <p className="text-[16px] leading-relaxed text-neutral-700 dark:text-neutral-300">
          Can't find what you need?{" "}
          <Link to="/support" className="font-semibold underline underline-offset-2">
            Contact our team
          </Link>
          .
        </p>
      </div>
      <div className="flex flex-col gap-2.5">
        {FAQS.map(([q, a], i) => {
          const isOpen = open === i;
          const id = `faq-${i}`;
          return (
            <div
              key={q}
              className={`rounded-[18px] border border-neutral-200 dark:border-neutral-800 transition-colors ${
                isOpen ? "bg-white dark:bg-neutral-900" : "bg-neutral-50 dark:bg-neutral-950"
              }`}
            >
              <h3 className="m-0">
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={id}
                  onClick={() => setOpen(isOpen ? -1 : i)}
                  className="w-full min-h-[62px] px-[22px] flex items-center gap-3 text-left text-[16px] font-semibold text-on-surface"
                >
                  <span className="flex-1">{q}</span>
                  <span
                    className={`material-symbols-outlined text-[20px] text-neutral-600 dark:text-neutral-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                  >
                    expand_more
                  </span>
                </button>
              </h3>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    id={id}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: [0.2, 0.8, 0.2, 1] }}
                    className="overflow-hidden"
                  >
                    <p className="px-[22px] pb-5 text-[15px] leading-relaxed text-neutral-700 dark:text-neutral-300">{a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default PricingFAQ;
