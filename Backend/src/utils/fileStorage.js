import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

const UPLOAD_ROOT = path.join(path.resolve(), "uploads");

// Persists a multer memory-storage file to disk and returns the info needed
// to render it later (URL, original name, mimetype). Used for ticket
// attachments, which — unlike chat-copilot attachments — need to survive
// past the request that uploaded them.
export const saveUploadedFile = async (file, subdir = "ticket-attachments") => {
  const dir = path.join(UPLOAD_ROOT, subdir);
  await fs.mkdir(dir, { recursive: true });

  const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
  const diskName = `${crypto.randomUUID()}-${safeName}`;
  await fs.writeFile(path.join(dir, diskName), file.buffer);

  return {
    url: `/uploads/${subdir}/${diskName}`,
    filename: file.originalname,
    mimetype: file.mimetype,
  };
};
