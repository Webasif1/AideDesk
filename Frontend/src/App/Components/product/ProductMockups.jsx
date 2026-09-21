// Product mockups for the Product page, built from real UI patterns with the
// brief's fictional sample data. Decorative: each is aria-hidden and the
// surrounding copy carries the meaning.
const TONES = {
  ok: "bg-ok-soft text-ok",
  warn: "bg-warn-soft text-warn",
  err: "bg-err-soft text-err",
  info: "bg-info-soft text-info",
  neutral: "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300",
};

const Pill = ({ tone, children }) => (
  <span className={`justify-self-start h-6 px-2.5 rounded-full text-[12px] font-medium whitespace-nowrap inline-flex items-center ${TONES[tone]}`}>{children}</span>
);

const shell = "rounded-3xl shadow-[0_30px_60px_rgba(5,31,32,0.12)] overflow-hidden transition-transform duration-300 hover:-translate-y-1.5";

export const TicketsMockup = () => (
  <div aria-hidden="true" className={`${shell} bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800`}>
    <div className="flex gap-4 px-5 pt-4 border-b border-neutral-100 dark:border-neutral-800 text-[13px] overflow-x-auto">
      {["All open · 128", "Assigned to me · 12", "Unassigned · 9", "SLA at risk · 3"].map((t, i) => (
        <span key={t} className={`pb-3 whitespace-nowrap ${i === 0 ? "font-semibold text-on-surface shadow-[inset_0_-2px_0_currentColor]" : "text-neutral-500"}`}>
          {t}
        </span>
      ))}
    </div>
    {[
      ["#4821", "Unable to update billing information", "Sarah Mitchell · Acme Technologies", "Waiting for customer", "neutral", "High", "warn", "1h 24m", "text-warn"],
      ["#4820", "SSO login loops back to sign-in page", "Daniel Ortiz · Brightline Health", "Open", "info", "Urgent", "err", "18m left", "text-err"],
      ["#4815", "Webhook deliveries delayed since Tuesday", "Luca Romano · Parcel Loop", "Escalated", "err", "High", "warn", "Breached", "text-err"],
      ["#4809", "Invoice shows the wrong VAT number", "Tom Becker · Nordlicht GmbH", "Open", "info", "Medium", "info", "3h 40m", "text-neutral-500"],
      ["#4797", "Refund request for a duplicate charge", "Nina Petrov · Solace Travel", "Resolved", "ok", "Medium", "info", "Met", "text-ok"],
    ].map(([id, s, c, st, stT, pr, prT, sla, slaT]) => (
      <div key={id} className="grid grid-cols-[minmax(0,1fr)_auto] md:grid-cols-[52px_minmax(0,1fr)_150px_80px_80px] items-center gap-3 px-5 py-3 border-b border-neutral-100 dark:border-neutral-800 last:border-0">
        <span className="hidden md:block font-mono text-[12px] text-neutral-500">{id}</span>
        <span className="flex flex-col gap-0.5 min-w-0">
          <span className="text-[13px] font-semibold text-on-surface truncate">{s}</span>
          <span className="text-[12px] text-neutral-500 truncate">{c}</span>
        </span>
        <Pill tone={stT}>{st}</Pill>
        <span className="hidden md:inline-flex">
          <Pill tone={prT}>{pr}</Pill>
        </span>
        <span className={`hidden md:block text-[12px] font-semibold text-right ${slaT}`}>{sla}</span>
      </div>
    ))}
  </div>
);

