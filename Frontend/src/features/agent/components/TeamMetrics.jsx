import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useAgent } from "../hooks/useAgent";

const TeamMetrics = () => {
  const { getAgentStats, resetAgentStats } = useAgent();
  const stats = useSelector((s) => s.agent.stats);
  const role = useSelector((s) => s.auth.role);
  const activeWorkspaceId = useSelector((s) => s.company.activeWorkspaceId);
  const userWorkspaceId = useSelector((s) => s.auth.user?.workspaceId);
  const workspaceId = activeWorkspaceId || userWorkspaceId;

  useEffect(() => {
    if ((role === "admin" || role === "agent") && workspaceId) {
      // Clear stats left over from a previous workspace before refetching,
      // so a stale nonzero count can't linger alongside a fresh empty list.
      resetAgentStats();
      getAgentStats().catch(() => {});
    }
  }, [getAgentStats, resetAgentStats, role, workspaceId]);

  const metrics = [
    {
      label: "Total Agents",
      value: stats ? `${stats.total}` : "—",
      sub: (
        <span className="text-xs text-neutral-400 font-medium pb-1">in workspace</span>
      ),
    },
    {
      label: "Active Now",
      value: stats ? `${stats.active}` : "—",
      sub: <span className="w-2 h-2 rounded-full bg-green-500 mb-1" />,
    },
    {
      label: "Avg Performance",
      value: stats?.avgCsat != null ? `${stats.avgCsat}%` : "—",
      sub: (
        <span className="text-xs text-neutral-400 font-medium pb-1">CSAT score</span>
      ),
    },
    {
      label: "Pending Invites",
      value: stats ? `${stats.pendingInvites}` : "—",
      sub: (
        <span className="text-xs text-neutral-400 font-medium pb-1">unverified</span>
      ),
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-[24px] mb-8">
      {metrics.map((m) => (
        <div
          key={m.label}
          className="bg-white dark:bg-[#1a1a1a] border border-neutral-200 dark:border-neutral-700 p-[24px] rounded-xl"
        >
          <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-500 dark:text-neutral-400 mb-1">
            {m.label}
          </p>
          <div className="flex items-end gap-2">
            <span className="text-[24px] font-bold text-black dark:text-white">{m.value}</span>
            {m.sub}
          </div>
        </div>
      ))}
    </div>
  );
};

export default TeamMetrics;
