import Navbar from "../components/landing/Navbar";
import Footer from "../components/landing/Footer";
import PageWrapper from "../components/ui/PageWrapper";
import FadeUp from "../components/ui/FadeUp";
import PrivacySidebar from "../components/privacy/PrivacySidebar";
import PrivacySection from "../components/privacy/PrivacySection";

const Privacy = () => (
  <PageWrapper>
    <div className="bg-surface-container-lowest text-on-surface antialiased min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow max-w-[1280px] mx-auto w-full px-[24px] py-[64px] flex flex-col md:flex-row gap-[48px]">
        <PrivacySidebar />
        <article className="flex-1 max-w-3xl">
          <FadeUp delay={0}>
            <header className="mb-[48px] border-b border-surface-variant pb-[32px]">
              <h1 className="text-[48px] font-semibold tracking-tight text-on-surface mb-[8px]">
                Privacy Policy
              </h1>
              <p className="text-[14px] text-on-surface-variant">
                Effective Date: October 24, 2024
              </p>
            </header>
          </FadeUp>

          <div className="flex flex-col gap-[48px]">
            <FadeUp delay={0.05}>
              <PrivacySection
                id="data-collection"
                title="Data Collection & Security"
              >
                <p className="text-[14px] text-on-surface-variant leading-relaxed mb-[16px]">
                  At AideDesk, structural integrity applies to our data
                  practices as much as our architecture. We operate on a
                  principle of absolute minimal collection — ingesting only the
                  telemetry and operational data strictly required to deliver,
                  secure, and optimize our platform.
                </p>
                <div className="bg-surface-container-low border border-surface-variant p-[24px] rounded-lg mt-[24px]">
                  <div className="flex items-center gap-[8px] mb-[8px]">
                    <span className="material-symbols-outlined text-[20px] text-on-surface">
                      shield_lock
                    </span>
                    <h3 className="text-[24px] font-medium text-on-surface">
                      End-to-End Encryption
                    </h3>
                  </div>
                  <p className="text-[14px] text-on-surface-variant leading-relaxed">
                    All data at rest is encrypted using AES-256 block-level
                    encryption. Data in transit is secured via TLS 1.3 across
                    all communication nodes. We maintain zero-knowledge
                    infrastructure for user-generated support tickets.
                  </p>
                </div>
              </PrivacySection>
            </FadeUp>

            <FadeUp delay={0.05}>
              <PrivacySection
                id="ai-ethics"
                title="AI & Machine Learning Ethics"
              >
                <p className="text-[14px] text-on-surface-variant leading-relaxed mb-[16px]">
                  AideDesk utilizes deterministic and generative models to
                  optimize ticket routing and draft responses. Our commitment to
                  ethical AI implies strict boundaries on model training and
                  data utilization.
                </p>
                <ul className="border-t border-surface-variant mt-[24px]">
                  {[
                    {
                      title: "Opt-In Training Data",
                      desc: "Your proprietary support interactions are never used to train generalized models without explicit, organizational-level consent.",
                    },
                    {
                      title: "Algorithmic Transparency",
                      desc: "Automated routing decisions maintain an audit trail accessible to workspace administrators for review and correction.",
                    },
                  ].map((item) => (
                    <li
                      key={item.title}
                      className="py-[16px] border-b border-surface-variant flex items-start gap-[16px]"
                    >
                      <span className="material-symbols-outlined text-[18px] text-primary mt-[2px]">
                        check_circle
                      </span>
                      <div>
                        <h4 className="text-[14px] font-semibold text-on-surface mb-[4px]">
                          {item.title}
                        </h4>
                        <p className="text-[13px] text-on-surface-variant leading-relaxed">
                          {item.desc}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </PrivacySection>
            </FadeUp>

            <FadeUp delay={0.05}>
              <PrivacySection id="third-party" title="Third-Party Integrations">
                <p className="text-[14px] text-on-surface-variant leading-relaxed">
                  Our platform integrates with external services (e.g., CRM
                  systems, messaging protocols) solely to extend functionality.
                  Data transferred through these API bridges is subject to the
                  security protocols of both AideDesk and the connected service.
                  We do not sell, broker, or monetize API telemetry under any
                  circumstances.
                </p>
              </PrivacySection>
            </FadeUp>

            <FadeUp delay={0.05}>
              <PrivacySection id="user-rights" title="Your Rights & Control">
                <p className="text-[14px] text-on-surface-variant leading-relaxed mb-[16px]">
                  Compliance with global data frameworks (GDPR, CCPA) is the
                  baseline, not the ceiling. You retain absolute control over
                  your digital footprint within our ecosystem.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-[16px] mt-[24px]">
                  {[
                    {
                      title: "Right to Erasure",
                      desc: "Execute hard-deletes of workspace data across all production databases within 72 hours.",
                    },
                    {
                      title: "Data Portability",
                      desc: "Export complete workspace schemas and interaction logs in standardized JSON format.",
                    },
                  ].map((card) => (
                    <div
                      key={card.title}
                      className="border border-surface-variant p-[16px] rounded-lg hover:border-primary transition-colors"
                    >
                      <span className="text-[12px] font-semibold tracking-widest uppercase text-on-surface block mb-[4px]">
                        {card.title}
                      </span>
                      <span className="text-[13px] text-on-surface-variant leading-relaxed">
                        {card.desc}
                      </span>
                    </div>
                  ))}
                </div>
              </PrivacySection>
            </FadeUp>
          </div>
        </article>
      </main>
      <Footer />
    </div>
  </PageWrapper>
);
export default Privacy;
