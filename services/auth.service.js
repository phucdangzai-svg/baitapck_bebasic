import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import * as userRepo from "../repositories/user.repository.js";
import * as tokenRepo from "../repositories/token.repository.js";
import { createError } from "../utils/createError.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt.js";

export const register = async (data) => {
  const errors = [];

  if (!data.fullName) errors.push("Họ tên là bắt buộc");
  if (!data.phone) errors.push("Số điện thoại là bắt buộc");
  if (!data.email || !/^\S+@\S+\.\S+$/.test(data.email)) {
    errors.push("Email không hợp lệ");
  }
  if (!data.password || data.password.length < 6) {
    errors.push("Mật khẩu tối thiểu 6 ký tự");
  }
  if (errors.length > 0) {
    throw createError(400, "Dữ liệu không hợp lệ", errors);
  }

  const existed = await userRepo.findByEmail(data.email);
  if (existed) {
    throw createError(409, "Email đã tồn tại");
  }

  const hashed = await bcrypt.hash(data.password, 10);
  const id = await userRepo.create({
    fullName: data.fullName,
    email: data.email,
    password: hashed,
    phone: data.phone,
  });

  return await userRepo.findById(id);
};

export const login = async (data) => {
  if (!data.email || !data.password) {
    throw createError(400, "Email và mật khẩu là bắt buộc");
  }

  const user = await userRepo.findByEmail(data.email);
  if (!user) {
    throw createError(401, "Email hoặc mật khẩu không đúng");
  }

  const match = await bcrypt.compare(data.password, user.password);
  if (!match) {
    throw createError(401, "Email hoặc mật khẩu không đúng");
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  const expiresAt = new Date(jwt.decode(refreshToken).exp * 1000);
  await tokenRepo.saveToken(user.id, refreshToken, expiresAt);

  return {
    user: await userRepo.findById(user.id),
    accessToken,
    refreshToken,
  };
};

export const refresh = async (refreshToken) => {
  if (!refreshToken) {
    throw createError(400, "Thiếu refresh token");
  }

  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch (error) {
    throw createError(401, "Refresh token không hợp lệ hoặc đã hết hạn");
  }

  const saved = await tokenRepo.findToken(refreshToken);
  if (!saved || saved.is_revoked) {
    throw createError(401, "Refresh token đã bị thu hồi");
  }

  const user = await userRepo.findById(payload.id);
  if (!user) {
    throw createError(401, "Tài khoản không tồn tại");
  }

  return { accessToken: generateAccessToken(user) };
};

export const logout = async (refreshToken) => {
  if (!refreshToken) {
    throw createError(400, "Thiếu refresh token");
  }
  await tokenRepo.revokeToken(refreshToken);
};