import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useTicket } from "../../ticket/hooks/useTicket";
import { formatRelative, initialsOf, shortId } from "../../../lib/format";
import { SkeletonRow } from "../../../components/ui/Skeleton";

const statusStyle = {
  New: "bg-black dark:bg-white text-white dark:text-black",
  "In Progress": "bg-neutral-200 dark:bg-neutral-700 text-black dark:text-white",
  Resolved: "border border-neutral-200 dark:border-neutral-700 text-neutral-400 dark:text-neutral-500",
};

// Recent-table only has three visual buckets.
const toStatus = (status) => {
  if (["resolved", "closed"].includes(status)) return "Resolved";
  if (["in_progress", "pending"].includes(status)) return "In Progress";
  return "New";
};

const RecentTicketsTable = () => {
  const { getTickets } = useTicket();
  const tickets = useSelector((s) => s.ticket.tickets);
  const loading = useSelector((s) => s.ticket.loading);
  const activeWorkspaceId = useSelector((s) => s.company.activeWorkspaceId);
  const userWorkspaceId = useSelector((s) => s.auth.user?.workspaceId);
  const workspaceId = activeWorkspaceId || userWorkspaceId;

  useEffect(() => {
    getTickets({ limit: 5 }).catch(() => {});
  }, [getTickets, workspaceId]);

  const rows = (tickets || []).slice(0, 5).map((t) => {
    const ai = !t.assignedAgent;
    const agentName = ai ? "AideBot" : t.assignedAgent?.name || "Agent";
    return {
      key: t._id,
      agent: agentName,
      initials: ai ? "AI" : initialsOf(agentName),
      id: t.ticketNumber || shortId(t._id, "#"),
      subject: t.title,
      status: toStatus(t.status),
      time: formatRelative(t.updatedAt || t.createdAt),
      ai,
    };
  });

  return (
    <div className="lg:col-span-3 bg-white dark:bg-[#1a1a1a] border border-neutral-200 dark:border-neutral-700 rounded-xl overflow-hidden">
      <div className="p-[24px] border-b border-neutral-100 dark:border-neutral-800 flex justify-between items-center">
        <h4 className="font-bold text-black dark:text-white">Recent Ticket Updates</h4>
        <button className="text-[12px] font-semibold text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white transition-colors">
          View All
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-neutral-50 dark:bg-neutral-800 text-[11px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
            <tr>
              <th className="px-[24px] py-[16px]">Agent</th>
              <th className="px-[24px] py-[16px]">Ticket ID</th>
              <th className="px-[24px] py-[16px]">Subject</th>
              <th className="px-[24px] py-[16px]">Status</th>
              <th className="px-[24px] py-[16px]">Timestamp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {loading && rows.length === 0 ? (
              [...Array(5)].map((_, i) => (
                <tr key={i}>
                  <td colSpan={5} className="px-0 py-0">
                    <SkeletonRow />
                  </td>
                </tr>
              ))
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-[24px] py-[48px] text-center">
                  <span className="material-symbols-outlined text-[36px] text-neutral-300 dark:text-neutral-700 block mb-2">
                    inbox
                  </span>
                  <p className="text-[13px] font-semibold text-neutral-600 dark:text-neutral-300">
                    No tickets yet
                  </p>
                  <p className="text-[12px] text-neutral-400 mt-1">
                    New tickets will appear here.
                  </p>
                </td>
              </tr>
            ) : (
              rows.map((t) => (
                <tr
                  key={t.key}
                  className="hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                >
                  <td className="px-[24px] py-[16px]">
                    <div className="flex items-center gap-[12px]">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold border ${t.ai ? "bg-black dark:bg-white text-white dark:text-black border-black dark:border-white" : "bg-neutral-100 dark:bg-neutral-800 text-black dark:text-white border-neutral-200 dark:border-neutral-700"}`}
                      >
                        {t.initials}
                      </div>
                      <span className="text-[13px] font-medium text-black dark:text-white">
                        {t.agent}
                      </span>
                    </div>
                  </td>
                  <td className="px-[24px] py-[16px] text-[11px] font-mono font-bold text-neutral-400 dark:text-neutral-500">
                    {t.id}
                  </td>
                  <td className="px-[24px] py-[16px] text-[13px] text-black dark:text-white">
                    {t.subject}
                  </td>
                  <td className="px-[24px] py-[16px]">
                    <span
                      className={`px-[8px] py-[4px] text-[10px] font-bold rounded-lg ${statusStyle[t.status]}`}
                    >
                      {t.status}
                    </span>
                  </td>
                  <td className="px-[24px] py-[16px] text-[11px] text-neutral-500 dark:text-neutral-400">
                    {t.time}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentTicketsTable;
