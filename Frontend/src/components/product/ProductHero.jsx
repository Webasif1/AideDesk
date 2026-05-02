const ProductHero = () => (
  <section className="max-w-[1280px] mx-auto px-[24px] pt-[64px] pb-[48px]">
    <div className="text-center max-w-3xl mx-auto mb-[48px]">
      <h1 className="text-[48px] font-semibold tracking-tight leading-[1.1] text-primary mb-[16px] md:text-[56px]">
        Engineered for resolution.
      </h1>
      <p className="text-[16px] text-on-surface-variant max-w-2xl mx-auto leading-relaxed">
        AideDesk is the structural foundation for modern customer support. We
        combined deterministic routing with generative AI to create a console
        that resolves issues before they escalate.
      </p>
    </div>
    <div className="relative w-full aspect-[16/9] md:aspect-[21/9] rounded-lg border border-surface-variant bg-surface-container-low overflow-hidden">
      <img
        alt="Dashboard preview"
        className="w-full h-full object-cover opacity-90 mix-blend-luminosity"
        src="https://images.unsplash.com/photo-1717501217780-03809da32358?q=80&w=3264&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&fit=crop"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest via-transparent to-transparent" />
    </div>
  </section>
);
export default ProductHero;
