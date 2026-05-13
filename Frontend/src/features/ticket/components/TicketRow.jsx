const statusStyle = {
  "In Progress": "bg-yellow-50 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-400",
  New: "bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-400",
  Resolved: "bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-400",
  Overdue: "bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-400",
};

const priorityStyle = {
  High: "bg-black dark:bg-white text-white dark:text-black",
  Normal: "bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300",
  Low: "bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300",
};

const TicketRow = ({
  status,
  subject,
  ticketId,
  category,
  requester,
  company,
  priority,
  time,
  created,
  timeColor,
}) => (
  <tr className="hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors group">
    <td className="py-4 px-6">
      <span
        className={`px-2 py-1 text-[10px] font-bold rounded uppercase ${statusStyle[status]}`}
      >
        {status}
      </span>
    </td>
    <td className="py-4 px-6">
      <div className="flex flex-col">
        <span className="font-semibold text-black dark:text-white text-sm">{subject}</span>
        <span className="text-xs text-neutral-400">
          {ticketId} • {category}
        </span>
      </div>
    </td>
    <td className="py-4 px-6">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-neutral-400 text-[16px]">
            person
          </span>
        </div>
        <div className="flex flex-col">
          <span className="font-medium text-sm text-black dark:text-white">{requester}</span>
          <span className="text-[10px] text-neutral-500 dark:text-neutral-400">{company}</span>
        </div>
      </div>
    </td>
    <td className="py-4 px-6">
      <span
        className={`px-2 py-1 text-[10px] font-bold rounded uppercase ${priorityStyle[priority]}`}
      >
        {priority}
      </span>
    </td>
    <td className="py-4 px-6">
      <div className="flex flex-col text-[11px]">
        <span className={`font-medium ${timeColor || "text-neutral-900 dark:text-white"}`}>
          {time}
        </span>
        <span className="text-neutral-400">Created: {created}</span>
      </div>
    </td>
    <td className="py-4 px-6 text-right">
      <button className="text-neutral-400 dark:text-neutral-500 hover:text-black dark:hover:text-white opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="material-symbols-outlined">more_horiz</span>
      </button>
    </td>
  </tr>
);

export default TicketRow;
