import { Link } from "react-router-dom";
import Navbar from "../Components/landing/Navbar";
import Footer from "../Components/landing/Footer";
import PageWrapper from "../Components/ui/PageWrapper";
import FadeUp from "../../components/ui/FadeUp";

// "Built in" must match what the backend ships (see Backend/src/services and
// config.js for the AI providers); everything else lives under the roadmap.
const BUILT_IN = [
  {
    icon: "auto_awesome",
    title: "Your choice of AI model",
    body: "The copilot runs on OpenRouter, Anthropic or Google Gemini models, configured when AideDesk is set up.",
  },
  {
    icon: "mail",
    title: "Email notifications",
    body: "Account emails for verification, password resets and account changes go out automatically.",
  },
  {
    icon: "bolt",
    title: "Real-time updates",
    body: "Tickets, chats and presence sync live across every open screen, with no refresh needed.",
  },
  {
    icon: "attach_file",
    title: "Attachments",
    body: "Images and PDFs attach to tickets and chats, and are checked before anyone opens them.",
  },
];

const ROADMAP = [
  { icon: "tag", title: "Team chat notifications", body: "Get alerts for new and at-risk tickets in your team's chat tool." },
  { icon: "webhook", title: "Webhooks", body: "Send ticket and chat events to your own systems." },
  { icon: "api", title: "REST API", body: "Create and update tickets and customers from your own code." },
  { icon: "forward_to_inbox", title: "Email to ticket", body: "Turn messages sent to your support address into tickets." },
  { icon: "move_down", title: "Import from another help desk", body: "Bring existing tickets and customers with you." },
  { icon: "widgets", title: "Embeddable chat widget", body: "Drop live chat into your own site or app." },
];

const Integrations = () => (
  <PageWrapper>
    <div className="bg-background text-on-background min-h-screen flex flex-col antialiased">
      <Navbar />
      <main className="flex-grow w-full max-w-[1280px] mx-auto px-6">
        <section className="pt-16 md:pt-24 pb-12 flex flex-col lg:flex-row lg:items-end gap-6 lg:gap-16">
          <div className="lg:w-[640px] flex flex-col gap-5">
            <span className="text-[13px] font-semibold tracking-[0.1em] uppercase text-neutral-500">Integrations</span>
            <h1 className="font-display text-[40px] md:text-[60px] font-extrabold tracking-[-0.045em] leading-[1.04] text-on-surface">
              Works with the tools you already use.
            </h1>
          </div>
          <p className="flex-1 text-[17px] leading-relaxed text-neutral-700 dark:text-neutral-300">
            Here's what's built in today and what's coming next. We only list an integration as available once it ships.
          </p>
        </section>

        <FadeUp>
          <section aria-labelledby="built-h" className="pb-16 flex flex-col gap-6">
            <h2 id="built-h" className="font-display text-[24px] md:text-[28px] font-bold text-on-surface flex items-center gap-3">
              Built in
              <span className="h-6 px-2.5 rounded-full bg-ok-soft text-ok text-[12px] font-semibold flex items-center">Available now</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {BUILT_IN.map((it) => (
                <div key={it.title} className="flex flex-col gap-3 p-6 rounded-3xl bg-forest-900 text-mint">
                  <span className="w-11 h-11 rounded-xl bg-sage text-forest-950 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[22px]">{it.icon}</span>
                  </span>
                  <h3 className="font-display text-[18px] font-bold">{it.title}</h3>
                  <p className="text-[14px] leading-relaxed text-[#b9d6c0]">{it.body}</p>
                </div>
              ))}
            </div>
          </section>
        </FadeUp>

        <FadeUp>
          <section aria-labelledby="road-h" className="pb-16 flex flex-col gap-6">
            <h2 id="road-h" className="font-display text-[24px] md:text-[28px] font-bold text-on-surface flex items-center gap-3">
              On the roadmap
              <span className="h-6 px-2.5 rounded-full border border-dashed border-neutral-400 dark:border-neutral-600 text-neutral-600 dark:text-neutral-400 text-[12px] font-semibold flex items-center">
                Not yet available
              </span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {ROADMAP.map((it) => (
                <div key={it.title} className="flex gap-4 p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-dashed border-neutral-300 dark:border-neutral-700">
                  <span className="w-11 h-11 shrink-0 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[22px]">{it.icon}</span>
                  </span>
                  <div className="flex flex-col gap-1.5">
                    <h3 className="font-display text-[17px] font-bold text-on-surface">{it.title}</h3>
                    <p className="text-[14px] leading-relaxed text-neutral-600 dark:text-neutral-400">{it.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </FadeUp>

        <FadeUp>
          <section className="mb-24 flex flex-col md:flex-row md:items-center gap-6 p-8 md:p-10 rounded-[32px] bg-mint dark:bg-forest-900">
            <div className="flex-1 flex flex-col gap-2">
              <h2 className="font-display text-[24px] md:text-[28px] font-bold text-on-surface">Need something that isn't listed?</h2>
              <p className="text-[15px] text-neutral-700 dark:text-neutral-300">Tell us which tools your team relies on. It helps us decide what to build next.</p>
            </div>
            <Link
              to="/demo"
              className="self-start md:self-auto h-12 px-6 rounded-full bg-brand text-white dark:text-black text-[15px] font-semibold flex items-center hover:bg-brand-hover transition-colors"
            >
              Request an integration
            </Link>
          </section>
        </FadeUp>
      </main>
      <Footer />
    </div>
  </PageWrapper>
);

export default Integrations;
