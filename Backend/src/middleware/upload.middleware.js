import multer from "multer";
import { AppError } from "../utils/errorHandler.js";
import { HTTP_STATUS } from "../config/constants.js";
import { sniffFileType } from "../utils/fileSignature.js";

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];
const ALLOWED_PDF_TYPE = "application/pdf";
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const storage = multer.memoryStorage();

// First gate only. file.mimetype is the Content-Type the client chose, so this
// rejects the obviously-wrong quickly but proves nothing — verifyFileContent
// below is what actually decides.
const fileFilter = (req, file, cb) => {
  if (
    ALLOWED_IMAGE_TYPES.includes(file.mimetype) ||
    file.mimetype === ALLOWED_PDF_TYPE
  ) {
    cb(null, true);
  } else {
    cb(
      new AppError(
        "Only images (JPEG/PNG/WEBP/GIF) and PDFs are allowed",
        HTTP_STATUS.BAD_REQUEST
      ),
      false,
    );
  }
};

const chatFileUpload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE }
}).single("attachment");

/**
 * Verify the bytes actually are what they claim, and overwrite the client's
 * claim with the verified truth.
 *
 * Everything downstream — storage, the extension on disk, the Content-Type the
 * download route sets, isImage() in the UI — reads req.file.mimetype. Setting
 * it here to the sniffed value means none of them can be fooled by a header.
 *
 * Mount immediately after handleChatUpload on every upload route.
 */
export const verifyFileContent = (req, res, next) => {
  if (!req.file) return next();

  if (!req.file.buffer?.length) {
    return next(new AppError("Uploaded file is empty", HTTP_STATUS.BAD_REQUEST));
  }

  const sniffed = sniffFileType(req.file.buffer);
  if (!sniffed) {
    return next(
      new AppError(
        "File content is not a supported image or PDF",
        HTTP_STATUS.BAD_REQUEST,
        "UNSUPPORTED_FILE_CONTENT"
      )
    );
  }

  req.file.mimetype = sniffed.mime;
  req.file.verifiedExt = sniffed.ext;
  next();
};

// Wrap multer so it cooperates with asyncHandler error pipeline.
export const handleChatUpload = (req, res, next) => {
  chatFileUpload(req, res, err => {
    if (err instanceof multer.MulterError) {
      return next(
        new AppError(`Upload error: ${err.message}`, HTTP_STATUS.BAD_REQUEST)
      );
    }
    if (err) return next(err);
    next();
  });
};
