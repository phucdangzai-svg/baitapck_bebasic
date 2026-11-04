import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { createError } from "../utils/createError.js";

const UPLOAD_DIR = path.join(process.cwd(), "uploads", "products");
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const ALLOWED_EXT = [".jpg", ".jpeg", ".png", ".webp"];
const MAX_SIZE = 2 * 1024 * 1024; // 2MB

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${crypto.randomUUID()}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();

  if (!ALLOWED_TYPES.includes(file.mimetype) || !ALLOWED_EXT.includes(ext)) {
    return cb(createError(400, "Chỉ chấp nhận ảnh JPG, PNG hoặc WEBP"));
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_SIZE },
});

export const uploadProductImage = (req, res, next) => {
  upload.single("image")(req, res, (err) => {
    if (!err) {
      return next();
    }
    if (err.code === "LIMIT_FILE_SIZE") {
      return next(createError(400, "Ảnh không được lớn hơn 2MB"));
    }
    if (err.code === "LIMIT_UNEXPECTED_FILE") {
      return next(
        createError(400, "File ảnh phải gửi trong trường tên là image"),
      );
    }
    next(err);
  });
};
