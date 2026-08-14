import db from "../db.js";
import { getPlayerBuildings } from "./buildingService.js";
import { getResourceFlow } from "./resourceFlowService.js";
import {
  getFoodConsumptionRate,
  getFoodNutritionConsumption,
} from "./foodService.js";
import { getRecipes } from "./recipeService.js";

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
      workers,
      food_tick_rate_seconds
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
  const recipeData = await getRecipes(playerId);

  // Total stored nutrition
  const food = resources.reduce(
    (sum, resource) => sum + resource.amount * resource.nutrition_value,
    0,
  );

  const foodRequiredPerMinute = getFoodConsumptionRate(
    player.population,
    player.food_tick_rate_seconds,
  );

  const foodSuppliedPerMinute = getFoodNutritionConsumption(resources);

  const foodNetFlowPerMinute = foodSuppliedPerMinute - foodRequiredPerMinute;

  return {
    population,
    workers,
    assignedWorkers,
    availableWorkers,
    food,
    foodRequiredPerMinute,
    foodSuppliedPerMinute,
    foodNetFlowPerMinute,
    resources,
    buildings,
    storage,
    recipes: recipeData.recipes,
    recipeInputs: recipeData.recipeInputs,
  };
}
