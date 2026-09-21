import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import Button from "../../../../components/ui/Button";
import { toast } from "../../../../components/ui/toast";
import { sendMessage, requestAiSuggestions } from "../../../message/services/message.api";
import { formatClock, customerName, initialsOf } from "../../../../lib/format";

const Attachments = ({ items = [] }) =>
  items.length ? (
    <div className="flex flex-col gap-1.5">
      {items.map((a, i) => (
        <a
          key={a.url || i}
          href={a.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2.5 w-[240px] max-w-full p-2 pr-3 rounded-xl text-[13px] font-semibold bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-on-surface"
        >
          <span aria-hidden="true" className="w-9 h-9 shrink-0 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-brand dark:text-sage flex items-center justify-center material-symbols-outlined text-[18px]">
            {a.mimetype?.startsWith("image/") ? "image" : "attach_file"}
          </span>
          <span className="truncate">{a.filename || "Attachment"}</span>
        </a>
      ))}
    </div>
  ) : null;

// Customer and AI messages sit on the left, staff replies on the right, and
// system notices (hand-overs) run across the thread as a divider.
const Message = ({ m, name, staff }) => {
  if (m.role === "system") {
    return (
      <div className="flex items-center gap-2.5 text-[12px] text-neutral-500">
        <span className="flex-1 h-px bg-neutral-200 dark:bg-neutral-800" />
        <span className="text-center max-w-[70%]">{m.content}</span>
        <span className="flex-1 h-px bg-neutral-200 dark:bg-neutral-800" />
      </div>
    );
  }
  const ai = m.role === "ai";
  return (
    <div className={`flex gap-3 ${staff ? "flex-row-reverse" : ""}`}>
      <span
        aria-hidden="true"
        className={`w-[34px] h-[34px] shrink-0 rounded-full text-[12px] font-bold flex items-center justify-center ${
          staff ? "bg-brand text-mint dark:bg-sage dark:text-forest-950" : "bg-mint text-brand dark:bg-forest-800 dark:text-mint"
        }`}
      >
        {ai ? <span className="material-symbols-outlined text-[16px]">auto_awesome</span> : initialsOf(name)}
      </span>
      <div className={`flex flex-col gap-1.5 max-w-[480px] min-w-0 ${staff ? "items-end" : ""}`}>
        <div className="text-[12px] text-neutral-500">
          <span className="font-semibold text-on-surface">{name}</span> · {formatClock(m.createdAt)}
        </div>
        <div
          className={`px-4 py-3 text-[14px] leading-[1.55] whitespace-pre-wrap break-words ${
            staff
              ? "rounded-[18px_4px_18px_18px] bg-brand text-mint dark:bg-sage dark:text-forest-950"
              : "rounded-[4px_18px_18px_18px] bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-on-surface"
          }`}
        >
          {m.content}
        </div>
        <Attachments items={m.attachments} />
      </div>
    </div>
  );
};

const TicketThread = ({ ticket, messages, onSent }) => {
  const role = useSelector((s) => s.auth.role);
  const me = useSelector((s) => s.auth.user);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [suggesting, setSuggesting] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const endRef = useRef(null);

  const chat = typeof ticket.chat === "object" ? ticket.chat : null;
  const customer = customerName(ticket.customerId);
  const agentId = ticket.assignedAgent?._id;

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length]);

  const nameFor = (m) => {
    if (m.role === "user") return customer;
    if (m.role === "ai") return "AI copilot";
    if (String(m.sender) === String(me?._id)) return "You";
    if (agentId && String(m.sender) === String(agentId)) return ticket.assignedAgent.name || "Agent";
    return m.senderModel === "admin" ? "Admin" : "Agent";
  };

  // Why the composer is off, if it is. Each maps to a refusal the API would
  // otherwise return after the agent had typed a reply.
  const blocked = !chat
    ? "This ticket has no conversation to reply in."
    : chat.status === "closed"
      ? "This conversation is closed."
      : ticket.status === "forced_closed"
        ? "The customer's account was deleted."
        : "";

  const lastCustomerMsg = [...messages].reverse().find((m) => m.role === "user");

  const send = async (e) => {
    e.preventDefault();
    const content = draft.trim();
    if (!content || blocked) return;
    setSending(true);
    try {
      const res = await sendMessage({ chat: chat._id, content });
      setDraft("");
      setSuggestions([]);
      onSent?.(res.data);
    } catch (err) {
      toast(err.response?.data?.message || "Couldn't send your reply.", { type: "error" });
    } finally {
      setSending(false);
    }
  };

  const suggest = async () => {
    if (!lastCustomerMsg) return;
    setSuggesting(true);
    try {
      const res = await requestAiSuggestions(lastCustomerMsg._id);
      setSuggestions(res.data?.suggestions || []);
      if (!res.data?.suggestions?.length) toast("No suggestions came back for this message.");
    } catch (err) {
      toast(err.response?.data?.message || "Couldn't get suggestions.", { type: "error" });
    } finally {
      setSuggesting(false);
    }
  };

  return (
    <section aria-label="Conversation" className="flex-1 min-w-[420px] flex flex-col border-r border-neutral-200 dark:border-neutral-800">
      <div className="flex-1 overflow-y-auto px-7 py-6 flex flex-col gap-[18px]">
        {/* The ticket body is the customer's opening words; it isn't stored as
            a chat message, so it leads the thread here. */}
        <Message
          m={{ role: "user", content: ticket.description, createdAt: ticket.createdAt, attachments: ticket.attachments }}
          name={customer}
          staff={false}
        />
        {ticket.aiSummary && (
          <div className="flex gap-2.5 p-4 rounded-2xl bg-mint/60 dark:bg-forest-800 text-[13px] leading-[1.55] text-on-surface">
            <span aria-hidden="true" className="material-symbols-outlined text-[18px] text-brand dark:text-sage">auto_awesome</span>
            <div>
              <div className="font-semibold mb-0.5">AI escalation briefing</div>
              {ticket.aiSummary}
            </div>
          </div>
        )}
        {messages.map((m) => (
          <Message key={m._id} m={m} name={nameFor(m)} staff={m.role === "agent"} />
        ))}
        <div ref={endRef} />
      </div>

      <form onSubmit={send} className="m-5 mt-0 rounded-2xl bg-white dark:bg-[#0b2b26] border border-neutral-300 dark:border-neutral-700 shadow-[0_8px_24px_rgba(5,31,32,0.06)]">
        {suggestions.length > 0 && (
          <div className="flex flex-col gap-1.5 p-2.5 pb-0">
            {suggestions.map((s, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setDraft(s.reply)}
                className="text-left p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-[13px] text-on-surface"
              >
                <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-neutral-500">{s.tone || "Suggestion"}</span>
                <span className="block line-clamp-2">{s.reply}</span>
              </button>
            ))}
          </div>
        )}
        <label className="block px-4 py-2.5">
          <span className="sr-only">Reply to {customer}</span>
          <textarea
            rows={2}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) send(e);
            }}
            disabled={!!blocked}
            maxLength={5000}
            placeholder={blocked || `Reply to ${customer}…`}
            className="w-full resize-none bg-transparent text-[14px] text-on-surface placeholder:text-neutral-500 focus:outline-none disabled:cursor-not-allowed"
          />
        </label>
        <div className="flex items-center gap-2 px-2.5 py-2 border-t border-neutral-100 dark:border-neutral-800">
          {/* The suggest endpoint is agent-only and works off a customer message. */}
          {role === "agent" && lastCustomerMsg && !blocked && (
            <Button type="button" variant="secondary" size="sm" icon="auto_awesome" loading={suggesting} onClick={suggest}>
              Suggest reply
            </Button>
          )}
          <span className="flex-1 text-[12px] text-neutral-500 pl-1 hidden md:block">Ctrl + Enter to send</span>
          <Button type="submit" size="sm" icon="send" loading={sending} disabled={!draft.trim() || !!blocked}>
            Send
          </Button>
        </div>
      </form>
    </section>
  );
};

export default TicketThread;
