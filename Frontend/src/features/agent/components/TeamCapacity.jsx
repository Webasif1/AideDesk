import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useTicket } from "../../ticket/hooks/useTicket";

const TeamCapacity = () => {
  const { getTicketStats } = useTicket();
  const agentStats = useSelector((s) => s.agent.stats);
  const ticketStats = useSelector((s) => s.ticket.stats);
  const activeWorkspaceId = useSelector((s) => s.company.activeWorkspaceId);
  const userWorkspaceId = useSelector((s) => s.auth.user?.workspaceId);
  const workspaceId = activeWorkspaceId || userWorkspaceId;

  useEffect(() => {
    getTicketStats().catch(() => {});
  }, [getTicketStats, workspaceId]);

  const total = agentStats?.total ?? 0;
  const active = agentStats?.active ?? 0;
  const bandwidth = total ? Math.round((active / total) * 100) : 0;
  const backlog = ticketStats
    ? (ticketStats.open || 0) + (ticketStats.pending || 0) + (ticketStats.inProgress || 0)
    : 0;

  return (
    <div className="mt-8">
      {/* Capacity panel */}
      <div className="bg-white dark:bg-[#1a1a1a] border border-neutral-200 dark:border-neutral-700 p-[24px] rounded-xl flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h4 className="text-[18px] font-semibold text-black dark:text-white">Team Capacity</h4>
          <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
            Live Updates
          </span>
        </div>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="font-medium text-black dark:text-white">Agents Online</span>
              <span className="text-neutral-500 dark:text-neutral-400">{bandwidth}%</span>
            </div>
            <div className="h-1.5 w-full bg-neutral-100 dark:bg-neutral-800 rounded-full">
              <div
                className="h-full bg-black dark:bg-white rounded-full transition-all"
                style={{ width: `${bandwidth}%` }}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-[16px] bg-neutral-50 dark:bg-neutral-800 rounded-xl border border-neutral-100 dark:border-neutral-700">
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">Online Now</p>
              <p className="text-[18px] font-bold text-black dark:text-white">
                {active} {active === 1 ? "Agent" : "Agents"}
              </p>
            </div>
            <div className="p-[16px] bg-neutral-50 dark:bg-neutral-800 rounded-xl border border-neutral-100 dark:border-neutral-700">
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">Current Backlog</p>
              <p className="text-[18px] font-bold text-black dark:text-white">
                {backlog} {backlog === 1 ? "Ticket" : "Tickets"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamCapacity;
