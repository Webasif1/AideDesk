import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useUser } from "../hooks/useUser";

const CustomerMetrics = () => {
  const { getUserStats } = useUser();
  const stats = useSelector((s) => s.user.stats);
  const role = useSelector((s) => s.auth.role);
  const activeWorkspaceId = useSelector((s) => s.company.activeWorkspaceId);
  const userWorkspaceId = useSelector((s) => s.auth.user?.workspaceId);
  const workspaceId = activeWorkspaceId || userWorkspaceId;

  useEffect(() => {
    if (role === "admin" || role === "agent") {
      getUserStats().catch(() => {});
    }
  }, [getUserStats, role, workspaceId]);

  const metrics = [
    {
      label: "Total Customers",
      value: stats ? (stats.total ?? 0).toLocaleString() : "—",
      right: (
        <span className="text-[11px] text-neutral-400 dark:text-neutral-500 font-medium">
          in workspace
        </span>
      ),
    },
    {
      label: "Active (30d)",
      value: stats ? (stats.active ?? 0).toLocaleString() : "—",
      right: (
        <div className="h-1.5 w-24 bg-neutral-100 dark:bg-neutral-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-black dark:bg-white"
            style={{ width: `${stats?.activeRate ?? 0}%` }}
          />
        </div>
      ),
    },
    {
      label: "Active Rate",
      value: stats ? `${stats.activeRate ?? 0}%` : "—",
      right: (
        <span className="text-[11px] text-neutral-400 dark:text-neutral-500 font-medium">
          logged in 30d
        </span>
      ),
    },
    {
      label: "New This Month",
      value: stats ? (stats.newThisMonth ?? 0).toLocaleString() : "—",
      right: (
        <span className="material-symbols-outlined text-neutral-300 dark:text-neutral-600">
          trending_up
        </span>
      ),
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[24px]">
      {metrics.map((m) => (
        <div
          key={m.label}
          className="bg-white dark:bg-[#1a1a1a] border border-neutral-100 dark:border-neutral-700 p-[24px] rounded-xl"
        >
          <p className="text-[11px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest mb-[8px]">
            {m.label}
          </p>
          <div className="flex items-end justify-between">
            <h3 className="text-[22px] font-bold text-black dark:text-white">{m.value}</h3>
            {m.right}
          </div>
        </div>
      ))}
    </div>
  );
};

export default CustomerMetrics;
