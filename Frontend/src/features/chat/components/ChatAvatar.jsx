// Offline reads grey, never green — presence comes from the customer's own
// `status`, not from whether their chat session happens to be open.
const statusColors = {
  online: "bg-emerald-500",
  away: "bg-amber-400",
  offline: "bg-neutral-400 dark:bg-neutral-600",
  busy: "bg-red-500",
};

const ChatAvatar = ({
  name = "",
  role = "agent",
  status = "online",
  size = "md",
  showStatus = true,
}) => {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const isAI = role === "ai";
  const isCustomer = role === "customer";

  const sizes = {
    sm: "w-7 h-7 text-[10px]",
    md: "w-9 h-9 text-[12px]",
    lg: "w-11 h-11 text-[13px]",
  };

  const dotSizes = {
    sm: "w-2 h-2 border-[1.5px]",
    md: "w-2.5 h-2.5 border-2",
    lg: "w-3 h-3 border-2",
  };

  return (
    <div className="relative shrink-0">
      <div
        className={`${sizes[size]} rounded-xl flex items-center justify-center font-bold select-none
          ${isAI ? "bg-black text-white" : isCustomer ? "bg-neutral-800 text-white" : "bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-600"}`}
      >
        {isAI ? (
          <span className="material-symbols-outlined text-[15px]">
            smart_toy
          </span>
        ) : (
          initials
        )}
      </div>
      {showStatus && !isAI && (
        <span
          className={`absolute -bottom-0.5 -right-0.5 rounded-full border-white dark:border-[#1a1a1a] ${dotSizes[size]} ${statusColors[status] || statusColors.offline}`}
        />
      )}
    </div>
  );
};

export default ChatAvatar;
