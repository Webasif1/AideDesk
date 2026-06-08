import { useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import { useTicket } from "../hooks/useTicket";
import { formatMinutes } from "../../../lib/format";

// Admin/agent read the aggregated /tickets/stats endpoint. Customers can't (it's
// company-wide), so their strip is derived client-side from their own tickets.
const TicketMetrics = () => {
  const { getTicketStats } = useTicket();
  const role = useSelector((s) => s.auth.role);
  const stats = useSelector((s) => s.ticket.stats);
  const tickets = useSelector((s) => s.ticket.tickets);
  const loading = useSelector((s) => s.ticket.loading);
  const activeWorkspaceId = useSelector((s) => s.company.activeWorkspaceId);
  const userWorkspaceId = useSelector((s) => s.auth.user?.workspaceId);
  const workspaceId = activeWorkspaceId || userWorkspaceId;

  const isStaff = role === "admin" || role === "agent";

  useEffect(() => {
    if (isStaff) getTicketStats().catch(() => {});
  }, [getTicketStats, isStaff, workspaceId]);

  // Customer fallback — compute from the customer's own ticket list.
  const derived = useMemo(() => {
    const list = tickets || [];
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const resolvedClosed = list.filter((t) => ["resolved", "closed"].includes(t.status)).length;
    const responded = list.filter((t) => t.firstResponseAt);
    const avgMins = responded.length
      ? Math.round(
          responded.reduce(
            (s, t) => s + (new Date(t.firstResponseAt) - new Date(t.createdAt)),
            0
          ) /
            responded.length /
            60000
        )
      : null;
    return {
      total: list.length,
      avgFirstResponseMins: avgMins,
      resolutionRate: list.length ? Math.round((resolvedClosed / list.length) * 1000) / 10 : 0,
      newThisWeek: list.filter((t) => new Date(t.createdAt).getTime() >= weekAgo).length,
    };
  }, [tickets]);

  const s = isStaff ? stats : derived;
  const ready = isStaff ? !!stats : true;

  const metrics = [
    {
      label: "Total Tickets",
      value: ready ? (s?.total ?? 0).toLocaleString() : "—",
      badge: ready ? `${s?.open ?? "·"} open` : "",
      badgeColor: "text-neutral-400",
      icon: "confirmation_number",
    },
    {
      label: "Avg Response",
      value: ready ? formatMinutes(s?.avgFirstResponseMins ?? null) : "—",
      badge: "first reply",
      badgeColor: "text-neutral-400",
      icon: "schedule",
    },
    {
      label: "Resolution Rate",
      value: ready ? `${s?.resolutionRate ?? 0}%` : "—",
      badge: "resolved",
      badgeColor: "text-green-600",
      icon: "check_circle",
    },
    {
      label: "New This Week",
      value: ready ? `${s?.newThisWeek ?? 0}` : "—",
      badge: "last 7d",
      badgeColor: "text-neutral-400",
      icon: "trending_up",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[24px] mb-10">
      {metrics.map((m) => (
        <div
          key={m.label}
          className="p-[24px] border border-neutral-200 dark:border-neutral-700 rounded-xl bg-white dark:bg-[#1a1a1a] hover:border-neutral-300 dark:hover:border-neutral-600 transition-colors"
        >
          <div className="flex items-center justify-between mb-[16px]">
            <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
              {m.label}
            </span>
            <span className="material-symbols-outlined text-neutral-400 dark:text-neutral-500 text-[20px]">
              {m.icon}
            </span>
          </div>
          <div className="flex items-baseline gap-[8px]">
            <span
              className={`text-[24px] font-bold text-black dark:text-white ${loading && isStaff && !stats ? "opacity-40" : ""}`}
            >
              {m.value}
            </span>
            <span className={`text-[10px] font-semibold ${m.badgeColor}`}>
              {m.badge}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TicketMetrics;
