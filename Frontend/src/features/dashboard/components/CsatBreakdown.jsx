import ComingSoonOverlay from "../../../components/ui/ComingSoonOverlay";

const RADIUS = 58;

// Channel names only — no scores. CSAT scoring is not implemented, and a
// hardcoded "92%" behind a translucent overlay still reads as a real number.
const CHANNELS = ["Live Chat", "Email", "Dashboard"];

const CsatBreakdown = () => {
  return (
    <div className="relative bg-white dark:bg-[#1a1a1a] border border-neutral-200 dark:border-neutral-700 rounded-xl p-[24px] flex flex-col overflow-hidden">
      <div className="pointer-events-none select-none opacity-60 flex flex-col flex-1">
        <h4 className="font-bold text-black dark:text-white mb-[4px]">Customer Satisfaction</h4>
        <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mb-[24px]">
          Derived from ticket sentiment, across all channels
        </p>

        {/* Faux donut */}
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
            </svg>
            <div className="absolute text-center">
              <p className="text-[22px] font-bold leading-none text-neutral-300 dark:text-neutral-700">
                —
              </p>
              <p className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase">
                Score
              </p>
            </div>
          </div>
        </div>

        {/* Faux bars */}
        <div className="flex flex-col gap-[16px] mt-[16px]">
          {CHANNELS.map((label) => (
            <div key={label} className="flex flex-col gap-[6px]">
              <div className="flex justify-between text-[12px] font-semibold text-black dark:text-white">
                <span>{label}</span>
                <span className="text-neutral-300 dark:text-neutral-700">—</span>
              </div>
              <div className="h-1.5 w-full bg-neutral-100 dark:bg-neutral-800 rounded-full" />
            </div>
          ))}
        </div>
      </div>

      <ComingSoonOverlay sub="CSAT scoring is coming soon." />
    </div>
  );
};

export default CsatBreakdown;
