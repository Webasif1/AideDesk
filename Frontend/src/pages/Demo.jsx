import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "../components/landing/Navbar";
import Footer from "../components/landing/Footer";
import PageWrapper from "../components/ui/PageWrapper";

const Demo = () => {
  return (
    <PageWrapper>
      <div className="bg-background text-on-surface antialiased min-h-screen flex flex-col">
        <Navbar />

        <main className="flex-1 flex items-center justify-center px-6 py-[120px]">
          <motion.div
            className="max-w-[560px] w-full text-center"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 bg-surface-container-low border border-surface-container-highest rounded-full px-4 py-1.5 mb-[40px]">
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
              Book a Demo
            </h1>
            <p
              className="text-on-surface-variant mb-[48px] max-w-md mx-auto"
              style={{ fontSize: "16px", lineHeight: "1.7" }}
            >
              Our demo scheduling portal is being set up. In the meantime, reach
              out directly and our engineering team will get back to you within
              one business day.
            </p>

            <div className="bg-surface border border-surface-container-highest rounded-xl p-[40px] text-left mb-[40px]">
              <p className="text-[12px] font-semibold uppercase tracking-widest text-on-surface-variant mb-[24px]">
                Get in touch
              </p>
              <div className="flex flex-col gap-[20px]">
                <div className="flex items-center gap-[16px]">
                  <div className="w-10 h-10 rounded-lg bg-surface-container-low border border-surface-container-highest flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-primary text-[20px]">
                      mail
                    </span>
                  </div>
                  <div>
                    <p className="text-[12px] text-on-surface-variant mb-[2px]">
                      Email us at
                    </p>
                    <p className="text-[14px] font-medium text-on-surface">
                      demo@aidedesk.io
                    </p>
                  </div>
                </div>
                <div className="w-full h-px bg-surface-container-highest" />
                <div className="flex items-center gap-[16px]">
                  <div className="w-10 h-10 rounded-lg bg-surface-container-low border border-surface-container-highest flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-primary text-[20px]">
                      schedule
                    </span>
                  </div>
                  <div>
                    <p className="text-[12px] text-on-surface-variant mb-[2px]">
                      Response time
                    </p>
                    <p className="text-[14px] font-medium text-on-surface">
                      Within 1 business day
                    </p>
                  </div>
                </div>
                <div className="w-full h-px bg-surface-container-highest" />
                <div className="flex items-center gap-[16px]">
                  <div className="w-10 h-10 rounded-lg bg-surface-container-low border border-surface-container-highest flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-primary text-[20px]">
                      video_call
                    </span>
                  </div>
                  <div>
                    <p className="text-[12px] text-on-surface-variant mb-[2px]">
                      Session format
                    </p>
                    <p className="text-[14px] font-medium text-on-surface">
                      30-min live walkthrough via Google Meet
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <Link
              to="/"
              className="inline-flex items-center gap-2 text-[13px] text-on-surface-variant hover:text-primary transition-colors group"
            >
              <span className="material-symbols-outlined text-[18px] group-hover:-translate-x-1 transition-transform">
                arrow_back
              </span>
              Back to Home
            </Link>
          </motion.div>
        </main>

        <Footer />
      </div>
    </PageWrapper>
  );
};

export default Demo;
