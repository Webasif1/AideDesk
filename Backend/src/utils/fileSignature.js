// Content-based file type detection.
//
// multer's fileFilter can only see the Content-Type the client put on the
// multipart part, which is attacker-controlled. An HTML file declared as
// image/png passed that filter, kept its .html extension on disk, and was then
// served by express.static as text/html on the application's own origin —
// stored XSS against a same-origin session.
//
// These are the only five types the app accepts, so a hand-rolled sniffer is
// both sufficient and easier to audit than a dependency. It reads the magic
// bytes and ignores the declared type entirely.

const startsWith = (buf, bytes, offset = 0) =>
  bytes.every((b, i) => buf[offset + i] === b);

const SIGNATURES = [
  // JPEG — FF D8 FF
  { mime: "image/jpeg", ext: "jpg", test: (b) => startsWith(b, [0xff, 0xd8, 0xff]) },
  // PNG — 89 50 4E 47 0D 0A 1A 0A
  {
    mime: "image/png",
    ext: "png",
    test: (b) => startsWith(b, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  },
  // GIF — "GIF87a" / "GIF89a"
  {
    mime: "image/gif",
    ext: "gif",
    test: (b) => startsWith(b, [0x47, 0x49, 0x46, 0x38]) && (b[4] === 0x37 || b[4] === 0x39),
  },
  // WEBP — "RIFF" .... "WEBP"
  {
    mime: "image/webp",
    ext: "webp",
    test: (b) =>
      startsWith(b, [0x52, 0x49, 0x46, 0x46]) &&
      startsWith(b, [0x57, 0x45, 0x42, 0x50], 8),
  },
  // PDF — "%PDF-"
  {
    mime: "application/pdf",
    ext: "pdf",
    test: (b) => startsWith(b, [0x25, 0x50, 0x44, 0x46, 0x2d]),
  },
];

/**
 * @param {Buffer} buffer
 * @returns {{mime: string, ext: string}|null} null when nothing matches —
 *   which includes SVG, deliberately: it is an image by extension but a
 *   scriptable document in a browser.
 */
export const sniffFileType = (buffer) => {
  if (!Buffer.isBuffer(buffer) || buffer.length < 12) return null;
  const hit = SIGNATURES.find((s) => s.test(buffer));
  return hit ? { mime: hit.mime, ext: hit.ext } : null;
};

export const SNIFFABLE_MIMES = SIGNATURES.map((s) => s.mime);
