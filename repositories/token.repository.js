import pool from "../configs/db.config.js";

export const saveToken = async (userId, token, expiresAt) => {
  await pool.query(
    "INSERT INTO refresh_tokens (user_id, refresh_token, expires_at) VALUES (?, ?, ?)",
    [userId, token, expiresAt],
  );
};

export const findToken = async (token) => {
  const [rows] = await pool.query(
    "SELECT * FROM refresh_tokens WHERE refresh_token = ?",
    [token],
  );
  return rows[0];
};

export const revokeToken = async (token) => {
  await pool.query(
    "UPDATE refresh_tokens SET is_revoked = TRUE WHERE refresh_token = ?",
    [token],
  );
};