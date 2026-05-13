const roleStyle = {
  Lead: "bg-black text-white dark:bg-white dark:text-black",
  Agent: "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200",
  Admin: "bg-neutral-200 text-black border border-neutral-300 dark:bg-neutral-700 dark:text-white dark:border-neutral-600",
};

const statusConfig = {
  Online: { dot: "bg-green-500", label: "Online", text: "text-black dark:text-white" },
  Offline: {
    dot: "bg-neutral-300 dark:bg-neutral-600",
    label: "Offline",
    text: "text-neutral-500 dark:text-neutral-400",
  },
  Away: {
    dot: "bg-amber-400",
    label: "Away",
    text: "text-neutral-700 dark:text-neutral-300",
  },
  Pending: { dot: "bg-amber-400", label: "Pending", text: "text-black dark:text-white" },
};

const TeamRow = ({
  name,
  agentId,
  email,
  role,
  status,
  assigned,
  lastActive,
  pending,
}) => {
  const s = statusConfig[status] || statusConfig.Offline;
  const rs = roleStyle[role] || roleStyle.Agent;

  return (
    <tr className="hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          {pending ? (
            <div className="w-10 h-10 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center border border-dashed border-neutral-300 dark:border-neutral-600">
              <span className="material-symbols-outlined text-neutral-400 text-[20px]">
                person
              </span>
            </div>
          ) : (
            <div className="w-10 h-10 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center text-[12px] font-bold text-black dark:text-white border border-neutral-200 dark:border-neutral-600">
              {(name || "")
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2) || "?"}
            </div>
          )}
          <div>
            <p
              className={`text-sm font-semibold ${pending ? "text-neutral-400 italic" : "text-black dark:text-white"}`}
            >
              {pending ? "Invitation Sent" : name || "Unnamed"}
            </p>
            <p className="text-xs text-neutral-400 font-mono">
              {pending ? email : agentId}
            </p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${rs}`}
        >
          {role}
        </span>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${s.dot}`} />
          <span className={`text-sm ${s.text}`}>{s.label}</span>
        </div>
      </td>
      <td className="px-6 py-4">
        <span
          className={`text-sm font-medium ${pending ? "text-neutral-400" : "text-black dark:text-white"}`}
        >
          {assigned}
        </span>
      </td>
      <td className="px-6 py-4 text-sm text-neutral-500 dark:text-neutral-400">{lastActive}</td>
      <td className="px-6 py-4 text-right">
        {pending ? (
          <button className="px-3 py-1 text-xs font-semibold text-black dark:text-white border border-neutral-200 dark:border-neutral-700 rounded hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
            Resend
          </button>
        ) : (
          <button className="p-2 text-neutral-400 hover:text-black dark:hover:text-white transition-colors">
            <span className="material-symbols-outlined">more_vert</span>
          </button>
        )}
      </td>
    </tr>
  );
};

export default TeamRow;
