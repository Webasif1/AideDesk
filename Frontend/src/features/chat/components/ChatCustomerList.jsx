import { useMemo, useState } from "react";
import ChatAvatar from "./ChatAvatar";
import { SkeletonConversation } from "../../../components/ui/Skeleton";
import { formatRelative } from "../../../lib/format";

// The first column on the staff chat page: every customer in the workspace who
// has at least one ticket. Picking someone here scopes the conversation list to
// them — before this, every conversation in the company was dumped into one
// list with no way to see a single customer's history together.
const ChatCustomerList = ({
  customers = [],
  loading = false,
  error = null,
  selectedId,
  onSelect,
}) => {
  const [search, setSearch] = useState("");

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return customers;
    return customers.filter((c) =>
      [c.name, c.email].filter(Boolean).some((f) => f.toLowerCase().includes(term))
    );
  }, [customers, search]);

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Header */}
      <div className="shrink-0 px-[16px] pt-[20px] pb-[12px] border-b border-neutral-100 dark:border-neutral-800">
        <div className="flex items-center justify-between mb-[12px]">
          <h2 className="text-[15px] font-bold text-black dark:text-white">Customers</h2>
          {customers.length > 0 && (
            <span className="text-[10px] font-semibold text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-[7px] py-[2px] rounded-full">
              {customers.length}
            </span>
          )}
        </div>
        <div className="flex items-center bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg px-[10px] py-[6px] gap-[6px] focus-within:border-black dark:focus-within:border-white transition-all">
          <span className="material-symbols-outlined text-neutral-400 text-[16px]">
            search
          </span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent text-[12px] text-black dark:text-white outline-none placeholder:text-neutral-400 dark:placeholder:text-neutral-500 w-full"
            placeholder="Search customers..."
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto overscroll-contain">
        {loading && customers.length === 0 && (
          <div className="p-[12px] space-y-[10px]">
            {[...Array(5)].map((_, i) => (
              <SkeletonConversation key={i} />
            ))}
          </div>
        )}

        {/* A failed fetch must not read as an empty list — that ambiguity hid a
            broken query behind "No customers with tickets yet." */}
        {!loading && error && (
          <div className="px-4 py-8 text-center">
            <span className="material-symbols-outlined text-[24px] text-red-400 block mb-1">
              error
            </span>
            <p className="text-[12px] text-red-500 dark:text-red-400">{error}</p>
          </div>
        )}

        {!loading && !error && visible.length === 0 && (
          <div className="px-4 py-8 text-center text-[12px] text-neutral-400">
            {customers.length === 0
              ? "No customers with tickets yet."
              : `Nothing matches "${search.trim()}".`}
          </div>
        )}

        {visible.map((customer, idx) => {
          const isActive = customer._id === selectedId;
          return (
            <button
              key={customer._id}
              onClick={() => onSelect(customer)}
              className={`w-full text-left flex items-start gap-[10px] px-[16px] py-[12px] transition-all border-b border-neutral-50 dark:border-neutral-800 ${
                isActive
                  ? "bg-neutral-100 dark:bg-neutral-800"
                  : "hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
              }`}
              style={{
                animation: "custIn 0.25s ease-out both",
                animationDelay: `${idx * 0.03}s`,
              }}
            >
              <ChatAvatar
                name={customer.name}
                role="customer"
                status={customer.status === "online" ? "online" : "offline"}
                size="md"
              />

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-[6px] mb-[2px]">
                  <span
                    className={`text-[13px] font-semibold truncate ${
                      isActive
                        ? "text-black dark:text-white"
                        : "text-neutral-800 dark:text-neutral-200"
                    }`}
                  >
                    {customer.name}
                  </span>
                  <span className="text-[10px] text-neutral-400 shrink-0">
                    {formatRelative(customer.lastActivity)}
                  </span>
                </div>
                <p className="text-[10px] text-neutral-400 truncate leading-tight">
                  {customer.email}
                </p>
                <div className="flex items-center gap-[6px] mt-[5px]">
                  <span className="text-[9px] font-bold px-[6px] py-[2px] rounded-full uppercase tracking-wide bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
                    {customer.ticketCount} ticket{customer.ticketCount === 1 ? "" : "s"}
                  </span>
                  {/* No suspended badge: the endpoint only returns active
                      customers, so it could never render. */}
                  {customer.openCount > 0 && (
                    <span className="text-[9px] font-bold px-[6px] py-[2px] rounded-full uppercase tracking-wide bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                      {customer.openCount} open
                    </span>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <style>{`
        @keyframes custIn {
          from { opacity: 0; transform: translateX(-8px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
};

export default ChatCustomerList;
