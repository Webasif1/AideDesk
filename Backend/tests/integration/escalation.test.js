// Escalation honesty net.
//
// escalateTicket created the "I'm connecting you with a human specialist"
// message unconditionally, several lines BEFORE it checked whether an agent had
// actually been found. A tenant with no eligible agents therefore told its
// customer a specialist was joining shortly, assigned nobody, and moved the
// ticket to in_progress so it dropped out of the unassigned queue entirely.
import { beforeEach, describe, expect, it, vi } from "vitest";
import mongoose from "mongoose";
import agentModel from "../../src/models/aget.model.js";
import messageModel from "../../src/models/message.model.js";
import ticketModel from "../../src/models/ticket.model.js";
import { pickAgentFor } from "../../src/services/agentAssignment.service.js";
import { buildTenant } from "../helpers/tenant.js";

// escalateTicket is module-private, and the real copilot would make a network
// call whose verdict decides which branch runs. Stub the one function that
// decides, so these tests exercise the escalation path deterministically and
// offline. runCopilot's verdict is set per-test via copilotVerdict.
const copilotVerdict = { current: { wantsHuman: true } };

vi.mock("../../src/services/copilot.service.js", () => ({
  runCopilot: vi.fn(async () => copilotVerdict.current),
}));

let A;
beforeEach(async () => {
  A = await buildTenant("A");
});

const reqFor = (tenant) => ({
  companyId: String(tenant.company._id),
  workspaceId: String(tenant.workspace._id),
  userId: String(tenant.admin._id),
  role: "admin",
});

describe("pickAgentFor eligibility", () => {
  it("returns an active, verified agent", async () => {
    const agent = await pickAgentFor(reqFor(A));
    expect(agent).not.toBeNull();
  });

  it("never returns an unverified agent", async () => {
    // An agent who never accepted their invite cannot sign in, so handing them
    // an escalation silently parks it.
    await agentModel.updateMany({ companyId: A.company._id }, { isVerified: false });
    expect(await pickAgentFor(reqFor(A))).toBeNull();
  });

  it("never returns a suspended agent", async () => {
    await agentModel.updateMany({ companyId: A.company._id }, { accountStatus: "suspended" });
    expect(await pickAgentFor(reqFor(A))).toBeNull();
  });

  it("never returns a deleted agent", async () => {
    await agentModel.updateMany({ companyId: A.company._id }, { accountStatus: "deleted" });
    expect(await pickAgentFor(reqFor(A))).toBeNull();
  });

  it("keeps agents that predate the isVerified flag eligible", async () => {
    // $ne:false rather than ==true, so a missing field is not treated as
    // unverified — otherwise every legacy agent silently stops receiving work.
    await agentModel.collection.updateMany(
      { companyId: A.company._id },
      { $unset: { isVerified: "" } },
    );
    expect(await pickAgentFor(reqFor(A))).not.toBeNull();
  });

  it("prefers an online agent over an offline one", async () => {
    await agentModel.updateOne({ _id: A.agent._id }, { status: "offline" });
    await agentModel.updateOne({ _id: A.otherAgent._id }, { status: "online" });

    const agent = await pickAgentFor(reqFor(A));
    expect(String(agent._id)).toBe(String(A.otherAgent._id));
  });

  it("still returns an offline agent when nobody is online", async () => {
    await agentModel.updateMany({ companyId: A.company._id }, { status: "offline" });
    expect(await pickAgentFor(reqFor(A))).not.toBeNull();
  });

  it("does not spread work across tenants", async () => {
    const B = await buildTenant("B");
    await agentModel.updateMany({ companyId: A.company._id }, { accountStatus: "suspended" });

    // A has no eligible agents; B's must not be borrowed.
    expect(await pickAgentFor(reqFor(A))).toBeNull();
    expect(await pickAgentFor(reqFor(B))).not.toBeNull();
  });

  it("spreads escalations rather than always picking the same agent", async () => {
    // findOne with no sort returned the same document every time, so one agent
    // absorbed every escalation in the workspace.
    await agentModel.updateMany({ companyId: A.company._id }, { status: "online" });

    const picks = new Set();
    for (let i = 0; i < 25; i++) {
      const agent = await pickAgentFor(reqFor(A));
      picks.add(String(agent._id));
    }
    expect(picks.size).toBeGreaterThan(1);
  });
});

