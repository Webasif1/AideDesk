// Socket authorization net.
//
// The handshake previously verified the JWT and stopped there — no account
// load, so a deleted or suspended user kept a live feed — and chat:join /
// workspace:focus joined whatever room id they were handed. A tenant could
// receive another tenant's private messages in real time.
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import http from "http";
import request from "supertest";
import { io as ioClient } from "socket.io-client";
import app from "../../src/app.js";
import { initSocket, getIO } from "../../src/sockets/server.socket.js";
import { ACCOUNT_STATUS } from "../../src/config/constants.js";
import agentModel from "../../src/models/aget.model.js";
import userModel from "../../src/models/user.model.js";
import { buildTenant } from "../helpers/tenant.js";

let server, port;

beforeAll(async () => {
  server = http.createServer(app);
  initSocket(server);
  await new Promise((resolve) => server.listen(0, resolve));
  port = server.address().port;
});

afterAll(async () => {
  try {
    getIO().close();
  } catch {
    /* already closed */
  }
  await new Promise((resolve) => server.close(resolve));
});

const open = (cookie) =>
  ioClient(`http://localhost:${port}`, {
    extraHeaders: cookie ? { Cookie: cookie } : {},
    transports: ["websocket"],
    reconnection: false,
    forceNew: true,
  });

/** Resolve on connect, reject on refusal — so a test can assert either. */
const connect = (cookie) =>
  new Promise((resolve, reject) => {
    const socket = open(cookie);
    socket.on("connect", () => resolve(socket));
    socket.on("connect_error", (err) => {
      socket.close();
      reject(err);
    });
  });

const emitAck = (socket, event, payload) =>
  new Promise((resolve) => {
    let settled = false;
    socket.emit(event, payload, (ack) => {
      settled = true;
      resolve(ack);
    });
    // An un-acked handler is itself a failure worth surfacing rather than
    // hanging the suite until the vitest timeout.
    setTimeout(() => !settled && resolve({ ok: false, error: "no_ack" }), 2000);
  });

let A, B;
const sockets = [];
const track = (s) => {
  sockets.push(s);
  return s;
};

beforeEach(async () => {
  while (sockets.length) sockets.pop()?.close();
  A = await buildTenant("A");
  B = await buildTenant("B");
});

describe("handshake", () => {
  it("refuses a connection with no cookie", async () => {
    await expect(connect(undefined)).rejects.toThrow(/unauthorized/i);
  });

  it("refuses a malformed token", async () => {
    await expect(connect("token=not-a-jwt")).rejects.toThrow(/unauthorized/i);
  });

  it("refuses a deleted account", async () => {
    await userModel.updateOne(
      { _id: A.customer._id },
      { accountStatus: ACCOUNT_STATUS.DELETED },
    );
    await expect(connect(A.cookies.customer)).rejects.toThrow(/account_deleted|unauthorized/i);
  });

  it("lets a suspended account connect read-only", async () => {
    await agentModel.updateOne(
      { _id: A.agent._id },
      { accountStatus: ACCOUNT_STATUS.SUSPENDED },
    );
    const socket = track(await connect(A.cookies.agent));
    expect(socket.connected).toBe(true);
  });

  it("does not mark a suspended agent online when their socket connects", async () => {
    // The factory leaves the agent "online", so this asserts markOnline
    // actively drives them offline rather than merely declining to raise them.
    await agentModel.updateOne(
      { _id: A.agent._id },
      { accountStatus: ACCOUNT_STATUS.SUSPENDED },
    );
    track(await connect(A.cookies.agent));
    await new Promise((r) => setTimeout(r, 500));
    const after = await agentModel.findById(A.agent._id).select("status");
    expect(after.status).toBe("offline");
  });
});

