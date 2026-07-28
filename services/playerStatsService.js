import db from "../db.js";
import { getPlayerBuildings } from "./buildingService.js";

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
  const buildings = await getPlayerBuildings(playerId);

  const totalWorkers = buildings.reduce(
    (sum, b) => sum + b.workers_assigned,
    0,
  );

  const playerRes = await db.query(
    `SELECT population, workers, food_tick_rate_seconds FROM players WHERE id = $1`,
    [playerId],
  );

  const population = playerRes.rows[0].population;
  const workers = playerRes.rows[0].workers;
  const foodTickRate = playerRes.rows[0].food_tick_rate_seconds;

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
    foodTickRate,
    assignedWorkers: totalWorkers,
    availableWorkers,
    food,
    resources: resourcesRes.rows,
    buildings,
  };
}
