import * as orderRepo from "../repositories/order.repository.js";
import * as productRepo from "../repositories/product.repository.js";
import { createError } from "../utils/createError.js";

const ALL_STATUS = ["PENDING", "SHIPPING", "DELIVERED", "CANCELLED"];

// mỗi trạng thái được chuyển sang những trạng thái nào
const NEXT_STATUS = {
  PENDING: ["SHIPPING", "CANCELLED"],
  SHIPPING: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
};

const checkId = (id) => {
  const orderId = Number(id);
  if (!Number.isInteger(orderId) || orderId <= 0) {
    throw createError(400, "Id đơn hàng không hợp lệ");
  }
  return orderId;
};

// lấy đơn kèm danh sách sản phẩm trong đơn
const getOrderWithItems = async (orderId) => {
  const order = await orderRepo.getOrderById(orderId);
  if (!order) {
    throw createError(404, "Không tìm thấy đơn hàng");
  }

  order.items = await orderRepo.getOrderItemByOrderId(orderId);
  return order;
};

export const createOrder = async (userId, data) => {
  // 1. kiểm tra thông tin chung
  const errors = [];

  if (
    typeof data.shippingAddress !== "string" ||
    data.shippingAddress.trim() === "" ||
    data.shippingAddress.length > 255
  ) {
    errors.push("Địa chỉ giao hàng là bắt buộc (tối đa 255 ký tự)");
  }
  if (
    typeof data.receiverPhone !== "string" ||
    !/^\d{10}$/.test(data.receiverPhone)
  ) {
    errors.push("Số điện thoại người nhận phải gồm 10 chữ số");
  }
  if (
    data.note !== undefined &&
    data.note !== null &&
    (typeof data.note !== "string" || data.note.length > 255)
  ) {
    errors.push("Ghi chú phải là chuỗi tối đa 255 ký tự");
  }
  if (!Array.isArray(data.items) || data.items.length === 0) {
    errors.push("Đơn hàng phải có ít nhất 1 sản phẩm");
  }
  if (errors.length > 0) {
    throw createError(400, "Dữ liệu không hợp lệ", errors);
  }

  // 2. kiểm tra từng sản phẩm, lấy giá từ DB, tính tổng tiền
  const orderItems = [];
  let totalAmount = 0;

  for (const item of data.items) {
    if (!Number.isInteger(item.productId) || item.productId <= 0) {
      throw createError(400, "Id sản phẩm không hợp lệ");
    }
    if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
      throw createError(400, "Số lượng phải là số nguyên lớn hơn 0");
    }

    const duplicated = orderItems.find((x) => x.productId === item.productId);
    if (duplicated) {
      throw createError(400, `Sản phẩm ${item.productId} bị lặp trong đơn`);
    }

    const product = await productRepo.getProductById(item.productId);
    if (!product || !product.is_active) {
      throw createError(
        400,
        `Sản phẩm ${item.productId} không tồn tại hoặc đã ngừng bán`,
      );
    }
    if (item.quantity > product.stock) {
      throw createError(
        400,
        `Sản phẩm "${product.name}" chỉ còn ${product.stock} trong kho`,
      );
    }

    const price = Number(product.price);
    totalAmount += price * item.quantity;
    orderItems.push({
      productId: item.productId,
      quantity: item.quantity,
      price: price,
    });
  }

  // 3. lưu đơn (repository lo transaction và trừ kho)
  const orderId = await orderRepo.createOrder(
    {
      userId: userId,
      totalAmount: totalAmount,
      shippingAddress: data.shippingAddress.trim(),
      receiverPhone: data.receiverPhone,
      note: data.note || null,
    },
    orderItems,
  );

  return await getOrderWithItems(orderId);
};

export const getAllOrderByUserId = async (userId) => {
  return await orderRepo.getAllOrderByUserId(userId);
};

export const getAllOrder = async () => {
  return await orderRepo.getAllOrder();
};

export const getOrderById = async (id, user) => {
  const order = await getOrderWithItems(checkId(id));

  // User chỉ xem được đơn của mình, Admin xem được tất cả
  if (user.role !== "ADMIN" && order.user_id !== user.id) {
    throw createError(403, "Bạn không có quyền xem đơn hàng này");
  }

  return order;
};

export const updateOrderStatus = async (id, status) => {
  const orderId = checkId(id);

  if (!ALL_STATUS.includes(status)) {
    throw createError(
      400,
      "Trạng thái phải là PENDING, SHIPPING, DELIVERED hoặc CANCELLED",
    );
  }

  const order = await orderRepo.getOrderById(orderId);
  if (!order) {
    throw createError(404, "Không tìm thấy đơn hàng");
  }

  if (!NEXT_STATUS[order.status].includes(status)) {
    throw createError(
      400,
      `Không thể chuyển đơn từ ${order.status} sang ${status}`,
    );
  }

  if (status === "CANCELLED") {
    await orderRepo.cancelOrder(orderId);
  } else {
    await orderRepo.updateOrderStatus(orderId, status);
  }

  return await getOrderWithItems(orderId);
};
