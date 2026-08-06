// One-off migration for the "New vs In Progress" status rule.
//
// Before this change the copilot set a ticket to `pending` the moment it posted
// its own opening answer, so tickets the customer had never replied to were
// rendering as "In Progress". This walks every ticket, works out whether the
// customer actually replied after the AI spoke, and rewrites the status to
// match. Safe to re-run.
//
// Usage (from Backend/):  node scripts/backfillTicketStatus.js

import mongoose from "mongoose";
import { config } from "../src/config/config.js";
import ticketModel from "../src/models/ticket.model.js";
import messageModel from "../src/models/message.model.js";

const run = async () => {
  await mongoose.connect(config.MONGO_URI || process.env.MONGO_URI);
  console.log("[backfill] connected");

  // Resolved/closed tickets are final — their status is not derived from replies.
  const tickets = await ticketModel.find({
    status: { $in: ["open", "pending", "in_progress"] },
  });

  let toInProgress = 0;
  let toOpen = 0;
  let untouched = 0;

  for (const ticket of tickets) {
    let repliedAt = ticket.customerRepliedAt || null;

    if (!repliedAt && ticket.chat) {
      const thread = await messageModel
        .find({ chat: ticket.chat })
        .sort({ createdAt: 1 })
        .select("role createdAt")
        .lean();

      // The first customer message is the ticket description seeded at creation.
      // A genuine reply is a customer message that comes *after* an AI message.
      const firstAiAt = thread.find((m) => m.role === "ai")?.createdAt;
      if (firstAiAt) {
        const reply = thread.find(
          (m) => m.role === "user" && m.createdAt > firstAiAt
        );
        if (reply) repliedAt = reply.createdAt;
      }
    }

    // An escalated ticket implies the customer engaged, even if the message
    // trail was trimmed.
    if (!repliedAt && ticket.escalatedAt) repliedAt = ticket.escalatedAt;

    const nextStatus = repliedAt ? "in_progress" : "open";

    if (ticket.status === nextStatus && Boolean(ticket.customerRepliedAt) === Boolean(repliedAt)) {
      untouched++;
      continue;
    }

    ticket.customerRepliedAt = repliedAt;
    ticket.status = nextStatus;
    await ticket.save();

    if (nextStatus === "in_progress") toInProgress++;
    else toOpen++;
  }

  console.log(
    `[backfill] done — ${toInProgress} → in_progress, ${toOpen} → open, ${untouched} unchanged`
  );
  await mongoose.disconnect();
};

run().catch((err) => {
  console.error("[backfill] failed:", err);
  process.exit(1);
});
