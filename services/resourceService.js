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

async function ensurePlayerStorage(playerId, storageCategory) {
  await db.query(
    `
    INSERT INTO player_storage (
      player_id,
      storage_category,
      capacity
    )
    SELECT
      $1,
      sd.storage_category,
      sd.default_capacity
    FROM storage_defaults sd
    WHERE sd.storage_category = $2
    ON CONFLICT (player_id, storage_category)
    DO NOTHING
    `,
    [playerId, storageCategory],
  );
}

async function getStorageForResource(playerId, resourceTypeId) {
  const resourceResult = await db.query(
    `
    SELECT
      storage_category
    FROM resource_types
    WHERE id = $1
    `,
    [resourceTypeId],
  );

  if (resourceResult.rows.length === 0) {
    throw new Error(`Resource type ${resourceTypeId} not found`);
  }

  const { storage_category } = resourceResult.rows[0];

  await ensurePlayerStorage(playerId, storage_category);

  const storageResult = await db.query(
    `
    SELECT
      capacity,
      COALESCE(
        (
          SELECT SUM(pr.amount)
          FROM player_resources pr
          JOIN resource_types rt
            ON rt.id = pr.resource_type_id
          WHERE pr.player_id = $1
            AND rt.storage_category = $2
        ),
        0
      ) AS used
    FROM player_storage
    WHERE player_id = $1
      AND storage_category = $2
    FOR UPDATE
    `,
    [playerId, storage_category],
  );

  if (storageResult.rows.length === 0) {
    throw new Error(
      `No storage default found for category ${storage_category}`,
    );
  }

  return {
    storageCategory: storage_category,
    capacity: Number(storageResult.rows[0].capacity),
    used: Number(storageResult.rows[0].used),
  };
}

async function canAddPlayerResource(playerId, resourceTypeId, amount) {
  const storage = await getStorageForResource(playerId, resourceTypeId);

  return storage.used + Number(amount) <= storage.capacity;
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
  canAddPlayerResource,
  addPlayerResource,
  getStorageForResource,
};
