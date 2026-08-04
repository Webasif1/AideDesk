import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import ChatBubble from "./ChatBubble";
import ChatInput from "./ChatInput";
import ChatHeader from "./ChatHeader";
import TicketConfirmModal from "./TicketConfirmModal";
import { useChat } from "../hooks/useChat";
import { joinChat, leaveChat } from "../../../lib/socket";
import { clearMessages } from "../../message/state/message.slice";

// Backend message role is `user` | `agent` | `ai`. Map it to the display roles
// ChatBubble/ChatAvatar understand (`customer` | `agent` | `ai`).
// `customerLabel` is what a customer message is credited to — "You" in the
// customer's own view, the customer's name when staff read the thread.
const senderFromMessage = (msg, customerLabel = "You") => {
  const r = msg.role || msg.senderType;
  if (r === "ai" || r === "copilot")
    return { role: "ai", name: "AideDesk AI", status: "online" };
  if (r === "agent")
    return {
      role: "agent",
      name: msg.sender?.name || "Support Agent",
      status: msg.sender?.status || "online",
    };
  return {
    role: "customer",
    name: msg.sender?.name || customerLabel,
    status: "online",
  };
};

const DateDivider = ({ label }) => (
  <div className="flex items-center gap-[10px] my-[8px] px-[4px]">
    <div className="flex-1 h-px bg-neutral-100 dark:bg-neutral-800" />
    <span className="text-[10px] text-neutral-400 font-semibold uppercase tracking-widest shrink-0">
      {label}
    </span>
    <div className="flex-1 h-px bg-neutral-100 dark:bg-neutral-800" />
  </div>
);

const ChatWindow = ({ conversation, onClose }) => {
  const dispatch = useDispatch();
  const bottomRef = useRef(null);

  const {
    sendCopilotMessage,
    confirmTicket,
    cancelTicketDraft,
    getChat,
    ticketDraft,
    loading,
  } = useChat();

  const messages = useSelector((s) => s.message.messages);
  const role = useSelector((s) => s.auth.role);
  const copilotTyping = useSelector(
    (s) => conversation && s.socket.copilotTyping[conversation._id]
  );
  const typingUsers = useSelector(
    (s) => conversation && s.socket.typingByChat[conversation._id]
  );

  // Load chat + messages on conversation change
  useEffect(() => {
    if (!conversation?._id) {
      dispatch(clearMessages());
      return;
    }
    getChat(conversation._id).catch(() => {});
    joinChat(conversation._id);
    return () => leaveChat(conversation._id);
  }, [conversation?._id, dispatch, getChat]);

  // Scroll to bottom on new messages or typing
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, copilotTyping]);

  const handleSend = async ({ content, attachment }) => {
    if (!conversation?._id) return;

    if (role === "customer") {
      await sendCopilotMessage({
        chatId: conversation._id,
        content,
        attachment,
      }).catch(() => {});
    } else {
      // Agent path: use plain message endpoint
      const { sendMessage } = await import("../../message/services/message.api");
      await sendMessage({
        chatId: conversation._id,
        content,
      }).catch(() => {});
    }
  };

  if (!conversation) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-neutral-50 dark:bg-[#111] gap-[12px]">
        <div className="w-16 h-16 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
          <span className="material-symbols-outlined text-[32px] text-neutral-300 dark:text-neutral-600">
            chat_bubble_outline
          </span>
        </div>
        <p className="text-[14px] font-semibold text-neutral-500 dark:text-neutral-400">
          Select a conversation
        </p>
        <p className="text-[12px] text-neutral-400">
          Choose a chat from the list to get started
        </p>
      </div>
    );
  }

  const customerLabel =
    role === "customer" ? "You" : conversation.user?.name || "Customer";

  const someoneTyping =
    !!copilotTyping ||
    (typingUsers && Object.keys(typingUsers || {}).length > 0);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <ChatHeader conversation={conversation} onClose={onClose} />

      <div
        className="flex-1 overflow-y-auto px-[20px] py-[20px] flex flex-col gap-[2px] bg-neutral-50 dark:bg-[#111]"
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: "#e5e5e5 transparent",
        }}
      >
        {loading && messages.length === 0 ? (
          <div className="flex-1 flex flex-col gap-[16px] pt-[8px]">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={`flex items-end gap-[8px] ${i % 2 === 0 ? "flex-row-reverse" : ""}`}
              >
                <div className="w-7 h-7 rounded-xl bg-neutral-200 dark:bg-neutral-700 animate-pulse shrink-0" />
                <div
                  className={`h-[40px] rounded-2xl bg-neutral-200 dark:bg-neutral-700 animate-pulse ${i % 2 === 0 ? "rounded-br-[4px]" : "rounded-bl-[4px]"}`}
                  style={{
                    width: `${120 + i * 40}px`,
                    animationDelay: `${i * 0.1}s`,
                  }}
                />
              </div>
            ))}
          </div>
        ) : (
          <>
            <DateDivider label="Today" />

            {messages.map((msg, idx) => {
              const prevMsg = messages[idx - 1];
              const sender = senderFromMessage(msg, customerLabel);
              const prevSender = prevMsg
                ? senderFromMessage(prevMsg, customerLabel)
                : null;
              const showAvatar =
                !prevSender || prevSender.role !== sender.role;
              // Side is decided by who spoke, not by who is watching: the
              // customer is always on the right, AI and agents always on the
              // left. Staff reading a thread see the same layout the customer
              // does, so a transcript reads identically for everyone.
              const isOwn = sender.role === "customer";

              return (
                <div
                  key={msg._id || msg.id}
                  className={showAvatar ? "mt-[10px]" : "mt-[2px]"}
                >
                  <ChatBubble
                    message={{
                      ...msg,
                      sender,
                      text: msg.content || msg.text,
                      time: msg.createdAt
                        ? new Date(msg.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : msg.time,
                    }}
                    isOwn={isOwn}
                    showStatus={isOwn && role === "customer"}
                    showAvatar={showAvatar}
                    animate={true}
                  />
                </div>
              );
            })}

            {someoneTyping && (
              <div className="mt-[10px]">
                <ChatBubble
                  message={{
                    sender: {
                      role: copilotTyping ? "ai" : "customer",
                      name: copilotTyping ? "AideDesk AI" : "Customer",
                    },
                    text: "",
                    time: "",
                  }}
                  isOwn={false}
                  isTyping={true}
                  showAvatar={true}
                  animate={true}
                />
              </div>
            )}

            <div ref={bottomRef} />
          </>
        )}
      </div>

      <ChatInput onSend={handleSend} disabled={loading} />

      {ticketDraft && ticketDraft.chatId === conversation._id && (
        <TicketConfirmModal
          draft={ticketDraft}
          onConfirm={(edited) =>
            confirmTicket({
              chatId: conversation._id,
              ticketDraft: edited,
            }).catch(() => {})
          }
          onCancel={cancelTicketDraft}
        />
      )}
    </div>
  );
};

export default ChatWindow;
