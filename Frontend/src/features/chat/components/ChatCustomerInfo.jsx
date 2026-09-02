import { useState } from "react";
import { useSelector } from "react-redux";
import ChatAvatar from "./ChatAvatar";
import CustomerNoteSticky from "./CustomerNoteSticky";
import {
  conversationCustomer,
  conversationPresence,
  conversationTag,
} from "../lib/conversation";
import { formatClock } from "../../../lib/format";

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
  const role = useSelector((s) => s.auth.role);
  const [noteOpen, setNoteOpen] = useState(false);

  const customerId = conversationCustomer(conversation).id;

  // Close the sticky when the panel switches to a different customer, so the
  // note that unmounts is saved against the person it was written for. Done
  // during render rather than in an effect so the sticky never paints one frame
  // holding the previous customer's note.
  const [prevCustomerId, setPrevCustomerId] = useState(customerId);
  if (customerId !== prevCustomerId) {
    setPrevCustomerId(customerId);
    setNoteOpen(false);
  }

  if (!conversation) return null;

  const customer = conversationCustomer(conversation);
  const tag = conversationTag(conversation);
  const presence = conversationPresence(conversation);

  // The chat document carries at most its own linked ticket; there is no
  // per-customer ticket-history endpoint yet, so show that one when present.
  const linkedTicket =
    conversation.ticket && typeof conversation.ticket === "object"
      ? conversation.ticket
      : null;

  return (
    <div
      className="flex flex-col flex-1 min-h-0 overflow-y-auto overscroll-contain"
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
          status={presence}
          size="lg"
        />
        <h3 className="text-[15px] font-bold text-black dark:text-white mt-[12px]">
          {customer.name}
        </h3>
        <p className="text-[12px] text-neutral-500 dark:text-neutral-400 mt-[2px]">
          Customer
        </p>
        <div className="flex items-center gap-[6px] mt-[10px]">
          <span
            className={`text-[9px] font-bold px-[8px] py-[3px] rounded-full uppercase tracking-wide ${tag.color}`}
          >
            {tag.label}
          </span>
          {linkedTicket?.priority === "urgent" && (
            <span className="text-[9px] font-bold px-[8px] py-[3px] rounded-full uppercase tracking-wide bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400">
              Urgent
            </span>
          )}
        </div>
      </div>

      {/* Details */}
      <div className="px-[20px] py-[4px] border-b border-neutral-100 dark:border-neutral-800">
        <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mt-[12px] mb-[4px]">
          Contact Info
        </p>
        <InfoRow icon="mail" label="Email" value={customer.email || "—"} />
        <InfoRow
          icon="forum"
          label="Messages"
          value={conversation.messageCount ?? 0}
        />
        <InfoRow
          icon="schedule"
          label="Last activity"
          value={
            conversation.lastActivity
              ? formatClock(conversation.lastActivity)
              : "—"
          }
        />
      </div>

      {/* Linked ticket */}
      <div className="px-[20px] py-[12px] border-b border-neutral-100 dark:border-neutral-800">
        <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-[10px]">
          Linked Ticket
        </p>
        {linkedTicket ? (
          <div className="flex items-center justify-between bg-neutral-50 dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700 rounded-lg px-[10px] py-[8px]">
            <div>
              <p className="text-[11px] font-semibold text-black dark:text-white">
                {linkedTicket.ticketNumber || "Ticket"}
              </p>
              <p className="text-[10px] text-neutral-500 dark:text-neutral-400 truncate max-w-[110px]">
                {linkedTicket.title}
              </p>
            </div>
            <p className="text-[9px] font-bold text-neutral-500 dark:text-neutral-400 uppercase">
              {linkedTicket.status}
            </p>
          </div>
        ) : (
          <p className="text-[11px] text-neutral-400">
            No ticket raised from this conversation.
          </p>
        )}
      </div>

      {/* Actions — admin only. The note is private to admins, so agents get no
          actions section at all. */}
      {role === "admin" && customerId && (
        <>
          <div className="px-[20px] py-[12px]">
            <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-[10px]">
              Actions
            </p>
            <button
              type="button"
              onClick={() => setNoteOpen((open) => !open)}
              className="w-full flex items-center gap-[8px] px-[10px] py-[8px] rounded-lg border border-neutral-100 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 text-[12px] font-medium text-left transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800 hover:border-neutral-200 dark:hover:border-neutral-600"
            >
              <span className="material-symbols-outlined text-[16px] text-neutral-400">
                note_add
              </span>
              {noteOpen ? "Close Note" : "Add Note"}
            </button>
          </div>

          {noteOpen && (
            <CustomerNoteSticky
              customerId={customerId}
              customerName={customer.name}
              onClose={() => setNoteOpen(false)}
            />
          )}
        </>
      )}

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
