import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";
import KpiCard from "../components/KpiCard";
import TicketVolumeChart from "../components/TicketVolumeChart";
import CsatBreakdown from "../components/CsatBreakdown";
import RecentTicketsTable from "../components/RecentTicketsTable";
import QuickActions from "../components/QuickActions";
import CustomerDashboard from "../components/CustomerDashboard";
import AgentHome from "../components/AgentHome";
import GenerateReportModal from "../components/GenerateReportModal";
import PageWrapper from "../../../App/Components/ui/PageWrapper";
import { SkeletonCard } from "../../../components/ui/Skeleton";
import Button from "../../../components/ui/Button";
import { useEffect, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import { useTicket } from "../../ticket/hooks/useTicket";
import { useAgent } from "../../agent/hooks/useAgent";
import { formatMinutes } from "../../../lib/format";

const buildAdminKpis = (ticketStats, agentStats) => [
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

// ─── Agent Dashboard ────────────────────────────────────────────────────────
// Agents get a queue-first home: what needs them now, their tickets ranked by
// urgency, and their own numbers. See components/AgentHome.
const AgentDashboard = ({ ticketStats, loadStats, user }) => (
  <PageWrapper>
    <div className="bg-surface dark:bg-[#051f20] text-on-surface min-h-screen font-sans">
      <Sidebar />
      <div className="ml-64 min-h-screen flex flex-col">
        <TopBar />
        <AgentHome ticketStats={ticketStats} loadStats={loadStats} user={user} />
      </div>
    </div>
  </PageWrapper>
);

// ─── Admin Dashboard ─────────────────────────────────────────────────────────
const Dashboard = () => {
  const [showReport, setShowReport] = useState(false);
  const role = useSelector((s) => s.auth.role);
  const user = useSelector((s) => s.auth.user);

  const { stats: ticketStats, getTicketStats } = useTicket();
  const { stats: agentStats, getAgentStats, resetAgentStats } = useAgent();
  const ticketLoading = useSelector((s) => s.ticket.loading);
  const agentLoading = useSelector((s) => s.agent.loading);
  const activeWorkspaceId = useSelector((s) => s.company.activeWorkspaceId);
  const userWorkspaceId = useSelector((s) => s.auth.user?.workspaceId);
  const workspaceId = activeWorkspaceId || userWorkspaceId;

  const isAgent = role === "agent";
  const isCustomer = role === "customer";

  const loadStats = useCallback(() => {
    // Customers don't have access to the admin/agent stats endpoints.
    if (isCustomer) return;
    getTicketStats().catch(() => {});
    if (!isAgent) getAgentStats().catch(() => {});
  }, [getTicketStats, getAgentStats, isAgent, isCustomer]);

  useEffect(() => {
    // Clear any stats left over from the previous workspace so a stale
    // nonzero count can't sit alongside a freshly (and correctly) empty list.
    if (!isAgent && !isCustomer) resetAgentStats();
    loadStats();
  }, [loadStats, workspaceId, isAgent, isCustomer, resetAgentStats]);

  // ── Customer layout (mini dashboard) ─────────────────────────────────────────
  if (isCustomer) {
    return <CustomerDashboard user={user} />;
  }

  // ── Agent layout ───────────────────────────────────────────────────────────
  if (isAgent) {
    return (
      <AgentDashboard
        ticketStats={ticketStats}
        loadStats={loadStats}
        user={user}
      />
    );
  }

  // ── Admin layout ───────────────────────────────────────────────────────────
  const statsReady = ticketStats && agentStats;
  const adminKpis = buildAdminKpis(ticketStats, agentStats);
  const showSkeleton = !statsReady && (ticketLoading || agentLoading || !statsReady);

  return (
    <PageWrapper>
      <div className="bg-surface dark:bg-[#051f20] text-on-surface min-h-screen font-sans">
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
                <Button variant="secondary" icon="refresh" onClick={loadStats}>
                  Refresh
                </Button>
                <Button icon="add" onClick={() => setShowReport(true)}>
                  Create Report
                </Button>
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
                : adminKpis.map((k) => <KpiCard key={k.label} {...k} />)}
            </motion.div>

            {/* Recent ticket updates + CSAT */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.16, ease: "easeOut" }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-[24px]"
            >
              <RecentTicketsTable />
              <CsatBreakdown />
            </motion.div>

            {/* Ticket volume + Quick actions */}
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
