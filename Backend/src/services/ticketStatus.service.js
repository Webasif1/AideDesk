import ticketModel from "../models/ticket.model.js";
import { emitDomain } from "../sockets/emit.js";

// Statuses a ticket can still be moved out of by a customer reply. Once it is
// resolved or closed, a new message does not silently reopen it.
const REOPENABLE = ["open", "pending"];

// ============================================
// A ticket reads as "New" until the customer replies of their own accord.
//
// Creating a ticket seeds the chat with the customer's description and the AI
// answers straight away — neither of those counts. Only the two genuine reply
// paths call this: copilotFlow.handleCustomerReply and message.sendMessage.
//
// Safe to call on every customer message; it no-ops once the flag is set.
// ============================================
export const markCustomerReplied = async (chat) => {
  if (!chat?.ticket) return null;

  const ticket = await ticketModel.findById(chat.ticket);
  if (!ticket || ticket.customerRepliedAt) return null;

  ticket.customerRepliedAt = new Date();
  ticket.lastMessageAt = new Date();
  if (REOPENABLE.includes(ticket.status)) ticket.status = "in_progress";

  await ticket.save();

  emitDomain.ticketUpdated(ticket.companyId, {
    _id: ticket._id,
    status: ticket.status,
    customerRepliedAt: ticket.customerRepliedAt,
  });

  return ticket;
};
