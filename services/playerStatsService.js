import db from "../db.js";
import { getPlayerBuildings } from "./buildingService.js";
import { getResourceFlow } from "./resourceFlowService.js";
import { getRecipes } from "./recipeService.js";
import { getPopulation, getPopulationCapacity } from "./populationService.js";

export async function getPlayerStats(playerId) {
  // Buildings
  const buildings = await getPlayerBuildings(playerId);

  const assignedWorkers = buildings.reduce(
    (sum, building) => sum + building.workers_assigned,
    0,
  );

  // Player info
  const player = await getPopulation(playerId);
  const populationCapacity = await getPopulationCapacity(playerId);

  const population = Number(player.population);
  const workers = Number(player.workers);
  const historicalMaxPopulation = Number(player.historical_max_population);

  const availableWorkers = Math.max(workers - assignedWorkers, 0);

  // Resource production / consumption / net flow / storage
  const resourceFlow = await getResourceFlow(playerId);

  const {
    resources,
    storage,
    foodRequiredPerMinute,
    foodSuppliedPerMinute,
    foodNetFlowPerMinute,
  } = resourceFlow;
  const recipeData = await getRecipes(playerId);

  // Total stored nutrition
  const food = resources.reduce(
    (sum, resource) => sum + resource.amount * resource.nutrition_value,
    0,
  );

  return {
    population,
    workers,
    historicalMaxPopulation,
    populationCapacity,
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
