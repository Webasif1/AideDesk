import { Link } from "react-router-dom";

const PlatformCTA = () => {
  return (
    <section className="max-w-4xl mx-auto px-8 text-center bg-surface border border-surface-container-highest rounded-xl py-16 mt-32">
      <h2 className="text-[32px] font-semibold leading-[1.2] tracking-[-0.01em] text-on-surface mb-4">
        Ready to build on AideDesk?
      </h2>
      <p className="text-[16px] text-on-surface-variant mb-8 max-w-xl mx-auto leading-relaxed">
        Provision your dedicated environment and start architecting intelligent
        workflows in minutes.
      </p>
      <div className="flex justify-center gap-4">
        <Link
          to="/signup"
          className="text-[16px] bg-primary text-on-primary px-8 py-3 rounded-lg hover:opacity-90 transition-opacity"
        >
          Start Free Trial
        </Link>
        <Link
          to="/demo"
          className="text-[16px] border border-surface-container-highest text-on-surface px-8 py-3 rounded-lg bg-surface-container-lowest hover:border-on-surface transition-colors"
        >
          Talk to Engineering
        </Link>
      </div>
    </section>
  );
};

export default PlatformCTA;
