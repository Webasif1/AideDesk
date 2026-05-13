const bars = [
  { day: "Mon", total: 160, aiPct: 85 },
  { day: "Tue", total: 176, aiPct: 90 },
  { day: "Wed", total: 128, aiPct: 70 },
  { day: "Thu", total: 192, aiPct: 95 },
  { day: "Fri", total: 208, aiPct: 80 },
  { day: "Sat", total: 96, aiPct: 40 },
  { day: "Sun", total: 80, aiPct: 30 },
  { day: "Mon", total: 160, aiPct: 88 },
  { day: "Tue", total: 168, aiPct: 92 },
  { day: "Wed", total: 144, aiPct: 75 },
];

const MAX = 208;

const TicketVolumeChart = () => {
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
      <div className="flex-1 min-h-[300px] px-[24px] pb-[24px] pt-[16px] flex items-end justify-between gap-[8px]">
        {bars.map((bar, i) => {
          const totalHeight = Math.round((bar.total / MAX) * 220);
          const aiHeight = Math.round((bar.aiPct / 100) * totalHeight);
          return (
            <div
              key={i}
              className="flex-1 flex flex-col items-center gap-[6px] group"
            >
              <div
                className="w-full bg-neutral-100 dark:bg-neutral-800 rounded-t relative overflow-hidden"
                style={{ height: `${totalHeight}px` }}
              >
                <div
                  className="absolute bottom-0 w-full bg-black dark:bg-white rounded-t transition-all group-hover:opacity-75"
                  style={{ height: `${aiHeight}px` }}
                />
              </div>
              <p className="text-[10px] text-neutral-400 dark:text-neutral-500">{bar.day}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TicketVolumeChart;
