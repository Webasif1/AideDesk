import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";
import CustomerDashboard from "../components/CustomerDashboard";
import AgentHome from "../components/AgentHome";
import AdminHome from "../components/AdminHome";
import GenerateReportModal from "../components/GenerateReportModal";
import PageWrapper from "../../../App/Components/ui/PageWrapper";
import { useEffect, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { useTicket } from "../../ticket/hooks/useTicket";
import { useAgent } from "../../agent/hooks/useAgent";

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
  return (
    <PageWrapper>
      <div className="bg-surface dark:bg-[#051f20] text-on-surface min-h-screen font-sans">
        <Sidebar />
        <div className="ml-64 min-h-screen flex flex-col">
          <TopBar />
          <AdminHome
            ticketStats={ticketStats}
            agentStats={agentStats}
            statsLoading={ticketLoading || agentLoading}
            loadStats={loadStats}
            onCreateReport={() => setShowReport(true)}
            user={user}
          />
        </div>
        {showReport && <GenerateReportModal onClose={() => setShowReport(false)} />}
      </div>
    </PageWrapper>
  );
};

export default Dashboard;
