import { useState } from "react";
import { useSelector } from "react-redux";
import { formatMinutes, formatRelative } from "../../../../lib/format";
import { RAW_STATUS_LABEL } from "../../lib/ticketStatus";

const cap = (s = "") => (s ? s[0].toUpperCase() + s.slice(1) : "");
const PRIORITIES = ["urgent", "high", "medium", "low"];
const CATEGORIES = ["billing", "technical", "account", "general"];
const SOURCE_LABEL = { chat: "Live chat", email: "Email", dashboard: "Dashboard", portal: "Support portal", api: "API" };
const ROLE_LABEL = { admin: "Admin", agent: "Agent", customer: "Customer", system: "System" };

const Heading = ({ children }) => (
  <h2 className="text-[11px] font-semibold tracking-[0.08em] uppercase text-neutral-500">{children}</h2>
);

const Row = ({ label, children }) => (
  <div className="grid grid-cols-[76px_minmax(0,1fr)] items-center gap-2">
    <span className="text-[13px] text-neutral-500">{label}</span>
    {children}
  </div>
);

const selectCls =
  "h-[34px] w-full px-2.5 rounded-[10px] border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#0b2b26] text-[13px] font-medium text-on-surface cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus:border-neutral-400";

const minutesBetween = (a, b) => (a && b ? Math.max(0, Math.round((new Date(b) - new Date(a)) / 60000)) : null);

