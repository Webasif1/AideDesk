import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import { useTicket } from "../../ticket/hooks/useTicket";
import KpiCard from "./KpiCard";
import TicketVolumeChart from "./TicketVolumeChart";
import CsatBreakdown from "./CsatBreakdown";
import QuickActions from "./QuickActions";
import Badge from "../../../components/ui/Badge";
import Button from "../../../components/ui/Button";
import { SkeletonCard, SkeletonRow } from "../../../components/ui/Skeleton";
import { customerName, formatMinutes, formatRelative, initialsOf, shortId, ticketPriorityLabel, ticketPriorityTone } from "../../../lib/format";

const ACTIVE = new Set(["open", "pending", "in_progress"]);
const PRIORITY_RANK = { urgent: 0, high: 1, medium: 2, low: 3 };
const LIST_LIMIT = 100; // the list endpoint's maximum page size

const fadeUp = (delay) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3, delay, ease: [0.2, 0.8, 0.2, 1] },
});

const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
};

const AdminHome = ({ ticketStats, agentStats, statsLoading, loadStats, onCreateReport, user }) => {
  const navigate = useNavigate();
  const { getTickets } = useTicket();
  const tickets = useSelector((s) => s.ticket.tickets);
  const pagination = useSelector((s) => s.ticket.pagination);
  const listLoading = useSelector((s) => s.ticket.loading);
  const activeWorkspaceId = useSelector((s) => s.company.activeWorkspaceId);

  useEffect(() => {
    getTickets({ limit: LIST_LIMIT, sort: "updatedAt" }).catch(() => {});
  }, [getTickets, activeWorkspaceId]);

  const active = useMemo(() => (tickets || []).filter((t) => ACTIVE.has(t.status)), [tickets]);

  // Urgent and high-priority open tickets, most urgent then oldest first.
  const attention = useMemo(
    () =>
      active
        .filter((t) => t.priority === "urgent" || t.priority === "high")
        .sort((a, b) => PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority] || new Date(a.createdAt) - new Date(b.createdAt))
        .slice(0, 5),
    [active],
  );

  // Open tickets per agent, derived from the ticket list. Unassigned open
  // tickets are the AI's (the copilot owns a conversation until someone takes
  // it over), so they get their own row.
  const workload = useMemo(() => {
    const rows = new Map();
    for (const t of active) {
      const a = t.assignedAgent;
      const key = a?._id || "ai";
      const row = rows.get(key) || { key, name: a ? a.name || a.email || "Agent" : "AI copilot", ai: !a, online: a?.status === "online", count: 0 };
      row.count += 1;
      rows.set(key, row);
    }
    return [...rows.values()].sort((x, y) => Number(x.ai) - Number(y.ai) || y.count - x.count);
  }, [active]);
  const maxLoad = Math.max(1, ...workload.map((w) => w.count));
  const partial = (pagination?.total ?? pagination?.totalTickets ?? 0) > LIST_LIMIT;

  const openNow = ticketStats ? (ticketStats.open ?? 0) + (ticketStats.pending ?? 0) + (ticketStats.inProgress ?? 0) : null;
  const statsReady = ticketStats && agentStats;
  const kpis = [
    {
      icon: "inbox",
      label: "Open now",
      value: openNow ?? "—",
      badge: ticketStats?.urgent ? `${ticketStats.urgent} urgent` : "none urgent",
      badgeType: ticketStats?.urgent ? "warn" : "ok",
    },
    {
      icon: "confirmation_number",
      label: "New this week",
      value: (ticketStats?.newThisWeek ?? 0).toLocaleString(),
      badge: `${(ticketStats?.total ?? 0).toLocaleString()} all time`,
    },
    {
      icon: "timer",
      label: "Avg. first response",
      value: formatMinutes(ticketStats?.avgFirstResponseMins ?? null),
      badge: ticketStats ? `${ticketStats.aiResolutionRate ?? 0}% resolved by AI` : undefined,
      badgeType: "info",
    },
    {
      icon: "support_agent",
      label: "Agents online",
      value: `${agentStats?.active ?? 0}/${agentStats?.total ?? 0}`,
      badge: "Live",
    },
  ];

  const firstName = (user?.name || user?.fullName || "").split(" ")[0];

  return (
    <main className="p-6 md:p-8 flex flex-col gap-6 flex-1">
      <motion.div {...fadeUp(0)} className="flex flex-col sm:flex-row sm:items-end gap-4">
        <div className="flex-1 flex flex-col gap-1.5">
          <h1 className="font-display text-[26px] md:text-[28px] font-bold tracking-[-0.02em] text-on-surface">
            {greeting()}
            {firstName ? `, ${firstName}` : ""}.
          </h1>
          <p className="text-[14px] text-neutral-600 dark:text-neutral-400">
            {openNow == null
              ? "Loading your workspace…"
              : attention.length
                ? `${attention.length} high-priority ${attention.length === 1 ? "ticket needs" : "tickets need"} attention.`
                : "No urgent or high-priority tickets waiting. Everything's on track."}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" icon="refresh" onClick={loadStats}>
            Refresh
          </Button>
          <Button icon="add" onClick={onCreateReport}>
            Create report
          </Button>
        </div>
      </motion.div>

      <motion.div {...fadeUp(0.05)} className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {!statsReady && statsLoading ? [...Array(4)].map((_, i) => <SkeletonCard key={i} />) : kpis.map((k) => <KpiCard key={k.label} {...k} />)}
      </motion.div>

      <motion.div {...fadeUp(0.1)} className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <TicketVolumeChart />
        <section aria-labelledby="att-h" className="flex flex-col rounded-[20px] bg-white dark:bg-[#0b2b26] border border-neutral-200 dark:border-neutral-800 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100 dark:border-neutral-800">
            <h2 id="att-h" className="font-display text-[16px] font-bold text-on-surface">
              Needs attention
            </h2>
            <button type="button" onClick={() => navigate("/dashboard/tickets")} className="text-[12px] font-semibold text-forest-700 dark:text-sage">
              All tickets
            </button>
          </div>
          {listLoading && !tickets?.length ? (
            [...Array(4)].map((_, i) => <SkeletonRow key={i} />)
          ) : attention.length ? (
            <ul className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {attention.map((t) => {
                const pr = ticketPriorityLabel(t.priority);
                return (
                  <li key={t._id}>
                    <button
                      type="button"
                      onClick={() => navigate("/dashboard/tickets")}
                      className="w-full flex flex-col gap-1.5 px-5 py-3.5 text-left hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <Badge tone={ticketPriorityTone(pr)}>{pr}</Badge>
                        <span className="flex-1" />
                        <span className="text-[11px] text-neutral-500">{formatRelative(t.createdAt)}</span>
                      </span>
                      <span className="text-[13px] font-semibold text-on-surface line-clamp-1">{t.title}</span>
                      <span className="text-[12px] text-neutral-500 truncate">
                        {t.ticketNumber || shortId(t._id)} · {customerName(t.customerId)} · {t.assignedAgent?.name || "AI copilot"}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center gap-2 px-6 py-10 text-center">
              <span className="w-12 h-12 rounded-2xl bg-ok-soft text-ok flex items-center justify-center">
                <span className="material-symbols-outlined text-[24px]">task_alt</span>
              </span>
              <p className="text-[14px] font-semibold text-on-surface">Nothing urgent</p>
              <p className="text-[12px] text-neutral-500">Urgent and high-priority open tickets show up here.</p>
            </div>
          )}
        </section>
      </motion.div>

      <motion.div {...fadeUp(0.15)} className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <section aria-labelledby="load-h" className="flex flex-col gap-4 p-6 rounded-[20px] bg-white dark:bg-[#0b2b26] border border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center justify-between">
            <h2 id="load-h" className="font-display text-[16px] font-bold text-on-surface">
              Open tickets by owner
            </h2>
            <button type="button" onClick={() => navigate("/dashboard/team")} className="text-[12px] font-semibold text-forest-700 dark:text-sage">
              Team
            </button>
          </div>
          {workload.length ? (
            <ul className="flex flex-col gap-3">
              {workload.map((w) => (
                <li key={w.key} className="flex items-center gap-3">
                  <span
                    className={`relative w-8 h-8 shrink-0 rounded-full text-[11px] font-bold flex items-center justify-center ${
                      w.ai ? "bg-forest-900 text-sage" : "bg-neutral-100 dark:bg-neutral-800 text-forest-700 dark:text-sage"
                    }`}
                  >
                    {w.ai ? <span className="material-symbols-outlined text-[16px]">auto_awesome</span> : initialsOf(w.name)}
                    {!w.ai && w.online && <span className="absolute -right-0.5 -bottom-0.5 w-2.5 h-2.5 rounded-full bg-ok border-2 border-white dark:border-[#0b2b26]" aria-label="Online" />}
                  </span>
                  <span className="w-[110px] shrink-0 text-[13px] font-medium text-on-surface truncate">{w.name}</span>
                  <span className="flex-1 h-2 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                    <span className={`block h-2 rounded-full ${w.ai ? "bg-sage" : "bg-forest-700 dark:bg-sage"}`} style={{ width: `${(w.count / maxLoad) * 100}%` }} />
                  </span>
                  <span className="w-8 text-right text-[13px] font-semibold text-on-surface">{w.count}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[13px] text-neutral-500">No open tickets right now.</p>
          )}
          {partial && <p className="text-[11px] text-neutral-500">Based on the {LIST_LIMIT} most recently updated tickets.</p>}
        </section>
        <CsatBreakdown />
        <QuickActions />
      </motion.div>
    </main>
  );
};

export default AdminHome;
