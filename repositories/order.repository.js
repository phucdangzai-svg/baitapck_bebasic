import pool from "../configs/db.config.js";
import { createError } from "../utils/createError.js";

export const createOrder = async (order, items) => {
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    const [result] = await conn.query(
      "INSERT INTO orders (user_id, total_amount, shipping_address, receiver_phone, note, status) VALUES (?, ?, ?, ?, ?, 'PENDING')",
      [
        order.userId,
        order.totalAmount,
        order.shippingAddress,
        order.receiverPhone,
        order.note,
      ],
    );
    const orderId = result.insertId;

    for (const item of items) {
      await conn.query(
        "INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)",
        [orderId, item.productId, item.quantity, item.price],
      );

      const [update] = await conn.query(
        "UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?",
        [item.quantity, item.productId, item.quantity],
      );
      if (update.affectedRows === 0) {
        throw createError(400, "Có sản phẩm không còn đủ tồn kho");
      }
    }

    await conn.commit();
    return orderId;
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
};

// lấy tất cả đơn hàng
export const getAllOrder = async () => {
  const [rows] = await pool.query(
    `SELECT o.*, u.full_name AS customer_name, u.email AS customer_email
     FROM orders o
     JOIN users u ON u.id = o.user_id
     ORDER BY o.id DESC`,
  );
  return rows;
};
// lấy tất cả đơn của 1 khách
export const getAllOrderByUserId = async (userId) => {
  const [rows] = await pool.query(
    "SELECT * FROM orders WHERE user_id = ? ORDER BY id DESC",
    [userId],
  );
  return rows;
};
// lấy 1 đơn hàng của khách
export const getOrderById = async (id) => {
  const [rows] = await pool.query(
    `SELECT o.*, u.full_name AS customer_name, u.email AS customer_email, u.phone AS customer_phone
     FROM orders o
     JOIN users u ON u.id = o.user_id
     WHERE o.id = ?`,
    [id],
  );
  return rows[0];
};
export const updateOrderStatus = async (id, status) => {
  await pool.query("UPDATE orders SET status = ? WHERE id = ?", [status, id]);
};

// hủy đơn + hoàn lại tồn kho, trong một transaction
export const cancelOrder = async (id) => {
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    const [result] = await conn.query(
      "UPDATE orders SET status = 'CANCELLED' WHERE id = ? AND status = 'PENDING'",
      [id],
    );
    if (result.affectedRows === 0) {
      throw createError(400, "Chỉ hủy được đơn đang ở trạng thái PENDING");
    }

    const [items] = await conn.query(
      "SELECT product_id, quantity FROM order_items WHERE order_id = ?",
      [id],
    );
    for (const item of items) {
      await conn.query("UPDATE products SET stock = stock + ? WHERE id = ?", [
        item.quantity,
        item.product_id,
      ]);
    }

    await conn.commit();
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
};
export const getOrderItemByOrderId = async (orderId) => {
  const [rows] = await pool.query(
    `SELECT oi.id, oi.product_id, p.name AS product_name, oi.quantity, oi.price
     FROM order_items oi
     JOIN products p ON p.id = oi.product_id
     WHERE oi.order_id = ?`,
    [orderId],
  );
  return rows;
};
