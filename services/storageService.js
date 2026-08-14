import db from "../db.js";

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

  const capacity = Number(storageResult.rows[0].capacity);
  const used = Number(storageResult.rows[0].used);

  return {
    storageCategory: storage_category,
    capacity,
    used,
    available: capacity - used,
  };
}

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

async function canAddPlayerResource(playerId, resourceTypeId, amount) {
  const storage = await getStorageForResource(playerId, resourceTypeId);

  return Number(amount) <= storage.available;
}

export {
  ensurePlayerStorage,
  getStorageForResource,
  getPlayerStorage,
  canAddPlayerResource,
};
