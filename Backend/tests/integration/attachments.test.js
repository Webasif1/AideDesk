// Attachment pipeline net.
//
// The original chain: multer trusted the client's Content-Type, fileStorage
// kept the original extension on disk, and express.static served the result
// with a Content-Type inferred from that extension and no authentication. An
// HTML file declared image/png therefore executed script on the app's own
// origin. Each layer is asserted separately so a regression in any one of them
// fails on its own.
import { beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import fs from "fs/promises";
import path from "path";
import app from "../../src/app.js";
import { UPLOAD_ROOT } from "../../src/utils/fileStorage.js";
import { sniffFileType } from "../../src/utils/fileSignature.js";
import ticketModel from "../../src/models/ticket.model.js";
import { buildTenant } from "../helpers/tenant.js";

// Minimal but genuinely valid files — the sniffer reads magic bytes, so these
// have to be real headers rather than plausible-looking noise.
const PNG = Buffer.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
  0x49, 0x48, 0x44, 0x52,
]);
const JPEG = Buffer.concat([Buffer.from([0xff, 0xd8, 0xff, 0xe0]), Buffer.alloc(16)]);
const GIF = Buffer.concat([Buffer.from("GIF89a", "latin1"), Buffer.alloc(16)]);
const WEBP = Buffer.concat([
  Buffer.from("RIFF", "latin1"),
  Buffer.alloc(4),
  Buffer.from("WEBP", "latin1"),
  Buffer.alloc(8),
]);
const PDF = Buffer.concat([Buffer.from("%PDF-1.4\n", "latin1"), Buffer.alloc(16)]);
const HTML = Buffer.from(
  '<html><script>fetch("/api/auth/get-me").then(r=>r.json())</script></html>',
);
const SVG = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>');

let A, B;
beforeEach(async () => {
  A = await buildTenant("A");
  B = await buildTenant("B");
});

const uploadTicket = (tenant, buffer, filename, contentType) =>
  request(app)
    .post("/api/tickets")
    .set("Cookie", tenant.cookies.customer)
    .field("title", "Attachment test ticket")
    .field("description", "A description long enough to satisfy validation.")
    .attach("attachment", buffer, { filename, contentType });

describe("content sniffing", () => {
  it("identifies each accepted format from its bytes", () => {
    expect(sniffFileType(PNG)?.mime).toBe("image/png");
    expect(sniffFileType(JPEG)?.mime).toBe("image/jpeg");
    expect(sniffFileType(GIF)?.mime).toBe("image/gif");
    expect(sniffFileType(WEBP)?.mime).toBe("image/webp");
    expect(sniffFileType(PDF)?.mime).toBe("application/pdf");
  });

  it("refuses HTML and SVG whatever they are called", () => {
    expect(sniffFileType(HTML)).toBeNull();
    // SVG is an image by extension but a scriptable document in a browser, so
    // it is deliberately absent from the allow-list.
    expect(sniffFileType(SVG)).toBeNull();
  });

  it("refuses empty and truncated buffers", () => {
    expect(sniffFileType(Buffer.alloc(0))).toBeNull();
    expect(sniffFileType(Buffer.from([0x89, 0x50]))).toBeNull();
    expect(sniffFileType("not a buffer")).toBeNull();
  });
});

describe("upload", () => {
  // The exploit, verbatim: HTML bytes wearing an image/png Content-Type.
  it("rejects HTML content declared as image/png", async () => {
    const res = await uploadTicket(A, HTML, "poc.html", "image/png");
    expect(res.status).toBe(400);
  });

  it("rejects an SVG declared as image/png", async () => {
    const res = await uploadTicket(A, SVG, "poc.svg", "image/png");
    expect(res.status).toBe(400);
  });

  it("accepts a real PNG and strips the misleading extension", async () => {
    const res = await uploadTicket(A, PNG, "evil.html", "image/png");
    expect(res.status).toBe(201);

    const ticket = await ticketModel.findById(res.body.data.ticket._id);
    const [attachment] = ticket.attachments;

    expect(attachment.url).not.toContain(".html");
    expect(attachment.url).toMatch(/\.png$/);
    expect(attachment.mimetype).toBe("image/png");
  });

  it("accepts a real PDF", async () => {
    const res = await uploadTicket(A, PDF, "invoice.pdf", "application/pdf");
    expect(res.status).toBe(201);
    const ticket = await ticketModel.findById(res.body.data.ticket._id);
    expect(ticket.attachments[0].mimetype).toBe("application/pdf");
  });

  it("records the verified type even when the client lies in the safe direction", async () => {
    // A genuine PNG announced as a PDF must be stored as a PNG.
    const res = await uploadTicket(A, PNG, "thing.pdf", "application/pdf");
    expect(res.status).toBe(201);
    const ticket = await ticketModel.findById(res.body.data.ticket._id);
    expect(ticket.attachments[0].mimetype).toBe("image/png");
  });

  it("rejects an empty file", async () => {
    const res = await uploadTicket(A, Buffer.alloc(0), "empty.png", "image/png");
    expect(res.status).toBe(400);
  });
});

