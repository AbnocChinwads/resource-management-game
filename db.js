import "dotenv/config";
import pg from "pg";

// Initialise Database connection
const db = new pg.Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
});

try {
  await db.query("SELECT 1");
  console.log("Database connected successfully.");
} catch (err) {
  console.error("Database connection error:", err);
  process.exit(1);
}

export default db;