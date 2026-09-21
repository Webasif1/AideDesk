import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getTickets } from "../../services/ticket.api";
import { accountFlagPill } from "../../../../lib/accountStatus";
import { customerName, formatRelative, initialsOf, ticketStatusLabel } from "../../../../lib/format";

// Who the customer is and what else they've raised. Counts are the list
// endpoint's own totals (scoped by role, so an agent sees their share).
const TicketCustomerPanel = ({ ticket }) => {
  const customer = ticket.customerId || {};
  const customerId = customer._id;
  const [history, setHistory] = useState(null);

  useEffect(() => {
    if (!customerId) return;
    let live = true;
    Promise.all([
      getTickets({ customerId, limit: 6, sort: "updatedAt" }),
      getTickets({ customerId, limit: 1, status: "open,pending,in_progress" }),
    ])
      .then(([all, open]) => {
        if (!live) return;
        setHistory({
          total: all.pagination?.total ?? 0,
          open: open.pagination?.total ?? 0,
          items: (all.data || []).filter((t) => t._id !== ticket._id).slice(0, 5),
        });
      })
      .catch(() => live && setHistory({ error: true }));
    return () => {
      live = false;
    };
  }, [customerId, ticket._id]);

  const name = customerName(customer);
  const pill = accountFlagPill(customer.accountStatus);

  return (
    <aside aria-label="Customer" className="w-[292px] shrink-0 px-5 py-[22px] flex flex-col gap-[18px] bg-white dark:bg-[#0b2b26] overflow-y-auto">
      <div className="flex items-center gap-3">
        <span aria-hidden="true" className="w-12 h-12 shrink-0 rounded-full bg-mint text-brand dark:bg-forest-800 dark:text-mint font-display text-[16px] font-bold flex items-center justify-center">
          {initialsOf(name)}
        </span>
        <div className="flex flex-col gap-0.5 min-w-0">
          <span className="font-display text-[16px] font-bold text-on-surface truncate">{name}</span>
          {customer.email && <span className="text-[12px] text-neutral-500 truncate">{customer.email}</span>}
        </div>
      </div>
      {pill && (
        <span className={`self-start h-6 px-2.5 rounded-full text-[12px] font-medium inline-flex items-center ${pill.className}`}>{pill.label}</span>
      )}

      <dl className="grid grid-cols-2 gap-2">
        {[
          ["Tickets", history?.total],
          ["Open", history?.open],
        ].map(([label, v]) => (
          <div key={label} className="flex flex-col-reverse gap-0.5 p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-950">
            <dt className="text-[11px] text-neutral-500">{label}</dt>
            <dd className="font-display text-[18px] font-bold text-on-surface m-0">{v ?? "—"}</dd>
          </div>
        ))}
      </dl>

      <div className="flex flex-col gap-2">
        <h2 className="text-[11px] font-semibold tracking-[0.08em] uppercase text-neutral-500">Previous tickets</h2>
        {!history ? (
          [0, 1].map((i) => <div key={i} className="h-[54px] rounded-xl bg-neutral-100 dark:bg-neutral-900 animate-pulse" />)
        ) : history.error ? (
          <p className="text-[13px] text-neutral-500">Couldn't load this customer's history.</p>
        ) : history.items.length ? (
          history.items.map((t) => (
            <Link
              key={t._id}
              to={`/dashboard/tickets/${t._id}`}
              className="flex flex-col gap-0.5 px-3 py-2.5 rounded-xl border border-neutral-100 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900"
            >
              <span className="text-[13px] font-medium text-on-surface line-clamp-1">{t.title}</span>
              <span className="text-[11px] text-neutral-500">
                {t.ticketNumber} · {ticketStatusLabel(t.status, t.slaBreached)} · {formatRelative(t.updatedAt || t.createdAt)}
              </span>
            </Link>
          ))
        ) : (
          <p className="text-[13px] text-neutral-500">No other tickets from this customer.</p>
        )}
      </div>

      {customerId && (
        <Link to={`/dashboard/chat?customer=${customerId}`} className="text-[13px] font-semibold text-brand dark:text-sage underline underline-offset-2">
          Open in live chat
        </Link>
      )}
    </aside>
  );
};

export default TicketCustomerPanel;
