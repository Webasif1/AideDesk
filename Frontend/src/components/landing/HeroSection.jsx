import HeroBadge from './HeroBadge';
import HeroCTAButtons from './HeroCTAButtons';
import ProductPreview from './ProductPreview';

const HeroSection = () => {
  return (
    <header className="pt-stack-xl pb-stack-lg px-6">
      <div className="max-w-[1280px] mx-auto text-center">
        <HeroBadge text="AideDesk 1.0 is live" />
        <h1 className="font-display-xl text-display-xl text-on-surface max-w-4xl mx-auto mb-6">
          AI Customer Support that works while you sleep.
        </h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto mb-10">
          Resolve 90% of customer inquiries instantly. AideDesk routes complex issues to humans and handles the rest with absolute precision.
        </p>
        <HeroCTAButtons />
        <ProductPreview />
      </div>
    </header>
  );
};

export default HeroSection;
