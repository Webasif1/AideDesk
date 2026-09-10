// Email verification net.
//
// Registration used to call generateToken, which set a session cookie AND
// returned the JWT in the body AND emailed that same token as the verification
// link. So an unverified account was immediately usable, the link in an inbox
// was a working login, and the token from the register response could be
// replayed against /verify to self-verify without ever receiving the email.
// /verify accepted any JWT signed with JWT_SECRET because it checked no purpose.
import { beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../../src/app.js";
import { config } from "../../src/config/config.js";
import adminModel from "../../src/models/admin.model.js";
import { buildTenant, cookieFor } from "../helpers/tenant.js";
import { generateVerificationToken, hashToken } from "../../src/utils/tokens.js";

const CREDENTIALS = {
  fullName: "Pen Test",
  email: "newadmin@example.test",
  password: "Str0ngPassw0rd!",
};

const register = (over = {}) =>
  request(app).post("/api/auth/register").send({ ...CREDENTIALS, ...over });

/** Issue a genuine verification link the way registration does. */
const issueVerifyToken = async (admin) => {
  const token = generateVerificationToken(admin._id, admin.email, "admin");
  await adminModel.updateOne({ _id: admin._id }, { verifyTokenHash: hashToken(token) });
  return token;
};

describe("registration", () => {
  it("does not set a session cookie or return a token", async () => {
    const res = await register();

    expect(res.status).toBe(201);
    expect(res.body.token).toBeUndefined();
    expect(res.body.data.token).toBeUndefined();
    expect(res.headers["set-cookie"]).toBeUndefined();
  });

  it("leaves the account unverified and unauthenticated", async () => {
    await register();

    const admin = await adminModel.findOne({ email: CREDENTIALS.email });
    expect(admin.isVerified).toBe(false);

    // Nothing from the register response can be replayed as a session.
    const me = await request(app).get("/api/auth/get-me");
    expect(me.status).toBe(401);
  });

  it("refuses a duplicate email", async () => {
    await register();
    expect((await register()).status).toBe(409);
  });
});

describe("login before verification", () => {
  it("is refused", async () => {
    await register();
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: CREDENTIALS.email, password: CREDENTIALS.password });

    expect(res.status).toBeGreaterThanOrEqual(400);
    expect(res.headers["set-cookie"]).toBeUndefined();
  });
});

