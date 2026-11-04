import * as authService from "../services/auth.service.js";
import { sendSuccess } from "../utils/response.js";

export const register = async (req, res, next) => {
  try {
    const user = await authService.register(req.body);
    sendSuccess(res, user, "Đăng ký thành công", 201);
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const data = await authService.login(req.body);
    sendSuccess(res, data, "Đăng nhập thành công");
  } catch (error) {
    next(error);
  }
};

export const refresh = async (req, res, next) => {
  try {
    const data = await authService.refresh(req.body.refreshToken);
    sendSuccess(res, data, "Làm mới token thành công");
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    await authService.logout(req.body.refreshToken);
    sendSuccess(res, null, "Đăng xuất thành công");
  } catch (error) {
    next(error);
  }
};

export const me = (req, res) => {
  sendSuccess(res, req.user, "OK");
};