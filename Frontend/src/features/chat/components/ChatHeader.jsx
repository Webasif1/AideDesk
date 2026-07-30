import ChatAvatar from "./ChatAvatar";
import {
  conversationCustomer,
  conversationPresence,
  conversationTag,
} from "../lib/conversation";

const ChatHeader = ({ conversation, onClose }) => {
  if (!conversation) return null;

  const customer = conversationCustomer(conversation);
  const tag = conversationTag(conversation);
  const presence = conversationPresence(conversation);

  const actions = [
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
          name={customer.name}
          role="customer"
          status={presence}
          size="md"
          showStatus
        />

        <div>
          <div className="flex items-center gap-[8px]">
            <h3 className="text-[14px] font-semibold text-black dark:text-white">
              {customer.name}
            </h3>
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
          </p>
        </div>
      </div>

      {/* Right: action buttons */}
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
