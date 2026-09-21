import { accountFlagPill } from "../../../lib/accountStatus";
import { initialsOf, ticketPriorityTone, ticketStatusTone } from "../../../lib/format";
import Badge from "../../../components/ui/Badge";

// One ticket in the list. The subject is the real control that opens the
// conversation; the checkbox (staff only) feeds the bulk-action bar.
const TicketRow = ({ t, columns, selectable, selected, onToggle, onOpen }) => {
  const accountPill = accountFlagPill(t.accountStatus);
  return (
    <div
      className={`grid ${columns} items-center gap-x-3 min-h-[54px] px-4 py-2 border-b border-neutral-100 dark:border-neutral-800 transition-colors ${
        selected ? "bg-neutral-50 dark:bg-neutral-900" : "hover:bg-neutral-50/60 dark:hover:bg-neutral-900/60"
      }`}
    >
      {selectable && (
        <input
          type="checkbox"
          checked={selected}
          onChange={onToggle}
          aria-label={`Select ticket ${t.ticketId}`}
          className="w-4 h-4 m-0 accent-brand dark:accent-sage"
        />
      )}
      <span className="font-mono text-[12px] text-neutral-500 truncate">{t.ticketId}</span>
      <button type="button" onClick={onOpen} className="flex flex-col gap-0.5 min-w-0 text-left group">
        <span className="flex items-center gap-2 min-w-0">
          <span className="text-[13px] font-semibold text-on-surface truncate group-hover:underline">{t.subject}</span>
          {accountPill && (
            <span className={`text-[9px] font-bold uppercase tracking-wide px-[6px] py-[1px] rounded-full shrink-0 ${accountPill.className}`}>
              {accountPill.label}
            </span>
          )}
        </span>
        <span className="text-[12px] text-neutral-500 truncate">{t.requester}</span>
      </button>
      <span className="justify-self-start">
        <Badge tone={ticketStatusTone(t.status)} dot>
          {t.status}
        </Badge>
      </span>
      <span className="justify-self-start">
        <Badge tone={ticketPriorityTone(t.priority)}>{t.priority}</Badge>
      </span>
      {t.assignee !== undefined && (
        <span className={`flex items-center gap-2 min-w-0 text-[13px] ${t.assignee ? "text-on-surface" : "text-neutral-500"}`}>
          <span
            aria-hidden="true"
            className={`w-6 h-6 shrink-0 rounded-full text-[10px] font-bold flex items-center justify-center text-neutral-700 dark:text-neutral-300 ${
              t.assignee ? "bg-neutral-100 dark:bg-neutral-800" : "border border-dashed border-neutral-300 dark:border-neutral-700"
            }`}
          >
            {t.assignee ? initialsOf(t.assignee) : "AI"}
          </span>
          <span className="truncate">{t.assignee || "AI copilot"}</span>
        </span>
      )}
      <span className="text-[13px] text-neutral-600 dark:text-neutral-400 truncate">{t.category}</span>
      <span className="text-[12px] text-neutral-500 whitespace-nowrap">{t.updated}</span>
    </div>
  );
};

export default TicketRow;
