import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

export const UPLOAD_ROOT = path.join(path.resolve(), "uploads");

// Attachments are only ever written into these. The download route checks the
// same list, so a subdir cannot be used to walk out of the upload root.
export const ATTACHMENT_SUBDIRS = ["ticket-attachments", "chat-attachments"];

// Strips anything that could be read as a path or as markup when the name is
// rendered. Length-capped so a 4KB filename cannot bloat every message row.
const sanitizeDisplayName = (name = "file") =>
  String(name)
    .replace(/[\\/]/g, "_")
    .replace(/[^\w.\- ]/g, "_")
    .slice(0, 120) || "file";

// Persists a multer memory-storage file to disk and returns the info needed
// to render it later (URL, original name, mimetype). Used for ticket
// attachments, which — unlike chat-copilot attachments — need to survive
// past the request that uploaded them.
export const saveUploadedFile = async (file, subdir = "ticket-attachments") => {
  const dir = path.join(UPLOAD_ROOT, subdir);
  await fs.mkdir(dir, { recursive: true });

  // The name on disk is derived, never taken from the client. Keeping the
  // original extension meant an upload called poc.html stayed .html on disk,
  // and express.static then served it as text/html on our own origin.
  // verifiedExt comes from verifyFileContent's magic-byte check.
  const ext = file.verifiedExt || "bin";
  const diskName = `${crypto.randomUUID()}.${ext}`;
  await fs.writeFile(path.join(dir, diskName), file.buffer);

  return {
    url: `/uploads/${subdir}/${diskName}`,
    // Display only — never used to build a path.
    filename: sanitizeDisplayName(file.originalname),
    mimetype: file.mimetype,
  };
};
