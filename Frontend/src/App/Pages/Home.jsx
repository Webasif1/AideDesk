import Navbar from "../Components/landing/Navbar";
import HeroSection from "../Components/landing/HeroSection";
import StatsSection from "../Components/landing/StatsSection";
import FeaturesSection from "../Components/landing/FeaturesSection";
import IntegrationFlowSection from "../Components/landing/IntegrationFlowSection";
import CTASection from "../Components/landing/CTASection";
import Footer from "../Components/landing/Footer";
import PageWrapper from "../Components/ui/PageWrapper";
import FadeUp from "../../components/ui/FadeUp";

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
