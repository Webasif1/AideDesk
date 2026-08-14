import { useSelector } from "react-redux";
import ChatAvatar from "./ChatAvatar";
import { customerName } from "../../../lib/format";

const STATUS_TEXT = {
  online: "Active now",
  away: "Away",
  offline: "Offline",
};

const CHAT_STATUS_TAG = {
  active: { label: "Active", color: "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400" },
  waiting: { label: "Waiting", color: "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400" },
  closed: { label: "Closed", color: "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400" },
};

const ChatHeader = ({ conversation, onClose }) => {
  const role = useSelector((s) => s.auth.role);
  if (!conversation) return null;

  const isCustomerView = role === "customer";
  // Either can be the human on the other end: an agent by assignment, or an
  // admin who took the conversation over. Without the admin case the customer
  // would still see "AI Assistant" while a person is answering them.
  const human = conversation.assignedAdmin || conversation.assignedAgent;
  const customer = conversation.user; // populated customer

  // Resolve the counterpart the current viewer is talking to.
  let counterpart;
  if (isCustomerView) {
    counterpart = human
      ? {
          name: human.name || "Support Agent",
          avatarRole: "agent",
          status: human.status || "online",
          subtitle: STATUS_TEXT[human.status] || "Support Agent",
        }
      : {
          name: "AideDesk Support",
          avatarRole: "ai",
          status: "online",
          subtitle: "AI Assistant · Always available",
        };
  } else {
    // Default to offline, not online — an absent presence value means we don't
    // know they are connected, so a green dot would be a lie.
    counterpart = {
      name: customerName(customer),
      avatarRole: "customer",
      status: customer?.status === "online" ? "online" : "offline",
      subtitle: STATUS_TEXT[customer?.status] || "Offline",
    };
  }

  const isAI = counterpart.avatarRole === "ai";
  const tag = CHAT_STATUS_TAG[conversation.status];

  // Agents/admins get quick actions; the customer view stays minimal.
  const actions = isCustomerView
    ? []
    : [
        { icon: "call", label: "Call" },
        { icon: "videocam", label: "Video" },
        { icon: "info", label: "Info" },
        { icon: "more_vert", label: "More" },
      ];

  return (
    <div
      className="flex items-center justify-between px-[20px] py-[14px] border-b border-neutral-200 dark:border-neutral-700 bg-white dark:bg-[#1a1a1a]"
      style={{ animation: "headerIn 0.2s ease-out both" }}
    >
      {/* Left: avatar + name */}
      <div className="flex items-center gap-[12px]">
        {onClose && (
          <button
            onClick={onClose}
            className="p-[6px] hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors mr-[2px]"
          >
            <span className="material-symbols-outlined text-[18px] text-neutral-400 dark:text-neutral-600">
              arrow_back
            </span>
          </button>
        )}

        <ChatAvatar
          name={counterpart.name}
          role={counterpart.avatarRole}
          status={counterpart.status}
          size="md"
          showStatus={!isAI}
        />

        <div>
          <div className="flex items-center gap-[8px]">
            <h3 className="text-[14px] font-semibold text-black dark:text-white">
              {counterpart.name}
            </h3>
            {tag && !isCustomerView && (
              <span
                className={`text-[9px] font-bold px-[6px] py-[2px] rounded-full uppercase tracking-wide ${tag.color}`}
              >
                {tag.label}
              </span>
            )}
          </div>
          <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-[1px] flex items-center gap-[4px]">
            {!isAI && (
              <span
                className={`w-[6px] h-[6px] rounded-full inline-block ${
                  counterpart.status === "online"
                    ? "bg-emerald-500"
                    : counterpart.status === "away"
                      ? "bg-amber-400"
                      : "bg-neutral-400 dark:bg-neutral-600"
                }`}
              />
            )}
            {counterpart.subtitle}
          </p>
        </div>
      </div>

      {/* Right: action buttons (agent/admin only) */}
      {actions.length > 0 && (
        <div className="flex items-center gap-[2px]">
          {actions.map((a) => (
            <button
              key={a.icon}
              title={a.label}
              className="p-[8px] rounded-lg text-neutral-400 dark:text-neutral-600 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">
                {a.icon}
              </span>
            </button>
          ))}
        </div>
      )}

      <style>{`
        @keyframes headerIn {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default ChatHeader;
