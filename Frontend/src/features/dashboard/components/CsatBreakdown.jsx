const channels = [
  { label: "Email Support", pct: 94 },
  { label: "Live Chat", pct: 99 },
  { label: "Help Center", pct: 88 },
];

const RADIUS = 58;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const CsatBreakdown = () => {
  const score = 98;
  const offset = CIRCUMFERENCE * (1 - score / 100);

  return (
    <div className="bg-white dark:bg-[#1a1a1a] border border-neutral-200 dark:border-neutral-700 rounded-xl p-[24px] flex flex-col">
      <h4 className="font-bold text-black dark:text-white mb-[4px]">Customer Satisfaction</h4>
      <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mb-[24px]">
        Aggregate across all channels
      </p>

      {/* Donut */}
      <div className="flex justify-center items-center py-[16px]">
        <div className="relative w-32 h-32 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 128 128">
            <circle
              cx="64"
              cy="64"
              r={RADIUS}
              fill="transparent"
              stroke="currentColor"
              strokeWidth="8"
              className="text-neutral-100 dark:text-neutral-800"
            />
            <circle
              cx="64"
              cy="64"
              r={RADIUS}
              fill="transparent"
              stroke="currentColor"
              strokeWidth="8"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={offset}
              strokeLinecap="round"
              className="text-black dark:text-white transition-all duration-700"
            />
          </svg>
          <div className="absolute text-center">
            <p className="text-[22px] font-bold leading-none text-black dark:text-white">{score}%</p>
            <p className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase">
              Score
            </p>
          </div>
        </div>
      </div>

      {/* Bars */}
      <div className="flex flex-col gap-[16px] mt-[16px]">
        {channels.map((c) => (
          <div key={c.label} className="flex flex-col gap-[6px]">
            <div className="flex justify-between text-[12px] font-semibold text-black dark:text-white">
              <span>{c.label}</span>
              <span>{c.pct}%</span>
            </div>
            <div className="h-1.5 w-full bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-black dark:bg-white rounded-full"
                style={{ width: `${c.pct}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CsatBreakdown;
