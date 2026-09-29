import db from "../db.js";

export async function reconcileWorkers(playerId, availableWorkers, queryRunner = db) {
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

  for (const building of buildingsRes.rows) {
    const assigned = Math.min(building.workers_assigned, remainingWorkers);

    remainingWorkers -= assigned;

    await queryRunner.query(
      `
      UPDATE player_buildings
      SET workers_assigned = $1
      WHERE id = $2
      `,
      [assigned, building.id],
    );
  }
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
