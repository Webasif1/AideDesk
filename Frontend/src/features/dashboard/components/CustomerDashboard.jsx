import { useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import PageWrapper from "../../../App/Components/ui/PageWrapper";
import Badge from "../../../components/ui/Badge";
import { useTicket } from "../../ticket/hooks/useTicket";
import { formatRelative, shortId } from "../../../lib/format";

// Customers see progress in plain language, never internal status keys.
// `pending` is a legacy value the copilot used to set; it reads as in progress.
const STAGE = {
  open: { step: 1, label: "Received", tone: "info" },
  pending: { step: 2, label: "In progress", tone: "warn" },
  in_progress: { step: 2, label: "In progress", tone: "warn" },
  resolved: { step: 3, label: "Resolved", tone: "ok" },
  closed: { step: 3, label: "Resolved", tone: "ok" },
  forced_closed: { step: 3, label: "Closed", tone: "neutral" },
};
const STEPS = ["Received", "In progress", "Resolved"];
const stageOf = (t) => STAGE[t.status] || STAGE.open;

const fadeUp = (delay) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3, delay, ease: [0.2, 0.8, 0.2, 1] },
});

const Progress = ({ step }) => (
  <ol aria-label={`Progress: ${STEPS[step - 1]}`} className="grid grid-cols-3 gap-2">
    {STEPS.map((label, i) => {
      const done = i < step;
      return (
        <li key={label} aria-current={i === step - 1 ? "step" : undefined} className="flex flex-col gap-2">
          <span className={`h-1.5 rounded-full ${done ? "bg-forest-700 dark:bg-sage" : "bg-neutral-200 dark:bg-neutral-800"}`} />
          <span className={`text-[12px] ${i === step - 1 ? "font-semibold text-on-surface" : done ? "text-on-surface" : "text-neutral-500"}`}>{label}</span>
        </li>
      );
    })}
  </ol>
);

