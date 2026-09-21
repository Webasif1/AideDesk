import { Link } from "react-router-dom";
import FadeUp from "../../../components/ui/FadeUp";

const TONES = {
  ok: "bg-ok-soft text-ok",
  warn: "bg-warn-soft text-warn",
  err: "bg-err-soft text-err",
  info: "bg-info-soft text-info",
  neutral: "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300",
};

const TICKETS = [
  ["Unable to update billing information", "Sarah Mitchell · Acme Technologies", "Waiting for customer", "neutral", "High", "1h 24m", "text-warn"],
  ["SSO login loops back to sign-in page", "Daniel Ortiz · Brightline Health", "Open", "info", "Urgent", "18m left", "text-err"],
  ["Invoice shows the wrong VAT number", "Tom Becker · Nordlicht GmbH", "Open", "info", "Medium", "3h 40m", "text-neutral-500"],
  ["Refund request for a duplicate charge", "Nina Petrov · Solace Travel", "Resolved", "ok", "Medium", "Met", "text-ok"],
];

const Check = ({ children }) => (
  <li className="flex gap-2.5 text-[15px] text-on-surface">
    <span className="material-symbols-outlined text-[20px] text-forest-700 dark:text-sage">check</span>
    {children}
  </li>
);

const Copy = ({ eyebrow, title, body, children }) => (
  <div className="lg:w-[460px] shrink-0 flex flex-col gap-4">
    <span className="text-[13px] font-semibold tracking-[0.08em] uppercase text-neutral-500">{eyebrow}</span>
    <h2 className="font-display text-[32px] md:text-[40px] font-extrabold tracking-[-0.03em] leading-[1.1] text-on-surface">{title}</h2>
    <p className="text-[16px] leading-relaxed text-neutral-700 dark:text-neutral-300">{body}</p>
    {children}
  </div>
);

const GRID = [
  { icon: "home", title: "Customer portal", body: "Customers track requests, reply and follow progress without emailing back and forth." },
  { icon: "bolt", title: "Automation", body: "When, if, then rules to route, tag and escalate tickets automatically.", soon: true },
  { icon: "bar_chart", title: "Analytics", body: "Ticket and agent stats across the workspace, with charts on the way." },
  { icon: "groups", title: "Team collaboration", body: "Internal notes, assignments and workload views keep everyone on the same page." },
];

