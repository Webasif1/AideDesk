import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useTicket } from "../../ticket/hooks/useTicket";

const RADIUS = 58;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const CsatBreakdown = () => {
  const { getTicketCsat } = useTicket();
  const csat = useSelector((s) => s.ticket.csat);
  const loading = useSelector((s) => s.ticket.loading);
  const activeWorkspaceId = useSelector((s) => s.company.activeWorkspaceId);
  const userWorkspaceId = useSelector((s) => s.auth.user?.workspaceId);
  const workspaceId = activeWorkspaceId || userWorkspaceId;

  useEffect(() => {
    getTicketCsat().catch(() => {});
  }, [getTicketCsat, workspaceId]);

  const score = csat?.score ?? null;
  const channels = csat?.channels || [];
  const offset = CIRCUMFERENCE * (1 - (score ?? 0) / 100);

  return (
    <div className="bg-white dark:bg-[#1a1a1a] border border-neutral-200 dark:border-neutral-700 rounded-xl p-[24px] flex flex-col">
      <h4 className="font-bold text-black dark:text-white mb-[4px]">Customer Satisfaction</h4>
      <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mb-[24px]">
        Derived from ticket sentiment, across all channels
      </p>

      {score == null && !loading ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-[24px]">
          <span className="material-symbols-outlined text-[40px] text-neutral-300 dark:text-neutral-700 mb-2">
            sentiment_satisfied
          </span>
          <p className="text-[13px] font-semibold text-neutral-600 dark:text-neutral-300">
            No satisfaction data yet
          </p>
          <p className="text-[12px] text-neutral-400 mt-1">
            Appears once tickets are scored.
          </p>
        </div>
      ) : (
        <>
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
                <p className="text-[22px] font-bold leading-none text-black dark:text-white">
                  {score != null ? `${score}%` : "—"}
                </p>
                <p className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase">
                  Score
                </p>
              </div>
            </div>
          </div>

          {/* Bars */}
          <div className="flex flex-col gap-[16px] mt-[16px]">
            {channels.length === 0 ? (
              <p className="text-[12px] text-neutral-400 text-center">No channel breakdown yet.</p>
            ) : (
              channels.map((c) => (
                <div key={c.source} className="flex flex-col gap-[6px]">
                  <div className="flex justify-between text-[12px] font-semibold text-black dark:text-white">
                    <span>{c.label}</span>
                    <span>{c.score}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-black dark:bg-white rounded-full"
                      style={{ width: `${c.score}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default CsatBreakdown;
