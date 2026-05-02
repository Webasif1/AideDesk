import Navbar from "../components/landing/Navbar";
import Footer from "../components/landing/Footer";
import PageWrapper from "../components/ui/PageWrapper";
import FadeUp from "../components/ui/FadeUp";
import SupportHero from "../components/support/SupportHero";
import CategoryGrid from "../components/support/CategoryGrid";
import ArticleList from "../components/support/ArticleList";
import SupportSidebar from "../components/support/SupportSidebar";

const Support = () => (
  <PageWrapper>
    <div className="bg-background text-on-background min-h-screen flex flex-col antialiased">
      <Navbar />
      <main className="flex-grow w-full">
        <FadeUp delay={0}>
          <SupportHero />
        </FadeUp>
        <FadeUp delay={0.05}>
          <CategoryGrid />
        </FadeUp>
        <FadeUp delay={0.1}>
          <section className="max-w-[1280px] mx-auto px-[24px] py-[48px]">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-[32px]">
              <ArticleList />
              <SupportSidebar />
            </div>
          </section>
        </FadeUp>
      </main>
      <Footer />
    </div>
  </PageWrapper>
);
export default Support;
