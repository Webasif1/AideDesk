import { describe, expect, it } from "vitest";
import mongoose from "mongoose";
import { canAccessChat, idOf } from "../../src/services/chatAccess.js";

const oid = () => new mongoose.Types.ObjectId();

const COMPANY = oid();
const OTHER_COMPANY = oid();
const AGENT = oid();
const OTHER_AGENT = oid();
const CUSTOMER = oid();
const OTHER_CUSTOMER = oid();

const chat = (over = {}) => ({
  company: COMPANY,
  workspaceId: oid(),
  user: CUSTOMER,
  assignedAgent: AGENT,
  ...over,
});

const actor = (role, userId, companyId = COMPANY) => ({ role, userId: userId.toString(), companyId });

describe("idOf", () => {
  it("normalises raw ObjectId, populated doc, string and nullish alike", () => {
    const id = oid();
    expect(idOf(id)).toBe(id.toString());
    expect(idOf({ _id: id, name: "populated" })).toBe(id.toString());
    expect(idOf(id.toString())).toBe(id.toString());
    expect(idOf(null)).toBeNull();
    expect(idOf(undefined)).toBeNull();
  });
});

describe("canAccessChat", () => {
  it("admin reaches any chat in their own company", () => {
    expect(canAccessChat(chat(), actor("admin", oid()))).toBe(true);
  });

  it("admin cannot reach another company's chat", () => {
    expect(canAccessChat(chat({ company: OTHER_COMPANY }), actor("admin", oid()))).toBe(false);
  });

  it("agent reaches only their own assignment", () => {
    expect(canAccessChat(chat(), actor("agent", AGENT))).toBe(true);
    expect(canAccessChat(chat(), actor("agent", OTHER_AGENT))).toBe(false);
  });

  it("agent cannot reach an unassigned chat", () => {
    expect(canAccessChat(chat({ assignedAgent: null }), actor("agent", AGENT))).toBe(false);
  });

  it("agent cannot reach their own assignment in another company", () => {
    const foreign = chat({ company: OTHER_COMPANY });
    expect(canAccessChat(foreign, actor("agent", AGENT))).toBe(false);
  });

  it("customer reaches only their own chat", () => {
    expect(canAccessChat(chat(), actor("customer", CUSTOMER))).toBe(true);
    expect(canAccessChat(chat(), actor("customer", OTHER_CUSTOMER))).toBe(false);
  });

  // The regression this primitive exists to prevent: chat.controller populates
  // assignedAgent/user, message.controller does not. Both shapes must decide
  // identically or agents lose access to their own conversations.
  it("decides identically whether refs are populated or raw", () => {
    const raw = chat();
    const populated = chat({
      company: { _id: COMPANY, name: "Acme" },
      assignedAgent: { _id: AGENT, name: "Agent One" },
      user: { _id: CUSTOMER, name: "Cust" },
    });

    for (const a of [
      actor("admin", oid()),
      actor("agent", AGENT),
      actor("agent", OTHER_AGENT),
      actor("customer", CUSTOMER),
      actor("customer", OTHER_CUSTOMER),
    ]) {
      expect(canAccessChat(populated, a), `role=${a.role}`).toBe(canAccessChat(raw, a));
    }
  });

  it("denies unknown roles, missing chat and missing actor", () => {
    expect(canAccessChat(chat(), actor("superuser", oid()))).toBe(false);
    expect(canAccessChat(null, actor("admin", oid()))).toBe(false);
    expect(canAccessChat(chat(), null)).toBe(false);
  });

  it("denies an admin whose companyId is missing rather than matching null to null", () => {
    expect(canAccessChat(chat({ company: null }), actor("admin", oid(), null))).toBe(false);
  });
});
