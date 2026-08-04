import db from "../db.js";
import { appVersion } from "../config/appVersion.js";

async function initialisePlayerStorage(playerId) {
  await db.query(
    `
        INSERT INTO player_storage
        (
            player_id,
            storage_category,
            capacity
        )
        SELECT
            $1,
            storage_category,
            default_capacity
        FROM storage_defaults
        ON CONFLICT DO NOTHING
        `,
    [playerId],
  );
}

async function assignSettlementAnnouncement(playerId, version) {
  const announcement = await db.query(
    `
        SELECT id
        FROM announcements
        WHERE version = $1
        LIMIT 1
        `,
    [version],
  );

  if (announcement.rows.length === 0) {
    console.warn(`No announcement found for settlement version ${version}`);
    return;
  }

  await db.query(
    `
        INSERT INTO player_announcements
        (
            player_id,
            announcement_id
        )
        VALUES
        ($1, $2)
        ON CONFLICT DO NOTHING
        `,
    [playerId, announcement.rows[0].id],
  );
}

export async function resetSettlement(playerId, version) {
  await db.query("BEGIN");

  try {
    await db.query(
      `
        DELETE FROM player_tasks
        WHERE player_id = $1`,
      [playerId],
    );

    await db.query(
      `
        DELETE FROM player_buildings
        WHERE player_id = $1`,
      [playerId],
    );

    await db.query(
      `
        DELETE FROM player_resources
        WHERE player_id = $1`,
      [playerId],
    );

    await initialisePlayerStorage(playerId);

    await db.query(
      `
        UPDATE players
        SET
        population = 0,
        workers = 0,
        starvation_started_at = NULL,
        last_food_tick = now(),
        settlement_version = $2
        WHERE id = $1
        `,
      [playerId, version],
    );

    await db.query("COMMIT");
  } catch (err) {
    await db.query("ROLLBACK");
    throw err;
  }
}

export async function ensureSettlementVersion(playerId) {
  const result = await db.query(
    `
        SELECT settlement_version
        FROM players
        WHERE id = $1
        `,
    [playerId],
  );

  if (result.rows.length === 0) {
    return;
  }

  const currentVersion = result.rows[0].settlement_version;

  if (currentVersion === appVersion) {
    return;
  }

  console.log(
    `Resetting settlement for player ${playerId}: ${currentVersion} -> ${appVersion}`,
  );

  await resetSettlement(playerId, appVersion);

  await assignSettlementAnnouncement(playerId, appVersion);

  console.log(`Settlement reset complete for player ${playerId}`);
}
