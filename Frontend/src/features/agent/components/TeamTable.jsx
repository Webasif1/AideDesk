import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import TeamFilter from "./TeamFilter";
import TeamRow from "./TeamRow";
import { SkeletonRow } from "../../../components/ui/Skeleton";
import ConfirmActionModal from "../../../components/ui/ConfirmActionModal";
import { toast } from "../../../components/ui/toast";
import { formatRelative } from "../../../lib/format";
import { useAgent } from "../hooks/useAgent";

// The three admin actions, each rendered through the same confirm modal the
// Customers page uses.
const ACTION_COPY = {
  suspend: {
    title: "Suspend this agent?",
    description:
      "They lose the ability to act on tickets immediately, and any live tickets they are holding are handed to other active agents. Their history is kept.",
    confirmLabel: "Suspend agent",
    tone: "warning",
    accountStatus: "suspended",
    success: "Agent suspended",
  },
  restore: {
    title: "Restore this agent?",
    description:
      "They can work tickets again straight away. Tickets that were handed to other agents while they were away stay where they are.",
    confirmLabel: "Restore agent",
    tone: "neutral",
    accountStatus: "active",
    success: "Agent restored",
  },
  remove: {
    title: "Remove this agent?",
    description:
      "They lose access permanently and their live tickets are handed to other active agents. Tickets they already handled keep their name for reporting.",
    confirmLabel: "Remove agent",
    tone: "danger",
    accountStatus: "deleted",
    success: "Agent removed",
  },
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
  const { getAgents, getAgentStats, updateAgentAccountStatus } = useAgent();

  // { action: 'suspend'|'restore'|'remove', agent }
  const [pending, setPending] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState("");

  useEffect(() => {
    if (role === "admin" && workspaceId) {
      getAgents().catch(() => {});
    }
  }, [getAgents, role, workspaceId]);

  const normalized = (agents || []).map((a) => {
    const isSuspended = a.accountStatus === "suspended";
    const isPending = a.isVerified === false;
    return {
      raw: a,
      name: a.name || a.fullName || "",
      agentId: a._id ? `#${String(a._id).slice(-6).toUpperCase()}` : "",
      email: a.email,
      role: a.role || "Agent",
      // Account state outranks presence — a suspended agent showing as "Online"
      // would read as though they were still working tickets.
      status: isSuspended
        ? "Suspended"
        : isPending
          ? "Pending"
          : a.status
            ? a.status[0].toUpperCase() + a.status.slice(1)
            : "Offline",
      assigned:
        typeof a.assignedTickets === "number" ? `${a.assignedTickets} Tickets` : "—",
      lastActive: formatRelative(a.lastLogin || a.updatedAt),
      pending: isPending,
      suspended: isSuspended,
    };
  });

  const filtered = normalized.filter((a) => {
    const matchStatus =
      filter === "All Agents" ||
      (filter === "Pending" && a.pending) ||
      (filter === "Suspended" && a.suspended) ||
      (!a.pending && !a.suspended && a.status === filter);
    const matchSearch =
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      (a.email || "").toLowerCase().includes(search.toLowerCase()) ||
      (a.agentId || "").toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const copy = pending ? ACTION_COPY[pending.action] : null;

  const runAction = async (reason) => {
    if (!pending || !copy) return;
    setSubmitting(true);
    setModalError("");
    try {
      const res = await updateAgentAccountStatus({
        id: pending.agent._id,
        accountStatus: copy.accountStatus,
        reason,
      });

      // Tell the admin where the agent's open work actually went.
      const { reassigned = 0, unassigned = 0 } = res?.reassignment || {};
      const handoff =
        reassigned || unassigned
          ? ` ${reassigned} ticket${reassigned === 1 ? "" : "s"} reassigned${
              unassigned ? `, ${unassigned} left unassigned` : ""
            }.`
          : "";
      toast(`${copy.success}.${handoff}`, { type: "success" });

      setPending(null);
      getAgents().catch(() => {});
      getAgentStats().catch(() => {});
    } catch (err) {
      setModalError(
        err?.response?.data?.message || err?.message || "That didn't work. Try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

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
              filtered.map((a) => (
                <TeamRow
                  key={a.raw._id}
                  {...a}
                  onSuspend={() => setPending({ action: "suspend", agent: a.raw })}
                  onRestore={() => setPending({ action: "restore", agent: a.raw })}
                  onRemove={() => setPending({ action: "remove", agent: a.raw })}
                  onResendInvite={() => toast.comingSoon("Resending invites")}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {filtered.length > 0 && (
        <div className="flex items-center justify-between p-[16px] bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800">
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Showing {filtered.length} of {normalized.length} agents
          </p>
        </div>
      )}

      <ConfirmActionModal
        open={Boolean(pending)}
        title={copy?.title}
        description={copy?.description}
        entityName={pending ? `${pending.agent.name} · ${pending.agent.email}` : ""}
        confirmLabel={copy?.confirmLabel}
        tone={copy?.tone}
        loading={submitting}
        error={modalError}
        onCancel={() => {
          setPending(null);
          setModalError("");
        }}
        onConfirm={runAction}
      />
    </div>
  );
};

export default TeamTable;
