import { useSelector } from "react-redux";
import Tooltip from "../../../components/ui/Tooltip";
import { toast } from "../../../components/ui/toast";

const adminTabs = [
  { label: "All Tickets", dot: false },
  { label: "Unassigned", dot: false },
  { label: "Recently Updated", dot: false },
  { label: "SLA Warnings", dot: true },
];

// An agent only ever receives their own assigned tickets, so "Unassigned" would
// silently return that same set under a label that contradicts it.
const agentTabs = [
  { label: "All Tickets", dot: false },
  { label: "Open", dot: false },
  { label: "Recently Updated", dot: false },
  { label: "SLA Warnings", dot: true },
];

// Customers get a focused, self-service set (no unassigned/SLA/staff tooling).
const customerTabs = [
  { label: "All Tickets", dot: false },
  { label: "Open", dot: false },
  { label: "Resolved", dot: false },
];

const TicketTabs = ({ active, onChange }) => {
  const role = useSelector((s) => s.auth.role);
  const isCustomer = role === "customer";
  const tabs =
    isCustomer ? customerTabs : role === "agent" ? agentTabs : adminTabs;

  return (
  <div className="border-b border-neutral-200 dark:border-neutral-800 mb-6 flex items-center justify-between">
    <div className="flex gap-8">
      {tabs.map((t) => (
        <button
          key={t.label}
          onClick={() => onChange(t.label)}
          className={`pb-4 text-sm font-medium transition-colors relative ${
            active === t.label
              ? "text-black dark:text-white border-b-2 border-black dark:border-white font-semibold"
              : "text-neutral-400 hover:text-black dark:hover:text-white"
          }`}
        >
          {t.label}
          {t.dot && (
            <span className="absolute top-0 -right-2 w-1.5 h-1.5 bg-red-500 rounded-full" />
          )}
        </button>
      ))}
    </div>

    {/* Advanced filtering + export aren't backed yet — staff-only, coming soon */}
    {!isCustomer && (
      <div className="flex items-center gap-3 pb-4">
        <Tooltip text="Coming soon">
          <button
            onClick={() => toast.comingSoon("Advanced filters")}
            className="flex items-center gap-2 px-3 py-1.5 border border-neutral-200 dark:border-neutral-700 rounded text-xs font-medium text-neutral-400 dark:text-neutral-500 opacity-60 cursor-not-allowed"
          >
            <span className="material-symbols-outlined text-sm">filter_list</span>
            Filters
          </button>
        </Tooltip>
        <Tooltip text="Coming soon">
          <button
            onClick={() => toast.comingSoon("Export")}
            className="flex items-center gap-2 px-3 py-1.5 border border-neutral-200 dark:border-neutral-700 rounded text-xs font-medium text-neutral-400 dark:text-neutral-500 opacity-60 cursor-not-allowed"
          >
            <span className="material-symbols-outlined text-sm">download</span>
            Export
          </button>
        </Tooltip>
      </div>
    )}
  </div>
  );
};

export default TicketTabs;
