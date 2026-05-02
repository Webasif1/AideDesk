import Navbar from "../components/landing/Navbar";
import HeroSection from "../components/landing/HeroSection";
import StatsSection from "../components/landing/StatsSection";
import FeaturesSection from "../components/landing/FeaturesSection";
import IntegrationFlowSection from "../components/landing/IntegrationFlowSection";
import CTASection from "../components/landing/CTASection";
import Footer from "../components/landing/Footer";
import PageWrapper from "../components/ui/PageWrapper";
import FadeUp from "../components/ui/FadeUp";

const Home = () => {
  return (
    <PageWrapper>
      <div className="bg-background text-on-background antialiased">
        <Navbar />
        <FadeUp delay={0}>
          <HeroSection />
        </FadeUp>
        <FadeUp delay={0.05}>
          <StatsSection />
        </FadeUp>
        <FadeUp delay={0.05}>
          <FeaturesSection />
        </FadeUp>
        <FadeUp delay={0.05}>
          <IntegrationFlowSection />
        </FadeUp>
        <FadeUp delay={0.05}>
          <CTASection />
        </FadeUp>
        <Footer />
      </div>
    </PageWrapper>
  );
};

export default Home;
