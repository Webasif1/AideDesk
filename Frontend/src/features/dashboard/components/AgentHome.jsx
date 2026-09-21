import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import { useTicket } from "../../ticket/hooks/useTicket";
import Badge from "../../../components/ui/Badge";
import Button from "../../../components/ui/Button";
import { SkeletonRow } from "../../../components/ui/Skeleton";
import {
  customerName,
  formatMinutes,
  formatRelative,
  shortId,
  ticketPriorityLabel,
  ticketPriorityTone,
  ticketStatusLabel,
  ticketStatusTone,
} from "../../../lib/format";

const ACTIVE = new Set(["open", "pending", "in_progress"]);
const PRIORITY_RANK = { urgent: 0, high: 1, medium: 2, low: 3 };

// Urgency = priority first, then whoever has waited longest. There is no
// per-ticket SLA due time from the backend yet, so waiting time stands in for
// it rather than showing a countdown we can't back up.
const byUrgency = (a, b) =>
  (PRIORITY_RANK[a.priority] ?? 2) - (PRIORITY_RANK[b.priority] ?? 2) ||
  new Date(a.createdAt) - new Date(b.createdAt);
const byNewest = (a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt);

const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
};

const fadeUp = (delay) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3, delay, ease: [0.2, 0.8, 0.2, 1] },
});

