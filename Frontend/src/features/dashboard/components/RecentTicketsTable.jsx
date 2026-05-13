const tickets = [
  {
    agent: "Sarah J.",
    initials: "SJ",
    id: "#AD-4521",
    subject: "Billing Inquiry: Pro Plan Upgrade",
    status: "New",
    time: "2 mins ago",
    ai: false,
  },
  {
    agent: "Michael K.",
    initials: "MK",
    id: "#AD-4518",
    subject: "API Webhook Failure",
    status: "In Progress",
    time: "14 mins ago",
    ai: false,
  },
  {
    agent: "AideBot",
    initials: "AI",
    id: "#AD-4515",
    subject: "Resetting User Password",
    status: "Resolved",
    time: "28 mins ago",
    ai: true,
  },
  {
    agent: "David L.",
    initials: "DL",
    id: "#AD-4512",
    subject: "Dashboard Load Issues",
    status: "In Progress",
    time: "1 hour ago",
    ai: false,
  },
  {
    agent: "AideBot",
    initials: "AI",
    id: "#AD-4509",
    subject: "Pricing Page Info Request",
    status: "Resolved",
    time: "2 hours ago",
    ai: true,
  },
];

const statusStyle = {
  New: "bg-black dark:bg-white text-white dark:text-black",
  "In Progress": "bg-neutral-200 dark:bg-neutral-700 text-black dark:text-white",
  Resolved: "border border-neutral-200 dark:border-neutral-700 text-neutral-400 dark:text-neutral-500",
};

const RecentTicketsTable = () => {
  return (
    <div className="lg:col-span-3 bg-white dark:bg-[#1a1a1a] border border-neutral-200 dark:border-neutral-700 rounded-xl overflow-hidden">
      <div className="p-[24px] border-b border-neutral-100 dark:border-neutral-800 flex justify-between items-center">
        <h4 className="font-bold text-black dark:text-white">Recent Ticket Updates</h4>
        <button className="text-[12px] font-semibold text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white transition-colors">
          View All
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-neutral-50 dark:bg-neutral-800 text-[11px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
            <tr>
              <th className="px-[24px] py-[16px]">Agent</th>
              <th className="px-[24px] py-[16px]">Ticket ID</th>
              <th className="px-[24px] py-[16px]">Subject</th>
              <th className="px-[24px] py-[16px]">Status</th>
              <th className="px-[24px] py-[16px]">Timestamp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {tickets.map((t) => (
              <tr key={t.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
                <td className="px-[24px] py-[16px]">
                  <div className="flex items-center gap-[12px]">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold border ${t.ai ? "bg-black dark:bg-white text-white dark:text-black border-black dark:border-white" : "bg-neutral-100 dark:bg-neutral-800 text-black dark:text-white border-neutral-200 dark:border-neutral-700"}`}
                    >
                      {t.initials}
                    </div>
                    <span className="text-[13px] font-medium text-black dark:text-white">{t.agent}</span>
                  </div>
                </td>
                <td className="px-[24px] py-[16px] text-[11px] font-mono font-bold text-neutral-400 dark:text-neutral-500">
                  {t.id}
                </td>
                <td className="px-[24px] py-[16px] text-[13px] text-black dark:text-white">{t.subject}</td>
                <td className="px-[24px] py-[16px]">
                  <span
                    className={`px-[8px] py-[4px] text-[10px] font-bold rounded-lg ${statusStyle[t.status]}`}
                  >
                    {t.status}
                  </span>
                </td>
                <td className="px-[24px] py-[16px] text-[11px] text-neutral-500 dark:text-neutral-400">
                  {t.time}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentTicketsTable;
