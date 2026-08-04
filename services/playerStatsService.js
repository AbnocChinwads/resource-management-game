import db from "../db.js";
import { getPlayerBuildings } from "./buildingService.js";
import { getResourceFlow } from "./resourceFlowService.js";
import { getFoodNutritionConsumption } from "./foodService.js";

export async function getPlayerStats(playerId) {
  // Buildings
  const buildings = await getPlayerBuildings(playerId);

  const assignedWorkers = buildings.reduce(
    (sum, building) => sum + building.workers_assigned,
    0,
  );

  // Player info
  const playerRes = await db.query(
    `
    SELECT 
      population,
      workers
    FROM players
    WHERE id = $1
    `,
    [playerId],
  );

  const player = playerRes.rows[0];

  if (!player) {
    throw new Error("Player not found");
  }

  const population = player.population;
  const workers = player.workers;

  const availableWorkers = Math.max(workers - assignedWorkers, 0);

  // Resource production / consumption / net flow / storage
  const resourceFlow = await getResourceFlow(playerId);

  const resources = resourceFlow.resources;
  const storage = resourceFlow.storage;

  // Total stored nutrition
  const food = resources.reduce(
    (sum, resource) => sum + resource.amount * resource.nutrition_value,
    0,
  );

  // Actual nutrition being consumed per minute
  const foodConsumptionRate = getFoodNutritionConsumption(resources);

  return {
    population,
    workers,
    assignedWorkers,
    availableWorkers,
    food,
    foodConsumptionRate,
    resources,
    buildings,
    storage,
  };
}