export const ChatMockup = () => (
  <div aria-hidden="true" className={`${shell} flex bg-forest-950 text-mint min-h-[400px]`}>
    <div className="hidden sm:flex w-[220px] shrink-0 flex-col gap-1 p-3 bg-[#041819] border-r border-forest-800">
      {[
        ["GK", "Grace Kim", "Grace is typing…", true],
        ["DO", "Daniel Ortiz", "SSO still loops after…"],
        ["LR", "Luca Romano", "Any update on the webhook?"],
        ["AB", "Aisha Bello", "Can I add a second admin?"],
      ].map(([i, n, m, on]) => (
        <div key={i} className={`flex gap-2.5 p-2.5 rounded-xl ${on ? "bg-forest-900" : ""}`}>
          <span className="w-8 h-8 shrink-0 rounded-full bg-forest-800 text-sage text-[11px] font-bold flex items-center justify-center">{i}</span>
          <span className="flex flex-col gap-0.5 min-w-0">
            <span className="text-[12px] font-semibold">{n}</span>
            <span className="text-[11px] text-[#6f9a85] truncate">{m}</span>
          </span>
        </div>
      ))}
    </div>
    <div className="flex-1 min-w-0 flex flex-col gap-3 p-5">
      <div className="self-start max-w-[320px] px-3.5 py-2.5 rounded-[4px_16px_16px_16px] bg-forest-900 border border-forest-800 text-[13px] leading-relaxed">
        Our chat widget stopped loading on Safari after yesterday's deploy.
      </div>
      <div className="self-start max-w-[360px] px-3.5 py-2.5 rounded-[4px_16px_16px_16px] bg-[#10332d] border border-forest-700 text-[13px] leading-relaxed">
        <b className="block text-[11px] text-sage mb-0.5">AideDesk AI</b>
        Which Safari version are you on, and is there a console error?
      </div>
      <div className="flex items-center gap-2.5 text-[11px] text-[#6f9a85]">
        <span className="flex-1 h-px bg-forest-800" />
        Alex Morgan took over
        <span className="flex-1 h-px bg-forest-800" />
      </div>
      <div className="self-end max-w-[340px] px-3.5 py-2.5 rounded-[16px_4px_16px_16px] bg-sage text-forest-950 text-[13px] leading-relaxed">
        Hi Grace, Alex here. Checking the frame header with engineering now.
      </div>
      <div className="self-end max-w-[340px] px-3.5 py-2.5 rounded-[14px] bg-[#e6c170]/10 border border-dashed border-[#e6c170]/50 text-[#f0d9a4] text-[13px] leading-relaxed">
        <b className="block text-[11px] mb-0.5">Internal note</b>
        Likely the frame-ancestors change in the last release.
      </div>
      <div className="mt-auto flex items-center gap-2.5 px-3 py-2.5 rounded-2xl bg-forest-900 border border-forest-700 text-[13px] text-[#6f9a85]">
        <span className="flex-1">Message Grace…</span>
        <span className="h-[30px] px-3.5 rounded-full bg-sage text-forest-950 text-[12px] font-semibold flex items-center">Send</span>
      </div>
    </div>
  </div>
);

