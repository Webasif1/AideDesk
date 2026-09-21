import { accountFlagPill } from "../../../lib/accountStatus";
import { ticketPriorityTone, ticketStatusTone } from "../../../lib/format";
import Badge from "../../../components/ui/Badge";

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
  chatId,
  aiHandled,
  onOpen,
  showRequester = true,
  accountStatus,
}) => {
  const accountPill = accountFlagPill(accountStatus);
  return (
  <tr
    onClick={onOpen}
    role={chatId ? "button" : undefined}
    tabIndex={chatId ? 0 : undefined}
    onKeyDown={(e) => {
      if (chatId && (e.key === "Enter" || e.key === " ")) {
        e.preventDefault();
        onOpen?.();
      }
    }}
    title={chatId ? "Open conversation" : undefined}
    className={`transition-colors group ${
      chatId
        ? "cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800"
        : "hover:bg-neutral-50 dark:hover:bg-neutral-800"
    }`}
  >
    <td className="py-4 px-6">
      <Badge tone={ticketStatusTone(status)} dot>
        {status}
      </Badge>
    </td>
    <td className="py-4 px-6">
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-black dark:text-white text-sm">{subject}</span>
          {aiHandled && (
            <span className="text-[9px] font-bold uppercase tracking-widest bg-brand text-white dark:text-black px-[5px] py-[1px] rounded-full shrink-0">
              AI
            </span>
          )}
        </div>
        <span className="text-xs text-neutral-400">
          {ticketId} • {category}
        </span>
      </div>
    </td>
    {showRequester && (
      <td className="py-4 px-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-neutral-400 text-[16px]">
              person
            </span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-[6px]">
              <span className="font-medium text-sm text-black dark:text-white">{requester}</span>
              {accountPill && (
                <span
                  className={`text-[9px] font-bold uppercase tracking-wide px-[6px] py-[1px] rounded-full shrink-0 ${accountPill.className}`}
                >
                  {accountPill.label}
                </span>
              )}
            </div>
            <span className="text-[10px] text-neutral-500 dark:text-neutral-400">{company}</span>
          </div>
        </div>
      </td>
    )}
    <td className="py-4 px-6">
      {/* Urgent and High use different tones so the most severe tickets stand out. */}
      <Badge tone={ticketPriorityTone(priority)}>{priority}</Badge>
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
      <button
        onClick={(e) => e.stopPropagation()}
        className="text-neutral-400 dark:text-neutral-500 hover:text-black dark:hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <span className="material-symbols-outlined">
          {chatId ? "chat_bubble_outline" : "more_horiz"}
        </span>
      </button>
    </td>
  </tr>
  );
};

export default TicketRow;
