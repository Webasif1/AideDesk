import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import ChatAvatar from "./ChatAvatar";
import {
  conversationCreatedBy,
  conversationCustomer,
  conversationIsUnreadFor,
  conversationPresence,
  conversationPriorityRank,
  conversationSubtitle,
  conversationTag,
  conversationTicket,
  conversationTitle,
} from "../lib/conversation";

const formatTime = (date) => {
  if (!date) return "";
  const diff = Date.now() - new Date(date).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "now";
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
};


const FILTERS = ["All", "Mine", "Unread", "Priority"];

const ChatConversationList = ({
  conversations = [],
  activeId,
  onSelect,
  emptyLabel = "No conversations yet.",
}) => {
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const myId = useSelector((s) => s.auth.user?.id || s.auth.user?._id);

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();

    let list = conversations.filter((conv) => {
      if (!term) return true;
      const customer = conversationCustomer(conv);
      return [
        conversationTitle(conv),
        conversationSubtitle(conv),
        customer.name,
        customer.email,
        conv.latestMessage?.content,
      ]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(term));
    });

    // Mine  → tickets this staff member raised on a customer's behalf.
    // Unread→ conversations they have never opened.
    if (filter === "Mine") {
      list = list.filter((conv) => conversationCreatedBy(conv, myId));
    } else if (filter === "Unread") {
      list = list.filter((conv) => conversationIsUnreadFor(conv, myId));
    } else if (filter === "Priority") {
      // Sort rather than filter — urgent first, then newest within a priority.
      list = [...list].sort(
        (a, b) =>
          conversationPriorityRank(a) - conversationPriorityRank(b) ||
          new Date(b.lastActivity || b.updatedAt || 0) -
            new Date(a.lastActivity || a.updatedAt || 0)
      );
    }

    return list;
  }, [conversations, filter, search, myId]);

  const emptyMessage =
    conversations.length === 0
      ? emptyLabel
      : search.trim()
        ? `Nothing matches "${search.trim()}".`
        : `No conversations under "${filter}".`;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-[16px] pt-[20px] pb-[12px] border-b border-neutral-100 dark:border-neutral-800">
        <div className="flex items-center justify-between mb-[12px]">
          <h2 className="text-[15px] font-bold text-black dark:text-white">Conversations</h2>
          <button className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
            <span className="material-symbols-outlined text-[18px] text-neutral-400">
              edit_square
            </span>
          </button>
        </div>
        {/* Search */}
        <div className="flex items-center bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg px-[10px] py-[6px] gap-[6px] focus-within:border-black dark:focus-within:border-white transition-all">
          <span className="material-symbols-outlined text-neutral-400 text-[16px]">
            search
          </span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent text-[12px] text-black dark:text-white outline-none placeholder:text-neutral-400 dark:placeholder:text-neutral-500 w-full"
            placeholder="Search conversations..."
          />
        </div>
      </div>

      {/* Filter pills */}
      <div className="flex gap-[6px] px-[16px] py-[10px] border-b border-neutral-100 dark:border-neutral-800 overflow-x-auto scrollbar-none">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`shrink-0 text-[11px] font-semibold px-[10px] py-[4px] rounded-full transition-all ${
              filter === f
                ? "bg-black dark:bg-white text-white dark:text-black"
                : "bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {visible.length === 0 && (
          <div className="px-4 py-8 text-center text-[12px] text-neutral-400">
            {emptyMessage}
          </div>
        )}
        {visible.map((conv, idx) => {
          const isActive = conv._id === activeId;
          const customer = conversationCustomer(conv);
          const title = conversationTitle(conv);
          const subtitle = conversationSubtitle(conv);
          const ticket = conversationTicket(conv);
          const lastText =
            conv.latestMessage?.content || "No messages yet";
          const tag = conversationTag(conv);
          return (
            <button
              key={conv._id}
              onClick={() => onSelect(conv)}
              className={`w-full text-left flex items-start gap-[10px] px-[16px] py-[12px] transition-all border-b border-neutral-50 dark:border-neutral-800 relative
                ${isActive ? "bg-neutral-100 dark:bg-neutral-800" : "hover:bg-neutral-50 dark:hover:bg-neutral-800/50"}
              `}
              style={{
                animation: `listIn 0.25s ease-out both`,
                animationDelay: `${idx * 0.04}s`,
              }}
            >
              <ChatAvatar
                name={customer.name}
                role="customer"
                status={conversationPresence(conv)}
                size="md"
              />

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-[2px]">
                  <span
                    className={`text-[13px] font-semibold truncate ${isActive ? "text-black dark:text-white" : "text-neutral-800 dark:text-neutral-200"}`}
                  >
                    {title}
                  </span>
                  <span className="text-[10px] text-neutral-400 shrink-0 ml-[4px]">
                    {formatTime(conv.lastActivity || conv.updatedAt)}
                  </span>
                </div>
                {subtitle && (
                  <p className="text-[10px] text-neutral-400 truncate leading-tight">
                    {subtitle}
                  </p>
                )}
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate leading-tight">
                  {lastText}
                </p>
                <div className="flex items-center gap-[6px] mt-[5px]">
                  <span
                    className={`text-[9px] font-bold px-[6px] py-[2px] rounded-full uppercase tracking-wide ${tag.color}`}
                  >
                    {tag.label}
                  </span>
                  {ticket && (
                    <span className="text-[9px] font-bold px-[6px] py-[2px] rounded-full uppercase tracking-wide bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
                      Ticket
                    </span>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <style>{`
        @keyframes listIn {
          from { opacity: 0; transform: translateX(-8px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        .scrollbar-none { scrollbar-width: none; }
        .scrollbar-none::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
};

export default ChatConversationList;
