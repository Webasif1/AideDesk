import Navbar from "../components/landing/Navbar";
import Footer from "../components/landing/Footer";
import PageWrapper from "../components/ui/PageWrapper";
import FadeUp from "../components/ui/FadeUp";
import PricingHero from "../components/pricing/PricingHero";
import PricingGrid from "../components/pricing/PricingGrid";
import ComparisonTable from "../components/pricing/ComparisonTable";

const Pricing = () => (
  <PageWrapper>
    <div className="bg-background text-on-background antialiased min-h-screen">
      <Navbar />
      <main className="pt-[120px] pb-[64px] px-[24px] max-w-[1280px] mx-auto">
        <FadeUp delay={0}>
          <PricingHero />
        </FadeUp>
        <FadeUp delay={0.05}>
          <PricingGrid />
        </FadeUp>
        <FadeUp delay={0.1}>
          <ComparisonTable />
        </FadeUp>
      </main>
      <Footer />
    </div>
  </PageWrapper>
);
export default Pricing;
