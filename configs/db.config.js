import dotenv from "dotenv";
import mysql2 from "mysql2/promise";

dotenv.config();

const pool = mysql2.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,

  connectionLimit: 10,
  waitForConnections: true,
  queueLimit: 0,
});

export const connectionDb = async () => {
  try {
    const conn = await pool.getConnection();
    console.log("database connected successfully");
    conn.release();
  } catch (err) {
    console.error("database connect failed: ", err.message);
    process.exit(1);
  }
};

export default pool;