const FeatureRows = () => (
  <section className="max-w-[1280px] mx-auto px-6 pt-8 pb-24 flex flex-col gap-20 md:gap-24">
    <FadeUp>
      <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
        <Copy
          eyebrow="Ticket management"
          title="Tickets that arrive ready to work."
          body="Every request gets a status, priority, owner and SLA timer. Saved views and bulk actions keep the queue moving."
        >
          <ul className="flex flex-col gap-2.5">
            <Check>Assign, escalate and change status in one click</Check>
            <Check>Attachments, internal notes and history together</Check>
            <Check>Real-time updates across every agent's screen</Check>
          </ul>
        </Copy>
        <div className="w-full flex-1 min-w-0 p-4 md:p-7 rounded-[28px] bg-mint dark:bg-forest-900">
          <div className="rounded-[18px] bg-white dark:bg-neutral-950 shadow-[0_30px_60px_rgba(5,31,32,0.12)] overflow-hidden">
            <div className="flex gap-5 px-5 pt-4 border-b border-neutral-100 dark:border-neutral-800 text-[13px] overflow-x-auto">
              <span className="pb-3 font-semibold text-on-surface shadow-[inset_0_-2px_0_currentColor] whitespace-nowrap">All open · 128</span>
              <span className="pb-3 text-neutral-500 whitespace-nowrap">Assigned to me · 12</span>
              <span className="pb-3 text-neutral-500 whitespace-nowrap">SLA at risk · 3</span>
            </div>
            {TICKETS.map(([s, c, st, tone, p, sla, slaTone]) => (
              <div key={s} className="grid grid-cols-[minmax(0,1fr)_auto] sm:grid-cols-[minmax(0,1fr)_150px_70px_80px] items-center gap-3 px-5 py-3.5 border-b border-neutral-100 dark:border-neutral-800 last:border-0">
                <span className="flex flex-col gap-0.5 min-w-0">
                  <span className="text-[13px] font-semibold text-on-surface truncate">{s}</span>
                  <span className="text-[12px] text-neutral-500 truncate">{c}</span>
                </span>
                <span className={`justify-self-start h-6 px-2.5 rounded-full text-[12px] font-medium whitespace-nowrap flex items-center ${TONES[tone]}`}>{st}</span>
                <span className="hidden sm:block text-[12px] font-medium text-neutral-500">{p}</span>
                <span className={`hidden sm:block text-[12px] font-semibold text-right ${slaTone}`}>{sla}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </FadeUp>

    <FadeUp>
      <div className="flex flex-col lg:flex-row-reverse items-center gap-10 lg:gap-16">
        <Copy
          eyebrow="Live chat & AI copilot"
          title="AI answers first. Your team steps in when it counts."
          body="The copilot handles common questions, drafts a ticket for the customer to confirm, and hands off with the full thread the moment an agent takes over."
        />
        <div className="w-full flex-1 min-w-0 p-4 md:p-7 rounded-[28px] bg-forest-900">
          <div className="flex flex-col gap-3 p-5 md:p-6 rounded-[18px] bg-forest-950 border border-forest-800 text-mint">
            <div className="self-start max-w-[360px] px-4 py-3 rounded-[4px_16px_16px_16px] bg-forest-900 border border-forest-800 text-[14px] leading-relaxed">
              Can I add a second admin to our workspace myself?
            </div>
            <div className="self-start max-w-[420px] flex gap-2.5 px-4 py-3 rounded-[4px_16px_16px_16px] bg-[#10332d] border border-forest-700 text-[14px] leading-relaxed">
              <span className="material-symbols-outlined text-[16px] text-sage mt-0.5">auto_awesome</span>
              <span>Yes. Go to Settings → Team, choose Invite, and set the role to Admin. Want me to open a request so the team can do it for you?</span>
            </div>
            <div className="self-end px-4 py-3 rounded-[16px_4px_16px_16px] bg-sage text-forest-950 text-[14px]">Please do, thanks!</div>
            <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-forest-900 border border-forest-700">
              <span className="flex-1 text-[13px]">
                <b>Ticket drafted:</b> Add a second admin
              </span>
              <span className="h-[30px] px-3 rounded-full bg-sage text-forest-950 text-[12px] font-semibold flex items-center">Confirm</span>
            </div>
          </div>
        </div>
      </div>
    </FadeUp>

    <FadeUp>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {GRID.map((g) => (
          <div
            key={g.title}
            className="flex flex-col gap-3 p-6 rounded-[22px] bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 transition-[transform,box-shadow] duration-200 hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="flex items-center justify-between">
              <span className="w-11 h-11 rounded-xl bg-forest-900 text-sage flex items-center justify-center">
                <span className="material-symbols-outlined text-[22px]">{g.icon}</span>
              </span>
              {g.soon && <span className="h-[22px] px-2 rounded-full border border-dashed border-neutral-400 dark:border-neutral-600 text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 flex items-center">Soon</span>}
            </div>
            <h3 className="font-display text-[19px] font-bold text-on-surface">{g.title}</h3>
            <p className="text-[14px] leading-relaxed text-neutral-600 dark:text-neutral-400">{g.body}</p>
          </div>
        ))}
      </div>
      <div className="mt-8 flex justify-center">
        <Link to="/platform" className="h-11 px-5 rounded-full border border-neutral-300 dark:border-neutral-700 text-[14px] font-semibold text-on-surface flex items-center gap-2 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors">
          See all modules
          <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
        </Link>
      </div>
    </FadeUp>
  </section>
);

export default FeatureRows;