export const CustomerMockup = () => (
  <div aria-hidden="true" className={`${shell} grid grid-cols-1 md:grid-cols-[280px_minmax(0,1fr)] gap-4 p-4 md:p-5 bg-mint dark:bg-forest-900`}>
    <div className="flex flex-col gap-3.5 p-5 rounded-[18px] bg-white dark:bg-neutral-950">
      <div className="flex items-center gap-3">
        <span className="w-[52px] h-[52px] rounded-full bg-forest-700 text-mint font-display text-[17px] font-bold flex items-center justify-center">SM</span>
        <span className="flex flex-col gap-0.5">
          <span className="font-display text-[17px] font-bold text-on-surface">Sarah Mitchell</span>
          <span className="text-[12px] text-neutral-500">Acme Technologies</span>
        </span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        <span className="h-6 px-2.5 rounded-full bg-forest-700 text-mint text-[12px] flex items-center">Business plan</span>
        <Pill tone="warn">Renews Oct 28</Pill>
        <Pill tone="neutral">Admin</Pill>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {[["7", "Tickets"], ["2", "Open"], ["5.0", "CSAT"]].map(([v, l]) => (
          <span key={l} className="flex flex-col p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-900">
            <b className="font-display text-[18px] text-on-surface">{v}</b>
            <span className="text-[11px] text-neutral-500">{l}</span>
          </span>
        ))}
      </div>
      <div className="px-3.5 py-3 rounded-xl bg-[#fbf3dc] text-[#4a3708] text-[13px] leading-relaxed">Prefers email over calls. Loop in finance before changing seats.</div>
    </div>
    <div className="flex flex-col p-5 rounded-[18px] bg-white dark:bg-neutral-950">
      <span className="pb-3 text-[11px] font-semibold tracking-[0.08em] uppercase text-neutral-500">Activity</span>
      {[
        ["Replied to #4821 by email", "Today, 10:31", "bg-sage"],
        ["Opened #4821 · Unable to update billing", "Today, 10:02", "bg-[#c89b3c]"],
        ["Rated a chat with Maya 5 / 5", "Sep 2", "bg-ok"],
        ["#4602 resolved · Add SSO for finance", "Aug 30", "bg-ok"],
        ["Upgraded to Business plan", "Aug 12", "bg-forest-700"],
      ].map(([t, w, dot]) => (
        <div key={t} className="flex gap-3">
          <div className="flex flex-col items-center pt-1.5">
            <span className={`w-[9px] h-[9px] rounded-full ${dot}`} />
            <span className="w-px flex-1 bg-neutral-200 dark:bg-neutral-800" />
          </div>
          <div className="flex flex-col gap-0.5 pb-3.5">
            <span className="text-[13px] font-medium text-on-surface">{t}</span>
            <span className="text-[11px] text-neutral-500">{w}</span>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const AIMockup = () => (
  <div aria-hidden="true" className={`${shell} flex flex-col gap-3.5 p-6 md:p-7 bg-forest-900 text-mint`}>
    <div className="flex flex-col gap-2.5 p-4 rounded-2xl bg-forest-950 border border-forest-800">
      <span className="text-[12px] text-sage">Customer · Grace Kim</span>
      <span className="text-[14px] leading-relaxed">Safari 17.4. Console says “Refused to display in a frame”.</span>
    </div>
    <div className="flex flex-col gap-2.5 p-4 rounded-2xl bg-forest-950 border border-forest-700">
      <span className="flex items-center gap-2 text-[12px] font-semibold text-sage">
        <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
        AI drafted a ticket
      </span>
      <span className="text-[14px] font-semibold">Chat widget not loading on Safari 17</span>
      <div className="flex gap-1.5">
        <span className="h-[22px] px-2 rounded-full bg-[#e6c170]/15 text-[#e6c170] text-[11px] font-medium flex items-center">High</span>
        <span className="h-[22px] px-2 rounded-full bg-forest-800 text-sage text-[11px] font-medium flex items-center">1 attachment</span>
      </div>
    </div>
    <div className="flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-forest-950 border border-forest-800">
      <span className="flex-1 text-[14px]">Waiting for Grace to confirm the ticket</span>
      <span className="h-[26px] px-2.5 rounded-full bg-sage text-forest-950 text-[12px] font-semibold flex items-center">Take over</span>
    </div>
  </div>
);

export const SLAMockup = () => (
  <div aria-hidden="true" className={`${shell} bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800`}>
    <div className="grid grid-cols-[100px_repeat(2,minmax(0,1fr))] gap-3 px-5 py-3.5 border-b border-neutral-100 dark:border-neutral-800 text-[11px] font-semibold tracking-[0.06em] uppercase text-neutral-500">
      <span>Priority</span>
      <span>First response</span>
      <span>Resolution</span>
    </div>
    {[
      ["Urgent", "err", "30 min", "4 hours"],
      ["High", "warn", "1 hour", "8 hours"],
      ["Medium", "info", "4 hours", "2 days"],
      ["Low", "neutral", "1 day", "5 days"],
    ].map(([p, t, fr, rs]) => (
      <div key={p} className="grid grid-cols-[100px_repeat(2,minmax(0,1fr))] items-center gap-3 px-5 py-3.5 border-b border-neutral-100 dark:border-neutral-800 text-[14px]">
        <Pill tone={t}>{p}</Pill>
        <span className="font-semibold text-on-surface">{fr}</span>
        <span className="font-semibold text-on-surface">{rs}</span>
      </div>
    ))}
    <div className="flex flex-col gap-2 px-5 py-4 bg-neutral-50 dark:bg-neutral-950">
      <div className="flex justify-between text-[13px] text-on-surface">
        <span>#4821 · Next reply due</span>
        <span className="font-semibold text-warn">1h 24m remaining</span>
      </div>
      <div className="h-2 rounded-full bg-warn-soft overflow-hidden">
        <div className="w-[68%] h-2 rounded-full bg-[#c89b3c]" />
      </div>
      <span className="text-[11px] text-neutral-500">Example policy. Targets are set per workspace.</span>
    </div>
  </div>
);
