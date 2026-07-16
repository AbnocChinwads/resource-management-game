import "dotenv/config";
import fs from "fs";
import path from "path";
import pg from "pg";
import { fileURLToPath } from "url";

const { Pool } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
});

async function seed() {
  const client = await db.connect();

  try {
    console.log("Starting seeds...");

    const seedsDir = path.join(__dirname, "seeds");

    const files = fs
      .readdirSync(seedsDir)
      .filter(file => file.endsWith(".sql"))
      .sort();

    for (const file of files) {
      const alreadyApplied = await client.query(
        "SELECT 1 FROM public.seed_history WHERE name = $1",
        [file]
      );

      if (alreadyApplied.rowCount > 0) {
        console.log(`Skipping ${file}`);
        continue;
      }

      console.log(`Running ${file}`);

      const sql = fs.readFileSync(
        path.join(seedsDir, file),
        "utf8"
      );

      await client.query("BEGIN");

      await client.query(sql);

      await client.query(
        "INSERT INTO public.seed_history (name) VALUES ($1)",
        [file]
      );

      await client.query("COMMIT");

      console.log(`Completed ${file}`);
    }

    console.log("Seeds complete.");

  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Seed failed:", err);
    process.exit(1);

  } finally {
    client.release();
    await db.end();
  }
}

seed();
