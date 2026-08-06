import { customerName } from "../../../lib/format";

// Single source of truth for reading an API chat document in the UI.
//
// The chat components were originally written against mock data shaped as
// { customer, tag, tagColor }. The API returns { user, status, assignedAgent, ... }
// with `user` populated as { name, email, profileImage }. Every component now
// reads through these helpers so the two shapes can't drift apart again.

export const STATUS_TAG = {
  active: {
    label: "Active",
    color:
      "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400",
  },
  waiting: {
    label: "Waiting",
    color: "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400",
  },
  closed: {
    label: "Closed",
    color:
      "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400",
  },
};

// `user` is a populated document on list/detail routes, but can still be a bare
// id when a chat comes straight back from POST /api/chats.
export const conversationCustomer = (conv) => {
  const user = conv?.user;
  const populated = user && typeof user === "object" ? user : null;

  return {
    id: populated?._id || user || null,
    name: populated ? customerName(populated) : "Customer",
    email: populated?.email || null,
    profileImage: populated?.profileImage || "",
  };
};

export const conversationTag = (conv) =>
  STATUS_TAG[conv?.status] || STATUS_TAG.active;

// Populated on list/detail routes; a bare id elsewhere.
export const conversationTicket = (conv) =>
  conv?.ticket && typeof conv.ticket === "object" ? conv.ticket : null;

// Every ticket owns exactly one chat, so a customer's chat list is a list of
// their tickets — labelling those rows by customer name would make them all
// identical. Ticket-bound chats read as the ticket; walk-in chats keep the
// customer name (which is what staff need on their side of the list).
export const conversationTitle = (conv) => {
  const ticket = conversationTicket(conv);
  if (ticket) return ticket.title || ticket.ticketNumber || "Ticket";
  return conversationCustomer(conv).name;
};

// Secondary line: ticket number for ticket chats, email for walk-ins.
export const conversationSubtitle = (conv) => {
  const ticket = conversationTicket(conv);
  if (ticket?.ticketNumber) return ticket.ticketNumber;
  return conversationCustomer(conv).email || null;
};

// Real presence of the customer, from the populated user document. This used to
// read the *chat's* session status, which meant every active conversation showed
// a green dot regardless of whether the customer was actually connected.
export const conversationPresence = (conv) => {
  const user = conv?.user;
  const presence = user && typeof user === "object" ? user.status : null;
  return presence === "online" ? "online" : "offline";
};

// Priority order for the conversation list's "Priority" filter.
const PRIORITY_RANK = { urgent: 0, high: 1, medium: 2, low: 3 };

export const conversationPriorityRank = (conv) =>
  PRIORITY_RANK[conversationTicket(conv)?.priority] ?? PRIORITY_RANK.medium;

// "Unread" for staff = this conversation has never been opened by me.
// The backend records an entry in chat.openedBy the first time it is fetched.
export const conversationIsUnreadFor = (conv, userId) => {
  if (!userId) return false;
  return !(conv?.openedBy || []).some(
    (entry) => String(entry?.user) === String(userId)
  );
};

// "Mine" for staff = I raised this ticket on the customer's behalf.
export const conversationCreatedBy = (conv, userId) => {
  const ticket = conversationTicket(conv);
  if (!ticket?.createdBy || !userId) return false;
  return String(ticket.createdBy) === String(userId);
};
