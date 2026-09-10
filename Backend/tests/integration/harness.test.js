// Proves the harness itself before anything is built on it: two tenants are
// genuinely independent, the app is reachable through supertest without a
// listener, and auth cookies are accepted.
import { describe, expect, it } from "vitest";
import request from "supertest";
import app from "../../src/app.js";
import { buildTenant } from "../helpers/tenant.js";

describe("test harness", () => {
  it("builds two fully independent tenants", async () => {
    const [a, b] = [await buildTenant("A"), await buildTenant("B")];

    expect(a.company._id.toString()).not.toBe(b.company._id.toString());
    for (const key of ["workspace", "admin", "agent", "customer", "chat", "ticket", "message"]) {
      expect(a[key]._id.toString()).not.toBe(b[key]._id.toString());
    }
    // Every child actually belongs to its own company.
    expect(a.agent.companyId.toString()).toBe(a.company._id.toString());
    expect(a.chat.company.toString()).toBe(a.company._id.toString());
    expect(a.ticket.companyId.toString()).toBe(a.company._id.toString());
    // Two agents, only one of which owns the chat — the fixture the isolation
    // matrix needs to express "same company, wrong agent".
    expect(a.chat.assignedAgent.toString()).toBe(a.agent._id.toString());
    expect(a.otherAgent._id.toString()).not.toBe(a.agent._id.toString());
  });

  it("serves the API over supertest with no listener", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("rejects an unauthenticated API call", async () => {
    const res = await request(app).get("/api/tickets");
    expect(res.status).toBe(401);
  });

  it("accepts a factory-signed cookie", async () => {
    const a = await buildTenant("A");
    const res = await request(app).get("/api/tickets").set("Cookie", a.cookies.admin);
    expect(res.status).toBe(200);
  });
});