describe("escalation wording matches the outcome", () => {
  // escalateTicket is module-private; exercise it through the ticket flow by
  // calling the copilot entry point with the model stubbed to fail, which lands
  // in the fallback escalation path.
  const runEscalation = async (tenant) => {
    const mod = await import("../../src/services/copilotFlow.service.js");
    const chatModel = (await import("../../src/models/chat.model.js")).default;

    const chat = await chatModel.findById(tenant.chat._id);
    const ticket = await ticketModel.findById(tenant.ticket._id);

    return mod.startTicketCopilot({
      ticket,
      chat,
      firstMessage: "Nothing works and I need a person.",
      req: reqFor(tenant),
    });
  };

  beforeEach(() => {
    // "Customer asked for a human" — the shortest route to the escalation
    // branch, and the case that must never over-promise.
    copilotVerdict.current = { wantsHuman: true };
  });

  /** Every AI message in the thread, oldest first. */
  const aiMessages = async (chatId) =>
    (await messageModel.find({ chat: chatId, role: "ai" }).sort({ createdAt: 1 })).map(
      (m) => m.content,
    );

  it("promises a specialist when one was actually assigned", async () => {
    const before = await messageModel.countDocuments({ chat: A.chat._id });
    await runEscalation(A);

    expect(await messageModel.countDocuments({ chat: A.chat._id })).toBeGreaterThan(before);

    const ticket = await ticketModel.findById(A.ticket._id);
    expect(ticket.assignedAgent, "fixture should have an eligible agent").not.toBeNull();

    // The handoff is followed by an "agent has joined" notice, so assert on the
    // thread as a whole rather than on whichever message happens to be last.
    const texts = (await aiMessages(A.chat._id)).join(" | ");
    expect(texts).toMatch(/connecting you with a human specialist/i);
    expect(texts).not.toMatch(/escalated this to our support team/i);
  });

  it("uses the queued wording and flags the ticket when nobody is eligible", async () => {
    await agentModel.updateMany({ companyId: A.company._id }, { accountStatus: "suspended" });
    await ticketModel.updateOne({ _id: A.ticket._id }, { assignedAgent: null });
    await (await import("../../src/models/chat.model.js")).default.updateOne(
      { _id: A.chat._id },
      { assignedAgent: null },
    );

    await runEscalation(A);

    const texts = (await aiMessages(A.chat._id)).join(" | ");
    expect(texts).toMatch(/escalated this to our support team/i);
    // The promise that was never kept.
    expect(texts).not.toMatch(/join this conversation shortly/i);
    expect(texts).not.toMatch(/has joined the chat/i);

    const ticket = await ticketModel.findById(A.ticket._id);
    expect(ticket.assignedAgent).toBeNull();
    // Visible in the unassigned queue rather than silently in_progress.
    expect(ticket.escalationState).toBe("unassigned");
  });

  it("always leaves the customer a message, even when the copilot throws", async () => {
    const { runCopilot } = await import("../../src/services/copilot.service.js");
    runCopilot.mockRejectedValueOnce(new Error("model exploded"));

    const before = await messageModel.countDocuments({ chat: A.chat._id });
    await runEscalation(A);

    // The catch block used to return without posting anything, leaving the
    // customer staring at an empty thread.
    expect(await messageModel.countDocuments({ chat: A.chat._id })).toBeGreaterThan(before);
  });

  it("clears the unassigned flag once an agent is assigned", async () => {
    await ticketModel.updateOne({ _id: A.ticket._id }, { escalationState: "unassigned" });

    const request = (await import("supertest")).default;
    const app = (await import("../../src/app.js")).default;

    await request(app)
      .patch(`/api/tickets/${A.ticket._id}/assign`)
      .set("Cookie", A.cookies.admin)
      .send({ agentId: String(A.agent._id) });

    expect((await ticketModel.findById(A.ticket._id)).escalationState).toBeNull();
  });
});

describe("ticket number generation", () => {
  it("produces unique numbers under concurrency", async () => {
    const made = await Promise.all(
      Array.from({ length: 20 }, () =>
        ticketModel.create({
          title: "Concurrency probe",
          description: "Several tickets created within the same millisecond.",
          companyId: A.company._id,
          customerId: A.customer._id,
          createdBy: A.customer._id,
          createdByModel: "user",
        }),
      ),
    );
    expect(new Set(made.map((t) => t.ticketNumber)).size).toBe(20);
  });
});

// Guard against the helper import above silently going stale.
describe("test wiring", () => {
  it("has a live mongoose connection", () => {
    expect(mongoose.connection.readyState).toBe(1);
  });
});
