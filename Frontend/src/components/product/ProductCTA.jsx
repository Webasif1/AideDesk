import { Link } from "react-router-dom";

const ProductCTA = () => (
  <section className="border-t border-surface-variant bg-white">
    <div className="max-w-3xl mx-auto px-[24px] py-[64px] text-center">
      <h2 className="text-[30px] font-semibold text-primary mb-[8px]">
        Ready for a faster resolution?
      </h2>
      <p className="text-[14px] text-on-surface-variant leading-relaxed mb-[24px]">
        Join forward-thinking teams using AideDesk to streamline their support
        operations.
      </p>
      <div className="flex flex-col sm:flex-row justify-center gap-[16px]">
        <Link
          to="/signup"
          className="bg-primary text-on-primary px-[32px] py-[12px] rounded-lg font-medium hover:opacity-90 transition-opacity"
        >
          Start Free Trial
        </Link>
        <Link
          to="/demo"
          className="bg-white text-primary border border-surface-variant px-[32px] py-[12px] rounded-lg font-medium hover:bg-surface-container-low transition-colors"
        >
          Book Demo
        </Link>
      </div>
    </div>
  </section>
);

export default ProductCTA;
