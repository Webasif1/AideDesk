import LayerFeatureItem from "./LayerFeatureItem";

const PlatformLayer = ({
  layerNumber,
  title,
  description,
  features,
  preview,
  reverse = false,
}) => {
  return (
    <section className="max-w-7xl mx-auto px-8 mb-32">
      <div className="grid grid-cols-12 gap-6 items-center">
        {/* Text Content */}
        <div
          className={`col-span-12 md:col-span-5 ${reverse ? "order-2 md:order-1" : ""}`}
        >
          <div className="text-[12px] font-semibold uppercase tracking-widest text-on-surface-variant mb-4">
            Layer {layerNumber}
          </div>
          <h2 className="text-[32px] font-semibold leading-[1.2] tracking-[-0.01em] text-on-surface mb-6">
            {title}
          </h2>
          <p className="text-[16px] text-on-surface-variant mb-8 leading-relaxed">
            {description}
          </p>
          <div className="flex flex-col gap-4">
            {features.map((f, i) => (
              <div key={f.title}>
                <LayerFeatureItem {...f} />
                {i < features.length - 1 && (
                  <div className="border-b border-surface-container-highest w-full my-4"></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Preview Visual */}
        <div
          className={`col-span-12 md:col-span-7 ${reverse ? "order-1 md:order-2" : ""}`}
        >
          {preview}
        </div>
      </div>
    </section>
  );
};

export default PlatformLayer;
