import db from "../db.js";

export async function getPlayerStats(playerId) {
  // Resources
  const resourcesRes = await db.query(
    `SELECT pr.*, rt.name
       FROM player_resources pr
       JOIN resource_types rt ON pr.resource_type_id = rt.id
       WHERE pr.player_id = $1
       ORDER BY pr.resource_type_id ASC`,
    [playerId],
  );

  // Buildings
  const buildingsRes = await db.query(
    `SELECT pb.id, pb.workers_assigned, b.production_recipe_id
      FROM player_buildings pb
      JOIN buildings b ON pb.building_id = b.id
      WHERE pb.player_id = $1
      AND b.production_recipe_id IS NOT NULL
      ORDER BY pb.id ASC`,
    [playerId],
  );

  const totalWorkers = buildingsRes.rows.reduce(
    (sum, b) => sum + b.workers_assigned,
    0,
  );

  const playerRes = await db.query(
    `SELECT population, workers FROM players WHERE id = $1`,
    [playerId],
  );

  const population = playerRes.rows[0].population;
  const workers = playerRes.rows[0].workers;

  // Calculate available workers
  const availableWorkers = Math.max(workers - totalWorkers, 0);

  // Total food
  const foodRes = await db.query(
    `SELECT SUM(pr.amount * rt.nutrition_value) AS total_food
       FROM player_resources pr
       JOIN resource_types rt ON pr.resource_type_id = rt.id
       WHERE pr.player_id = $1`,
    [playerId],
  );
  
  const food = foodRes.rows[0].total_food || 0;

  return {
    population,
    workers,
    assignedWorkers: totalWorkers,
    availableWorkers,
    food,
    resources: resourcesRes.rows,
    buildings: buildingsRes.rows,
  };
}
