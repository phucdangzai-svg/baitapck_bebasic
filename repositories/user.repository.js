import pool from "../configs/db.config.js";

export const findByEmail = async (email) => {
  const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [
    email,
  ]);
  return rows[0];
};

export const findById = async (id) => {
  const [rows] = await pool.query(
    "SELECT id, full_name, email, phone, role, created_at, updated_at FROM users WHERE id = ?",
    [id],
  );
  return rows[0];
};

export const create = async (user) => {
  const [result] = await pool.query(
    "INSERT INTO users (full_name, email, password, phone, role) VALUES (?, ?, ?, ?, 'USER')",
    [user.fullName, user.email, user.password, user.phone],
  );
  return result.insertId;
};

export const updateUser = async (id, user) => {
  await pool.query("UPDATE users SET full_name = ?, phone = ? WHERE id = ?", [
    user.fullName,
    user.phone,
    id,
  ]);
};
