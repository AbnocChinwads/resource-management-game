import db from "../db.js";

export async function reconcileWorkers(
  playerId,
  availableWorkers,
  queryRunner = db,
) {
  const buildingsRes = await queryRunner.query(
    `
    SELECT id, workers_assigned 
    FROM player_buildings 
    WHERE player_id = $1 
    ORDER BY id DESC
    `,
    [playerId],
  );

  let remainingWorkers = availableWorkers;

  const updates = [];

  for (const building of buildingsRes.rows) {
    const assigned = Math.min(building.workers_assigned, remainingWorkers);

    remainingWorkers -= assigned;

    updates.push({
      id: building.id,
      workersAssigned: assigned,
    });
  }

  if (updates.length === 0) {
    return;
  }

  await queryRunner.query(
    `
    UPDATE player_buildings AS pb
    SET workers_assigned = update_data.workers_assigned
    FROM (
      SELECT *
      FROM UNNEST(
        $1::integer[],
        $2::integer[]
      )
      AS data(
        id,
        workers_assigned
      )
    ) AS update_data
    WHERE pb.id = update_data.id
    `,
    [
      updates.map((update) => update.id),
      updates.map((update) => update.workersAssigned),
    ],
  );
}

export async function calculateAvailableWorkers(playerId, queryRunner = db) {
  const playerRes = await queryRunner.query(
    `
    SELECT population
    FROM players
    WHERE id = $1
    `,
    [playerId],
  );

  if (playerRes.rows.length === 0) {
    throw new Error("Player not found");
  }

  const workers = Number(playerRes.rows[0].population);

  await queryRunner.query(
    `
    UPDATE players
    SET workers = $1
    WHERE id = $2
    `,
    [workers, playerId],
  );

  await reconcileWorkers(playerId, workers, queryRunner);

  return workers;
}
