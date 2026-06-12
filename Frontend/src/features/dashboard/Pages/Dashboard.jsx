import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";
import KpiCard from "../components/KpiCard";
import TicketVolumeChart from "../components/TicketVolumeChart";
import CsatBreakdown from "../components/CsatBreakdown";
import RecentTicketsTable from "../components/RecentTicketsTable";
import QuickActions from "../components/QuickActions";
import GenerateReportModal from "../components/GenerateReportModal";
import PageWrapper from "../../../App/Components/ui/PageWrapper";
import { SkeletonCard } from "../../../components/ui/Skeleton";
import { useEffect, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import { useTicket } from "../../ticket/hooks/useTicket";
import { useAgent } from "../../agent/hooks/useAgent";
import { formatMinutes } from "../../../lib/format";

const buildKpis = (ticketStats, agentStats) => [
  {
    icon: "confirmation_number",
    label: "Total Tickets",
    value: (ticketStats?.total ?? 0).toLocaleString(),
    badge: ticketStats?.newThisWeek ? `+${ticketStats.newThisWeek} this wk` : "—",
    badgeType: ticketStats?.newThisWeek ? "success" : "neutral",
  },
  {
    icon: "psychology",
    label: "AI Resolution Rate",
    value: ticketStats ? `${ticketStats.aiResolutionRate}%` : "—",
    badge: ticketStats ? `${ticketStats.aiResolved} resolved` : "—",
    badgeType: "success",
  },
  {
    icon: "timer",
    label: "Avg. Response Time",
    value: formatMinutes(ticketStats?.avgFirstResponseMins ?? null),
    badge: "first reply",
    badgeType: "neutral",
  },
  {
    icon: "support_agent",
    label: "Active Agents",
    value: `${agentStats?.active ?? 0}/${agentStats?.total ?? 0}`,
    badge: "Live",
    badgeType: "neutral",
  },
];

const Dashboard = () => {
  const [showReport, setShowReport] = useState(false);

  const { stats: ticketStats, getTicketStats } = useTicket();
  const { stats: agentStats, getAgentStats } = useAgent();
  const ticketLoading = useSelector((s) => s.ticket.loading);
  const agentLoading = useSelector((s) => s.agent.loading);
  const activeWorkspaceId = useSelector((s) => s.company.activeWorkspaceId);
  const userWorkspaceId = useSelector((s) => s.auth.user?.workspaceId);
  const workspaceId = activeWorkspaceId || userWorkspaceId;

  const loadStats = useCallback(() => {
    getTicketStats().catch(() => {});
    getAgentStats().catch(() => {});
  }, [getTicketStats, getAgentStats]);

  // Fetch on mount + whenever the active workspace changes.
  useEffect(() => {
    loadStats();
  }, [loadStats, workspaceId]);

  const statsReady = ticketStats && agentStats;
  const kpis = buildKpis(ticketStats, agentStats);
  const showSkeleton = !statsReady && (ticketLoading || agentLoading || !statsReady);

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
                  Dashboard
                </h2>
                <p className="text-[14px] text-neutral-500 dark:text-neutral-400">
                  Welcome back, here's what's happening today.
                </p>
              </div>
              <div className="flex items-center gap-[12px]">
                <button
                  onClick={loadStats}
                  title="Refresh"
                  className="flex items-center gap-[8px] bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-black dark:text-white px-[16px] py-[10px] rounded-xl font-medium text-[13px] transition-all active:scale-95 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                >
                  <span className="material-symbols-outlined text-[18px]">refresh</span>
                  Refresh
                </button>
                <button
                  onClick={() => setShowReport(true)}
                  className="flex items-center gap-[8px] bg-black dark:bg-white text-white dark:text-black px-[20px] py-[10px] rounded-xl font-medium text-[13px] transition-transform active:scale-95 hover:opacity-90"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    add
                  </span>
                  Create Report
                </button>
              </div>
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

            {/* Recent ticket updates (moved up) + CSAT (coming soon) */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.16, ease: "easeOut" }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-[24px]"
            >
              <RecentTicketsTable />
              <CsatBreakdown />
            </motion.div>

            {/* Ticket volume (coming soon, moved down) + Quick actions */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.24, ease: "easeOut" }}
              className="grid grid-cols-1 lg:grid-cols-4 gap-[24px]"
            >
              <TicketVolumeChart />
              <QuickActions />
            </motion.div>
          </main>
        </div>

        {showReport && (
          <GenerateReportModal onClose={() => setShowReport(false)} />
        )}
      </div>
    </PageWrapper>
  );
};

export default Dashboard;
