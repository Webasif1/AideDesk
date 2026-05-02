const FeatureSection = ({
  label,
  title,
  description,
  features,
  visual,
  reverse = false,
}) => (
  <div className="max-w-[1280px] mx-auto px-[24px] py-[48px]">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-[32px] items-center">
      <div className={reverse ? "order-2 md:order-1" : "order-2 md:order-2"}>
        {visual}
      </div>
      <div className={reverse ? "order-1 md:order-2" : "order-1 md:order-1"}>
        <span className="text-[12px] font-semibold tracking-widest uppercase text-primary bg-surface-container-low px-[8px] py-[4px] rounded mb-[16px] inline-block">
          {label}
        </span>
        <h2 className="text-[30px] font-semibold text-primary mb-[16px]">
          {title}
        </h2>
        <p className="text-[14px] text-on-surface-variant leading-relaxed mb-[24px]">
          {description}
        </p>
        {features && (
          <ul className="flex flex-col gap-[8px]">
            {features.map((f) => (
              <li
                key={f}
                className="flex items-start gap-[8px] border-b border-surface-variant pb-[8px]"
              >
                <span className="material-symbols-outlined text-primary text-[20px]">
                  check
                </span>
                <span className="text-[13px] text-on-surface">{f}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  </div>
);
export default FeatureSection;
