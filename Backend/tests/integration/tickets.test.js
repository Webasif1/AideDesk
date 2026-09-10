// Ticket lifecycle net.
//
// updateTicketStatus validated only that the status was in the enum, so any
// jump was legal. resolvedAt/closedAt were stamped with `if (!ticket.resolvedAt)`,
// so a resolved → reopened → resolved ticket kept the FIRST timestamp while
// sitting in another state. And assignAgent set firstResponseAt — assignment is
// not a response, which inflated the dashboard's average response time.
import { beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import app from "../../src/app.js";
import ticketModel from "../../src/models/ticket.model.js";
import { buildTenant } from "../helpers/tenant.js";

let A;
beforeEach(async () => {
  A = await buildTenant("A");
});

const setStatus = (status, cookie = A.cookies.admin, id = A.ticket._id) =>
  request(app).patch(`/api/tickets/${id}/status`).set("Cookie", cookie).send({ status });

const reload = (id = A.ticket._id) => ticketModel.findById(id);

describe("status transitions", () => {
  it("allows the ordinary forward path", async () => {
    for (const status of ["in_progress", "resolved", "closed"]) {
      const res = await setStatus(status);
      expect(res.status, `-> ${status}`).toBe(200);
    }
  });

  it("allows reopening a resolved ticket", async () => {
    await setStatus("resolved");
    expect((await setStatus("open")).status).toBe(200);
  });

  it("refuses a nonsensical jump", async () => {
    await setStatus("closed");
    // A closed ticket is reopened, not resolved straight out of closure.
    const res = await setStatus("resolved");
    expect(res.status).toBe(400);
    expect((await reload()).status).toBe("closed");
  });

  it("refuses forced_closed as a normal transition", async () => {
    // forced_closed is only reachable when a customer's account is deleted.
    const res = await setStatus("forced_closed");
    expect(res.status).toBe(400);
  });

  it("refuses a status outside the enum", async () => {
    expect((await setStatus("banana")).status).toBe(400);
  });

  it("refuses a no-op transition to the current status", async () => {
    expect((await reload()).status).toBe("open");
    expect((await setStatus("open")).status).toBe(400);
  });

  it("still lets only an admin reopen a force-closed ticket", async () => {
    await ticketModel.updateOne({ _id: A.ticket._id }, { status: "forced_closed" });

    expect((await setStatus("open", A.cookies.agent)).status).toBe(403);
    expect((await setStatus("open", A.cookies.admin)).status).toBe(200);
  });
});

describe("timestamps track the current state", () => {
  it("clears resolvedAt when a resolved ticket is reopened", async () => {
    await setStatus("resolved");
    expect((await reload()).resolvedAt).not.toBeNull();

    await setStatus("open");
    expect((await reload()).resolvedAt).toBeNull();
  });

  it("stamps the SECOND resolution, not the first", async () => {
    await setStatus("resolved");
    const first = (await reload()).resolvedAt;

    await setStatus("open");
    await new Promise((r) => setTimeout(r, 20));
    await setStatus("resolved");
    const second = (await reload()).resolvedAt;

    expect(second.getTime()).toBeGreaterThan(first.getTime());
  });

  it("clears closedAt when a closed ticket is reopened", async () => {
    await setStatus("closed");
    expect((await reload()).closedAt).not.toBeNull();

    await setStatus("open");
    expect((await reload()).closedAt).toBeNull();
  });
});

describe("statusHistory", () => {
  it("records every change in order, with who made it", async () => {
    await setStatus("in_progress");
    await setStatus("resolved");
    await setStatus("open");

    const { statusHistory } = await reload();
    expect(statusHistory).toHaveLength(3);
    expect(statusHistory.map((h) => h.to)).toEqual(["in_progress", "resolved", "open"]);
    expect(statusHistory.map((h) => h.from)).toEqual(["open", "in_progress", "resolved"]);
    expect(String(statusHistory[0].by)).toBe(String(A.admin._id));
    expect(statusHistory[0].role).toBe("admin");
  });
});

describe("firstResponseAt", () => {
  it("is not set by assigning an agent", async () => {
    // Assignment is not a response. Setting it here inflated the dashboard's
    // average-first-response metric with the time an admin happened to triage.
    const res = await request(app)
      .patch(`/api/tickets/${A.ticket._id}/assign`)
      .set("Cookie", A.cookies.admin)
      .send({ agentId: String(A.agent._id) });

    expect(res.status).toBe(200);
    expect((await reload()).firstResponseAt).toBeNull();
  });

  it("is set when staff actually post a message", async () => {
    await request(app)
      .post("/api/messages")
      .set("Cookie", A.cookies.agent)
      .send({ chat: String(A.chat._id), content: "Hello, taking a look now." });

    expect((await reload()).firstResponseAt).not.toBeNull();
  });

  it("is not moved by a second staff message", async () => {
    await request(app).post("/api/messages").set("Cookie", A.cookies.agent)
      .send({ chat: String(A.chat._id), content: "First reply." });
    const first = (await reload()).firstResponseAt;

    await new Promise((r) => setTimeout(r, 20));
    await request(app).post("/api/messages").set("Cookie", A.cookies.agent)
      .send({ chat: String(A.chat._id), content: "Second reply." });

    expect((await reload()).firstResponseAt.getTime()).toBe(first.getTime());
  });

  it("is not set by the customer writing in", async () => {
    await request(app)
      .post("/api/messages")
      .set("Cookie", A.cookies.customer)
      .send({ chat: String(A.chat._id), content: "Any update?" });

    expect((await reload()).firstResponseAt).toBeNull();
  });
});

describe("ticket numbers", () => {
  it("stay unique when several are created in the same millisecond", async () => {
    // The generator was Date.now().toString().slice(-6) against a unique index,
    // so two tickets created in the same millisecond collided outright.
    const created = await Promise.all(
      Array.from({ length: 12 }, (_, i) =>
        ticketModel.create({
          title: `Concurrent ticket ${i}`,
          description: "Created in a tight loop to force a collision.",
          companyId: A.company._id,
          customerId: A.customer._id,
          createdBy: A.customer._id,
          createdByModel: "user",
        }),
      ),
    );

    const numbers = created.map((t) => t.ticketNumber);
    expect(new Set(numbers).size).toBe(numbers.length);
    expect(numbers.every(Boolean)).toBe(true);
  });
});

describe("assignment eligibility", () => {
  const assign = (agentId) =>
    request(app)
      .patch(`/api/tickets/${A.ticket._id}/assign`)
      .set("Cookie", A.cookies.admin)
      .send({ agentId: String(agentId) });

  it("accepts an active, verified agent", async () => {
    expect((await assign(A.otherAgent._id)).status).toBe(200);
  });

  it("refuses an unverified agent", async () => {
    const agentModel = (await import("../../src/models/aget.model.js")).default;
    await agentModel.updateOne({ _id: A.otherAgent._id }, { isVerified: false });
    expect((await assign(A.otherAgent._id)).status).toBe(404);
  });

  it("refuses a suspended agent", async () => {
    const agentModel = (await import("../../src/models/aget.model.js")).default;
    await agentModel.updateOne({ _id: A.otherAgent._id }, { accountStatus: "suspended" });
    expect((await assign(A.otherAgent._id)).status).toBe(404);
  });

  it("refuses a malformed agent id with 400, not 500", async () => {
    const res = await request(app)
      .patch(`/api/tickets/${A.ticket._id}/assign`)
      .set("Cookie", A.cookies.admin)
      .send({ agentId: "not-an-id" });
    expect(res.status).toBe(400);
  });
});
