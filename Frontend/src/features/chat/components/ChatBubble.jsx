import { useState } from "react";
import ChatAvatar from "./ChatAvatar";

const TypingIndicator = () => (
  <div className="flex items-center gap-[3px] px-[14px] py-[10px]">
    {[0, 1, 2].map((i) => (
      <span
        key={i}
        className="w-[6px] h-[6px] rounded-full bg-neutral-400 dark:bg-neutral-600 inline-block"
        style={{
          animation: `typingBounce 1.2s ease-in-out infinite`,
          animationDelay: `${i * 0.18}s`,
        }}
      />
    ))}
  </div>
);

const ChatBubble = ({
  message,
  isOwn = false,
  isTyping = false,
  showAvatar = true,
  animate = true,
  // Delivery ticks belong to the person who sent the message. Right-aligned is
  // not the same as authored-by-you (staff see customer bubbles on the right
  // too), so this is opt-in rather than derived from `isOwn`.
  showStatus = false,
}) => {
  const [hovered, setHovered] = useState(false);

  const { sender, text, time, status, attachments = [] } = message || {};

  const isAgent = sender?.role === "agent";
  const isAI = sender?.role === "ai";
  const isMine = isOwn;

  return (
    <div
      className={`flex items-end gap-[8px] group ${isMine ? "flex-row-reverse" : "flex-row"}`}
      style={{
        animation: animate
          ? "bubbleIn 0.22s cubic-bezier(0.34,1.56,0.64,1) both"
          : "none",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Avatar */}
      {showAvatar ? (
        <ChatAvatar
          name={sender?.name}
          role={sender?.role}
          status={sender?.status}
          size="sm"
        />
      ) : (
        <div className="w-7 shrink-0" />
      )}

      <div
        className={`flex flex-col gap-[4px] max-w-[72%] ${isMine ? "items-end" : "items-start"}`}
      >
        {/* Sender name + time */}
        {showAvatar && (
          <div
            className={`flex items-center gap-[6px] ${isMine ? "flex-row-reverse" : ""}`}
          >
            <span className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400">
              {sender?.name}
              {isAI && (
                <span className="ml-[6px] text-[9px] font-bold uppercase tracking-widest bg-black dark:bg-white text-white dark:text-black px-[5px] py-[1px] rounded-full">
                  AI
                </span>
              )}
            </span>
            <span className="text-[10px] text-neutral-300 dark:text-neutral-600">{time}</span>
          </div>
        )}

        {/* Bubble */}
        <div
          className={`relative rounded-2xl px-[14px] py-[10px] text-[13px] leading-relaxed transition-all
            ${
              isMine
                ? "bg-black dark:bg-white text-white dark:text-black rounded-br-[4px]"
                : "bg-white dark:bg-[#222] border border-neutral-200 dark:border-neutral-700 text-neutral-800 dark:text-white rounded-bl-[4px] shadow-sm dark:shadow-none"
            }
            ${isTyping ? "py-0 px-0 bg-white dark:bg-[#222] border border-neutral-200 dark:border-neutral-700 rounded-bl-[4px]" : ""}
          `}
        >
          {isTyping ? (
            <TypingIndicator />
          ) : (
            <>
              {text && (
                <p className="whitespace-pre-wrap break-words">{text}</p>
              )}
              {attachments.length > 0 && (
                <div className="flex flex-col gap-[6px] mt-[8px]">
                  {/* Fields are filename/mimetype per message.model.js. This
                      read a.name and a.type, neither of which exists, so every
                      chip rendered blank with a generic icon — and it was a
                      div, so the file could not be opened at all.
                      TicketSummaryCard is the reference implementation. */}
                  {attachments.map((a, i) => (
                    <a
                      key={a.url || i}
                      href={a.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center gap-[8px] rounded-lg px-[10px] py-[8px] text-[12px] transition-colors
                        ${isMine ? "bg-white/10 dark:bg-black/20 hover:bg-white/20 dark:hover:bg-black/30" : "bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800"}`}
                    >
                      <span
                        className="material-symbols-outlined text-[16px]"
                        aria-hidden="true"
                      >
                        {a.mimetype?.startsWith("image/") ? "image" : "attach_file"}
                      </span>
                      <span className="truncate">{a.filename || "Attachment"}</span>
                    </a>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Status tick (only under messages the viewer sent) */}
        {showStatus && !isTyping && (
          <div className="flex items-center gap-[3px] text-[10px] text-neutral-400 dark:text-neutral-600">
            <span className="material-symbols-outlined text-[13px]">
              {status === "read"
                ? "done_all"
                : status === "delivered"
                  ? "done_all"
                  : "done"}
            </span>
            <span>
              {status === "read"
                ? "Read"
                : status === "delivered"
                  ? "Delivered"
                  : "Sent"}
            </span>
          </div>
        )}
      </div>

      {/* Hover timestamp (compact) */}
      <span
        className={`text-[10px] text-neutral-300 dark:text-neutral-600 transition-opacity self-center ${hovered ? "opacity-100" : "opacity-0"}`}
      >
        {!showAvatar && time}
      </span>

      <style>{`
        @keyframes bubbleIn {
          from { opacity: 0; transform: translateY(8px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)   scale(1); }
        }
        @keyframes typingBounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30%            { transform: translateY(-5px); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default ChatBubble;
