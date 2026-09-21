import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../Components/landing/Navbar";
import Footer from "../Components/landing/Footer";
import PageWrapper from "../Components/ui/PageWrapper";
import FadeUp from "../../components/ui/FadeUp";
import PricingHero from "../Components/pricing/PricingHero";
import PricingGrid from "../Components/pricing/PricingGrid";
import ComparisonTable from "../Components/pricing/ComparisonTable";
import PricingFAQ from "../Components/pricing/PricingFAQ";

const Pricing = () => {
  const [yearly, setYearly] = useState(false);

  return (
    <PageWrapper>
      <div className="bg-background text-on-background antialiased min-h-screen">
        <Navbar />
        <main className="pt-10 pb-4 px-6 max-w-[1280px] mx-auto">
          <PricingHero yearly={yearly} onToggle={() => setYearly((y) => !y)} />
          <FadeUp delay={0.05}>
            <PricingGrid yearly={yearly} />
          </FadeUp>
          <FadeUp>
            <ComparisonTable />
          </FadeUp>
          <FadeUp>
            <PricingFAQ />
          </FadeUp>
          <FadeUp>
            <section className="mb-24 flex flex-col md:flex-row md:items-center gap-8 p-10 md:p-14 rounded-[36px] bg-forest-900 text-mint bg-[radial-gradient(500px_300px_at_90%_20%,rgba(142,182,155,0.2),rgba(11,43,38,0)_70%)]">
              <div className="flex-1 flex flex-col gap-3">
                <h2 className="font-display text-[30px] md:text-[36px] font-extrabold tracking-[-0.03em]">Need something tailored?</h2>
                <p className="max-w-[620px] text-[16px] leading-relaxed text-[#b9d6c0]">
                  Multiple workspaces, custom roles, security reviews and onboarding for large teams. We'll build a plan around how you work.
                </p>
              </div>
              <Link
                to="/demo"
                className="self-start md:self-auto h-[52px] px-[26px] rounded-full bg-sage text-forest-950 text-[15px] font-semibold flex items-center hover:bg-mint transition-colors"
              >
                Talk to sales
              </Link>
            </section>
          </FadeUp>
        </main>
        <Footer />
      </div>
    </PageWrapper>
  );
};

export default Pricing;