const AgentHome = ({ ticketStats, loadStats, user }) => {
  const navigate = useNavigate();
  const { getTickets } = useTicket();
  const tickets = useSelector((s) => s.ticket.tickets);
  const loading = useSelector((s) => s.ticket.loading);
  const activeWorkspaceId = useSelector((s) => s.company.activeWorkspaceId);
  const workspaceId = activeWorkspaceId || user?.workspaceId;
  const [sort, setSort] = useState("urgency");

  // The list endpoint scopes agents to their own assignments server-side.
  useEffect(() => {
    getTickets({ limit: 50 }).catch(() => {});
  }, [getTickets, workspaceId]);

  const active = useMemo(() => (tickets || []).filter((t) => ACTIVE.has(t.status)), [tickets]);
  const ranked = useMemo(() => [...active].sort(byUrgency), [active]);
  const listed = useMemo(() => [...active].sort(sort === "urgency" ? byUrgency : byNewest), [active, sort]);
  const firstUp = ranked.slice(0, 3);

  const open = ticket => {
    const chatId = ticket.chat?._id || ticket.chat;
    const customerId = ticket.customerId?._id || ticket.customerId;
    if (chatId) navigate(`/dashboard/chat?chat=${chatId}`);
    else if (customerId) navigate(`/dashboard/chat?customer=${customerId}`);
    else navigate("/dashboard/tickets");
  };

  const firstName = (user?.name || user?.fullName || "").split(" ")[0];
  const openCount = (ticketStats?.open ?? 0) + (ticketStats?.inProgress ?? 0);
  const urgent = ticketStats?.urgent ?? 0;
  const initialLoad = loading && !tickets?.length;

  const today = [
    { label: "Open", value: ticketStats ? ticketStats.open ?? 0 : "—" },
    { label: "In progress", value: ticketStats ? ticketStats.inProgress ?? 0 : "—" },
    { label: "Resolved", value: ticketStats ? (ticketStats.resolved ?? 0) + (ticketStats.closed ?? 0) : "—" },
    { label: "Avg first reply", value: ticketStats ? formatMinutes(ticketStats.avgFirstResponseMins ?? null) : "—" },
  ];

  return (
    <main className="p-6 md:p-8 flex flex-col gap-6 flex-1">
      <motion.div {...fadeUp(0)} className="flex flex-col sm:flex-row sm:items-end gap-4">
        <div className="flex-1 flex flex-col gap-1.5">
          <h1 className="font-display text-[26px] md:text-[28px] font-bold tracking-[-0.02em] text-on-surface">
            {greeting()}
            {firstName ? `, ${firstName}` : ""}.
          </h1>
          <p className="text-[14px] text-neutral-600 dark:text-neutral-400">
            {ticketStats
              ? `${openCount} open ${openCount === 1 ? "ticket" : "tickets"} assigned to you${urgent ? ` · ${urgent} urgent` : ""}`
              : "Loading your queue…"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" icon="refresh" onClick={loadStats}>
            Refresh
          </Button>
          <Button icon="forum" onClick={() => navigate("/dashboard/chat")}>
            Open chat
          </Button>
        </div>
      </motion.div>

      <motion.section {...fadeUp(0.06)} aria-labelledby="first-h" className="flex flex-col gap-3">
        <h2 id="first-h" className="text-[12px] font-semibold tracking-[0.08em] uppercase text-neutral-500">
          Needs you first
        </h2>
        {initialLoad ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-[132px] rounded-[20px] bg-neutral-100 dark:bg-neutral-900 animate-pulse" />
            ))}
          </div>
        ) : firstUp.length ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {firstUp.map((t, i) => {
              const lead = i === 0;
              const pr = ticketPriorityLabel(t.priority);
              return (
                <button
                  key={t._id}
                  type="button"
                  onClick={() => open(t)}
                  className={`flex flex-col gap-3 p-5 rounded-[20px] text-left transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-lg ${
                    lead
                      ? "bg-forest-900 text-mint"
                      : "bg-white dark:bg-neutral-900 text-on-surface border border-neutral-200 dark:border-neutral-800"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {lead ? (
                      <span className="h-6 px-2.5 rounded-full bg-mint/15 text-mint text-[12px] font-medium inline-flex items-center">{pr}</span>
                    ) : (
                      <Badge tone={ticketPriorityTone(pr)}>{pr}</Badge>
                    )}
                    <span className="flex-1" />
                    <span className={`font-mono text-[11px] ${lead ? "text-sage" : "text-neutral-500"}`}>{t.ticketNumber || shortId(t._id)}</span>
                  </span>
                  <span className="text-[16px] font-semibold leading-snug line-clamp-2">{t.title}</span>
                  <span className={`text-[12px] ${lead ? "text-sage" : "text-neutral-500"}`}>
                    {customerName(t.customerId)} · opened {formatRelative(t.createdAt)}
                  </span>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="flex items-center gap-4 p-5 rounded-[20px] bg-ok-soft text-ok">
            <span className="material-symbols-outlined text-[24px]">task_alt</span>
            <span className="text-[14px] font-medium">You're all caught up. Nothing open is assigned to you right now.</span>
          </div>
        )}
      </motion.section>

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_340px] gap-5">
        <motion.section
          {...fadeUp(0.12)}
          aria-labelledby="mine-h"
          className="flex flex-col rounded-[20px] bg-white dark:bg-[#0b2b26] border border-neutral-200 dark:border-neutral-800 overflow-hidden"
        >
          <div className="flex flex-wrap items-center gap-3 px-5 py-4 border-b border-neutral-100 dark:border-neutral-800">
            <h2 id="mine-h" className="flex-1 font-display text-[16px] font-bold text-on-surface">
              My tickets <span className="text-neutral-500 font-sans font-medium text-[13px]">· {active.length} open</span>
            </h2>
            <div role="group" aria-label="Sort my tickets" className="flex gap-1 p-[3px] rounded-full bg-neutral-100 dark:bg-neutral-900">
              {[
                ["urgency", "By urgency"],
                ["newest", "Recently updated"],
              ].map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  aria-pressed={sort === id}
                  onClick={() => setSort(id)}
                  className={`h-7 px-3 rounded-full text-[12px] transition-colors ${
                    sort === id ? "bg-white dark:bg-neutral-800 font-semibold text-on-surface shadow-sm" : "text-neutral-600 dark:text-neutral-400"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          {initialLoad ? (
            [...Array(5)].map((_, i) => <SkeletonRow key={i} />)
          ) : listed.length ? (
            <ul className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {listed.map((t) => {
                const pr = ticketPriorityLabel(t.priority);
                const st = ticketStatusLabel(t.status, t.slaBreached);
                return (
                  <li key={t._id}>
                    <button
                      type="button"
                      onClick={() => open(t)}
                      className="w-full grid grid-cols-[minmax(0,1fr)_auto] md:grid-cols-[minmax(0,1fr)_130px_90px_90px] items-center gap-3 px-5 py-3.5 text-left hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors"
                    >
                      <span className="flex flex-col gap-0.5 min-w-0">
                        <span className="text-[13px] font-semibold text-on-surface truncate">{t.title}</span>
                        <span className="text-[12px] text-neutral-500 truncate">
                          {t.ticketNumber || shortId(t._id)} · {customerName(t.customerId)}
                        </span>
                      </span>
                      <Badge tone={ticketStatusTone(st)} dot>
                        {st}
                      </Badge>
                      <span className="hidden md:inline-flex">
                        <Badge tone={ticketPriorityTone(pr)}>{pr}</Badge>
                      </span>
                      <span className="hidden md:block text-[12px] text-neutral-500 text-right">{formatRelative(t.updatedAt || t.createdAt)}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="flex flex-col items-center gap-2 px-6 py-14 text-center">
              <span className="material-symbols-outlined text-[36px] text-neutral-300 dark:text-neutral-700">inbox</span>
              <p className="text-[14px] font-semibold text-on-surface">No open tickets</p>
              <p className="text-[13px] text-neutral-500">New tickets assigned to you will appear here as they arrive.</p>
            </div>
          )}
        </motion.section>

        <motion.aside {...fadeUp(0.18)} className="flex flex-col gap-5">
          <section aria-labelledby="today-h" className="flex flex-col gap-3 p-5 rounded-[20px] bg-white dark:bg-[#0b2b26] border border-neutral-200 dark:border-neutral-800">
            <h2 id="today-h" className="font-display text-[16px] font-bold text-on-surface">
              Your numbers
            </h2>
            <dl className="grid grid-cols-2 gap-2.5">
              {today.map((d) => (
                <div key={d.label} className="flex flex-col gap-0.5 p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-950">
                  <dt className="text-[12px] text-neutral-500">{d.label}</dt>
                  <dd className="font-display text-[22px] font-bold text-on-surface m-0">{d.value}</dd>
                </div>
              ))}
            </dl>
            <div className="flex items-center justify-between pt-1 text-[13px]">
              <span className="text-neutral-600 dark:text-neutral-400">Resolution rate</span>
              <span className="font-semibold text-on-surface">{ticketStats ? `${ticketStats.resolutionRate ?? 0}%` : "—"}</span>
            </div>
          </section>

          <section aria-labelledby="go-h" className="flex flex-col gap-2 p-5 rounded-[20px] bg-forest-900 text-mint">
            <h2 id="go-h" className="font-display text-[16px] font-bold mb-1">
              Jump to
            </h2>
            {[
              ["forum", "Live chat", "Customers talking to you or the AI", "/dashboard/chat"],
              ["confirmation_number", "All my tickets", "Filter, sort and update in bulk", "/dashboard/tickets"],
            ].map(([icon, label, sub, to]) => (
              <button
                key={to}
                type="button"
                onClick={() => navigate(to)}
                className="flex items-center gap-3 p-3 rounded-2xl text-left hover:bg-forest-800 transition-colors"
              >
                <span className="w-9 h-9 rounded-xl bg-sage text-forest-950 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">{icon}</span>
                </span>
                <span className="flex flex-col">
                  <span className="text-[14px] font-semibold">{label}</span>
                  <span className="text-[12px] text-sage">{sub}</span>
                </span>
              </button>
            ))}
          </section>
        </motion.aside>
      </div>
    </main>
  );
};

export default AgentHome;