describe("the verification endpoint", () => {
  let admin;
  beforeEach(async () => {
    await register();
    admin = await adminModel.findOne({ email: CREDENTIALS.email });
  });

  it("accepts a genuine verification link exactly once", async () => {
    const token = await issueVerifyToken(admin);

    const first = await request(app).get(`/api/auth/verify/${token}`);
    expect([200, 302]).toContain(first.status);
    expect((await adminModel.findById(admin._id)).isVerified).toBe(true);

    // Replay must fail even though the token is still inside its 24h window.
    const second = await request(app).get(`/api/auth/verify/${token}`);
    expect(second.status).not.toBe(302);
    const body = String(second.text ?? "");
    expect(body).toMatch(/already been verified|Invalid or Expired/i);
  });

  // The bypass: a session JWT is signed with the same secret, so without a
  // purpose claim it verified here.
  it("refuses a session token", async () => {
    const session = cookieFor({
      _id: admin._id,
      email: admin.email,
      role: "admin",
      companyId: null,
      workspaceId: null,
    }).replace("token=", "");

    const res = await request(app).get(`/api/auth/verify/${session}`);
    expect(res.status).toBe(401);
    expect((await adminModel.findById(admin._id)).isVerified).toBe(false);
  });

  it("refuses a token with a different purpose", async () => {
    const reset = jwt.sign(
      { userId: admin._id, purpose: "password-reset" },
      config.JWT_SECRET,
      { expiresIn: "15m" },
    );
    const res = await request(app).get(`/api/auth/verify/${reset}`);
    expect(res.status).toBe(401);
    expect((await adminModel.findById(admin._id)).isVerified).toBe(false);
  });

  it("refuses an expired token", async () => {
    const expired = jwt.sign(
      { userId: admin._id, email: admin.email, role: "admin", purpose: "email-verify" },
      config.JWT_SECRET,
      { expiresIn: -10 },
    );
    expect((await request(app).get(`/api/auth/verify/${expired}`)).status).toBe(401);
  });

  it("refuses a link that a newer one superseded", async () => {
    // Requesting a fresh verification email must invalidate the previous link,
    // otherwise every link ever issued stays live for its full 24h window.
    const older = await issueVerifyToken(admin);

    // A JWT issued in the same second with identical claims is byte-identical,
    // so vary a claim to guarantee a genuinely different token.
    const newer = generateVerificationToken(admin._id, `x.${admin.email}`, "admin");
    await adminModel.updateOne({ _id: admin._id }, { verifyTokenHash: hashToken(newer) });

    const res = await request(app).get(`/api/auth/verify/${older}`);
    expect(res.status).toBe(401);
    expect((await adminModel.findById(admin._id)).isVerified).toBe(false);
  });

  it("refuses a well-formed token for an account that does not exist", async () => {
    const orphan = generateVerificationToken(
      "6aa0000000000000000000aa",
      "ghost@example.test",
      "admin",
    );
    const res = await request(app).get(`/api/auth/verify/${orphan}`);
    expect([401, 404]).toContain(res.status);
  });

  it("refuses garbage", async () => {
    expect((await request(app).get("/api/auth/verify/not-a-jwt")).status).toBe(401);
  });
});

describe("login after verification", () => {
  it("succeeds and issues a session", async () => {
    await register();
    const admin = await adminModel.findOne({ email: CREDENTIALS.email });
    const token = await issueVerifyToken(admin);
    await request(app).get(`/api/auth/verify/${token}`);

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: CREDENTIALS.email, password: CREDENTIALS.password });

    expect(res.status).toBe(200);
    expect(res.headers["set-cookie"].join(";")).toMatch(/token=/);
    // Session cookies must not be readable by script.
    expect(res.headers["set-cookie"].join(";")).toMatch(/HttpOnly/i);
  });
});

describe("session handling", () => {
  it("serves get-me with a valid cookie and refuses without", async () => {
    const A = await buildTenant("A");
    expect((await request(app).get("/api/auth/get-me").set("Cookie", A.cookies.admin)).status).toBe(200);
    expect((await request(app).get("/api/auth/get-me")).status).toBe(401);
  });

  it("refuses a token signed with the wrong secret", async () => {
    const A = await buildTenant("A");
    const forged = jwt.sign(
      { userId: String(A.admin._id), email: A.admin.email, role: "admin" },
      "not-the-real-secret",
      { expiresIn: "1h" },
    );
    const res = await request(app).get("/api/auth/get-me").set("Cookie", `token=${forged}`);
    expect(res.status).toBe(401);
  });

  it("clears the cookie on logout", async () => {
    const A = await buildTenant("A");
    const res = await request(app).post("/api/auth/logout").set("Cookie", A.cookies.admin);
    expect(res.status).toBe(200);
    expect(res.headers["set-cookie"].join(";")).toMatch(/token=;/);
  });
});

describe("security headers", () => {
  it("sends a CSP that blocks inline script, plus nosniff and no x-powered-by", async () => {
    const res = await request(app).get("/api/health");

    expect(res.headers["content-security-policy"]).toMatch(/script-src 'self'/);
    expect(res.headers["content-security-policy"]).toMatch(/object-src 'none'/);
    expect(res.headers["content-security-policy"]).toMatch(/frame-ancestors 'none'/);
    expect(res.headers["x-content-type-options"]).toBe("nosniff");
    expect(res.headers["x-powered-by"]).toBeUndefined();
  });
});
