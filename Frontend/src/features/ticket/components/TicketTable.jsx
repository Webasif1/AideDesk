import { useEffect, useState, useMemo, useCallback } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import TicketRow from "./TicketRow";
import { SkeletonRow } from "../../../components/ui/Skeleton";
import { toast } from "../../../components/ui/toast";
import { useTicket } from "../hooks/useTicket";
import { useAgent } from "../../agent/hooks/useAgent";
import {
  formatRelative,
  ticketStatusLabel,
  ticketPriorityLabel,
  customerName,
  shortId,
} from "../../../lib/format";

const cap = (s = "") => (s ? s[0].toUpperCase() + s.slice(1) : "");
const LIMIT = 10;

const PRIORITIES = ["urgent", "high", "medium", "low"];
const CATEGORIES = ["billing", "technical", "account", "general"];
// Targets the status endpoint accepts from at least one state. A move the
// backend refuses for a given ticket (e.g. closed → resolved) is reported back
// per ticket rather than hidden.
const BULK_STATUS = [
  ["in_progress", "In progress"],
  ["resolved", "Resolved"],
  ["closed", "Closed"],
  ["open", "Reopen"],
];

// Column templates. Staff get the checkbox and assignee; customers see only
// what means something to them.
const STAFF_COLS = "grid-cols-[16px_76px_minmax(0,1fr)_128px_86px_150px_92px_72px]";
const CUSTOMER_COLS = "grid-cols-[76px_minmax(0,1fr)_128px_86px_92px_72px]";

const FilterSelect = ({ label, value, onChange, options, active }) => (
  <label
    className={`h-[38px] pl-3 pr-2 rounded-[10px] border flex items-center gap-1.5 text-[13px] text-on-surface ${
      active
        ? "border-neutral-300 dark:border-neutral-600 bg-neutral-100 dark:bg-neutral-800"
        : "border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#0b2b26]"
    }`}
  >
    <span className="text-neutral-500">{label}</span>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="bg-transparent font-semibold focus:outline-none cursor-pointer max-w-[150px]"
    >
      {options.map(([v, l]) => (
        <option key={v} value={v}>
          {l}
        </option>
      ))}
    </select>
  </label>
);

const pageList = (page, pages) => {
  const start = Math.max(1, Math.min(page - 2, pages - 4));
  return Array.from({ length: Math.min(5, pages) }, (_, i) => start + i);
};

