import Navbar from '../components/landing/Navbar';
import HeroSection from '../components/landing/HeroSection';
import StatsSection from '../components/landing/StatsSection';
import FeaturesSection from '../components/landing/FeaturesSection';
import IntegrationFlowSection from '../components/landing/IntegrationFlowSection';
import CTASection from '../components/landing/CTASection';
import Footer from '../components/landing/Footer';

const Home = () => {
  return (
    <div className="bg-background text-on-background antialiased">
      <Navbar />
      <HeroSection />
      <StatsSection />
      <FeaturesSection />
      <IntegrationFlowSection />
      <CTASection />
      <Footer />
    </div>
  );
};

export default Home;
