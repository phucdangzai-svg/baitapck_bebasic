import * as userService from "../services/user.service.js";
import { sendSuccess } from "../utils/response.js";

export const getUserProfile = async (req, res, next) => {
  try {
    const user = await userService.getUserProfile(req.user.id);
    sendSuccess(res, user, "Lấy thông tin cá nhân thành công");
  } catch (error) {
    next(error);
  }
};

export const updateUserProfile = async (req, res, next) => {
  try {
    const user = await userService.updateUserProfile(req.user.id, req.body);
    sendSuccess(res, user, "Cập nhật thông tin thành công");
  } catch (error) {
    next(error);
  }
};
