import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../Components/landing/Navbar";
import Footer from "../Components/landing/Footer";
import PageWrapper from "../Components/ui/PageWrapper";
import FadeUp from "../../components/ui/FadeUp";
import SolutionsExplorer from "../Components/solutions/SolutionsExplorer";
import { SEGMENTS } from "../Components/solutions/solutions.data";

const Solutions = () => {
  const [selected, setSelected] = useState(0);

  // Picking a card below scrolls back up to the explorer so the change is seen.
  const pickFromGrid = (i) => {
    setSelected(i);
    document.getElementById("explorer")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <PageWrapper>
      <div className="bg-background text-on-background antialiased min-h-screen">
        <Navbar />
        <main className="max-w-[1280px] mx-auto px-6">
          <section className="pt-16 md:pt-24 pb-12 flex flex-col lg:flex-row lg:items-end gap-6 lg:gap-16">
            <div className="lg:w-[680px] flex flex-col gap-5">
              <span className="text-[13px] font-semibold tracking-[0.1em] uppercase text-neutral-500 dark:text-neutral-400">Solutions</span>
              <h1 className="font-display text-[40px] md:text-[62px] font-extrabold tracking-[-0.045em] leading-[1.04] text-on-surface">
                Support that fits the team you have today.
              </h1>
            </div>
            <p className="flex-1 text-[17px] md:text-[18px] leading-relaxed text-neutral-700 dark:text-neutral-300">
              From a two-person startup to a multi-team enterprise, AideDesk starts simple and grows with you. Pick the one that sounds like you.
            </p>
          </section>

          <div id="explorer" className="scroll-mt-24 pb-24">
            <SolutionsExplorer selected={selected} onSelect={setSelected} />
          </div>

          <FadeUp>
            <section className="pb-24 flex flex-col gap-7">
              <h2 className="font-display text-[30px] md:text-[36px] font-extrabold tracking-[-0.03em] text-on-surface">All solutions at a glance</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {SEGMENTS.map((s, i) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => pickFromGrid(i)}
                    className={`flex flex-col gap-3 p-6 rounded-[22px] bg-white dark:bg-neutral-900 border text-left transition-[transform,box-shadow] duration-200 hover:-translate-y-1 hover:shadow-lg ${
                      i === selected ? "border-forest-700 dark:border-sage" : "border-neutral-200 dark:border-neutral-800"
                    }`}
                  >
                    <span className="w-[42px] h-[42px] rounded-xl bg-neutral-100 dark:bg-neutral-800 text-forest-700 dark:text-sage flex items-center justify-center">
                      <span className="material-symbols-outlined text-[22px]">{s.icon}</span>
                    </span>
                    <span className="font-display text-[18px] font-bold text-on-surface">{s.name}</span>
                    <span className="text-[14px] leading-relaxed text-neutral-600 dark:text-neutral-400">{s.hook}</span>
                  </button>
                ))}
                <div className="flex flex-col justify-between gap-3 p-6 rounded-[22px] bg-forest-700 text-mint">
                  <span className="font-display text-[18px] font-bold">Not sure which fits?</span>
                  <span className="text-[14px] leading-relaxed text-[#b9d6c0]">Tell us about your team and we'll suggest a setup.</span>
                  <Link
                    to="/demo"
                    className="self-start h-10 px-4 rounded-full bg-sage text-forest-950 text-[14px] font-semibold flex items-center hover:bg-mint transition-colors"
                  >
                    Talk to us
                  </Link>
                </div>
              </div>
            </section>
          </FadeUp>
        </main>
        <Footer />
      </div>
    </PageWrapper>
  );
};

export default Solutions;
