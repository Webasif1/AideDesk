// Authenticated attachment downloads.
//
// This replaces `app.use("/uploads", express.static(...))`, which served every
// uploaded file to anyone who knew (or guessed) a URL, with no authentication,
// no ownership check, and a Content-Type inferred from the on-disk extension.
//
// It is deliberately mounted at the SAME /uploads path. Attachment URLs are
// already persisted in ticket.attachments[].url and message.attachments[].url,
// both required fields — moving the path would orphan every existing row and
// force a backfill. Keeping the path means the fix is server-side only.
//
// Serving with the *stored* mimetype rather than letting express.static guess
// from the extension also neutralises files already on disk from before the
// upload pipeline was hardened: a .html sitting in uploads/ from the old code
// is now served as whatever its record says, under nosniff.
import { Router } from "express";
import path from "path";
import fs from "fs";
import { protect } from "../middleware/auth.middleware.js";
import { AppError, asyncHandler } from "../utils/errorHandler.js";
import { HTTP_STATUS } from "../config/constants.js";
import { ATTACHMENT_SUBDIRS, UPLOAD_ROOT } from "../utils/fileStorage.js";
import { actorFromReq, canAccessChat } from "../services/chatAccess.js";
import ticketModel from "../models/ticket.model.js";
import messageModel from "../models/message.model.js";
import chatModel from "../models/chat.model.js";

const router = Router();

router.use(protect);

// Names written by fileStorage are always <uuid>.<ext>. Anything else — a
// traversal attempt, a legacy "<uuid>-original name.html" — fails here.
const DISK_NAME = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.[a-z0-9]{1,5}$/i;

const notFound = () => new AppError("Attachment not found", HTTP_STATUS.NOT_FOUND);

/**
 * Resolve who owns an attachment URL, and whether this caller may read it.
 *
 * Ownership is derived from the URL itself rather than a separate table: the
 * attachment is embedded in the ticket or message that carries it, so the
 * document that contains the URL *is* the authorization record.
 */
const findAccessibleAttachment = async (url, req) => {
  const ticket = await ticketModel
    .findOne({ "attachments.url": url })
    .select("companyId customerId assignedAgent attachments");

  if (ticket) {
    const sameCompany = String(ticket.companyId) === String(req.companyId);
    const allowed =
      (req.role === "admin" && sameCompany) ||
      (req.role === "agent" &&
        sameCompany &&
        String(ticket.assignedAgent || "") === String(req.userId)) ||
      (req.role === "customer" && String(ticket.customerId) === String(req.userId));
    if (!allowed) return null;
    return ticket.attachments.find((a) => a.url === url) || null;
  }

  const message = await messageModel
    .findOne({ "attachments.url": url })
    .select("chat attachments");
  if (!message) return null;

  const chat = await chatModel
    .findById(message.chat)
    .select("company user assignedAgent assignedAdmin workspaceId");
  if (!canAccessChat(chat, actorFromReq(req))) return null;

  return message.attachments.find((a) => a.url === url) || null;
};

router.get(
  "/:subdir/:diskName",
  asyncHandler(async (req, res) => {
    const { subdir, diskName } = req.params;

    if (!ATTACHMENT_SUBDIRS.includes(subdir)) throw notFound();
    if (!DISK_NAME.test(diskName)) throw notFound();

    const attachment = await findAccessibleAttachment(
      `/uploads/${subdir}/${diskName}`,
      req,
    );
    // A file the caller may not read is reported as missing, not forbidden —
    // otherwise the response confirms the attachment exists.
    if (!attachment) throw notFound();

    const absolute = path.join(UPLOAD_ROOT, subdir, diskName);
    // Belt and braces after the regex: the resolved path must still sit inside
    // the upload root.
    if (!absolute.startsWith(path.join(UPLOAD_ROOT, subdir))) throw notFound();
    if (!fs.existsSync(absolute)) throw notFound();

    const isImage = attachment.mimetype?.startsWith("image/");
    // Inline previews are allowed for images only. A PDF rendered inline can
    // host script in some viewers, and anything else is untrusted by
    // definition, so both are forced to download.
    const inline = isImage && req.query.disposition === "inline";

    res.setHeader("Content-Type", attachment.mimetype || "application/octet-stream");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Content-Security-Policy", "default-src 'none'; sandbox");
    res.setHeader(
      "Content-Disposition",
      `${inline ? "inline" : "attachment"}; filename="${encodeURIComponent(attachment.filename || "file")}"`,
    );
    res.sendFile(absolute);
  }),
);

export default router;
