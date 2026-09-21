import { Link } from "react-router-dom";
import { PLANS } from "../pricing/pricing.data";

// Compact plan strip that reads from the same data as the pricing page, so
// prices can never disagree between the two.
const PricingTeaser = () => (
  <section className="max-w-[1280px] mx-auto px-6 pb-24 flex flex-col gap-10">
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div className="flex flex-col gap-2.5">
        <h2 className="font-display text-[32px] md:text-[40px] font-extrabold tracking-[-0.03em] text-on-surface">Plans that grow with your team</h2>
        <p className="text-[16px] text-neutral-700 dark:text-neutral-300">Start free. Upgrade when you need automation, AI and deeper reporting.</p>
      </div>
      <Link to="/pricing" className="text-[15px] font-semibold text-on-surface underline underline-offset-4">
        Compare all features
      </Link>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {PLANS.map((p) => {
        const featured = !!p.popular;
        return (
          <div
            key={p.id}
            className={`flex flex-col gap-3.5 p-6 rounded-[22px] border transition-[transform,box-shadow] duration-200 hover:-translate-y-1 hover:shadow-lg ${
              featured ? "bg-forest-900 text-mint border-forest-900" : "bg-white dark:bg-neutral-900 text-on-surface border-neutral-200 dark:border-neutral-800"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-display text-[20px] font-bold">{p.name}</span>
              {featured && <span className="h-[22px] px-2 rounded-full bg-sage text-forest-950 text-[11px] font-semibold flex items-center">Most popular</span>}
            </div>
            <span className="flex items-baseline gap-1.5">
              <span className="font-display text-[32px] font-extrabold tracking-[-0.03em]">{p.price.monthly}</span>
              <span className={`text-[13px] ${featured ? "text-sage" : "text-neutral-500"}`}>{p.unit}</span>
            </span>
            <span className={`text-[14px] leading-relaxed ${featured ? "text-[#b9d6c0]" : "text-neutral-600 dark:text-neutral-400"}`}>{p.summary}</span>
            <Link
              to={p.cta.to}
              className={`mt-auto h-11 rounded-full text-[14px] font-semibold flex items-center justify-center transition-colors ${
                featured ? "bg-sage text-forest-950 hover:bg-mint" : "bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700"
              }`}
            >
              {p.cta.label}
            </Link>
          </div>
        );
      })}
    </div>
  </section>
);

export default PricingTeaser;
