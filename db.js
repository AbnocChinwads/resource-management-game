import "dotenv/config";
import pg from "pg";

const fs = require('fs');
// Initialise Database connection
const db = new pg.Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: fs.readFileSync('/run/secrets/resource_db_password', 'utf8').trim(),
});

try {
  await db.query("SELECT 1");
  console.log("Database connected successfully.");
} catch (err) {
  console.error("Database connection error:", err);
  process.exit(1);
}

export default db;