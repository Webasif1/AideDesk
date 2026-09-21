import { Link } from "react-router-dom";

// The popular plan is the one forest card; the rest are light surfaces so the
// eye lands on it first, while the identical row order keeps them comparable.
const PricingCard = ({ plan, yearly }) => {
  const featured = !!plan.popular;
  const price = yearly ? plan.price.yearly : plan.price.monthly;
  const billing = plan.billingNote || (plan.unit.startsWith("/") ? (yearly ? "Billed yearly" : "Billed monthly") : "");

  return (
    <div
      className={`relative flex flex-col gap-[18px] p-[28px] rounded-[28px] border transition-[transform,box-shadow] duration-200 ease-[cubic-bezier(.2,.8,.2,1)] hover:-translate-y-1.5 hover:shadow-xl ${
        featured
          ? "bg-forest-900 text-mint border-forest-900 dark:border-forest-700"
          : "bg-white dark:bg-neutral-900 text-on-surface border-neutral-200 dark:border-neutral-800"
      }`}
    >
      <div className="flex items-center justify-between">
        <h3 className="font-display text-[22px] font-extrabold">{plan.name}</h3>
        {featured && (
          <span className="h-6 px-2.5 rounded-full bg-sage text-forest-950 text-[12px] font-semibold flex items-center">Most popular</span>
        )}
      </div>
      <p className={`text-[14px] leading-relaxed min-h-[42px] ${featured ? "text-[#b9d6c0]" : "text-neutral-600 dark:text-neutral-400"}`}>{plan.summary}</p>
      <div className="flex flex-col gap-1">
        <span className="flex items-baseline gap-1.5">
          <span className="font-display text-[40px] font-extrabold tracking-[-0.03em]">{price}</span>
          {plan.unit && <span className={`text-[13px] ${featured ? "text-sage" : "text-neutral-500"}`}>{plan.unit}</span>}
        </span>
        <span className={`text-[12px] min-h-4 ${featured ? "text-sage" : "text-neutral-500"}`}>{billing}</span>
      </div>
      <Link
        to={plan.cta.to}
        className={`h-12 rounded-full text-[15px] font-semibold flex items-center justify-center transition-colors ${
          featured
            ? "bg-sage text-forest-950 hover:bg-mint"
            : plan.id === "enterprise"
              ? "bg-brand text-white dark:text-black hover:bg-brand-hover"
              : "border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800"
        }`}
      >
        {plan.cta.label}
      </Link>
      <div className={`h-px ${featured ? "bg-forest-700" : "bg-neutral-200 dark:bg-neutral-800"}`} />
      <dl className="flex flex-col gap-3">
        {plan.items.map(([k, v]) => (
          <div key={k} className="grid grid-cols-[92px_minmax(0,1fr)] gap-2.5 text-[13px] leading-snug">
            <dt className={featured ? "text-sage" : "text-neutral-500 dark:text-neutral-400"}>{k}</dt>
            <dd className="font-semibold m-0">{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
};

export default PricingCard;