const TicketProperties = ({ ticket, agents, busy, onPatch, onAssign }) => {
  const role = useSelector((s) => s.auth.role);
  const isAdmin = role === "admin";
  const [tag, setTag] = useState("");
  const locked = ticket.status === "forced_closed" && !isAdmin;

  const addTag = (e) => {
    e.preventDefault();
    const t = tag.trim().toLowerCase();
    setTag("");
    if (!t || ticket.tags?.includes(t)) return;
    onPatch({ tags: [...(ticket.tags || []), t] });
  };
  const removeTag = (t) => onPatch({ tags: (ticket.tags || []).filter((x) => x !== t) });

  const firstReply = minutesBetween(ticket.createdAt, ticket.firstResponseAt);
  // statusHistory carries who (role) and when, but not a name — so the feed
  // says "Agent" rather than guessing which one.
  const activity = [
    ...(ticket.statusHistory || []).map((h) => ({
      what: `Status → ${RAW_STATUS_LABEL[h.to] || h.to}`,
      who: ROLE_LABEL[h.role] || "System",
      at: h.at,
    })),
    ticket.escalatedAt && { what: "Escalated to a person", who: "System", at: ticket.escalatedAt },
    { what: `Ticket created via ${SOURCE_LABEL[ticket.source] || ticket.source}`, who: ticket.createdByModel === "user" ? "Customer" : ROLE_LABEL[ticket.createdByModel] || "Staff", at: ticket.createdAt },
  ]
    .filter(Boolean)
    .sort((a, b) => new Date(b.at) - new Date(a.at));

  return (
    <aside aria-label="Ticket details" className="w-[292px] shrink-0 px-5 py-[22px] flex flex-col gap-5 border-r border-neutral-200 dark:border-neutral-800 overflow-y-auto">
      <div className="flex flex-col gap-3">
        <Heading>Properties</Heading>
        <Row label="Priority">
          <select aria-label="Priority" className={selectCls} value={ticket.priority} disabled={busy || locked} onChange={(e) => onPatch({ priority: e.target.value })}>
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>{cap(p)}</option>
            ))}
          </select>
        </Row>
        <Row label="Assignee">
          {isAdmin ? (
            <select
              aria-label="Assignee"
              className={selectCls}
              value={ticket.assignedAgent?._id || ""}
              disabled={busy || !agents.length}
              onChange={(e) => e.target.value && onAssign(e.target.value)}
            >
              {/* The API assigns but has no unassign, so "AI copilot" is shown
                  only while nobody holds the ticket. */}
              {!ticket.assignedAgent && <option value="">AI copilot</option>}
              {agents.map((a) => (
                <option key={a._id} value={a._id}>{a.name || a.email}</option>
              ))}
            </select>
          ) : (
            <span className="text-[13px] font-medium text-on-surface truncate">{ticket.assignedAgent?.name || "AI copilot"}</span>
          )}
        </Row>
        <Row label="Category">
          <select aria-label="Category" className={selectCls} value={ticket.category} disabled={busy || locked} onChange={(e) => onPatch({ category: e.target.value })}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{cap(c)}</option>
            ))}
          </select>
        </Row>
        <Row label="Channel">
          <span className="text-[13px] font-medium text-on-surface">{SOURCE_LABEL[ticket.source] || cap(ticket.source)}</span>
        </Row>
        <div className="grid grid-cols-[76px_minmax(0,1fr)] gap-2">
          <span className="text-[13px] text-neutral-500 pt-1">Tags</span>
          <div className="flex flex-wrap gap-1.5">
            {(ticket.tags || []).map((t) => (
              <span key={t} className="h-6 pl-2.5 pr-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-brand dark:text-sage text-[12px] inline-flex items-center gap-1">
                {t}
                <button type="button" aria-label={`Remove tag ${t}`} disabled={busy || locked} onClick={() => removeTag(t)} className="w-4 h-4 rounded-full flex items-center justify-center hover:bg-neutral-200 dark:hover:bg-neutral-700">
                  <span aria-hidden="true" className="material-symbols-outlined text-[12px]">close</span>
                </button>
              </span>
            ))}
            {!locked && (
              <form onSubmit={addTag} className="flex">
                <label className="sr-only" htmlFor="tag-input">Add tag</label>
                <input
                  id="tag-input"
                  value={tag}
                  onChange={(e) => setTag(e.target.value)}
                  placeholder="+ Add tag"
                  maxLength={30}
                  className="h-6 w-[90px] px-2.5 rounded-full border border-dashed border-neutral-400 bg-transparent text-[12px] text-on-surface placeholder:text-brand dark:placeholder:text-sage focus:outline-none focus:border-solid"
                />
              </form>
            )}
          </div>
        </div>
      </div>

      {/* In place of the design's SLA card: the backend stores no SLA due
          time, so this shows the response facts it does record. */}
      <div className="flex flex-col gap-2.5 p-3.5 rounded-[14px] bg-white dark:bg-[#0b2b26] border border-neutral-200 dark:border-neutral-800 text-[13px]">
        <Heading>Timing</Heading>
        <div className="flex justify-between gap-2">
          <span className="text-neutral-500">Opened</span>
          <span className="font-semibold text-on-surface">{formatRelative(ticket.createdAt)}</span>
        </div>
        <div className="flex justify-between gap-2">
          <span className="text-neutral-500">First reply</span>
          <span className={`font-semibold ${firstReply == null ? "text-neutral-500" : "text-on-surface"}`}>
            {firstReply == null ? "Not yet" : `after ${formatMinutes(firstReply)}`}
          </span>
        </div>
        {ticket.resolvedAt && (
          <div className="flex justify-between gap-2">
            <span className="text-neutral-500">Resolved</span>
            <span className="font-semibold text-ok">{formatRelative(ticket.resolvedAt)}</span>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2.5">
        <Heading>Activity</Heading>
        <ol className="flex flex-col">
          {activity.map((a, i) => (
            <li key={i} className="flex gap-2.5">
              <span aria-hidden="true" className="flex flex-col items-center gap-1 pt-1">
                <span className="w-2 h-2 rounded-full bg-sage" />
                {i < activity.length - 1 && <span className="w-px flex-1 bg-neutral-200 dark:bg-neutral-800" />}
              </span>
              <span className="flex flex-col gap-0.5 pb-2">
                <span className="text-[13px] text-on-surface">{a.what}</span>
                <span className="text-[11px] text-neutral-500">
                  {a.who} · {formatRelative(a.at)}
                </span>
              </span>
            </li>
          ))}
        </ol>
      </div>
    </aside>
  );
};

export default TicketProperties;