const CustomerDashboard = ({ user }) => {
  const navigate = useNavigate();
  const { tickets, getTickets } = useTicket();
  const loading = useSelector((s) => s.ticket.loading);
  const firstName = (user?.fullName || user?.name || "").split(/\s+/)[0];

  useEffect(() => {
    getTickets({ limit: 100 }).catch(() => {});
  }, [getTickets]);

  const { openOnes, doneOnes, counts } = useMemo(() => {
    const openOnes = [];
    const doneOnes = [];
    const counts = { received: 0, progress: 0, resolved: 0 };
    for (const t of tickets) {
      const s = stageOf(t);
      if (s.step === 3) {
        doneOnes.push(t);
        counts.resolved += 1;
      } else {
        openOnes.push(t);
        counts[s.step === 1 ? "received" : "progress"] += 1;
      }
    }
    const recent = (a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt);
    return { openOnes: openOnes.sort(recent), doneOnes: doneOnes.sort(recent), counts };
  }, [tickets]);

  const initialLoad = loading && tickets.length === 0;

  return (
    <PageWrapper>
      <div className="bg-surface dark:bg-[#051f20] text-on-surface min-h-screen font-sans">
        <Sidebar />
        <div className="ml-64 min-h-screen flex flex-col">
          <TopBar />
          <main className="p-6 md:p-8 flex flex-col gap-6 flex-1">
            <motion.section
              {...fadeUp(0)}
              className="relative overflow-hidden flex flex-col md:flex-row md:items-center gap-6 px-7 py-8 md:px-9 rounded-[24px] bg-forest-900 text-mint"
            >
              <div aria-hidden="true" className="absolute -right-16 -top-10 w-[420px] flex flex-col -rotate-12 opacity-80 pointer-events-none">
                <span className="h-16 rounded-full bg-forest-800" />
                <span className="h-16 -mt-6 rounded-full bg-forest-700" />
                <span className="h-16 -mt-6 rounded-full bg-sage/50" />
              </div>
              <div className="relative flex-1 flex flex-col gap-2">
                <h1 className="font-display text-[28px] md:text-[32px] font-extrabold tracking-[-0.03em]">
                  Hi{firstName ? ` ${firstName}` : ""}, how can we help?
                </h1>
                <p className="text-[15px] text-[#b9d6c0] max-w-[520px]">
                  Start a chat for a quick answer. If it needs a person, we'll open a request and keep you posted here.
                </p>
              </div>
              <div className="relative flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => navigate("/dashboard/chat")}
                  className="h-12 px-5 rounded-full bg-sage text-forest-950 text-[15px] font-semibold flex items-center gap-2 hover:bg-mint transition-colors active:scale-[0.98]"
                >
                  <span className="material-symbols-outlined text-[20px]">chat_bubble</span>
                  Start a chat
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/dashboard/tickets")}
                  className="h-12 px-5 rounded-full border border-forest-700 text-mint text-[15px] font-semibold flex items-center hover:bg-forest-800 transition-colors"
                >
                  My tickets
                </button>
              </div>
            </motion.section>

            <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_320px] gap-5">
              <motion.section {...fadeUp(0.06)} aria-labelledby="open-h" className="flex flex-col gap-3.5">
                <div className="flex items-center justify-between">
                  <h2 id="open-h" className="font-display text-[18px] font-bold text-on-surface">
                    Your open requests
                  </h2>
                  {openOnes.length > 3 && (
                    <button type="button" onClick={() => navigate("/dashboard/tickets")} className="text-[13px] font-semibold text-forest-700 dark:text-sage">
                      View all {openOnes.length}
                    </button>
                  )}
                </div>

                {initialLoad ? (
                  [0, 1].map((i) => <div key={i} className="h-[150px] rounded-[20px] bg-neutral-100 dark:bg-neutral-900 animate-pulse" />)
                ) : openOnes.length ? (
                  openOnes.slice(0, 3).map((t) => {
                    const s = stageOf(t);
                    return (
                      <button
                        key={t._id}
                        type="button"
                        onClick={() => navigate("/dashboard/tickets")}
                        className="flex flex-col gap-4 p-5 md:p-6 rounded-[20px] bg-white dark:bg-[#0b2b26] border border-neutral-200 dark:border-neutral-800 text-left transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-lg"
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-1 min-w-0 flex flex-col gap-1">
                            <span className="text-[16px] font-semibold text-on-surface">{t.title}</span>
                            <span className="text-[13px] text-neutral-500">
                              Request {t.ticketNumber || shortId(t._id)} · opened {formatRelative(t.createdAt)}
                            </span>
                          </div>
                          <Badge tone={s.tone}>{s.label}</Badge>
                        </div>
                        <Progress step={s.step} />
                      </button>
                    );
                  })
                ) : (
                  <div className="flex flex-col items-center gap-3 px-6 py-12 rounded-[20px] bg-white dark:bg-[#0b2b26] border border-neutral-200 dark:border-neutral-800 text-center">
                    <span className="w-14 h-14 rounded-2xl bg-ok-soft text-ok flex items-center justify-center">
                      <span className="material-symbols-outlined text-[28px]">task_alt</span>
                    </span>
                    <p className="text-[16px] font-semibold text-on-surface">No open requests</p>
                    <p className="text-[14px] text-neutral-500 max-w-[360px]">If something comes up, start a chat and we'll take it from there.</p>
                  </div>
                )}
              </motion.section>

              <motion.aside {...fadeUp(0.12)} className="flex flex-col gap-5">
                <section aria-labelledby="sum-h" className="flex flex-col gap-3 p-5 rounded-[20px] bg-white dark:bg-[#0b2b26] border border-neutral-200 dark:border-neutral-800">
                  <h2 id="sum-h" className="font-display text-[16px] font-bold text-on-surface">
                    At a glance
                  </h2>
                  <dl className="grid grid-cols-3 gap-2">
                    {[
                      ["Received", counts.received],
                      ["In progress", counts.progress],
                      ["Resolved", counts.resolved],
                    ].map(([l, v]) => (
                      <div key={l} className="flex flex-col-reverse gap-0.5 p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-950">
                        <dt className="text-[11px] text-neutral-500">{l}</dt>
                        <dd className="font-display text-[22px] font-bold text-on-surface m-0">{initialLoad ? "—" : v}</dd>
                      </div>
                    ))}
                  </dl>
                </section>

                <section aria-labelledby="done-h" className="flex flex-col gap-1 p-5 rounded-[20px] bg-white dark:bg-[#0b2b26] border border-neutral-200 dark:border-neutral-800">
                  <h2 id="done-h" className="font-display text-[16px] font-bold text-on-surface mb-2">
                    Recently resolved
                  </h2>
                  {doneOnes.length ? (
                    doneOnes.slice(0, 4).map((t) => (
                      <button
                        key={t._id}
                        type="button"
                        onClick={() => navigate("/dashboard/tickets")}
                        className="flex items-center gap-3 py-2.5 border-t border-neutral-100 dark:border-neutral-800 first:border-0 text-left"
                      >
                        <span className="material-symbols-outlined text-[18px] text-ok">check_circle</span>
                        <span className="flex-1 min-w-0 text-[13px] font-medium text-on-surface truncate">{t.title}</span>
                        <span className="text-[11px] text-neutral-500 shrink-0">{formatRelative(t.updatedAt || t.createdAt)}</span>
                      </button>
                    ))
                  ) : (
                    <p className="text-[13px] text-neutral-500">Nothing resolved yet.</p>
                  )}
                </section>
              </motion.aside>
            </div>
          </main>
        </div>
      </div>
    </PageWrapper>
  );
};

export default CustomerDashboard;
