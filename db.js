import "dotenv/config";
import fs from "fs";
import pg from "pg";

// Initialise Database connection
const db = new pg.Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: fs.readFileSync('/run/secrets/resource_db_password.txt', 'utf8').trim(),
});

export default db;