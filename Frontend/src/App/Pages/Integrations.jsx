import Navbar from "../Components/landing/Navbar";
import Footer from "../Components/landing/Footer";
import PageWrapper from "../Components/ui/PageWrapper";
import FadeUp from "../../components/ui/FadeUp";
import IntegrationsHero from "../Components/integrations/IntegrationsHero";
import IntegrationsGrid from "../Components/integrations/IntegrationsGrid";

const Integrations = () => (
  <PageWrapper>
    <div className="bg-surface text-on-surface min-h-screen flex flex-col antialiased">
      <Navbar />
      <main className="flex-grow pt-[100px] px-[32px] pb-[64px] max-w-[1200px] mx-auto w-full flex flex-col gap-[48px]">
        <FadeUp delay={0}>
          <IntegrationsHero />
        </FadeUp>
        <FadeUp delay={0.05}>
          <IntegrationsGrid />
        </FadeUp>
      </main>
      <Footer />
    </div>
  </PageWrapper>
);
export default Integrations;
