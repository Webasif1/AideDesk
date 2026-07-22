import { useEffect, useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import TicketRow from "./TicketRow";
import { SkeletonRow } from "../../../components/ui/Skeleton";
import { useTicket } from "../hooks/useTicket";
import {
  formatRelative,
  formatClock,
  ticketStatusLabel,
  ticketPriorityLabel,
  customerName,
  shortId,
} from "../../../lib/format";

const cap = (s = "") => (s ? s[0].toUpperCase() + s.slice(1) : "");
const LIMIT = 10;

const TicketTable = ({ activeTab = "All Tickets" }) => {
  const navigate = useNavigate();
  const { getTickets } = useTicket();
  const tickets = useSelector((s) => s.ticket.tickets);
  const loading = useSelector((s) => s.ticket.loading);
  const pagination = useSelector((s) => s.ticket.pagination);
  const role = useSelector((s) => s.auth.role);
  const activeWorkspaceId = useSelector((s) => s.company.activeWorkspaceId);
  const userWorkspaceId = useSelector((s) => s.auth.user?.workspaceId);
  const workspaceId = activeWorkspaceId || userWorkspaceId;

  const isCustomer = role === "customer";
  const [page, setPage] = useState(1);

  // Reset to first page when the workspace context changes.
  useEffect(() => {
    setPage(1);
  }, [workspaceId]);

  useEffect(() => {
    getTickets({ page, limit: LIMIT }).catch(() => {});
  }, [getTickets, page, workspaceId]);

  // Tab filters applied to the current page client-side.
  const filtered = useMemo(() => {
    let list = [...(tickets || [])];
    if (activeTab === "Unassigned") list = list.filter((t) => !t.assignedAgent);
    else if (activeTab === "SLA Warnings") list = list.filter((t) => t.slaBreached);
    else if (activeTab === "Open") list = list.filter((t) => t.status === "open");
    else if (activeTab === "Resolved")
      list = list.filter((t) => ["resolved", "closed"].includes(t.status));
    else if (activeTab === "Recently Updated")
      list = list.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    return list;
  }, [tickets, activeTab]);

  // Customer rows deep-link to the ticket's copilot chat.
  const openTicketChat = (t) => {
    if (!isCustomer) return;
    if (t.chat) navigate(`/dashboard/chat?chat=${t.chat}`);
    else navigate("/dashboard/chat");
  };

  const rows = filtered.map((t) => ({
    key: t._id,
    status: ticketStatusLabel(t.status, t.slaBreached),
    subject: t.title,
    ticketId: t.ticketNumber || shortId(t._id),
    category: cap(t.category),
    requester: customerName(t.customerId),
    company: t.customerId?.email || "—",
    priority: ticketPriorityLabel(t.priority),
    time: formatRelative(t.updatedAt || t.createdAt),
    created: formatClock(t.createdAt),
    timeColor: t.slaBreached ? "text-red-600 dark:text-red-400" : "text-neutral-900 dark:text-white",
    onClick: isCustomer ? () => openTicketChat(t) : undefined,
  }));

  // Requester column is meaningless for a customer (always themselves).
  const showRequester = !isCustomer;
  const headers = showRequester
    ? ["Status", "Subject", "Requester", "Priority", "Time", ""]
    : ["Status", "Subject", "Priority", "Time", ""];
  const colCount = headers.length;

  const total = pagination?.total ?? rows.length;
  const pages = pagination?.pages ?? 1;

  return (
    <div className="border border-neutral-200 dark:border-neutral-700 rounded-xl overflow-hidden bg-white dark:bg-[#1a1a1a]">
      <table className="w-full text-left">
        <thead>
          <tr className="bg-neutral-50 dark:bg-[#222] border-b border-neutral-200 dark:border-neutral-700">
            {headers.map((h, i) => (
              <th
                key={h || `col-${i}`}
                className="py-4 px-6 text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
          {loading && rows.length === 0 ? (
            [...Array(6)].map((_, i) => (
              <tr key={i}>
                <td colSpan={colCount} className="px-0 py-0">
                  <SkeletonRow />
                </td>
              </tr>
            ))
          ) : rows.length === 0 ? (
            <tr>
              <td colSpan={colCount} className="px-6 py-16 text-center">
                <span className="material-symbols-outlined text-[40px] text-neutral-300 dark:text-neutral-700 block mb-2">
                  confirmation_number
                </span>
                <p className="text-[14px] font-semibold text-neutral-600 dark:text-neutral-300">
                  No tickets to show
                </p>
                <p className="text-[12px] text-neutral-400 mt-1">
                  {activeTab === "All Tickets"
                    ? "Create a ticket to get started."
                    : `No tickets match "${activeTab}".`}
                </p>
              </td>
            </tr>
          ) : (
            rows.map((t) => (
              <TicketRow key={t.key} {...t} showRequester={showRequester} />
            ))
          )}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="bg-neutral-50 dark:bg-[#111] px-6 py-4 border-t border-neutral-200 dark:border-neutral-700 flex items-center justify-between">
        <span className="text-[11px] text-neutral-500 dark:text-neutral-400 font-medium">
          {total === 0
            ? "No tickets"
            : `Page ${pagination?.page ?? page} of ${pages} • ${total.toLocaleString()} tickets`}
        </span>
        <div className="flex gap-2">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="px-3 py-1 border border-neutral-200 dark:border-neutral-700 rounded text-[11px] bg-white dark:bg-[#1a1a1a] text-black dark:text-white font-semibold hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <button
            disabled={page >= pages}
            onClick={() => setPage((p) => Math.min(pages, p + 1))}
            className="px-3 py-1 border border-neutral-200 dark:border-neutral-700 rounded text-[11px] bg-white dark:bg-[#1a1a1a] text-black dark:text-white font-semibold hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default TicketTable;