describe("chat:join authorization", () => {
  it("admits the assigned agent to their own chat", async () => {
    const socket = track(await connect(A.cookies.agent));
    const ack = await emitAck(socket, "chat:join", { chatId: String(A.chat._id) });
    expect(ack).toEqual({ ok: true });
  });

  it("admits an admin to any chat in their company", async () => {
    const socket = track(await connect(A.cookies.admin));
    const ack = await emitAck(socket, "chat:join", { chatId: String(A.chat._id) });
    expect(ack.ok).toBe(true);
  });

  it("refuses another tenant's chat", async () => {
    const socket = track(await connect(A.cookies.admin));
    const ack = await emitAck(socket, "chat:join", { chatId: String(B.chat._id) });
    expect(ack.ok).toBe(false);
  });

  it("refuses a colleague's chat to an unassigned agent", async () => {
    const socket = track(await connect(A.cookies.otherAgent));
    const ack = await emitAck(socket, "chat:join", { chatId: String(A.chat._id) });
    expect(ack.ok).toBe(false);
  });

  it("refuses another customer's chat", async () => {
    const socket = track(await connect(A.cookies.otherCustomer));
    const ack = await emitAck(socket, "chat:join", { chatId: String(A.chat._id) });
    expect(ack.ok).toBe(false);
  });

  it("survives a non-ObjectId chat id without crashing", async () => {
    const socket = track(await connect(A.cookies.admin));
    const ack = await emitAck(socket, "chat:join", { chatId: "'; DROP TABLE" });
    expect(ack).toEqual({ ok: false, error: "invalid_id" });
    expect(socket.connected).toBe(true);
  });

  // The finding itself: a refused join must mean the socket is genuinely not in
  // the room, not merely that the ack said no.
  it("leaves a refused socket out of the room entirely", async () => {
    const socket = track(await connect(A.cookies.admin));
    await emitAck(socket, "chat:join", { chatId: String(B.chat._id) });

    const room = getIO().sockets.adapter.rooms.get(`chat:${B.chat._id}`);
    expect(room?.size ?? 0).toBe(0);
  });

  it("delivers nothing to a refused socket when the other tenant posts", async () => {
    const intruder = track(await connect(A.cookies.admin));
    await emitAck(intruder, "chat:join", { chatId: String(B.chat._id) });

    const received = [];
    intruder.on("message:new", (m) => received.push(m));

    getIO().to(`chat:${B.chat._id}`).emit("message:new", { content: "tenant B secret" });
    await new Promise((r) => setTimeout(r, 300));

    expect(received).toEqual([]);
  });
});

describe("workspace:focus authorization", () => {
  it("admits an admin to their own workspace", async () => {
    const socket = track(await connect(A.cookies.admin));
    const ack = await emitAck(socket, "workspace:focus", {
      workspaceId: String(A.workspaceTwo._id),
    });
    expect(ack.ok).toBe(true);
  });

  it("refuses another tenant's workspace", async () => {
    const socket = track(await connect(A.cookies.admin));
    const ack = await emitAck(socket, "workspace:focus", {
      workspaceId: String(B.workspace._id),
    });
    expect(ack.ok).toBe(false);
    expect(getIO().sockets.adapter.rooms.get(`workspace:${B.workspace._id}`)?.size ?? 0).toBe(0);
  });
});

describe("chat:typing", () => {
  it("emits nothing into a room the socket never joined", async () => {
    const intruder = track(await connect(A.cookies.admin));
    const member = track(await connect(B.cookies.admin));
    await emitAck(member, "chat:join", { chatId: String(B.chat._id) });

    const seen = [];
    member.on("chat:typing", (e) => seen.push(e));

    intruder.emit("chat:typing", { chatId: String(B.chat._id), isTyping: true });
    await new Promise((r) => setTimeout(r, 300));

    expect(seen).toEqual([]);
  });
});

describe("revoking access disconnects live sockets", () => {
  it("drops an agent's socket when they are suspended", async () => {
    const socket = track(await connect(A.cookies.agent));
    expect(socket.connected).toBe(true);

    const closed = new Promise((resolve) => socket.on("disconnect", resolve));
    await request(app)
      .patch(`/api/agents/${A.agent._id}/account-status`)
      .set("Cookie", A.cookies.admin)
      .send({ accountStatus: "suspended", reason: "test" });

    await Promise.race([closed, new Promise((r) => setTimeout(r, 2000))]);
    expect(socket.connected).toBe(false);
  });

  it("drops a customer's socket when they are deleted", async () => {
    const socket = track(await connect(A.cookies.customer));
    const closed = new Promise((resolve) => socket.on("disconnect", resolve));

    await request(app)
      .delete(`/api/users/remove/${A.customer._id}`)
      .set("Cookie", A.cookies.admin)
      .send({ reason: "test" });

    await Promise.race([closed, new Promise((r) => setTimeout(r, 2000))]);
    expect(socket.connected).toBe(false);
  });

  it("drops the socket on logout", async () => {
    const socket = track(await connect(A.cookies.agent));
    const closed = new Promise((resolve) => socket.on("disconnect", resolve));

    await request(app).post("/api/auth/logout").set("Cookie", A.cookies.agent);

    await Promise.race([closed, new Promise((r) => setTimeout(r, 2000))]);
    expect(socket.connected).toBe(false);
  });
});

describe("presence across tabs", () => {
  it("stays online while one of two tabs remains open", async () => {
    const first = track(await connect(A.cookies.agent));
    const second = track(await connect(A.cookies.agent));
    await new Promise((r) => setTimeout(r, 200));

    first.close();
    await new Promise((r) => setTimeout(r, 400));

    expect((await agentModel.findById(A.agent._id).select("status")).status).toBe("online");
    second.close();
  });
});
