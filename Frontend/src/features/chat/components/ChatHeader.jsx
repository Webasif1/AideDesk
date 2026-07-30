import { useSelector } from "react-redux";
import ChatAvatar from "./ChatAvatar";
<<<<<<< HEAD
import {
  conversationCustomer,
  conversationPresence,
  conversationTag,
} from "../lib/conversation";
=======
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
>>>>>>> aae7b5cb8fd64ce2fd9c76e4a3b10a264c39f62f

const ChatHeader = ({ conversation, onClose }) => {
  const role = useSelector((s) => s.auth.role);
  if (!conversation) return null;

<<<<<<< HEAD
  const customer = conversationCustomer(conversation);
  const tag = conversationTag(conversation);
  const presence = conversationPresence(conversation);
=======
  const isCustomerView = role === "customer";
  const agent = conversation.assignedAgent; // populated when escalated
  const customer = conversation.user; // populated customer
>>>>>>> aae7b5cb8fd64ce2fd9c76e4a3b10a264c39f62f

  // Resolve the counterpart the current viewer is talking to.
  let counterpart;
  if (isCustomerView) {
    counterpart = agent
      ? {
          name: agent.name || "Support Agent",
          avatarRole: "agent",
          status: agent.status || "online",
          subtitle: STATUS_TEXT[agent.status] || "Support Agent",
        }
      : {
          name: "AideDesk Support",
          avatarRole: "ai",
          status: "online",
          subtitle: "AI Assistant · Always available",
        };
  } else {
    counterpart = {
      name: customerName(customer),
      avatarRole: "customer",
      status: customer?.status || "online",
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
<<<<<<< HEAD
          name={customer.name}
          role="customer"
          status={presence}
=======
          name={counterpart.name}
          role={counterpart.avatarRole}
          status={counterpart.status}
>>>>>>> aae7b5cb8fd64ce2fd9c76e4a3b10a264c39f62f
          size="md"
          showStatus={!isAI}
        />

        <div>
          <div className="flex items-center gap-[8px]">
            <h3 className="text-[14px] font-semibold text-black dark:text-white">
              {counterpart.name}
            </h3>
<<<<<<< HEAD
            <span
              className={`text-[9px] font-bold px-[6px] py-[2px] rounded-full uppercase tracking-wide ${tag.color}`}
            >
              {tag.label}
            </span>
          </div>
          <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-[1px] flex items-center gap-[4px]">
            <span
              className={`w-[6px] h-[6px] rounded-full inline-block ${
                presence === "online" ? "bg-emerald-500" : "bg-neutral-300"
              }`}
            />
            {customer.email ||
              (presence === "online" ? "Active now" : "Offline")}
=======
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
                      : "bg-neutral-300"
                }`}
              />
            )}
            {counterpart.subtitle}
>>>>>>> aae7b5cb8fd64ce2fd9c76e4a3b10a264c39f62f
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
