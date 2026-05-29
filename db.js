import "dotenv/config";
import fs from "fs";
import pg from "pg";

// Initialise Database connection
const db = new pg.Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
});

export default db;