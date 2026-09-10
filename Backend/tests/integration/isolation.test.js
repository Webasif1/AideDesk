// The permanent tenant-isolation net.
//
// Two complete tenants are built, then every principal in tenant A is pointed
// at tenant B's ids. Nothing may return 200. This file is the regression net
// for the three Critical findings (cross-tenant company read/write, live
// cross-tenant socket interception, cross-tenant SLA write) and it is expected
// to grow: adding a route that takes an id from the URL means adding a row.
import { beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import app from "../../src/app.js";
import companyModel from "../../src/models/company.model.js";
import slaConfigModel from "../../src/models/slaConfig.model.js";
import { buildTenant, cookieFor } from "../helpers/tenant.js";

const DENIED = [400, 401, 403, 404];

let A, B;
beforeEach(async () => {
  A = await buildTenant("A");
  B = await buildTenant("B");
});

// ── Direct object access ───────────────────────────────────────────────────
describe("cross-tenant direct object access", () => {
  const routes = (b) => [
    ["get", `/api/tickets/${b.ticket._id}`],
    ["patch", `/api/tickets/${b.ticket._id}`, { title: "pentest rename" }],
    ["patch", `/api/tickets/${b.ticket._id}/status`, { status: "closed" }],
    ["delete", `/api/tickets/${b.ticket._id}`],
    ["get", `/api/chats/${b.chat._id}`],
    ["patch", `/api/chats/${b.chat._id}/take-over`],
    ["patch", `/api/chats/${b.chat._id}/status`, { status: "closed" }],
    ["get", `/api/messages/${b.chat._id}`],
    ["patch", `/api/messages/${b.chat._id}/read`],
    ["get", `/api/users/${b.customer._id}`],
    ["get", `/api/users/${b.customer._id}/note`],
    ["patch", `/api/users/${b.customer._id}/account-status`, { accountStatus: "suspended" }],
    ["get", `/api/agents/${b.agent._id}`],
    ["patch", `/api/agents/${b.agent._id}`, { name: "pentest" }],
    ["delete", `/api/agents/${b.agent._id}`],
    ["get", `/api/workspaces/${b.workspace._id}`],
    ["patch", `/api/workspaces/${b.workspace._id}`, { name: "pentest" }],
    ["delete", `/api/workspaces/${b.workspace._id}`],
  ];

  for (const role of ["admin", "agent", "customer"]) {
    it(`refuses tenant A's ${role} on every tenant B object`, async () => {
      const failures = [];
      for (const [method, path, body] of routes(B)) {
        const res = await request(app)
          [method](path)
          .set("Cookie", A.cookies[role])
          .send(body ?? {});
        if (!DENIED.includes(res.status)) {
          failures.push(`${method.toUpperCase()} ${path} -> ${res.status}`);
        }
      }
      expect(failures, `leaked to tenant A's ${role}:\n${failures.join("\n")}`).toEqual([]);
    });
  }
});

// ── Company routes ─────────────────────────────────────────────────────────
describe("company routes", () => {
  it("never returns tenant B's data to tenant A's admin", async () => {
    const leaks = [];

    const company = await request(app)
      .get(`/api/company/${B.company._id}`)
      .set("Cookie", A.cookies.admin);
    if (company.status === 200 && company.body?.data?.name === "Tenant B") {
      leaks.push("GET /api/company/:id returned tenant B's company");
    }

    for (const sub of ["users", "agents", "tickets", "messages"]) {
      const res = await request(app)
        .get(`/api/company/${B.company._id}/${sub}`)
        .set("Cookie", A.cookies.admin);
      if (res.status !== 200) continue;
      const rows = res.body?.data ?? [];
      const foreign = rows.filter((row) => {
        const owner = row.companyId ?? row.company;
        return owner && String(owner) !== String(A.company._id);
      });
      if (foreign.length) {
        leaks.push(`GET /api/company/:id/${sub} returned ${foreign.length} foreign rows`);
      }
    }

    expect(leaks, leaks.join("\n")).toEqual([]);
  });

  it("does not let tenant A write to tenant B's company", async () => {
    await request(app)
      .put(`/api/company/${B.company._id}`)
      .set("Cookie", A.cookies.admin)
      .send({ description: "PENTEST MARKER" });

    const after = await companyModel.findById(B.company._id);
    expect(after.description).not.toBe("PENTEST MARKER");
  });

  it("does not let tenant A delete tenant B's company", async () => {
    await request(app)
      .delete(`/api/company/${B.company._id}`)
      .set("Cookie", A.cookies.admin);

    const after = await companyModel.findById(B.company._id);
    expect(after, "tenant B's company was deleted by tenant A").not.toBeNull();
  });

  it("refuses agents and customers on company routes entirely", async () => {
    const failures = [];
    for (const role of ["agent", "customer"]) {
      for (const path of [
        `/api/company/${A.company._id}`,
        `/api/company/${A.company._id}/users`,
        `/api/company/${A.company._id}/agents`,
        `/api/company/${A.company._id}/tickets`,
        `/api/company/${A.company._id}/messages`,
      ]) {
        const res = await request(app).get(path).set("Cookie", A.cookies[role]);
        if (res.status !== 403) failures.push(`${role} GET ${path} -> ${res.status}`);
      }
    }
    expect(failures, failures.join("\n")).toEqual([]);
  });

  it("returns 200 rather than 500 for the company ticket list", async () => {
    // Regression: this route populated a field the ticket schema does not have
    // ("assignedTo" rather than "assignedAgent"), so it always threw.
    const res = await request(app)
      .get(`/api/company/${A.company._id}/tickets`)
      .set("Cookie", A.cookies.admin);
    expect(res.status).toBe(200);
  });
});

// ── x-workspace-id header ──────────────────────────────────────────────────
describe("x-workspace-id header", () => {
  const HEADER_ROUTES = [
    "/api/sla-config",
    "/api/users/getAll",
    "/api/chats",
    "/api/agents/getAll",
    "/api/tickets",
  ];

  it("refuses another tenant's workspace id", async () => {
    const failures = [];
    for (const path of HEADER_ROUTES) {
      const res = await request(app)
        .get(path)
        .set("Cookie", A.cookies.admin)
        .set("x-workspace-id", String(B.workspace._id));
      // Falling back to company scope would silently *widen* access, so a bare
      // 200 is not acceptable here either — demand an explicit refusal.
      if (res.status !== 403) failures.push(`GET ${path} -> ${res.status}`);
    }
    expect(failures, failures.join("\n")).toEqual([]);
  });

  it("rejects a malformed workspace id with 400", async () => {
    const res = await request(app)
      .get("/api/tickets")
      .set("Cookie", A.cookies.admin)
      .set("x-workspace-id", "not-an-object-id");
    expect(res.status).toBe(400);
  });

  it("accepts the admin's own workspace", async () => {
    const res = await request(app)
      .get("/api/tickets")
      .set("Cookie", A.cookies.admin)
      .set("x-workspace-id", String(A.workspace._id));
    expect(res.status).toBe(200);
  });

  it("does not write another tenant's SLA config", async () => {
    await request(app)
      .put("/api/sla-config")
      .set("Cookie", A.cookies.admin)
      .set("x-workspace-id", String(B.workspace._id))
      .send({ firstResponseHours: { high: 99 } });

    const cfg = await slaConfigModel.findOne({ workspaceId: B.workspace._id });
    expect(cfg?.firstResponseHours?.high ?? null).not.toBe(99);
  });
});

// ── Agent scoping inside one tenant ────────────────────────────────────────
// Not cross-tenant, but the same class of defect: an agent reaching a
// colleague's conversation. chat.controller enforced this; message.controller
// checked only the company, so every agent could read the whole tenant.
describe("agent scoping inside one tenant", () => {
  it("refuses an agent on a chat assigned to a different agent", async () => {
    const failures = [];
    const calls = [
      ["get", `/api/messages/${A.chat._id}`, undefined],
      ["patch", `/api/messages/${A.chat._id}/read`, {}],
      ["post", "/api/messages", { chat: String(A.chat._id), content: "intruding" }],
      ["get", `/api/chats/${A.chat._id}`, undefined],
    ];
    for (const [method, path, body] of calls) {
      const res = await request(app)
        [method](path)
        .set("Cookie", A.cookies.otherAgent)
        .send(body ?? {});
      if (![401, 403, 404].includes(res.status)) {
        failures.push(`${method.toUpperCase()} ${path} -> ${res.status}`);
      }
    }
    expect(failures, failures.join("\n")).toEqual([]);
  });

  it("allows the assigned agent through", async () => {
    const res = await request(app)
      .get(`/api/messages/${A.chat._id}`)
      .set("Cookie", A.cookies.agent);
    expect(res.status).toBe(200);
  });

  it("refuses a customer on another customer's chat", async () => {
    const res = await request(app)
      .get(`/api/messages/${A.chat._id}`)
      .set("Cookie", A.cookies.otherCustomer);
    expect([401, 403, 404]).toContain(res.status);
  });
});

// ── Anonymous ──────────────────────────────────────────────────────────────
describe("anonymous access", () => {
  it("refuses every protected route without a cookie", async () => {
    const failures = [];
    for (const path of [
      "/api/tickets",
      "/api/chats",
      "/api/users/getAll",
      "/api/agents/getAll",
      "/api/sla-config",
      "/api/workspaces/getAll",
      `/api/company/${A.company._id}`,
      `/api/tickets/${A.ticket._id}`,
    ]) {
      const res = await request(app).get(path);
      if (res.status !== 401) failures.push(`GET ${path} -> ${res.status}`);
    }
    expect(failures, failures.join("\n")).toEqual([]);
  });
});

// ── Billing tier is not the client's to set ────────────────────────────────
describe("plan escalation", () => {
  it("ignores a plan sent to the company update endpoint", async () => {
    // The billing page used to validate a card, pause, then genuinely persist
    // the new plan — a free upgrade to any tier for any admin.
    await request(app)
      .put(`/api/company/${A.company._id}`)
      .set("Cookie", A.cookies.admin)
      .send({ plan: "enterprise", description: "legitimate change" });

    const after = await companyModel.findById(A.company._id);
    expect(after.plan).not.toBe("enterprise");
    // The legitimate field in the same request still applies.
    expect(after.description).toBe("legitimate change");
  });

  it("ignores a plan sent at company registration", async () => {
    const adminModel = (await import("../../src/models/admin.model.js")).default;
    const fresh = await adminModel.create({
      fullName: "Fresh Admin",
      email: `fresh-${Date.now()}@test.dev`,
      password: "x".repeat(20),
      isVerified: true,
    });

    const slug = `upgraded-${Date.now()}`;
    const res = await request(app)
      .post("/api/company/register")
      .set("Cookie", cookieFor(fresh))
      .send({
        name: "Upgraded Co",
        slug,
        email: `billing-${Date.now()}@test.dev`,
        phone: "+1000000000",
        website: "https://upgraded.test",
        size: "11-50",
        address: "1 Test Street",
        country: "Testland",
        plan: "enterprise",
      });

    expect(res.status).toBe(201);
    // Looked up by slug so this does not depend on the response envelope shape.
    const created = await companyModel.findOne({ slug });
    expect(created).not.toBeNull();
    expect(created.plan).not.toBe("enterprise");
  });
});
