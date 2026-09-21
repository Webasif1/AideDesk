import { Link } from "react-router-dom";
import Navbar from "../Components/landing/Navbar";
import Footer from "../Components/landing/Footer";
import PageWrapper from "../Components/ui/PageWrapper";
import FadeUp from "../../components/ui/FadeUp";
import OrbitDiagram from "../Components/platform/OrbitDiagram";
import ModuleExplorer from "../Components/platform/ModuleExplorer";
import { FLOW } from "../Components/platform/platform.data";

const Platform = () => (
  <PageWrapper>
    <div className="bg-background text-on-background antialiased min-h-screen">
      <Navbar />

      <header className="overflow-hidden bg-forest-950 text-mint bg-[radial-gradient(640px_480px_at_74%_50%,rgba(35,83,71,0.95),rgba(5,31,32,0)_70%)]">
        <div className="max-w-[1280px] mx-auto px-6 pt-16 pb-12 lg:py-20 flex flex-col lg:flex-row items-center gap-10 lg:gap-6">
          <div className="w-full lg:w-[540px] shrink-0 flex flex-col gap-6 text-center lg:text-left items-center lg:items-start">
            <span className="text-[13px] font-semibold tracking-[0.1em] uppercase text-sage">The platform</span>
            <h1 className="font-display text-[40px] sm:text-[52px] lg:text-[60px] font-extrabold tracking-[-0.045em] leading-[1.04]">
              One connected system for every customer conversation.
            </h1>
            <p className="max-w-[500px] text-[17px] lg:text-[18px] leading-relaxed text-[#b9d6c0]">
              Tickets, chat, your customer portal and an AI copilot share one workspace, so context follows the customer wherever they reach out.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <Link
                to="/signup"
                className="h-[52px] px-6 rounded-full bg-sage text-forest-950 text-[15px] font-semibold flex items-center justify-center hover:bg-mint transition-colors"
              >
                Get started
              </Link>
              <a
                href="#modules"
                className="h-[52px] px-6 rounded-full border border-forest-700 text-mint text-[15px] font-semibold flex items-center justify-center hover:bg-forest-900 transition-colors"
              >
                Explore the modules
              </a>
            </div>
          </div>
          <div className="flex-1 flex justify-center lg:justify-end">
            <OrbitDiagram />
          </div>
        </div>
      </header>

      <main className="max-w-[1280px] mx-auto px-6">
        <section id="modules" className="scroll-mt-24 pt-20 md:pt-28 pb-20 flex flex-col gap-10 md:gap-12">
          <div className="flex flex-col lg:flex-row lg:items-end gap-5 lg:gap-10">
            <h2 className="lg:w-[600px] font-display text-[34px] md:text-[46px] font-extrabold tracking-[-0.035em] leading-[1.08] text-on-surface">
              Ten modules. One place to work.
            </h2>
            <p className="flex-1 text-[16px] md:text-[17px] leading-relaxed text-neutral-700 dark:text-neutral-300">
              Pick a module to see how it looks inside AideDesk. Modules marked “Soon” are on the roadmap and shown as previews.
            </p>
          </div>
          <ModuleExplorer />
        </section>

        <FadeUp>
          <section className="pb-24 flex flex-col gap-8">
            <h2 className="font-display text-[30px] md:text-[40px] font-extrabold tracking-[-0.03em] text-on-surface">How a request flows through AideDesk</h2>
            <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {FLOW.map(([t, b], i) => (
                <li key={t} className="flex flex-col gap-3 p-6 md:p-7 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                  <span className="font-mono text-[12px] text-neutral-500">{String(i + 1).padStart(2, "0")}</span>
                  <span className="font-display text-[20px] font-bold text-on-surface">{t}</span>
                  <span className="text-[14px] leading-relaxed text-neutral-600 dark:text-neutral-400">{b}</span>
                </li>
              ))}
            </ol>
          </section>
        </FadeUp>
      </main>
      <Footer />
    </div>
  </PageWrapper>
);

export default Platform;
