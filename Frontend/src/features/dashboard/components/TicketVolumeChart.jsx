import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useTicket } from "../../ticket/hooks/useTicket";

const weekday = (dateStr) =>
  new Date(dateStr + "T00:00:00").toLocaleDateString(undefined, { weekday: "short" });

const TicketVolumeChart = () => {
  const { getTicketVolume } = useTicket();
  const volume = useSelector((s) => s.ticket.volume);
  const loading = useSelector((s) => s.ticket.loading);
  const activeWorkspaceId = useSelector((s) => s.company.activeWorkspaceId);
  const userWorkspaceId = useSelector((s) => s.auth.user?.workspaceId);
  const workspaceId = activeWorkspaceId || userWorkspaceId;

  useEffect(() => {
    getTicketVolume({ days: 14 }).catch(() => {});
  }, [getTicketVolume, workspaceId]);

  const bars = volume || [];
  const max = Math.max(1, ...bars.map((b) => b.total));
  const hasData = bars.some((b) => b.total > 0);

  return (
    <div className="lg:col-span-2 bg-white dark:bg-[#1a1a1a] border border-neutral-200 dark:border-neutral-700 rounded-xl overflow-hidden flex flex-col">
      {/* Header */}
      <div className="p-[24px] border-b border-neutral-100 dark:border-neutral-700 flex justify-between items-center">
        <div>
          <h4 className="font-bold text-black dark:text-white">Ticket Volume</h4>
          <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
            Human vs. AI Resolution Trend
          </p>
        </div>
        <div className="flex items-center gap-[16px]">
          <div className="flex items-center gap-[6px]">
            <div className="w-2.5 h-2.5 rounded-full bg-black dark:bg-white" />
            <span className="text-[11px] font-medium text-neutral-600 dark:text-neutral-300">
              AI Managed
            </span>
          </div>
          <div className="flex items-center gap-[6px]">
            <div className="w-2.5 h-2.5 rounded-full bg-neutral-200 dark:bg-neutral-700" />
            <span className="text-[11px] font-medium text-neutral-600 dark:text-neutral-300">
              Human Support
            </span>
          </div>
        </div>
      </div>

      {/* Chart */}
      {loading && !hasData ? (
        <div className="flex-1 min-h-[300px] px-[24px] pb-[24px] pt-[16px] flex items-end justify-between gap-[8px] animate-pulse">
          {[...Array(14)].map((_, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-[6px]">
              <div
                className="w-full bg-neutral-100 dark:bg-neutral-800 rounded-t"
                style={{ height: `${40 + ((i * 37) % 160)}px` }}
              />
            </div>
          ))}
        </div>
      ) : !hasData ? (
        <div className="flex-1 min-h-[300px] flex flex-col items-center justify-center text-center px-[24px]">
          <span className="material-symbols-outlined text-[40px] text-neutral-300 dark:text-neutral-700 mb-2">
            bar_chart
          </span>
          <p className="text-[13px] font-semibold text-neutral-600 dark:text-neutral-300">
            No ticket activity yet
          </p>
          <p className="text-[12px] text-neutral-400 mt-1">
            Volume appears here as tickets come in.
          </p>
        </div>
      ) : (
        <div className="flex-1 min-h-[300px] px-[24px] pb-[24px] pt-[16px] flex items-end justify-between gap-[8px]">
          {bars.map((bar, i) => {
            const totalHeight = Math.round((bar.total / max) * 220);
            const aiPct = bar.total ? bar.ai / bar.total : 0;
            const aiHeight = Math.round(aiPct * totalHeight);
            return (
              <div
                key={i}
                className="flex-1 flex flex-col items-center gap-[6px] group"
                title={`${bar.total} tickets • ${bar.ai} AI-managed`}
              >
                <div
                  className="w-full bg-neutral-100 dark:bg-neutral-800 rounded-t relative overflow-hidden"
                  style={{ height: `${Math.max(totalHeight, 2)}px` }}
                >
                  <div
                    className="absolute bottom-0 w-full bg-black dark:bg-white rounded-t transition-all group-hover:opacity-75"
                    style={{ height: `${aiHeight}px` }}
                  />
                </div>
                <p className="text-[10px] text-neutral-400 dark:text-neutral-500">
                  {weekday(bar.date)}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TicketVolumeChart;
