import db from "../../db.js";

export default async function migrate(playerId) {
  await db.query(
    `
    INSERT INTO player_storage (player_id, storage_category, capacity)
    SELECT
      $1,
      storage_category,
      default_capacity
    FROM storage_defaults
    WHERE storage_category = 'fuel'
    ON CONFLICT (player_id, storage_category) DO NOTHING
    `,
    [playerId],
  );
}