const TicketTable = ({ view, onTotal, onChanged }) => {
  const navigate = useNavigate();
  const { getTickets, updateTicketStatus, assignAgent } = useTicket();
  const { getAgents } = useAgent();
  const tickets = useSelector((s) => s.ticket.tickets);
  const loading = useSelector((s) => s.ticket.loading);
  const pagination = useSelector((s) => s.ticket.pagination);
  const agents = useSelector((s) => s.agent.agents);
  const role = useSelector((s) => s.auth.role);
  const activeWorkspaceId = useSelector((s) => s.company.activeWorkspaceId);
  const userWorkspaceId = useSelector((s) => s.auth.user?.workspaceId);
  const workspaceId = activeWorkspaceId || userWorkspaceId;

  const isCustomer = role === "customer";
  const isAdmin = role === "admin";
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [priority, setPriority] = useState("");
  const [category, setCategory] = useState("");
  const [assignee, setAssignee] = useState("");
  const [sort, setSort] = useState("createdAt");
  const [selected, setSelected] = useState(() => new Set());
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(id);
  }, [search]);

  // Only admins may filter or assign by agent; the endpoint is admin-only.
  useEffect(() => {
    if (isAdmin) getAgents({ page: 1, limit: 100 }).catch(() => {});
  }, [getAgents, isAdmin, workspaceId]);

  // The Unassigned view already pins the assignee, so its filter steps aside.
  const assigneeFilter = view.query.assignedAgent ? "" : assignee;

  // Adjusted during render rather than in an effect so the fetch below never
  // fires once against a stale page. Anything that changes the result set
  // returns to page 1 and drops a selection the new rows no longer contain.
  const scope = `${workspaceId}|${view.id}|${debouncedSearch}|${priority}|${category}|${assigneeFilter}|${sort}`;
  const [prevScope, setPrevScope] = useState(scope);
  if (scope !== prevScope) {
    setPrevScope(scope);
    setPage(1);
    setSelected(new Set());
  }

  const query = useMemo(
    () => ({
      page,
      limit: LIMIT,
      ...view.query,
      ...(debouncedSearch && { search: debouncedSearch }),
      ...(priority && { priority }),
      ...(category && { category }),
      ...(assigneeFilter && { assignedAgent: assigneeFilter }),
      ...(sort === "updatedAt" && { sort }),
    }),
    [page, view, debouncedSearch, priority, category, assigneeFilter, sort]
  );

  const load = useCallback(() => getTickets(query).catch(() => {}), [getTickets, query]);

  useEffect(() => {
    load();
  }, [load, workspaceId]);

  const total = pagination?.total ?? 0;
  const pages = pagination?.pages ?? 1;

  useEffect(() => {
    onTotal?.(total);
  }, [onTotal, total]);

  // Staff open the ticket's own page. Customers go to its conversation — that
  // thread is where the AI's reply and any human follow-up live. A ticket whose
  // chat was never created still opens the chat page, scoped to its customer;
  // the chat page materialises the missing thread on arrival.
  const openTicket = (t) => {
    if (!isCustomer) return navigate(`/dashboard/tickets/${t._id}`);
    const chatId = typeof t.chat === "object" ? t.chat?._id : t.chat;
    const customerId = t.customerId?._id || t.customerId;
    if (chatId) navigate(`/dashboard/chat?chat=${chatId}`);
    else if (customerId) navigate(`/dashboard/chat?customer=${customerId}`);
  };

  const rows = (tickets || []).map((t) => ({
    raw: t,
    id: t._id,
    ticketId: t.ticketNumber || shortId(t._id),
    subject: t.title,
    requester: isCustomer
      ? `Opened ${formatRelative(t.createdAt)}`
      : `${customerName(t.customerId)}${t.customerId?.email ? ` · ${t.customerId.email}` : ""}`,
    accountStatus: isCustomer ? undefined : t.customerId?.accountStatus,
    status: ticketStatusLabel(t.status, t.slaBreached),
    priority: ticketPriorityLabel(t.priority),
    // No human assignee means the AI copilot is handling it.
    assignee: isCustomer ? undefined : t.assignedAgent?.name || t.assignedAgent?.email || "",
    category: cap(t.category) || "—",
    updated: formatRelative(t.updatedAt || t.createdAt),
  }));

  const pageIds = rows.map((r) => r.id);
  const allOnPage = pageIds.length > 0 && pageIds.every((id) => selected.has(id));
  const someOnPage = pageIds.some((id) => selected.has(id));

  const toggle = (id) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  const toggleAll = () => setSelected(allOnPage ? new Set() : new Set(pageIds));

  // One request per ticket: the API has no bulk endpoint. Every outcome is
  // collected so a partial failure says how many landed and why the rest didn't.
  const runBulk = async (label, fn) => {
    const ids = [...selected];
    setBusy(true);
    const results = await Promise.allSettled(ids.map(fn));
    setBusy(false);
    const failed = results.filter((r) => r.status === "rejected");
    const done = ids.length - failed.length;
    if (!failed.length) {
      toast(`${label}: ${done} ${done === 1 ? "ticket" : "tickets"} updated.`, { type: "success" });
    } else {
      const reason = failed[0].reason?.response?.data?.message || failed[0].reason?.message || "Request failed";
      toast(`${label}: ${done} updated, ${failed.length} not — ${reason}`, { type: done ? "info" : "error" });
    }
    setSelected(new Set());
    load();
    onChanged?.();
  };

  const bulkStatus = (status) => {
    const label = BULK_STATUS.find(([v]) => v === status)?.[1];
    runBulk(`Status → ${label}`, (id) => updateTicketStatus({ id, status }));
  };
  const bulkAssign = (agentId) => {
    const agent = (agents || []).find((a) => a._id === agentId);
    runBulk(`Assign to ${agent?.name || "agent"}`, (id) => assignAgent({ id, agentId }));
  };

  const columns = isCustomer ? CUSTOMER_COLS : STAFF_COLS;
  const headers = isCustomer
    ? ["ID", "Subject", "Status", "Priority", "Category", "Updated"]
    : ["ID", "Subject", "Status", "Priority", "Assignee", "Category", "Updated"];
  const filtered = !!(debouncedSearch || priority || category || assigneeFilter);
  const clearFilters = () => {
    setSearch("");
    setPriority("");
    setCategory("");
    setAssignee("");
  };

  const agentOptions = (agents || []).map((a) => [a._id, a.name || a.email]);
  const from = total === 0 ? 0 : (page - 1) * LIMIT + 1;
  const to = Math.min(page * LIMIT, total);

  return (
    <div className="flex flex-col gap-4">
      {/* Search and filters all run server-side — the table only ever holds one
          page, so filtering in the client would miss tickets on other pages. */}
      <div className="flex flex-wrap items-center gap-2">
        <label className="flex items-center gap-2 w-full sm:w-[280px] h-[38px] px-3 rounded-[10px] border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#0b2b26] text-neutral-500 focus-within:border-neutral-400 dark:focus-within:border-neutral-600">
          <span aria-hidden="true" className="material-symbols-outlined text-[17px]">search</span>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Filter tickets"
            placeholder="Filter by subject or ticket number"
            className="flex-1 min-w-0 bg-transparent text-[13px] text-on-surface placeholder:text-neutral-500 focus:outline-none"
          />
        </label>
        <FilterSelect
          label="Priority"
          value={priority}
          onChange={setPriority}
          active={!!priority}
          options={[["", "Any"], ...PRIORITIES.map((p) => [p, cap(p)])]}
        />
        <FilterSelect
          label="Category"
          value={category}
          onChange={setCategory}
          active={!!category}
          options={[["", "Any"], ...CATEGORIES.map((c) => [c, cap(c)])]}
        />
        {isAdmin && !view.query.assignedAgent && (
          <FilterSelect
            label="Assignee"
            value={assignee}
            onChange={setAssignee}
            active={!!assignee}
            options={[["", "Anyone"], ["unassigned", "AI copilot"], ...agentOptions]}
          />
        )}
        {filtered && (
          <button type="button" onClick={clearFilters} className="h-[38px] px-2 text-[13px] text-neutral-600 dark:text-neutral-400 underline underline-offset-2 hover:text-on-surface">
            Clear filters
          </button>
        )}
        <div className="flex-1" />
        <FilterSelect
          label="Sort"
          value={sort}
          onChange={setSort}
          active={false}
          options={[
            ["createdAt", "Newest"],
            ["updatedAt", "Recently updated"],
          ]}
        />
      </div>

      <div className="flex flex-col rounded-2xl bg-white dark:bg-[#0b2b26] border border-neutral-200 dark:border-neutral-800 shadow-[0_1px_2px_rgba(5,31,32,0.05),0_8px_24px_rgba(5,31,32,0.05)] dark:shadow-none overflow-hidden">
        {!isCustomer && selected.size > 0 && (
          <div role="region" aria-label="Bulk actions" className="flex flex-wrap items-center gap-3 min-h-12 px-4 py-2 bg-brand text-mint dark:bg-sage dark:text-forest-950 text-[13px]">
            <span className="font-semibold" aria-live="polite">
              {selected.size} selected
            </span>
            <span aria-hidden="true" className="w-px h-5 bg-current opacity-30" />
            <select
              value=""
              disabled={busy}
              onChange={(e) => e.target.value && bulkStatus(e.target.value)}
              aria-label="Change status of selected tickets"
              className="h-8 px-2.5 rounded-lg bg-white/15 dark:bg-forest-950/10 font-medium focus:outline-none cursor-pointer disabled:opacity-60 [&>option]:text-forest-950"
            >
              <option value="">Change status…</option>
              {BULK_STATUS.map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>
            {isAdmin && (
              <select
                value=""
                disabled={busy || !agentOptions.length}
                onChange={(e) => e.target.value && bulkAssign(e.target.value)}
                aria-label="Assign selected tickets"
                className="h-8 px-2.5 rounded-lg bg-white/15 dark:bg-forest-950/10 font-medium focus:outline-none cursor-pointer disabled:opacity-60 [&>option]:text-forest-950"
              >
                <option value="">{agentOptions.length ? "Assign to…" : "No agents to assign"}</option>
                {agentOptions.map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </select>
            )}
            {busy && <span aria-hidden="true" className="w-4 h-4 rounded-full border-2 border-current border-r-transparent animate-spin" />}
            <div className="flex-1" />
            <button type="button" onClick={() => setSelected(new Set())} className="h-8 px-2.5 underline underline-offset-2">
              Clear selection
            </button>
          </div>
        )}

        <div className="overflow-x-auto">
          <div className="min-w-[880px]">
            <div className={`grid ${columns} items-center gap-x-3 h-10 px-4 border-b border-neutral-100 dark:border-neutral-800 text-[11px] font-semibold tracking-[0.06em] uppercase text-neutral-500`}>
              {!isCustomer && (
                <input
                  type="checkbox"
                  checked={allOnPage}
                  ref={(el) => el && (el.indeterminate = someOnPage && !allOnPage)}
                  onChange={toggleAll}
                  disabled={!pageIds.length}
                  aria-label="Select all tickets on this page"
                  className="w-4 h-4 m-0 accent-brand dark:accent-sage"
                />
              )}
              {headers.map((h) => (
                <span key={h}>{h}</span>
              ))}
            </div>

            {loading && rows.length === 0 ? (
              [...Array(6)].map((_, i) => <SkeletonRow key={i} />)
            ) : rows.length === 0 ? (
              <div className="flex flex-col items-center gap-2 px-6 py-16 text-center">
                <span aria-hidden="true" className="material-symbols-outlined text-[36px] text-neutral-300 dark:text-neutral-700">
                  confirmation_number
                </span>
                <p className="text-[14px] font-semibold text-on-surface">No tickets to show</p>
                <p className="text-[13px] text-neutral-500">
                  {filtered
                    ? "Nothing matches these filters."
                    : view.id === "open"
                      ? "Nothing is open right now."
                      : `No tickets in "${view.label}".`}
                </p>
                {filtered && (
                  <button type="button" onClick={clearFilters} className="mt-1 text-[13px] font-semibold text-brand dark:text-sage underline underline-offset-2">
                    Clear filters
                  </button>
                )}
              </div>
            ) : (
              rows.map((r) => (
                <TicketRow
                  key={r.id}
                  t={r}
                  columns={columns}
                  selectable={!isCustomer}
                  selected={selected.has(r.id)}
                  onToggle={() => toggle(r.id)}
                  onOpen={() => openTicket(r.raw)}
                />
              ))
            )}
          </div>
        </div>

        <nav aria-label="Pagination" className="flex items-center gap-2 min-h-[52px] px-4 py-2 text-[13px] text-neutral-500">
          <span className="flex-1">{total === 0 ? "No tickets" : `Showing ${from}–${to} of ${total.toLocaleString()}`}</span>
          {pages > 1 && (
            <>
              <button
                type="button"
                aria-label="Previous page"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="w-8 h-8 rounded-lg border border-neutral-200 dark:border-neutral-800 flex items-center justify-center text-on-surface disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <span aria-hidden="true" className="material-symbols-outlined text-[16px]">chevron_left</span>
              </button>
              {pageList(page, pages).map((n) => (
                <button
                  key={n}
                  type="button"
                  aria-current={n === page ? "page" : undefined}
                  onClick={() => setPage(n)}
                  className={`w-8 h-8 rounded-lg text-[13px] ${
                    n === page
                      ? "bg-brand text-mint dark:bg-sage dark:text-forest-950 font-semibold"
                      : "border border-neutral-200 dark:border-neutral-800 text-on-surface hover:bg-neutral-50 dark:hover:bg-neutral-900"
                  }`}
                >
                  {n}
                </button>
              ))}
              <button
                type="button"
                aria-label="Next page"
                disabled={page >= pages}
                onClick={() => setPage((p) => Math.min(pages, p + 1))}
                className="w-8 h-8 rounded-lg border border-neutral-200 dark:border-neutral-800 flex items-center justify-center text-on-surface disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <span aria-hidden="true" className="material-symbols-outlined text-[16px]">chevron_right</span>
              </button>
            </>
          )}
        </nav>
      </div>
    </div>
  );
};

export default TicketTable;
