import { Link } from "react-router-dom";
import Navbar from "../Components/landing/Navbar";
import Footer from "../Components/landing/Footer";
import PageWrapper from "../Components/ui/PageWrapper";
import FadeUp from "../../components/ui/FadeUp";

// Developer docs are not written yet. This page says so plainly and points to
// the help center, which covers how the product works today. It used to show a
// "Notify me" form that submitted nowhere and promised "40+ tools" and SDKs.
const PLANNED = [
  { icon: "rocket_launch", title: "Setup guides", desc: "Workspaces, roles and your first tickets, step by step." },
  { icon: "admin_panel_settings", title: "Admin & security", desc: "Roles, sessions and account controls." },
  { icon: "auto_awesome", title: "AI copilot", desc: "How the copilot answers, drafts tickets and hands over." },
  { icon: "api", title: "API & webhooks", desc: "Written alongside the API when it ships." },
];

const Docs = () => (
  <PageWrapper>
    <div className="bg-background text-on-background antialiased min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 w-full max-w-[1100px] mx-auto px-6 py-16 md:py-24 flex flex-col gap-14">
        <section className="flex flex-col items-center gap-5 text-center">
          <span className="inline-flex items-center gap-2 h-8 px-3.5 rounded-full border border-dashed border-neutral-400 dark:border-neutral-600 text-[12px] font-semibold uppercase tracking-[0.1em] text-neutral-600 dark:text-neutral-400">
            In progress
          </span>
          <h1 className="font-display text-[40px] md:text-[56px] font-extrabold tracking-[-0.04em] text-on-surface">Documentation</h1>
          <p className="max-w-[600px] text-[17px] leading-relaxed text-neutral-700 dark:text-neutral-300">
            Full documentation is still being written. For how AideDesk works today, the help center has step-by-step answers.
          </p>
          <Link
            to="/support"
            className="h-12 px-6 rounded-full bg-brand text-white dark:text-black text-[15px] font-semibold flex items-center gap-2 hover:bg-brand-hover transition-colors"
          >
            Go to the help center
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </Link>
        </section>

        <FadeUp>
          <section aria-labelledby="planned-h" className="flex flex-col gap-5">
            <h2 id="planned-h" className="font-display text-[22px] font-bold text-on-surface">What the docs will cover</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {PLANNED.map((s) => (
                <div key={s.title} className="flex gap-4 p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-dashed border-neutral-300 dark:border-neutral-700">
                  <span className="w-11 h-11 shrink-0 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-forest-700 dark:text-sage flex items-center justify-center">
                    <span className="material-symbols-outlined text-[22px]">{s.icon}</span>
                  </span>
                  <div className="flex flex-col gap-1.5">
                    <h3 className="font-display text-[17px] font-bold text-on-surface">{s.title}</h3>
                    <p className="text-[14px] leading-relaxed text-neutral-600 dark:text-neutral-400">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </FadeUp>
      </main>
      <Footer />
    </div>
  </PageWrapper>
);

export default Docs;
