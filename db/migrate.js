import fs from "fs";
import path from "path";
import db from "../db.js";

const migrationsPath = path.join(
  process.cwd(),
  "db",
  "migrations"
);

async function migrate() {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name TEXT UNIQUE NOT NULL,
        applied_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
    `);

    const files = fs.readdirSync(migrationsPath)
      .filter(file => file.endsWith(".sql"))
      .sort();

    for (const file of files) {
      const result = await db.query(
        "SELECT 1 FROM public.migrations WHERE name = $1",
        [file]
      );

      if (result.rowCount > 0) {
        console.log(`Skipping ${file}`);
        continue;
      }

      console.log(`Running ${file}`);

      const sql = fs.readFileSync(
        path.join(migrationsPath, file),
        "utf8"
      );

      await db.query("BEGIN");

      try {
        await db.query(sql);

        await db.query(
          "INSERT INTO public.migrations(name) VALUES($1)",
          [file]
        );

        await db.query("COMMIT");

        console.log(`Completed ${file}`);
      } catch (err) {
        await db.query("ROLLBACK");
        throw err;
      }
    }

    console.log("Migrations complete");

  } catch (err) {
    console.error(err);
    process.exitCode = 1;
  } finally {
    await db.end();
  }
}

migrate();