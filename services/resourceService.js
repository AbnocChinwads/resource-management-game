import db from "../db.js";

async function getPlayerResourceTypes(playerId) {
  const result = await db.query(
    `
    SELECT
      rt.id AS resource_type_id,
      rt.name,
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

async function getPlayerResources(playerId) {
  const result = await db.query(
    `
    SELECT
      resource_type_id,
      amount
    FROM player_resources
    WHERE player_id = $1
    `,
    [playerId],
  );

  return result.rows;
}

async function addPlayerResource(playerId, resourceTypeId, amount) {
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

export {
  getPlayerResourceTypes,
  getPlayerResources,
  addPlayerResource,
};
