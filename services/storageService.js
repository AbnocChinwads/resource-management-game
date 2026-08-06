import db from "../db.js";

async function getPlayerStorage(playerId) {
  const result = await db.query(
    `
    SELECT
      ps.storage_category,
      ps.capacity,
      COALESCE(SUM(pr.amount), 0) AS used
    FROM player_storage ps
    LEFT JOIN resource_types rt
      ON rt.storage_category = ps.storage_category
    LEFT JOIN player_resources pr
      ON pr.resource_type_id = rt.id
      AND pr.player_id = ps.player_id
    WHERE ps.player_id = $1
    GROUP BY
      ps.storage_category,
      ps.capacity;
    `,
    [playerId],
  );

  return result.rows;
}

export { getPlayerStorage };
