import { useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import KpiCard from "./KpiCard";
import PageWrapper from "../../../App/Components/ui/PageWrapper";
import { SkeletonCard } from "../../../components/ui/Skeleton";
import { useTicket } from "../../ticket/hooks/useTicket";
import {
  ticketStatusLabel,
  ticketPriorityLabel,
  formatRelative,
  shortId,
} from "../../../lib/format";

// Ordered status buckets for the "By Status" breakdown.
const STATUS_ORDER = [
  { key: "open", label: "Open", color: "bg-blue-500" },
  { key: "pending", label: "Pending", color: "bg-amber-500" },
  { key: "in_progress", label: "In Progress", color: "bg-yellow-500" },
  { key: "resolved", label: "Resolved", color: "bg-emerald-500" },
  { key: "closed", label: "Closed", color: "bg-neutral-400" },
];

const STATUS_BADGE = {
  New: "bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-400",
  "In Progress": "bg-yellow-50 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-400",
  Resolved: "bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-400",
  Overdue: "bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-400",
};

const CATEGORY_COLORS = [
  "bg-black dark:bg-white",
  "bg-neutral-500",
  "bg-neutral-400",
  "bg-neutral-300",
];

const CustomerDashboard = ({ user }) => {
  const navigate = useNavigate();
  const { tickets, getTickets } = useTicket();
  const loading = useSelector((s) => s.ticket.loading);

  const firstName = (user?.fullName || user?.name || "there").split(/\s+/)[0];

  useEffect(() => {
    getTickets({ limit: 100 }).catch(() => {});
  }, [getTickets]);

  const { total, open, inProgress, resolved, byStatus, byCategory } =
    useMemo(() => {
      const byStatus = {};
      const byCategory = {};
      for (const t of tickets) {
        byStatus[t.status] = (byStatus[t.status] || 0) + 1;
        const cat = t.category || "general";
        byCategory[cat] = (byCategory[cat] || 0) + 1;
      }
      return {
        total: tickets.length,
        open: byStatus.open || 0,
        inProgress: (byStatus.in_progress || 0) + (byStatus.pending || 0),
        resolved: (byStatus.resolved || 0) + (byStatus.closed || 0),
        byStatus,
        byCategory,
      };
    }, [tickets]);

  const kpis = [
    {
      icon: "confirmation_number",
      label: "My Tickets",
      value: total.toLocaleString(),
      badge: "total",
      badgeType: "neutral",
    },
    {
      icon: "radio_button_checked",
      label: "Open",
      value: open.toLocaleString(),
      badge: "awaiting",
      badgeType: "neutral",
    },
    {
      icon: "pending",
      label: "In Progress",
      value: inProgress.toLocaleString(),
      badge: "active",
      badgeType: "neutral",
    },
    {
      icon: "check_circle",
      label: "Resolved",
      value: resolved.toLocaleString(),
      badge: "completed",
      badgeType: "success",
    },
  ];

  const showSkeleton = loading && tickets.length === 0;
  const recent = tickets.slice(0, 5);
  const categoryEntries = Object.entries(byCategory).sort((a, b) => b[1] - a[1]);

  return (
    <PageWrapper>
      <div className="bg-surface dark:bg-[#111] text-on-surface min-h-screen font-['Poppins']">
        <Sidebar />
        <div className="ml-64 min-h-screen flex flex-col">
          <TopBar />
          <main className="p-[32px] flex flex-col gap-[32px] flex-1">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="flex justify-between items-end"
            >
              <div>
                <h2 className="text-[32px] font-bold text-black dark:text-white tracking-tight">
                  Welcome back, {firstName}
                </h2>
                <p className="text-[14px] text-neutral-500 dark:text-neutral-400">
                  Here's an overview of your support requests.
                </p>
              </div>
              <button
                onClick={() => navigate("/dashboard/chat")}
                className="flex items-center gap-[8px] bg-black dark:bg-white text-white dark:text-black px-[20px] py-[10px] rounded-xl font-medium text-[13px] transition-transform active:scale-95 hover:opacity-90"
              >
                <span className="material-symbols-outlined text-[18px]">
                  chat_bubble_outline
                </span>
                Get Support
              </button>
            </motion.div>

            {/* KPIs */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.08, ease: "easeOut" }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[24px]"
            >
              {showSkeleton
                ? [...Array(4)].map((_, i) => <SkeletonCard key={i} />)
                : kpis.map((k) => <KpiCard key={k.label} {...k} />)}
            </motion.div>

            {/* Breakdown: status + category */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.16, ease: "easeOut" }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-[24px]"
            >
              {/* By status */}
              <div className="bg-white dark:bg-[#1a1a1a] border border-neutral-200 dark:border-neutral-700 rounded-xl p-[24px]">
                <h4 className="font-bold text-black dark:text-white mb-[20px]">
                  Tickets by Status
                </h4>
                {total === 0 ? (
                  <p className="text-[13px] text-neutral-400">No tickets yet.</p>
                ) : (
                  <div className="flex flex-col gap-[16px]">
                    {STATUS_ORDER.map((s) => {
                      const count = byStatus[s.key] || 0;
                      const pct = total ? Math.round((count / total) * 100) : 0;
                      return (
                        <div key={s.key}>
                          <div className="flex items-center justify-between mb-[6px]">
                            <span className="text-[13px] text-neutral-600 dark:text-neutral-300">
                              {s.label}
                            </span>
                            <span className="text-[13px] font-bold text-black dark:text-white">
                              {count}
                            </span>
                          </div>
                          <div className="h-2 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${s.color}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* By category */}
              <div className="bg-white dark:bg-[#1a1a1a] border border-neutral-200 dark:border-neutral-700 rounded-xl p-[24px]">
                <h4 className="font-bold text-black dark:text-white mb-[20px]">
                  Tickets by Category
                </h4>
                {categoryEntries.length === 0 ? (
                  <p className="text-[13px] text-neutral-400">No tickets yet.</p>
                ) : (
                  <div className="flex flex-col gap-[16px]">
                    {categoryEntries.map(([cat, count], i) => {
                      const pct = total ? Math.round((count / total) * 100) : 0;
                      return (
                        <div key={cat}>
                          <div className="flex items-center justify-between mb-[6px]">
                            <span className="text-[13px] text-neutral-600 dark:text-neutral-300 capitalize">
                              {cat}
                            </span>
                            <span className="text-[13px] font-bold text-black dark:text-white">
                              {count}
                            </span>
                          </div>
                          <div className="h-2 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                CATEGORY_COLORS[i % CATEGORY_COLORS.length]
                              }`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>

            {/* Recent tickets */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.24, ease: "easeOut" }}
              className="bg-white dark:bg-[#1a1a1a] border border-neutral-200 dark:border-neutral-700 rounded-xl overflow-hidden"
            >
              <div className="flex items-center justify-between px-[24px] py-[16px] border-b border-neutral-100 dark:border-neutral-800">
                <h4 className="font-bold text-black dark:text-white">
                  Recent Tickets
                </h4>
                <button
                  onClick={() => navigate("/dashboard/tickets")}
                  className="text-[12px] font-semibold text-neutral-500 hover:text-black dark:hover:text-white transition-colors"
                >
                  View all
                </button>
              </div>

              {recent.length === 0 ? (
                <div className="px-[24px] py-[48px] text-center">
                  <span className="material-symbols-outlined text-neutral-300 dark:text-neutral-700 text-[40px] block mb-[8px]">
                    confirmation_number
                  </span>
                  <p className="text-[14px] font-semibold text-neutral-500 dark:text-neutral-400">
                    No tickets yet
                  </p>
                  <p className="text-[12px] text-neutral-400 mt-[2px]">
                    Start a chat with support to create your first ticket.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-neutral-50 dark:divide-neutral-800">
                  {recent.map((t) => {
                    const label = ticketStatusLabel(t.status, t.slaBreached);
                    return (
                      <button
                        key={t._id}
                        onClick={() => navigate("/dashboard/tickets")}
                        className="w-full text-left flex items-center gap-[16px] px-[24px] py-[14px] hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
                      >
                        <span
                          className={`px-2 py-1 text-[10px] font-bold rounded uppercase shrink-0 ${
                            STATUS_BADGE[label] || STATUS_BADGE.New
                          }`}
                        >
                          {label}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-[14px] font-semibold text-black dark:text-white truncate">
                            {t.title}
                          </p>
                          <p className="text-[11px] text-neutral-400">
                            {shortId(t._id)} • {t.category || "general"} •{" "}
                            {ticketPriorityLabel(t.priority)} priority
                          </p>
                        </div>
                        <span className="text-[11px] text-neutral-400 shrink-0">
                          {formatRelative(t.createdAt)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </motion.div>
          </main>
        </div>
      </div>
    </PageWrapper>
  );
};

export default CustomerDashboard;