describe("download authorization", () => {
  let url;
  beforeEach(async () => {
    const res = await uploadTicket(A, PNG, "screenshot.png", "image/png");
    const ticket = await ticketModel.findById(res.body.data.ticket._id);
    url = ticket.attachments[0].url;
  });

  it("refuses an anonymous request", async () => {
    expect((await request(app).get(url)).status).toBe(401);
  });

  it("serves the owning customer", async () => {
    const res = await request(app).get(url).set("Cookie", A.cookies.customer);
    expect(res.status).toBe(200);
  });

  it("serves an admin of the owning company", async () => {
    const res = await request(app).get(url).set("Cookie", A.cookies.admin);
    expect(res.status).toBe(200);
  });

  it("refuses another tenant's admin", async () => {
    const res = await request(app).get(url).set("Cookie", B.cookies.admin);
    expect(res.status).toBe(404);
  });

  it("refuses another tenant's customer", async () => {
    const res = await request(app).get(url).set("Cookie", B.cookies.customer);
    expect(res.status).toBe(404);
  });

  it("refuses another customer in the same tenant", async () => {
    const res = await request(app).get(url).set("Cookie", A.cookies.otherCustomer);
    expect(res.status).toBe(404);
  });

  it("sends nosniff and a download disposition", async () => {
    const res = await request(app).get(url).set("Cookie", A.cookies.customer);
    expect(res.headers["x-content-type-options"]).toBe("nosniff");
    expect(res.headers["content-disposition"]).toMatch(/^attachment;/);
    expect(res.headers["content-type"]).toMatch(/^image\/png/);
  });

  it("allows inline disposition for images only", async () => {
    const img = await request(app)
      .get(`${url}?disposition=inline`)
      .set("Cookie", A.cookies.customer);
    expect(img.headers["content-disposition"]).toMatch(/^inline;/);

    const res = await uploadTicket(A, PDF, "doc.pdf", "application/pdf");
    const ticket = await ticketModel.findById(res.body.data.ticket._id);
    const pdf = await request(app)
      .get(`${ticket.attachments[0].url}?disposition=inline`)
      .set("Cookie", A.cookies.customer);
    // A PDF can host script in some viewers, so inline is refused for it.
    expect(pdf.headers["content-disposition"]).toMatch(/^attachment;/);
  });
});

describe("the static mount is gone", () => {
  it("does not serve an arbitrary file dropped into the upload directory", async () => {
    // Simulates a file written by the old, unhardened pipeline.
    const dir = path.join(UPLOAD_ROOT, "ticket-attachments");
    await fs.mkdir(dir, { recursive: true });
    const legacy = "11111111-1111-1111-1111-111111111111.html";
    await fs.writeFile(path.join(dir, legacy), HTML);

    // Unauthenticated: refused outright.
    expect((await request(app).get(`/uploads/ticket-attachments/${legacy}`)).status).toBe(401);

    // Authenticated but unreferenced by any ticket or message: still refused,
    // so a file on disk is not reachable merely because it exists.
    const res = await request(app)
      .get(`/uploads/ticket-attachments/${legacy}`)
      .set("Cookie", A.cookies.admin);
    expect(res.status).toBe(404);

    await fs.rm(path.join(dir, legacy), { force: true });
  });

  it("refuses traversal and unknown subdirectories", async () => {
    for (const attempt of [
      "/uploads/ticket-attachments/..%2f..%2f.env",
      "/uploads/not-a-subdir/11111111-1111-1111-1111-111111111111.png",
      // A name that is not <uuid>.<ext> never reaches the filesystem.
      "/uploads/ticket-attachments/.env",
      "/uploads/ticket-attachments/index.js",
    ]) {
      const res = await request(app).get(attempt).set("Cookie", A.cookies.admin);
      expect([400, 401, 404], `${attempt} -> ${res.status}`).toContain(res.status);
    }
  });

  it("never returns .env contents through any /uploads path", async () => {
    // Express normalises "/uploads/../.env" to "/.env" before routing, so it
    // lands on the SPA catch-all rather than this router. Assert on the thing
    // that actually matters — that no response carries the file.
    // Paths with extra segments miss this two-segment route and land on the
    // SPA catch-all, which answers 200 with index.html. That is correct
    // behaviour, so assert on the payload rather than the status.
    for (const attempt of [
      "/uploads/../.env",
      "/uploads/%2e%2e/.env",
      "/uploads/ticket-attachments/....//....//.env",
      "/.env",
    ]) {
      const res = await request(app).get(attempt).set("Cookie", A.cookies.admin);
      expect(String(res.text ?? ""), attempt).not.toMatch(/JWT_SECRET|MONGO_URI/);
    }
  });
});

describe("client-supplied attachments", () => {
  it("ignores an attachments array posted to /api/messages", async () => {
    const res = await request(app)
      .post("/api/messages")
      .set("Cookie", A.cookies.customer)
      .send({
        chat: String(A.chat._id),
        content: "look at this invoice",
        attachments: [
          {
            url: "https://evil.example.com/steal",
            filename: "invoice.pdf",
            mimetype: "application/pdf",
          },
        ],
      });

    expect(res.status).toBe(201);
    expect(res.body.data.attachments).toEqual([]);
  });
});
