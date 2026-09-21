import Navbar from "../Components/landing/Navbar";
import Footer from "../Components/landing/Footer";
import PageWrapper from "../Components/ui/PageWrapper";
import FadeUp from "../../components/ui/FadeUp";
import { AIMockup, ChatMockup, CustomerMockup, SLAMockup, TicketsMockup } from "../Components/product/ProductMockups";

const INDEX = [
  ["Tickets", "tickets"],
  ["Conversations", "chat"],
  ["Live chat", "chat"],
  ["Customers", "customers"],
  ["Agent workspace", "more"],
  ["AI assistant", "ai"],
  ["Automation", "more", true],
  ["Knowledge base", "more", true],
  ["Reporting", "more"],
  ["SLA management", "sla"],
  ["Integrations", "more", true],
];

const SECTIONS = [
  {
    id: "tickets",
    eyebrow: "Tickets",
    title: "A queue with the next action always obvious.",
    body: "Saved views, filters and bulk actions. Every row shows status, priority, owner and the SLA clock.",
    Mockup: TicketsMockup,
  },
  {
    id: "chat",
    eyebrow: "Conversations & live chat",
    title: "Every channel in one thread.",
    body: "Email replies and live chat messages sit in the same timeline, with internal notes, attachments and a clear marker when a person takes over from the AI.",
    Mockup: ChatMockup,
  },
  {
    id: "customers",
    eyebrow: "Customer management",
    title: "Know who you're helping before you reply.",
    body: "Profiles bring together company, plan, notes and every past ticket and chat.",
    Mockup: CustomerMockup,
  },
  {
    id: "ai",
    eyebrow: "AI assistant",
    title: "Help that's labelled, reviewable and optional.",
    body: "The copilot answers routine questions and drafts tickets for customers to confirm. Every AI action is marked in the thread, and an agent can take over at any moment.",
    Mockup: AIMockup,
  },
  {
    id: "sla",
    eyebrow: "SLA management",
    title: "Targets you can see coming.",
    body: "Set first-response and resolution targets per priority. Timers count down on every ticket so risks surface before they breach.",
    Mockup: SLAMockup,
  },
];

const MORE = [
  { icon: "space_dashboard", title: "Agent workspace", body: "A personal home that ranks work by SLA risk and shows who is waiting." },
  { icon: "bar_chart", title: "Reporting", body: "Ticket and agent stats today, with response-time and satisfaction charts on the way." },
  { icon: "groups", title: "Teams & roles", body: "Admins, agents and customers each get the view their role needs." },
  { icon: "bolt", title: "Automation", body: "Visual when / if / then rules to route, tag and escalate automatically.", soon: true },
  { icon: "menu_book", title: "Knowledge base", body: "Articles for the portal, chat suggestions and copilot replies.", soon: true },
  { icon: "extension", title: "Integrations", body: "Webhooks and an API for your own systems.", soon: true },
];

const Product = () => (
  <PageWrapper>
    <div className="bg-background text-on-background antialiased">
      <Navbar />
      <main>
        <section className="max-w-[1280px] mx-auto px-6 pt-16 md:pt-24 pb-14 flex flex-col items-center gap-6 text-center">
          <span className="text-[13px] font-semibold tracking-[0.1em] uppercase text-neutral-500">Product</span>
          <h1 className="max-w-[900px] font-display text-[40px] md:text-[64px] font-extrabold tracking-[-0.045em] leading-[1.04] text-on-surface">
            Every tool your support team needs, designed as one.
          </h1>
          <p className="max-w-[640px] text-[17px] md:text-[18px] leading-relaxed text-neutral-700 dark:text-neutral-300">
            Modules that share the same customer record, the same timeline and the same calm interface.
          </p>
          <nav aria-label="Modules" className="flex flex-wrap justify-center gap-2 max-w-[980px] mt-2">
            {INDEX.map(([n, id, soon]) => (
              <a
                key={n}
                href={`#${id}`}
                className="h-[38px] px-4 rounded-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-[14px] font-medium text-on-surface flex items-center gap-1.5 hover:bg-forest-900 hover:text-mint hover:border-forest-900 transition-colors"
              >
                {n}
                {soon && <span className="text-[11px] opacity-70">· Soon</span>}
              </a>
            ))}
          </nav>
        </section>

        {SECTIONS.map(({ id, eyebrow, title, body, Mockup }, i) => (
          <FadeUp key={id}>
            <section id={id} className="scroll-mt-24 max-w-[1280px] mx-auto px-6 py-12 md:py-16">
              <div className={`flex flex-col ${i % 2 ? "lg:flex-row-reverse" : "lg:flex-row"} items-center gap-10 lg:gap-16`}>
                <div className="lg:w-[420px] shrink-0 flex flex-col gap-4">
                  <span className="text-[13px] font-semibold tracking-[0.08em] uppercase text-neutral-500">{eyebrow}</span>
                  <h2 className="font-display text-[32px] md:text-[40px] font-extrabold tracking-[-0.03em] leading-[1.1] text-on-surface">{title}</h2>
                  <p className="text-[16px] leading-relaxed text-neutral-700 dark:text-neutral-300">{body}</p>
                </div>
                <div className="w-full flex-1 min-w-0">
                  <Mockup />
                </div>
              </div>
            </section>
          </FadeUp>
        ))}

        <FadeUp>
          <section id="more" className="scroll-mt-24 max-w-[1280px] mx-auto px-6 pt-16 pb-24 flex flex-col gap-8">
            <h2 className="font-display text-[32px] md:text-[40px] font-extrabold tracking-[-0.03em] text-on-surface">And the rest of the toolkit</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {MORE.map((m) => (
                <div
                  key={m.title}
                  className="flex flex-col gap-3 p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 transition-[transform,box-shadow] duration-200 hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="flex items-center justify-between">
                    <span className="w-11 h-11 rounded-xl bg-forest-900 text-sage flex items-center justify-center">
                      <span className="material-symbols-outlined text-[22px]">{m.icon}</span>
                    </span>
                    {m.soon && (
                      <span className="h-[22px] px-2 rounded-full border border-dashed border-neutral-400 dark:border-neutral-600 text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 flex items-center">
                        Soon
                      </span>
                    )}
                  </div>
                  <h3 className="font-display text-[20px] font-bold text-on-surface">{m.title}</h3>
                  <p className="text-[14px] leading-relaxed text-neutral-600 dark:text-neutral-400">{m.body}</p>
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

export default Product;
