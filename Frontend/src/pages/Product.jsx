import Navbar from "../components/landing/Navbar";
import Footer from "../components/landing/Footer";
import PageWrapper from "../components/ui/PageWrapper";
import FadeUp from "../components/ui/FadeUp";
import ProductHero from "../components/product/ProductHero";
import FeatureSection from "../components/product/FeatureSection";
import RoutingVisual from "../components/product/RoutingVisual";
import ConsolePreview from "../components/product/ConsolePreview";
import ProductCTA from "../components/product/ProductCTA";

const AIChatMockup = () => (
  <div className="w-full aspect-square md:aspect-[4/3] rounded-lg border border-surface-variant bg-surface-container-low overflow-hidden p-[24px] relative">
    <div className="absolute top-4 left-4 right-4 bottom-4 bg-white border border-surface-variant rounded-lg flex flex-col">
      <div className="border-b border-surface-variant p-[16px] flex items-center justify-between">
        <div className="flex items-center gap-[8px]">
          <span className="material-symbols-outlined text-primary">
            robot_2
          </span>
          <span className="text-[12px] font-semibold tracking-widest uppercase text-primary">
            AideDesk AI
          </span>
        </div>
        <span className="text-[12px] text-on-surface-variant">Active</span>
      </div>
      <div className="p-[16px] flex-1 flex flex-col gap-[16px]">
        <div className="bg-surface-container-low p-[12px] rounded-lg self-start max-w-[80%] border border-surface-variant">
          <p className="text-[13px] text-on-surface">
            How do I reset my API key?
          </p>
        </div>
        <div className="bg-primary text-on-primary p-[12px] rounded-lg self-end max-w-[80%]">
          <p className="text-[13px]">
            Navigate to Settings › Developer › API Keys and click 'Regenerate'.
          </p>
        </div>
      </div>
      <div className="border-t border-surface-variant p-[8px] flex gap-[8px]">
        <div className="h-8 bg-surface-container-low rounded flex-1 border border-surface-variant" />
        <div className="h-8 w-8 bg-primary rounded" />
      </div>
    </div>
  </div>
);

const Product = () => (
  <PageWrapper>
    <div className="bg-surface-container-lowest text-on-surface antialiased">
      <Navbar />
      <main>
        <FadeUp delay={0}>
          <ProductHero />
        </FadeUp>
        <FadeUp delay={0.05}>
          <section className="border-t border-surface-variant">
            <FeatureSection
              label="Intelligence"
              title="AI Auto-Replies"
              description="Deploy context-aware models that read your documentation and resolve Tier 1 tickets instantly. It's not a chatbot — it's a semantic engine designed for accuracy and zero hallucinations."
              features={[
                "Train on Zendesk, Intercom, or raw Markdown.",
                "Customizable confidence thresholds for handoffs.",
                "Multi-language support by default.",
              ]}
              visual={<AIChatMockup />}
              reverse={true}
            />
          </section>
        </FadeUp>
        <FadeUp delay={0.05}>
          <section className="bg-surface-bright border-t border-surface-variant">
            <FeatureSection
              label="Architecture"
              title="Deterministic Routing"
              description="Eliminate manual triage. Our rules engine analyzes intent, sentiment, and customer tier to route issues to the exact right specialist in milliseconds."
              visual={<RoutingVisual />}
              reverse={false}
            />
          </section>
        </FadeUp>
        <FadeUp delay={0.05}>
          <ConsolePreview />
        </FadeUp>
        <FadeUp delay={0.05}>
          <ProductCTA />
        </FadeUp>
      </main>
      <Footer />
    </div>
  </PageWrapper>
);
export default Product;
