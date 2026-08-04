import db from "../db.js";

export async function initialisePlayerStorage(playerId) {
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

export async function resetSettlement(playerId) {
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
        WHERE id = $1
        `,
      [playerId],
    );

    await db.query("COMMIT");
  } catch (err) {
    await db.query("ROLLBACK");
    throw err;
  }
}
