import * as orderService from "../services/order.service.js";
import { sendSuccess } from "../utils/response.js";

export const createOrder = async (req, res, next) => {
  try {
    const order = await orderService.createOrder(req.user.id, req.body);
    sendSuccess(res, order, "Tạo đơn hàng thành công", 201);
  } catch (error) {
    next(error);
  }
};

export const getAllOrderByUserId = async (req, res, next) => {
  try {
    const orders = await orderService.getAllOrderByUserId(req.user.id);
    sendSuccess(res, orders, "Lấy danh sách đơn hàng của bạn thành công");
  } catch (error) {
    next(error);
  }
};

export const getAllOrder = async (req, res, next) => {
  try {
    const orders = await orderService.getAllOrder();
    sendSuccess(res, orders, "Lấy danh sách tất cả đơn hàng thành công");
  } catch (error) {
    next(error);
  }
};

export const getOrderById = async (req, res, next) => {
  try {
    const order = await orderService.getOrderById(req.params.id, req.user);
    sendSuccess(res, order, "Lấy chi tiết đơn hàng thành công");
  } catch (error) {
    next(error);
  }
};

export const updateOrderStatus = async (req, res, next) => {
  try {
    const order = await orderService.updateOrderStatus(
      req.params.id,
      req.body.status,
    );
    sendSuccess(res, order, "Cập nhật trạng thái đơn hàng thành công");
  } catch (error) {
    next(error);
  }
};
