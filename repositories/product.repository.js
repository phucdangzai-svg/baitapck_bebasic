import pool from "../configs/db.config.js";

export const getAllProduct = async (onlyActive) => {
  const sql = onlyActive
    ? "SELECT * FROM products WHERE is_active = TRUE ORDER BY id DESC"
    : "SELECT * FROM products ORDER BY id DESC";
  const [rows] = await pool.query(sql);
  return rows;
};

export const getProductById = async (id) => {
  const [rows] = await pool.query("SELECT * FROM products WHERE id=?", [id]);
  return rows[0];
};

export const createProduct = async (product) => {
  const [result] = await pool.query(
    "INSERT INTO products (name, description, price, stock, is_active) VALUES (?, ?, ?, ?, ?)",
    [
      product.name,
      product.description,
      product.price,
      product.stock,
      product.isActive,
    ],
  );

  return result.insertId;
};

export const updateProduct = async (id, product) => {
  await pool.query(
    "UPDATE products SET name=?, description=?, price=?, stock=?, is_active=? WHERE id=?",
    [
      product.name,
      product.description,
      product.price,
      product.stock,
      product.isActive,
      id,
    ],
  );
};
export const updateProductStock = async (id, stock) => {
  await pool.query("UPDATE products SET stock = ? WHERE id = ?", [stock, id]);
};

export const deactivateProduct = async (id) => {
  await pool.query("UPDATE products SET is_active = FALSE WHERE id = ?", [id]);
};

export const updateProductImage = async (id, imageUrl, imagePublicId) => {
  await pool.query(
    "UPDATE products SET image_url = ?, image_public_id = ? WHERE id = ?",
    [imageUrl, imagePublicId, id],
  );
};
