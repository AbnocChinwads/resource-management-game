import fs from "fs";
import path from "path";
import db from "../db.js";

const migrationsPath = path.join(process.cwd(), "services", "settlementMigrations");

async function getSettlementMigrations() {
  const files = fs
    .readdirSync(migrationsPath)
    .filter((file) => file.endsWith(".js"))
    .sort();

  const migrations = [];

  for (const file of files) {
    const migration = await import(path.join(migrationsPath, file));

    migrations.push({
      name: file,
      run: migration.default,
    });
  }

  return migrations;
}

async function getCompletedMigrations(playerId) {
  const result = await db.query(
    `
    SELECT migration_name
    FROM settlement_migrations
    WHERE player_id = $1
    `,
    [playerId],
  );

  return new Set(result.rows.map((row) => row.migration_name));
}

export async function ensureSettlementUpToDate(playerId) {
  const migrations = await getSettlementMigrations();

  const completedMigrations = await getCompletedMigrations(playerId);

  for (const migration of migrations) {
    if (completedMigrations.has(migration.name)) {
      continue;
    }

    console.log(
      `Running settlement migration ${migration.name} for player ${playerId}`,
    );

    await db.query("BEGIN");

    try {
      await migration.run(playerId);

      await db.query(
        `
        INSERT INTO settlement_migrations
        (
          player_id,
          migration_name
        )
        VALUES
        ($1, $2)
        `,
        [playerId, migration.name],
      );

      await db.query("COMMIT");

      console.log(
        `Completed settlement migration ${migration.name} for player ${playerId}`,
      );
    } catch (err) {
      await db.query("ROLLBACK");
      throw err;
    }
  }
}
