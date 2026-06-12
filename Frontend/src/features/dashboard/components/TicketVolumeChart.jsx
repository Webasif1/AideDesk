import ComingSoonOverlay from "../../../components/ui/ComingSoonOverlay";

// Static decorative bars — purely visual, sits behind the "Coming Soon" overlay.
const PREVIEW_BARS = [60, 90, 45, 120, 80, 140, 100, 70, 110, 95, 130, 75, 150, 85];

const TicketVolumeChart = () => {
  return (
    <div className="lg:col-span-3 relative bg-white dark:bg-[#1a1a1a] border border-neutral-200 dark:border-neutral-700 rounded-xl overflow-hidden flex flex-col">
      {/* Inactive — analytics pipeline not wired yet */}
      <div className="pointer-events-none select-none opacity-60 flex flex-col flex-1">
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

        {/* Faux chart */}
        <div className="flex-1 min-h-[300px] px-[24px] pb-[24px] pt-[16px] flex items-end justify-between gap-[8px]">
          {PREVIEW_BARS.map((h, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-[6px]">
              <div
                className="w-full bg-neutral-100 dark:bg-neutral-800 rounded-t relative overflow-hidden"
                style={{ height: `${h}px` }}
              >
                <div
                  className="absolute bottom-0 w-full bg-black dark:bg-white rounded-t"
                  style={{ height: `${Math.round(h * 0.55)}px` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <ComingSoonOverlay sub="Live ticket volume analytics are on the way." />
    </div>
  );
};

export default TicketVolumeChart;
