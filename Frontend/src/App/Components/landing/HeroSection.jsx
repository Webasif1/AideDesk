import { Link } from "react-router-dom";
import EcosystemScene from "./EcosystemScene";

const HeroSection = () => {
  return (
    <header className="relative overflow-hidden bg-forest-950 text-mint bg-[radial-gradient(700px_520px_at_76%_52%,rgba(35,83,71,0.95),rgba(5,31,32,0)_70%),radial-gradient(900px_300px_at_50%_-10%,rgba(142,182,155,0.14),rgba(5,31,32,0)_70%)]">
      <div className="max-w-[1280px] mx-auto px-6 pt-16 pb-12 lg:py-24 flex flex-col lg:flex-row items-center gap-10 lg:gap-6">
        <div className="w-full lg:w-[560px] shrink-0 flex flex-col gap-6 lg:gap-7 text-center lg:text-left items-center lg:items-start">
          <span className="inline-flex items-center gap-2 h-8 pl-2.5 pr-3.5 rounded-full border border-forest-700 bg-forest-900/70 text-[13px] text-[#b9d6c0]">
            <span className="relative flex w-2 h-2">
              <span className="absolute inset-0 rounded-full bg-sage animate-ping opacity-60" />
              <span className="relative w-2 h-2 rounded-full bg-sage" />
            </span>
            The customer support workspace
          </span>
          <h1 className="font-display text-[42px] sm:text-[56px] lg:text-[66px] font-extrabold tracking-[-0.045em] leading-[1.02]">
            Support that stays calm under pressure.
          </h1>
          <p className="max-w-[500px] text-[17px] lg:text-[18px] leading-relaxed text-[#b9d6c0]">
            AideDesk brings tickets, live chat and your customer portal into one workspace. An AI copilot answers first and drafts tickets, and your team takes over whenever a
            human should.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <Link
              to="/signup"
              className="h-[52px] px-6 rounded-full bg-sage text-forest-950 text-[15px] font-semibold flex items-center justify-center gap-2.5 hover:bg-mint transition-colors active:scale-[0.98]"
            >
              Get started
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </Link>
            <Link
              to="/platform"
              className="h-[52px] px-6 rounded-full border border-forest-700 text-mint text-[15px] font-semibold flex items-center justify-center hover:bg-forest-900 transition-colors"
            >
              Explore platform
            </Link>
          </div>
          <span className="text-[13px] text-[#6f9a85]">A free plan is available</span>
        </div>
        <div className="flex-1 flex justify-center lg:justify-end">
          <EcosystemScene />
        </div>
      </div>
    </header>
  );
};

export default HeroSection;
