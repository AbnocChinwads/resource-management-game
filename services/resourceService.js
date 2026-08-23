import db from "../db.js";

export async function getPlayerResources(playerId) {
  const result = await db.query(
    `
    SELECT
    pr.resource_type_id,
    pr.amount,
    rt.storage_category
    FROM player_resources pr
    JOIN resource_types rt
    ON rt.id = pr.resource_type_id
    WHERE pr.player_id = $1
    `,
    [playerId],
  );

  return result.rows;
}

export async function addPlayerResource(playerId, resourceTypeId, amount) {
  await db.query(
    `
    INSERT INTO player_resources (
      player_id,
      resource_type_id,
      amount
    )
    VALUES ($1, $2, $3)
    ON CONFLICT (player_id, resource_type_id)
    DO UPDATE
      SET amount = player_resources.amount + EXCLUDED.amount
    `,
    [playerId, resourceTypeId, Number(amount)],
  );
}

export async function getPlayerResourceState(playerId) {
  const result = await db.query(
    `
    SELECT
      pr.resource_type_id,
      rt.name,
      pr.amount,
      rt.nutrition_value,
      rt.storage_category
    FROM player_resources pr
    JOIN resource_types rt
      ON rt.id = pr.resource_type_id
    WHERE pr.player_id = $1
    ORDER BY rt.id ASC
    `,
    [playerId],
  );

  return result.rows;
}
