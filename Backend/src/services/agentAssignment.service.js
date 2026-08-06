import agentModel from "../models/aget.model.js";
import chatModel from "../models/chat.model.js";
import ticketModel from "../models/ticket.model.js";
import { ACCOUNT_STATUS } from "../config/constants.js";
import { emitDomain, socketEmit } from "../sockets/emit.js";

// Tickets that still need somebody working them. Resolved/closed tickets keep
// their original agent for reporting.
const LIVE_TICKET_STATUSES = ["open", "pending", "in_progress"];

// Fisher-Yates. "Random other agent" per the requirement, but see spreadTickets:
// we shuffle once and then round-robin so one person doesn't inherit the lot.
const shuffle = (items) => {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
};

// Agents who may receive work: same workspace when we have one, otherwise the
// whole company; never the agent being removed, never a suspended/removed one.
export const findEligibleAgents = async ({ companyId, workspaceId, excludeAgentId }) => {
  const base = {
    accountStatus: ACCOUNT_STATUS.ACTIVE,
    ...(excludeAgentId && { _id: { $ne: excludeAgentId } }),
  };

  if (workspaceId) {
    const inWorkspace = await agentModel.find({ ...base, workspaceId }).select("_id name status");
    if (inWorkspace.length) return inWorkspace;
  }

  if (!companyId) return [];
  return agentModel.find({ ...base, companyId }).select("_id name status");
};

// Online agents first so live work lands with somebody actually at their desk,
// then everyone else. Order within each group is randomised.
const rankEligible = (agents) => {
  const online = shuffle(agents.filter((a) => a.status === "online"));
  const rest = shuffle(agents.filter((a) => a.status !== "online"));
  return [...online, ...rest];
};

// ============================================
// Moves every live ticket held by `agentId` to another active agent.
// When there is nobody eligible the tickets go back to the unassigned queue
// rather than staying with an agent who can no longer act on them.
// Returns { reassigned, unassigned, total } for the admin-facing toast.
// ============================================
export const reassignAgentTickets = async (agentId, { companyId, workspaceId } = {}) => {
  const tickets = await ticketModel.find({
    assignedAgent: agentId,
    status: { $in: LIVE_TICKET_STATUSES },
  });

  if (!tickets.length) return { reassigned: 0, unassigned: 0, total: 0 };

  const eligible = rankEligible(
    await findEligibleAgents({ companyId, workspaceId, excludeAgentId: agentId })
  );

  let reassigned = 0;
  let unassigned = 0;

  for (let i = 0; i < tickets.length; i++) {
    const ticket = tickets[i];
    // Round-robin across the shuffled pool spreads the backlog instead of
    // dumping every ticket on whoever happened to be picked first.
    const nextAgent = eligible.length ? eligible[i % eligible.length] : null;

    ticket.assignedAgent = nextAgent?._id || null;
    await ticket.save();

    // The chat rides along with its ticket, otherwise the conversation stays
    // in the old agent's queue while the ticket has moved.
    if (ticket.chat) {
      await chatModel.findByIdAndUpdate(ticket.chat, {
        assignedAgent: nextAgent?._id || null,
      });
    }

    if (nextAgent) {
      reassigned++;
      socketEmit.ticketAssigned(nextAgent._id, {
        ticketId: ticket._id,
        chatId: ticket.chat,
        title: ticket.title,
      });
    } else {
      unassigned++;
    }

    emitDomain.ticketUpdated(companyId, {
      _id: ticket._id,
      assignedAgent: nextAgent?._id || null,
      status: ticket.status,
    });
  }

  return { reassigned, unassigned, total: tickets.length };
};
