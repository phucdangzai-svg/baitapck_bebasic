import { verifyAccessToken } from "../utils/jwt.js";
import { createError } from "../utils/createError.js";

export const authenticate = (req, res, next) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return next(createError(401, "Chưa đăng nhập"));
  }

  const token = header.split(" ")[1];

  try {
    req.user = verifyAccessToken(token);
    next();
  } catch (error) {
    next(createError(401, "Token không hợp lệ hoặc đã hết hạn"));
  }
};

export const authorize = (roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(createError(403, "Không đủ quyền truy cập"));
    }
    next();
  };
};

// sử dụng cho guest
export const optionalAuthenticate = (req, res, next) => {
  const header = req.headers.authorization;

  if (header && header.startsWith("Bearer ")) {
    try {
      req.user = verifyAccessToken(header.split(" ")[1]);
    } catch (error) {}
  }

  next();
};
