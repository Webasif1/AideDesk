import Navbar from "../Components/landing/Navbar";
import HeroSection from "../Components/landing/HeroSection";
import StatsSection from "../Components/landing/StatsSection";
import WhySection from "../Components/landing/WhySection";
import FeatureRows from "../Components/landing/FeatureRows";
import SecuritySection from "../Components/landing/SecuritySection";
import PricingTeaser from "../Components/landing/PricingTeaser";
import Footer from "../Components/landing/Footer";
import PageWrapper from "../Components/ui/PageWrapper";
import FadeUp from "../../components/ui/FadeUp";

// Testimonials and customer logos are intentionally absent until there are
// real ones to show. The footer carries the closing call to action.
const Home = () => {
  return (
    <PageWrapper>
      <div className="bg-background text-on-background antialiased">
        <Navbar />
        <HeroSection />
        <StatsSection />
        <FadeUp>
          <WhySection />
        </FadeUp>
        <FeatureRows />
        <FadeUp>
          <SecuritySection />
        </FadeUp>
        <FadeUp>
          <PricingTeaser />
        </FadeUp>
        <Footer />
      </div>
    </PageWrapper>
  );
};

export default Home;
