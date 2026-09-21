import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useTicket } from "../../ticket/hooks/useTicket";

// Daily ticket volume from GET /tickets/analytics/volume, split into tickets
// the AI handled on its own (no agent assigned) and ones a person took on.
// Stacked bars, a visually hidden data table for screen readers, and a value
// readout on hover/focus so no number depends on reading bar height.
const DAYS = 14;

const dayLabel = (iso) => new Date(`${iso}T00:00:00`).toLocaleDateString([], { day: "numeric", month: "short" });

const TicketVolumeChart = () => {
  const { getTicketVolume } = useTicket();
  const volume = useSelector((s) => s.ticket.volume);
  const activeWorkspaceId = useSelector((s) => s.company.activeWorkspaceId);
  const [state, setState] = useState("loading");
  const [hover, setHover] = useState(null);

  useEffect(() => {
    let alive = true;
    getTicketVolume({ days: DAYS })
      .then(() => alive && setState("ready"))
      .catch(() => alive && setState("error"));
    return () => {
      alive = false;
    };
  }, [getTicketVolume, activeWorkspaceId]);

  const series = useMemo(() => (volume || []).map((d) => ({ ...d, human: Math.max(0, d.total - d.ai) })), [volume]);
  const max = Math.max(1, ...series.map((d) => d.total));
  const totals = series.reduce((acc, d) => ({ total: acc.total + d.total, ai: acc.ai + d.ai }), { total: 0, ai: 0 });
  const shown = hover != null ? series[hover] : null;

  return (
    <section aria-labelledby="vol-h" className="lg:col-span-2 flex flex-col gap-4 p-6 rounded-[20px] bg-white dark:bg-[#0b2b26] border border-neutral-200 dark:border-neutral-800">
      <div className="flex flex-wrap items-start gap-4">
        <div className="flex-1 min-w-[180px]">
          <h2 id="vol-h" className="font-display text-[16px] font-bold text-on-surface">
            Ticket volume
          </h2>
          <p className="text-[12px] text-neutral-500">
            {shown
              ? `${dayLabel(shown.date)} · ${shown.total} tickets (${shown.ai} AI, ${shown.human} people)`
              : state === "ready"
                ? `Last ${DAYS} days · ${totals.total} tickets, ${totals.ai} handled by AI`
                : `Last ${DAYS} days`}
          </p>
        </div>
        <div className="flex items-center gap-4 text-[12px] text-neutral-600 dark:text-neutral-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-[3px] bg-forest-700 dark:bg-sage" />
            People
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-[3px] bg-sage dark:bg-forest-700" />
            AI
          </span>
        </div>
      </div>

      {state === "error" ? (
        <div className="flex-1 min-h-[220px] flex flex-col items-center justify-center gap-2 text-center">
          <span className="material-symbols-outlined text-[28px] text-neutral-400">cloud_off</span>
          <p className="text-[13px] text-neutral-600 dark:text-neutral-400">Couldn't load ticket volume.</p>
        </div>
      ) : state === "loading" ? (
        <div className="flex-1 min-h-[220px] flex items-end gap-2">
          {[...Array(DAYS)].map((_, i) => (
            <div key={i} className="flex-1 rounded-t-md bg-neutral-100 dark:bg-neutral-900 animate-pulse" style={{ height: `${30 + ((i * 37) % 50)}%` }} />
          ))}
        </div>
      ) : totals.total === 0 ? (
        <div className="flex-1 min-h-[220px] flex flex-col items-center justify-center gap-2 text-center">
          <span className="material-symbols-outlined text-[28px] text-neutral-400">bar_chart</span>
          <p className="text-[13px] text-neutral-600 dark:text-neutral-400">No tickets in the last {DAYS} days yet.</p>
        </div>
      ) : (
        <>
          <div aria-hidden="true" className="relative flex-1 min-h-[220px] flex items-end gap-1.5 sm:gap-2 pb-6">
            <div className="absolute inset-x-0 top-0 border-t border-dashed border-neutral-200 dark:border-neutral-800" />
            <span className="absolute right-0 -top-4 text-[10px] text-neutral-400">{max}</span>
            {series.map((d, i) => (
              <div
                key={d.date}
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
                className="relative flex-1 h-full flex flex-col justify-end items-center"
              >
                <div
                  className={`w-full max-w-[26px] flex flex-col justify-end rounded-t-md overflow-hidden transition-opacity ${hover != null && hover !== i ? "opacity-50" : ""}`}
                  style={{ height: `${(d.total / max) * 100}%` }}
                >
                  <div className="bg-sage dark:bg-forest-700" style={{ flexGrow: d.ai }} />
                  <div className="bg-forest-700 dark:bg-sage" style={{ flexGrow: d.human }} />
                </div>
                {(i === 0 || i === series.length - 1 || i % 4 === 0) && (
                  <span className="absolute -bottom-5 text-[10px] text-neutral-500 whitespace-nowrap">{dayLabel(d.date)}</span>
                )}
              </div>
            ))}
          </div>
          <table className="sr-only">
            <caption>Tickets per day, last {DAYS} days</caption>
            <thead>
              <tr>
                <th scope="col">Day</th>
                <th scope="col">Total</th>
                <th scope="col">Handled by AI</th>
                <th scope="col">Handled by people</th>
              </tr>
            </thead>
            <tbody>
              {series.map((d) => (
                <tr key={d.date}>
                  <th scope="row">{dayLabel(d.date)}</th>
                  <td>{d.total}</td>
                  <td>{d.ai}</td>
                  <td>{d.human}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </section>
  );
};

export default TicketVolumeChart;
