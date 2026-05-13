import ChatAvatar from "./ChatAvatar";

const InfoRow = ({ label, value, icon }) => (
  <div className="flex items-start gap-[10px] py-[10px] border-b border-neutral-50 dark:border-neutral-800 last:border-0">
    <span className="material-symbols-outlined text-[16px] text-neutral-300 dark:text-neutral-600 mt-[1px] shrink-0">
      {icon}
    </span>
    <div>
      <p className="text-[10px] text-neutral-400 uppercase tracking-widest font-semibold mb-[1px]">
        {label}
      </p>
      <p className="text-[12px] text-neutral-700 dark:text-neutral-200 font-medium">{value}</p>
    </div>
  </div>
);

const ChatCustomerInfo = ({ conversation }) => {
  if (!conversation) return null;

  const { customer, tag } = conversation;

  const ticketHistory = [
    {
      id: "#AD-4415",
      subject: "Payment failed",
      status: "Resolved",
      date: "Mar 12",
    },
    {
      id: "#AD-3901",
      subject: "Plan upgrade query",
      status: "Closed",
      date: "Jan 28",
    },
    {
      id: "#AD-3412",
      subject: "Login issue",
      status: "Resolved",
      date: "Dec 05",
    },
  ];

  return (
    <div
      className="flex flex-col h-full overflow-y-auto"
      style={{
        animation: "slideLeft 0.2s ease-out both",
        scrollbarWidth: "none",
      }}
    >
      {/* Profile */}
      <div className="px-[20px] py-[24px] border-b border-neutral-100 dark:border-neutral-800 flex flex-col items-center text-center">
        <ChatAvatar
          name={customer.name}
          role="customer"
          status={customer.status}
          size="lg"
        />
        <h3 className="text-[15px] font-bold text-black dark:text-white mt-[12px]">
          {customer.name}
        </h3>
        <p className="text-[12px] text-neutral-500 dark:text-neutral-400 mt-[2px]">
          Customer · Growth Plan
        </p>
        <div className="flex items-center gap-[6px] mt-[10px]">
          <span
            className={`text-[9px] font-bold px-[8px] py-[3px] rounded-full uppercase tracking-wide ${conversation.tagColor}`}
          >
            {tag}
          </span>
          {conversation.priority === "high" && (
            <span className="text-[9px] font-bold px-[8px] py-[3px] rounded-full uppercase tracking-wide bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400">
              High Priority
            </span>
          )}
        </div>
      </div>

      {/* Details */}
      <div className="px-[20px] py-[4px] border-b border-neutral-100 dark:border-neutral-800">
        <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mt-[12px] mb-[4px]">
          Contact Info
        </p>
        <InfoRow icon="mail" label="Email" value="priya.sharma@email.com" />
        <InfoRow icon="phone" label="Phone" value="+91 98765 43210" />
        <InfoRow icon="language" label="Timezone" value="IST (UTC+5:30)" />
        <InfoRow
          icon="calendar_today"
          label="Customer since"
          value="October 2023"
        />
      </div>

      {/* Ticket history */}
      <div className="px-[20px] py-[12px] border-b border-neutral-100 dark:border-neutral-800">
        <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-[10px]">
          Previous Tickets
        </p>
        <div className="flex flex-col gap-[6px]">
          {ticketHistory.map((t) => (
            <div
              key={t.id}
              className="flex items-center justify-between bg-neutral-50 dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700 rounded-lg px-[10px] py-[8px] hover:border-neutral-300 dark:hover:border-neutral-500 transition-colors cursor-pointer"
            >
              <div>
                <p className="text-[11px] font-semibold text-black dark:text-white">{t.id}</p>
                <p className="text-[10px] text-neutral-500 dark:text-neutral-400 truncate max-w-[110px]">
                  {t.subject}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[9px] font-bold text-emerald-600">
                  {t.status}
                </p>
                <p className="text-[9px] text-neutral-400">{t.date}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick actions */}
      <div className="px-[20px] py-[12px]">
        <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-[10px]">
          Actions
        </p>
        <div className="flex flex-col gap-[6px]">
          {[
            { icon: "confirmation_number", label: "Create Ticket" },
            { icon: "note_add", label: "Add Note" },
            { icon: "block", label: "Block User", danger: true },
          ].map((a) => (
            <button
              key={a.label}
              className={`w-full flex items-center gap-[8px] px-[10px] py-[8px] rounded-lg border text-[12px] font-medium transition-colors text-left
                ${
                  a.danger
                    ? "border-red-100 dark:border-red-900 text-red-500 hover:bg-red-50 dark:hover:bg-red-950"
                    : "border-neutral-100 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 hover:border-neutral-200 dark:hover:border-neutral-600"
                }`}
            >
              <span
                className={`material-symbols-outlined text-[16px] ${a.danger ? "text-red-400" : "text-neutral-400"}`}
              >
                {a.icon}
              </span>
              {a.label}
            </button>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes slideLeft {
          from { opacity: 0; transform: translateX(12px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
};

export default ChatCustomerInfo;
