import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import TeamFilter from "./TeamFilter";
import TeamRow from "./TeamRow";
import { SkeletonRow } from "../../../components/ui/Skeleton";
import { useAgent } from "../hooks/useAgent";

const formatRelative = (date) => {
  if (!date) return "—";
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
};

const TeamTable = () => {
  const [filter, setFilter] = useState("All Agents");
  const [search, setSearch] = useState("");
  const loading = useSelector((s) => s.agent.loading);
  const agents = useSelector((s) => s.agent.agents);
  const role = useSelector((s) => s.auth.role);
  const activeWorkspaceId = useSelector((s) => s.company.activeWorkspaceId);
  const userWorkspaceId = useSelector((s) => s.auth.user?.workspaceId);
  const workspaceId = activeWorkspaceId || userWorkspaceId;
  const { getAgents } = useAgent();

  useEffect(() => {
    if (role === "admin" && workspaceId) {
      getAgents().catch(() => {});
    }
  }, [getAgents, role, workspaceId]);

  const normalized = (agents || []).map((a) => ({
    name: a.name || a.fullName || "",
    agentId: a._id ? `#${String(a._id).slice(-6).toUpperCase()}` : "",
    email: a.email,
    role: a.role || "Agent",
    status: a.isVerified === false ? "Pending" : (a.status ? a.status[0].toUpperCase() + a.status.slice(1) : "Offline"),
    assigned: typeof a.assignedTickets === "number" ? `${a.assignedTickets} Tickets` : "—",
    lastActive: formatRelative(a.lastLogin || a.updatedAt),
    pending: a.isVerified === false,
  }));

  const filtered = normalized.filter((a) => {
    const matchStatus =
      filter === "All Agents" ||
      (filter === "Pending" && a.pending) ||
      (!a.pending && a.status === filter);
    const matchSearch =
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      (a.email || "").toLowerCase().includes(search.toLowerCase()) ||
      (a.agentId || "").toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <div className="bg-white dark:bg-[#1a1a1a] border border-neutral-200 dark:border-neutral-700 rounded-xl overflow-hidden">
      <TeamFilter
        active={filter}
        onChange={setFilter}
        search={search}
        onSearch={setSearch}
      />

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-neutral-50 dark:bg-neutral-950">
              {[
                "Agent",
                "Role",
                "Status",
                "Assigned",
                "Last Active",
                "Actions",
              ].map((h) => (
                <th
                  key={h}
                  className={`px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 ${h === "Actions" ? "text-right" : ""}`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i}>
                  <td colSpan={6} className="px-0 py-0">
                    <SkeletonRow />
                  </td>
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center">
                  <span className="material-symbols-outlined text-[36px] text-neutral-300 dark:text-neutral-700 block mb-2">
                    group_off
                  </span>
                  <p className="text-[13px] font-semibold text-neutral-600 dark:text-neutral-300">
                    No agents in this workspace yet
                  </p>
                  <p className="text-[12px] text-neutral-400 mt-1">
                    Add an agent to get started.
                  </p>
                </td>
              </tr>
            ) : (
              filtered.map((a, i) => <TeamRow key={i} {...a} />)
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {filtered.length > 0 && (
        <div className="flex items-center justify-between p-[16px] bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800">
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Showing 1 to {filtered.length} of {normalized.length} agents
          </p>
        </div>
      )}
    </div>
  );
};

export default TeamTable;
