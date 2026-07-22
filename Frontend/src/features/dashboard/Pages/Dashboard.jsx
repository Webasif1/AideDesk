import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";
import KpiCard from "../components/KpiCard";
import TicketVolumeChart from "../components/TicketVolumeChart";
import CsatBreakdown from "../components/CsatBreakdown";
import RecentTicketsTable from "../components/RecentTicketsTable";
import QuickActions from "../components/QuickActions";
import CustomerDashboard from "../components/CustomerDashboard";
import GenerateReportModal from "../components/GenerateReportModal";
import PageWrapper from "../../../App/Components/ui/PageWrapper";
import { SkeletonCard } from "../../../components/ui/Skeleton";
import { useEffect, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
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

const buildAgentKpis = (ticketStats) => [
  {
    icon: "confirmation_number",
    label: "My Tickets",
    value: (ticketStats?.total ?? 0).toLocaleString(),
    badge: ticketStats?.newThisWeek ? `+${ticketStats.newThisWeek} this wk` : "assigned to me",
    badgeType: ticketStats?.newThisWeek ? "success" : "neutral",
  },
  {
    icon: "radio_button_checked",
    label: "Open",
    value: (ticketStats?.open ?? 0).toLocaleString(),
    badge: "need attention",
    badgeType: "neutral",
  },
  {
    icon: "pending",
    label: "In Progress",
    value: (ticketStats?.inProgress ?? 0).toLocaleString(),
    badge: "active",
    badgeType: "neutral",
  },
  {
    icon: "check_circle",
    label: "Resolved",
    value: ((ticketStats?.resolved ?? 0) + (ticketStats?.closed ?? 0)).toLocaleString(),
    badge: "completed",
    badgeType: "success",
  },
];

// ─── Agent Dashboard ────────────────────────────────────────────────────────
const AgentDashboard = ({ ticketStats, ticketLoading, loadStats, user }) => {
  const navigate = useNavigate();
  const agentName = user?.name || user?.fullName || "there";
  const agentKpis = buildAgentKpis(ticketStats);
  const showSkeleton = !ticketStats && ticketLoading;
  const avgResponse = formatMinutes(ticketStats?.avgFirstResponseMins ?? null);

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
                  My Dashboard
                </h2>
                <p className="text-[14px] text-neutral-500 dark:text-neutral-400">
                  Welcome back, {agentName}. Here's your workload today.
                </p>
              </div>
              <button
                onClick={loadStats}
                title="Refresh"
                className="flex items-center gap-[8px] bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-black dark:text-white px-[16px] py-[10px] rounded-xl font-medium text-[13px] transition-all active:scale-95 hover:bg-neutral-50 dark:hover:bg-neutral-800"
              >
                <span className="material-symbols-outlined text-[18px]">refresh</span>
                Refresh
              </button>
            </motion.div>

            {/* Agent KPIs */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.08, ease: "easeOut" }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[24px]"
            >
              {showSkeleton
                ? [...Array(4)].map((_, i) => <SkeletonCard key={i} />)
                : agentKpis.map((k) => <KpiCard key={k.label} {...k} />)}
            </motion.div>

            {/* My Assigned Tickets – full width */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.16, ease: "easeOut" }}
            >
              <RecentTicketsTable />
            </motion.div>

            {/* Agent quick links + performance snapshot */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.24, ease: "easeOut" }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-[24px]"
            >
              {/* Quick links – spans 2 cols */}
              <div className="lg:col-span-2 bg-white dark:bg-[#1a1a1a] border border-neutral-200 dark:border-neutral-700 rounded-xl p-[24px]">
                <h4 className="font-bold text-black dark:text-white mb-[20px]">Quick Links</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-[12px]">
                  <button
                    onClick={() => navigate("/dashboard/tickets")}
                    className="flex items-center gap-[14px] p-[16px] bg-neutral-50 dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-xl border border-neutral-100 dark:border-neutral-700 transition-all active:scale-[0.98] group text-left"
                  >
                    <div className="w-10 h-10 bg-black dark:bg-white rounded-lg flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-white dark:text-black text-[20px]">confirmation_number</span>
                    </div>
                    <div>
                      <p className="text-[13px] font-semibold text-black dark:text-white">My Tickets</p>
                      <p className="text-[11px] text-neutral-500 dark:text-neutral-400">View all assigned tickets</p>
                    </div>
                  </button>
                  <button
                    onClick={() => navigate("/dashboard/chat")}
                    className="flex items-center gap-[14px] p-[16px] bg-neutral-50 dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-xl border border-neutral-100 dark:border-neutral-700 transition-all active:scale-[0.98] group text-left"
                  >
                    <div className="w-10 h-10 bg-black dark:bg-white rounded-lg flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-white dark:text-black text-[20px]">chat_bubble_outline</span>
                    </div>
                    <div>
                      <p className="text-[13px] font-semibold text-black dark:text-white">Live Chat</p>
                      <p className="text-[11px] text-neutral-500 dark:text-neutral-400">Open customer conversations</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Performance snapshot – 1 col */}
              <div className="bg-white dark:bg-[#1a1a1a] border border-neutral-200 dark:border-neutral-700 rounded-xl p-[24px] flex flex-col gap-[20px]">
                <h4 className="font-bold text-black dark:text-white">My Performance</h4>
                <div className="flex flex-col gap-[16px]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-[10px]">
                      <span className="material-symbols-outlined text-[18px] text-neutral-400 dark:text-neutral-500">timer</span>
                      <span className="text-[13px] text-neutral-600 dark:text-neutral-300">Avg Response</span>
                    </div>
                    <span className="text-[13px] font-bold text-black dark:text-white">
                      {ticketStats ? avgResponse : "—"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-[10px]">
                      <span className="material-symbols-outlined text-[18px] text-neutral-400 dark:text-neutral-500">percent</span>
                      <span className="text-[13px] text-neutral-600 dark:text-neutral-300">Resolution Rate</span>
                    </div>
                    <span className="text-[13px] font-bold text-black dark:text-white">
                      {ticketStats ? `${ticketStats.resolutionRate ?? 0}%` : "—"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-[10px]">
                      <span className="material-symbols-outlined text-[18px] text-neutral-400 dark:text-neutral-500">warning</span>
                      <span className="text-[13px] text-neutral-600 dark:text-neutral-300">Urgent Open</span>
                    </div>
                    <span className={`text-[13px] font-bold ${(ticketStats?.urgent ?? 0) > 0 ? "text-red-500" : "text-black dark:text-white"}`}>
                      {ticketStats ? (ticketStats.urgent ?? 0) : "—"}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </main>
        </div>
      </div>
    </PageWrapper>
  );
};

// ─── Admin Dashboard ─────────────────────────────────────────────────────────
const Dashboard = () => {
  const [showReport, setShowReport] = useState(false);
  const role = useSelector((s) => s.auth.role);
  const user = useSelector((s) => s.auth.user);

  const { stats: ticketStats, getTicketStats } = useTicket();
  const { stats: agentStats, getAgentStats } = useAgent();
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
    loadStats();
  }, [loadStats, workspaceId]);

  // ── Customer layout (mini dashboard) ─────────────────────────────────────────
  if (isCustomer) {
    return <CustomerDashboard user={user} />;
  }

  // ── Agent layout ───────────────────────────────────────────────────────────
  if (isAgent) {
    return (
      <AgentDashboard
        ticketStats={ticketStats}
        ticketLoading={ticketLoading}
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
