import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import ChatBubble from "./ChatBubble";
import ChatInput from "./ChatInput";
import ChatHeader from "./ChatHeader";
import TicketConfirmModal from "./TicketConfirmModal";
import TicketSummaryCard from "./TicketSummaryCard";
import { useChat } from "../hooks/useChat";
import { joinChat, leaveChat } from "../../../lib/socket";
import { addMessage, clearMessages } from "../../message/state/message.slice";
import { selectIsReadOnly } from "../../auth/state/auth.slice";

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

// Real day label for a message. The divider used to be hardcoded to "Today",
// so a month-old thread still claimed every message was sent today.
const dayLabel = (date) => {
  if (!date) return "";
  const d = new Date(date);
  const startOf = (x) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const days = Math.round((startOf(new Date()) - startOf(d)) / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return d.toLocaleDateString([], { weekday: "long" });
  return d.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
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

// An event in the thread ("X has joined the chat"), not something anybody said —
// so it is centred and unattributed rather than a bubble on either side.
const SystemNotice = ({ text, time }) => (
  <div className="flex items-center justify-center my-[10px] px-[4px]">
    <span className="text-[11px] text-neutral-500 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800 rounded-full px-[12px] py-[4px]">
      {text}
      {time && (
        <span className="text-neutral-400 dark:text-neutral-600 ml-[6px]">{time}</span>
      )}
    </span>
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
    takeOverChat,
    currentChat,
    ticketDraft,
    loading,
  } = useChat();

  const [takingOver, setTakingOver] = useState(false);
  // Scoped to this send. The slice-wide `loading` flag is raised by every chat
  // request (opening a thread, refreshing the list), so using it here greyed the
  // composer during unrelated fetches and blanked the input mid-typing.
  const [sending, setSending] = useState(false);

  const messages = useSelector((s) => s.message.messages);
  const role = useSelector((s) => s.auth.role);
  const myId = useSelector((s) => s.auth.user?.id || s.auth.user?._id);
  // Suspended accounts read the thread but cannot post into it.
  const isReadOnly = useSelector(selectIsReadOnly);
  const copilotTyping = useSelector(
    (s) => conversation && s.socket.copilotTyping[conversation._id]
  );
  const typingUsers = useSelector(
    (s) => conversation && s.socket.typingByChat[conversation._id]
  );

  // Load chat + messages on conversation change. The clear has to happen on
  // every switch, not just when the pane empties: otherwise the previous
  // thread's messages stay on screen under the new conversation's header until
  // its fetch lands.
  useEffect(() => {
    dispatch(clearMessages());
    if (!conversation?._id) return;
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

    setSending(true);
    try {
      if (role === "customer") {
        await sendCopilotMessage({
          chatId: conversation._id,
          content,
          attachment,
        });
      } else {
        // Staff path: plain message endpoint. The body key is `chat`, not `chatId` —
        // that is what the controller destructures and the validator checks.
        const { sendMessage } = await import(
          "../../message/services/message.api"
        );
        const res = await sendMessage({ chat: conversation._id, content });
        // Show it straight away instead of waiting for the socket echo, which
        // only lands if this tab is actually in the chat room. addMessage
        // dedupes by _id, so arriving twice is harmless.
        if (res?.data) dispatch(addMessage(res.data));
      }
    } catch {
      // The API layer has already surfaced the failure.
    } finally {
      setSending(false);
    }
  };

  // Ownership drives the composer lock for staff. Prefer the freshly-fetched
  // `currentChat` over the list row, since taking over updates that first.
  const chat =
    currentChat && currentChat._id === conversation?._id
      ? currentChat
      : conversation;
  const idOf = (v) => (v && typeof v === "object" ? v._id : v) || null;
  const isStaff = role === "admin" || role === "agent";

  const agentId = idOf(chat?.assignedAgent);
  const adminId = idOf(chat?.assignedAdmin);
  // Nobody has picked this conversation up yet. Only an admin can now reach such
  // a chat — agents are served their assigned conversations only.
  const unassigned = !agentId && !adminId;
  const ownsChat =
    !!myId && (String(agentId) === String(myId) || String(adminId) === String(myId));

  const handleTakeOver = async () => {
    if (!conversation?._id) return;
    setTakingOver(true);
    try {
      await takeOverChat({ id: conversation._id });
    } catch {
      // handleRequest already surfaced the error into chat.error
    } finally {
      setTakingOver(false);
    }
  };

  // Staff reply only to what is assigned to them. An admin can claim any chat
  // explicitly via Take over; agents are assigned by escalation or by an admin.
  const canReply = !isStaff || ownsChat;

  // Suspension is the stricter rule and wins over the assignment lock.
  const lockedReason = isReadOnly
    ? "Your account is suspended. You can read this conversation, but you can't send messages."
    : canReply
      ? ""
      : role === "admin"
        ? unassigned
          ? "No one has picked this up yet. Take it over to reply."
          : "This conversation is assigned to someone else. Take it over to reply."
        : "This conversation is assigned to someone else.";

  // Only an admin can claim a conversation; agents claim by replying.
  const lockedAction =
    !isReadOnly && role === "admin" && !canReply
      ? { label: "Take over", onClick: handleTakeOver, pending: takingOver }
      : null;

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

  // The skeleton must not pre-empt the typing bubble. A just-created ticket is
  // exactly `loading && no messages`, which is also precisely when the customer
  // needs to see that a reply is being written.
  const showSkeleton = loading && messages.length === 0 && !someoneTyping;
  // Pinned above the thread rather than scrolled with it, so the subject stays
  // in view for the whole conversation.
  const showTicketCard = !showSkeleton && !!conversation.ticket;

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
      <ChatHeader conversation={conversation} onClose={onClose} />

      {showTicketCard && (
        <div className="shrink-0 px-[20px] pt-[20px] bg-neutral-50 dark:bg-[#111]">
          <TicketSummaryCard ticket={conversation.ticket} />
        </div>
      )}

      <div
        className={`flex-1 min-h-0 overflow-y-auto px-[20px] pb-[20px] flex flex-col gap-[2px] bg-neutral-50 dark:bg-[#111] ${
          showTicketCard ? "pt-0" : "pt-[20px]"
        }`}
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: "#e5e5e5 transparent",
        }}
      >
        {showSkeleton ? (
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
            {messages.map((msg, idx) => {
              const prevMsg = messages[idx - 1];
              // Insert a divider whenever the calendar day changes.
              const thisDay = dayLabel(msg.createdAt);
              const showDayDivider =
                !prevMsg || dayLabel(prevMsg.createdAt) !== thisDay;

              // Events are not speech — render before the bubble path, which
              // would otherwise fall through to "customer" and put a handover
              // notice in the customer's own bubble on the right.
              if (msg.role === "system") {
                return (
                  <div key={msg._id || msg.id}>
                    {showDayDivider && thisDay && <DateDivider label={thisDay} />}
                    <SystemNotice
                      text={msg.content || msg.text}
                      time={
                        msg.createdAt
                          ? new Date(msg.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : null
                      }
                    />
                  </div>
                );
              }

              const sender = senderFromMessage(msg, customerLabel);
              // A system notice breaks the run, so the next real message shows
              // its avatar again rather than being grouped across the divider.
              const prevSender =
                prevMsg && prevMsg.role !== "system"
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
                <div key={msg._id || msg.id}>
                  {showDayDivider && thisDay && <DateDivider label={thisDay} />}
                  <div className={showAvatar ? "mt-[10px]" : "mt-[2px]"}>
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

      <ChatInput
        onSend={handleSend}
        disabled={sending}
        lockedReason={lockedReason}
        lockedAction={lockedAction}
      />

      {/* A suspended customer can't confirm a ticket draft either — the write
          would be rejected server-side, so don't offer it. */}
      {ticketDraft && ticketDraft.chatId === conversation._id && !isReadOnly && (
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
