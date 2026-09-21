import { YEARLY_DISCOUNT_LABEL } from "./pricing.data";

const PricingHero = ({ yearly, onToggle }) => (
  <section className="flex flex-col items-center gap-5 text-center pt-8 md:pt-16 pb-10">
    <span className="text-[13px] font-semibold tracking-[0.1em] uppercase text-neutral-500 dark:text-neutral-400">Pricing</span>
    <h1 className="font-display text-[40px] md:text-[62px] font-extrabold tracking-[-0.045em] leading-[1.04] max-w-[820px] text-on-surface">
      Simple plans. Upgrade when you need more.
    </h1>
    <p className="text-[17px] md:text-[18px] text-neutral-700 dark:text-neutral-300 max-w-[560px]">
      Start free, then move up when you need automation, AI and deeper reporting.
    </p>
    <div className="flex items-center gap-3.5 mt-2 text-[15px] font-medium">
      <span className={yearly ? "text-neutral-500" : "text-on-surface"}>Monthly</span>
      <button
        type="button"
        role="switch"
        aria-checked={yearly}
        aria-label="Bill yearly"
        onClick={onToggle}
        className="relative w-[60px] h-[34px] rounded-full bg-brand p-0"
      >
        <span
          className={`absolute top-1 left-1 w-[26px] h-[26px] rounded-full bg-mint dark:bg-forest-950 transition-transform duration-200 ease-[cubic-bezier(.2,.8,.2,1)] ${
            yearly ? "translate-x-[26px]" : ""
          }`}
        />
      </button>
      <span className={yearly ? "text-on-surface" : "text-neutral-500"}>Yearly</span>
      <span className="h-[26px] px-2.5 rounded-full bg-neutral-100 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 text-[12px] font-semibold flex items-center">
        {YEARLY_DISCOUNT_LABEL}
      </span>
    </div>
  </section>
);

export default PricingHero;
