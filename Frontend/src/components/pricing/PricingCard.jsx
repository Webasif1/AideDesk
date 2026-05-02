const PricingCard = ({
  tier,
  description,
  price,
  priceLabel,
  buttonText,
  buttonStyle,
  features,
  popular,
}) => (
  <div
    className={`bg-surface rounded-xl p-[24px] flex flex-col h-full relative ${popular ? "border-2 border-primary" : "border border-outline-variant hover:border-outline transition-colors"}`}
  >
    {popular && (
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-surface border border-outline-variant rounded-full px-[12px] py-[4px] text-[12px] font-semibold tracking-widest text-on-background whitespace-nowrap">
        Most Popular
      </div>
    )}
    <div className={`mb-[16px] ${popular ? "mt-[8px]" : ""}`}>
      <h3 className="text-[24px] font-medium text-on-background mb-[4px]">
        {tier}
      </h3>
      <p className="text-[14px] text-on-surface-variant h-[42px]">
        {description}
      </p>
    </div>
    <div className="mb-[16px]">
      <span className="text-[30px] font-semibold text-on-background">
        {price}
      </span>
      {priceLabel && (
        <span className="text-[14px] text-on-surface-variant">
          /{priceLabel}
        </span>
      )}
    </div>
    <button
      className={`w-full rounded-lg py-[12px] text-[16px] mb-[16px] transition-all ${buttonStyle}`}
    >
      {buttonText}
    </button>
    <div className="w-full h-px bg-outline-variant mb-[16px]" />
    <ul className="flex flex-col gap-[12px] flex-grow text-[14px] text-on-background">
      {features.map((f, i) => (
        <li
          key={i}
          className={`flex items-center gap-[8px] ${f.disabled ? "text-on-surface-variant" : ""}`}
        >
          <span className="material-symbols-outlined text-[18px]">
            {f.disabled ? "remove" : "check"}
          </span>
          {f.label}
        </li>
      ))}
    </ul>
  </div>
);
export default PricingCard;
