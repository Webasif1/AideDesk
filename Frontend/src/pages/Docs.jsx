import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "../components/landing/Navbar";
import Footer from "../components/landing/Footer";
import PageWrapper from "../components/ui/PageWrapper";

const docSections = [
  {
    icon: "rocket_launch",
    title: "Getting Started",
    desc: "Workspace setup, onboarding guides, and your first automation.",
  },
  {
    icon: "api",
    title: "API Reference",
    desc: "Full REST API specs, authentication, rate limits, and error codes.",
  },
  {
    icon: "hub",
    title: "Integrations",
    desc: "Connect AideDesk to Slack, Zendesk, Intercom, and 40+ tools.",
  },
  {
    icon: "psychology",
    title: "AI & Models",
    desc: "Prompt engineering, routing logic, and training your support model.",
  },
  {
    icon: "admin_panel_settings",
    title: "Admin & Security",
    desc: "SSO, RBAC, audit logs, and enterprise compliance controls.",
  },
  {
    icon: "code",
    title: "SDKs & Webhooks",
    desc: "Node.js, Python SDKs and real-time webhook event subscriptions.",
  },
];

const Docs = () => {
  return (
    <PageWrapper>
      <div className="bg-background text-on-surface antialiased min-h-screen flex flex-col">
        <Navbar />

        <main className="flex-1 px-6 py-[80px]">
          <motion.div
            className="max-w-[1280px] mx-auto"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <div className="text-center mb-[72px]">
              <div className="inline-flex items-center gap-2 bg-surface-container-low border border-surface-container-highest rounded-full px-4 py-1.5 mb-[32px]">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-[12px] font-semibold uppercase tracking-widest text-on-surface-variant">
                  Coming Soon
                </span>
              </div>
              <h1
                className="text-on-surface mb-[16px]"
                style={{
                  fontSize: "48px",
                  fontWeight: "600",
                  lineHeight: "1.1",
                  letterSpacing: "-0.02em",
                }}
              >
                Documentation
              </h1>
              <p
                className="text-on-surface-variant max-w-xl mx-auto"
                style={{ fontSize: "16px", lineHeight: "1.7" }}
              >
                Our developer documentation is being written. Below is a preview
                of what will be covered. Full docs launch alongside our public
                API release.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[24px] mb-[72px]">
              {docSections.map((s) => (
                <div
                  key={s.title}
                  className="bg-surface border border-surface-container-highest rounded-xl p-[28px] flex flex-col gap-[16px] opacity-80"
                >
                  <div className="w-10 h-10 rounded-lg bg-surface-container-low border border-surface-container-highest flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary text-[20px]">
                      {s.icon}
                    </span>
                  </div>
                  <div>
                    <h3
                      className="text-on-surface mb-[6px]"
                      style={{ fontSize: "18px", fontWeight: "500" }}
                    >
                      {s.title}
                    </h3>
                    <p
                      className="text-on-surface-variant"
                      style={{ fontSize: "13px", lineHeight: "1.6" }}
                    >
                      {s.desc}
                    </p>
                  </div>
                  <div className="mt-auto pt-[8px]">
                    <span className="text-[11px] font-semibold uppercase tracking-widest text-on-surface-variant border border-surface-container-highest rounded-full px-3 py-1">
                      In progress
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="max-w-[560px] mx-auto bg-surface border border-surface-container-highest rounded-xl p-[40px] text-center">
              <span className="material-symbols-outlined text-primary text-[32px] mb-[16px] block">
                notifications
              </span>
              <h2
                className="text-on-surface mb-[8px]"
                style={{ fontSize: "20px", fontWeight: "600" }}
              >
                Get notified when docs launch
              </h2>
              <p
                className="text-on-surface-variant mb-[24px]"
                style={{ fontSize: "13px", lineHeight: "1.6" }}
              >
                Drop your email and we'll ping you the moment documentation goes
                live.
              </p>
              <div className="flex gap-[8px]">
                <input
                  type="email"
                  placeholder="name@company.com"
                  className="flex-1 h-11 bg-surface-container-low border border-surface-variant rounded-xl px-[16px] text-[14px] text-primary placeholder:text-on-tertiary-container focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                />
                <button
                  type="button"
                  className="h-11 px-[20px] bg-primary text-on-primary rounded-xl text-[14px] font-semibold hover:opacity-90 transition-opacity whitespace-nowrap"
                >
                  Notify Me
                </button>
              </div>
            </div>

            <div className="text-center mt-[48px]">
              <Link
                to="/"
                className="inline-flex items-center gap-2 text-[13px] text-on-surface-variant hover:text-primary transition-colors group"
              >
                <span className="material-symbols-outlined text-[18px] group-hover:-translate-x-1 transition-transform">
                  arrow_back
                </span>
                Back to Home
              </Link>
            </div>
          </motion.div>
        </main>

        <Footer />
      </div>
    </PageWrapper>
  );
};

export default Docs;
