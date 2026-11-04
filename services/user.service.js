import * as userRepo from "../repositories/user.repository.js";
import { createError } from "../utils/createError.js";

export const getUserProfile = async (userId) => {
  const user = await userRepo.findById(userId);
  if (!user) {
    throw createError(404, "Không tìm thấy người dùng");
  }

  return user;
};

export const updateUserProfile = async (userId, data) => {
  const existing = await userRepo.findById(userId);
  if (!existing) {
    throw createError(404, "Không tìm thấy người dùng");
  }

  if (data.fullName === undefined && data.phone === undefined) {
    throw createError(400, "Cần gửi họ tên hoặc số điện thoại để cập nhật");
  }

  // chỉ lấy họ tên và số điện thoại, các trường khác client gửi lên đều bỏ qua
  let fullName = existing.full_name;
  let phone = existing.phone;
  if (data.fullName !== undefined) fullName = data.fullName;
  if (data.phone !== undefined) phone = data.phone;

  const errors = [];
  if (typeof fullName !== "string" || fullName.trim() === "") {
    errors.push("Họ tên không được để trống");
  }
  if (typeof phone !== "string" || !/^\d{10}$/.test(phone)) {
    errors.push("Số điện thoại không hợp lệ");
  }
  if (errors.length > 0) {
    throw createError(400, "Dữ liệu không hợp lệ", errors);
  }

  await userRepo.updateUser(userId, { fullName: fullName.trim(), phone });

  return await userRepo.findById(userId);
};
