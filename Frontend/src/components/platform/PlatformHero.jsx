import { Link } from "react-router-dom";

const PlatformHero = () => {
  return (
    <section className="max-w-7xl mx-auto px-8 mb-32 grid grid-cols-12 gap-6 items-center">
      <div className="col-span-12 md:col-span-7">
        <span className="text-[12px] font-semibold uppercase tracking-widest text-on-surface-variant mb-4 block">
          System Architecture
        </span>
        <h1 className="text-[48px] font-semibold leading-[1.1] tracking-[-0.02em] text-on-surface mb-6">
          Intelligence, structured for execution.
        </h1>
        <p className="text-[18px] text-on-surface-variant max-w-2xl mb-8 leading-relaxed">
          The AideDesk platform is built on a tri-layer architecture designed to
          separate cognition, action, and governance. Discover how our system
          translates raw intent into verifiable outcomes.
        </p>
        <div className="flex gap-4">
          <Link
            to="/docs"
            className="text-[14px] bg-primary text-on-primary px-6 py-3 rounded-lg hover:opacity-90 transition-opacity"
          >
            Explore Documentation
          </Link>
          <Link
            to="/docs"
            className="text-[14px] border border-surface-container-highest text-on-surface px-6 py-3 rounded-lg bg-surface-container-lowest hover:border-on-surface transition-colors"
          >
            View API Specs
          </Link>
        </div>
      </div>

      {/* Abstract Visual */}
      <div className="col-span-12 md:col-span-5 h-full min-h-[300px] bg-surface rounded-xl border border-surface-container-highest flex items-center justify-center p-8">
        <div className="flex flex-col gap-4 w-full max-w-xs">
          <div className="h-12 w-full bg-surface-container-lowest border border-surface-container-highest rounded-lg shadow-sm flex items-center px-4">
            <span className="h-2 w-16 bg-surface-variant rounded"></span>
          </div>
          <div className="h-12 w-5/6 ml-auto bg-surface-container-lowest border border-surface-container-highest rounded-lg shadow-sm flex items-center px-4">
            <span className="h-2 w-24 bg-surface-variant rounded"></span>
          </div>
          <div className="h-12 w-full bg-surface-container-lowest border border-surface-container-highest rounded-lg shadow-sm flex items-center px-4">
            <span className="h-2 w-20 bg-primary-fixed-dim rounded"></span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PlatformHero;
