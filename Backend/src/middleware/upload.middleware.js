import multer from "multer";
import { AppError } from "../utils/errorHandler.js";
import { HTTP_STATUS } from "../config/constants.js";

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];
const ALLOWED_PDF_TYPE = "application/pdf";
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const storage = multer.memoryStorage();

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
