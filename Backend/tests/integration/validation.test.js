// Input handling net.
//
// Search input went straight into a $regex, so punctuation was a 500 and
// "(a+)+$" was a catastrophic-backtracking DoS. Pagination was computed from
// raw query values, so ?page=0 produced skip:-10 — which MongoDB rejects, also
// surfacing as a 500 — and limit had no ceiling at all.
import { beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import app from "../../src/app.js";
import userModel from "../../src/models/user.model.js";
import { buildTenant } from "../helpers/tenant.js";

let A;
beforeEach(async () => {
  A = await buildTenant("A");
});

const LIST_ENDPOINTS = [
  "/api/users/getAll",
  "/api/tickets",
  "/api/chats",
  "/api/agents/getAll",
];

describe("search input", () => {
  const HOSTILE = [
    "((((",
    ".*",
    "(a+)+$",
    "[",
    "\\",
    "^.*$",
    "a{999999}",
    "ZoÃ«",
    "x".repeat(500),
  ];

  it("never 500s on hostile search input", async () => {
    const failures = [];
    for (const term of HOSTILE) {
      const res = await request(app)
        .get(`/api/users/getAll?search=${encodeURIComponent(term)}`)
        .set("Cookie", A.cookies.admin);
      if (res.status >= 500) failures.push(`${JSON.stringify(term)} -> ${res.status}`);
    }
    expect(failures, failures.join("\n")).toEqual([]);
  });

  it("treats regex metacharacters as literal text", async () => {
    // ".*" matches everything as a pattern and nothing as a literal. The tenant
    // has customers, so a non-empty result proves the input was NOT escaped.
    const res = await request(app)
      .get("/api/users/getAll?search=.*")
      .set("Cookie", A.cookies.admin);

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
  });

  it("still matches a genuine substring", async () => {
    const res = await request(app)
      .get(`/api/users/getAll?search=${encodeURIComponent(A.customer.email.slice(0, 8))}`)
      .set("Cookie", A.cookies.admin);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it("matches a literal dot rather than any character", async () => {
    await userModel.create({
      name: "Dotted Name",
      email: `dot.match-${Date.now()}@test.dev`,
      password: "x".repeat(20),
      companyId: A.company._id,
      workspaceId: A.workspace._id,
    });

    const res = await request(app)
      .get("/api/users/getAll?search=dot.match")
      .set("Cookie", A.cookies.admin);
    expect(res.body.data.length).toBe(1);
  });

  it("answers a ReDoS pattern quickly", async () => {
    const started = Date.now();
    await request(app)
      .get(`/api/users/getAll?search=${encodeURIComponent("(a+)+$")}`)
      .set("Cookie", A.cookies.admin);
    expect(Date.now() - started).toBeLessThan(2000);
  });
});

describe("pagination", () => {
  it("treats page 0 and negatives as page 1 rather than 500ing", async () => {
    const failures = [];
    for (const endpoint of LIST_ENDPOINTS) {
      for (const page of ["0", "-1", "-999", "abc", "", "1e999"]) {
        const res = await request(app)
          .get(`${endpoint}?page=${encodeURIComponent(page)}`)
          .set("Cookie", A.cookies.admin);
        if (res.status !== 200) failures.push(`${endpoint}?page=${page} -> ${res.status}`);
      }
    }
    expect(failures, failures.join("\n")).toEqual([]);
  });

  it("clamps limit so a single request cannot drain a collection", async () => {
    const failures = [];
    for (const endpoint of LIST_ENDPOINTS) {
      const res = await request(app)
        .get(`${endpoint}?limit=100000`)
        .set("Cookie", A.cookies.admin);
      if (res.status !== 200) {
        failures.push(`${endpoint} -> ${res.status}`);
      } else if ((res.body.data ?? []).length > 100) {
        failures.push(`${endpoint} returned ${res.body.data.length} rows`);
      }
    }
    expect(failures, failures.join("\n")).toEqual([]);
  });

  it("floors a zero or negative limit", async () => {
    for (const limit of ["0", "-5"]) {
      const res = await request(app)
        .get(`/api/users/getAll?limit=${limit}`)
        .set("Cookie", A.cookies.admin);
      expect(res.status).toBe(200);
    }
  });

  it("reports the clamped values it actually used", async () => {
    const res = await request(app)
      .get("/api/users/getAll?page=0&limit=100000")
      .set("Cookie", A.cookies.admin);

    expect(res.body.pagination.page).toBe(1);
    expect(res.body.pagination.limit).toBeLessThanOrEqual(100);
  });

  it("pages correctly", async () => {
    // Nine extra customers so paging has something to walk.
    for (let i = 0; i < 9; i++) {
      await userModel.create({
        name: `Paged ${i}`,
        email: `paged-${i}-${Date.now()}@test.dev`,
        password: "x".repeat(20),
        companyId: A.company._id,
        workspaceId: A.workspace._id,
      });
    }

    const first = await request(app)
      .get("/api/users/getAll?page=1&limit=5")
      .set("Cookie", A.cookies.admin);
    const second = await request(app)
      .get("/api/users/getAll?page=2&limit=5")
      .set("Cookie", A.cookies.admin);

    expect(first.body.data.length).toBe(5);
    expect(second.body.data.length).toBeGreaterThan(0);

    const firstIds = first.body.data.map((u) => u._id);
    const secondIds = second.body.data.map((u) => u._id);
    expect(firstIds.filter((id) => secondIds.includes(id))).toEqual([]);
  });
});

describe("malformed identifiers", () => {
  it("answers 400 with a clean message, never a Mongoose cast error", async () => {
    const failures = [];
    for (const path of [
      "/api/tickets/not-an-id",
      "/api/chats/zzz",
      "/api/users/nope",
      "/api/agents/%20",
      "/api/messages/bad-id",
      "/api/workspaces/xyz",
    ]) {
      const res = await request(app).get(path).set("Cookie", A.cookies.admin);
      if (res.status !== 400) {
        failures.push(`GET ${path} -> ${res.status}`);
        continue;
      }
      const message = String(res.body.message ?? "");
      if (/Cast to ObjectId|ObjectId\(|for model/i.test(message)) {
        failures.push(`GET ${path} leaked driver text: ${message}`);
      }
    }
    expect(failures, failures.join("\n")).toEqual([]);
  });

  it("answers 404 for a well-formed id that does not exist", async () => {
    const res = await request(app)
      .get("/api/tickets/6aa0000000000000000000aa")
      .set("Cookie", A.cookies.admin);
    expect(res.status).toBe(404);
  });

  it("never returns a stack trace", async () => {
    const res = await request(app)
      .get("/api/tickets/6aa0000000000000000000aa")
      .set("Cookie", A.cookies.admin);
    expect(res.body.stack).toBeUndefined();
  });
});
