import db from "../db.js";
import { getPlayerBuildings } from "./buildingService.js";
import { getResourceFlow } from "./resourceFlowService.js";
import { getRecipeInputs, getRecipes } from "./recipeService.js";
import { getPopulationCapacity } from "./populationService.js";

export async function getPlayerStats(playerId) {
  // Resource production / consumption / net flow / storage
  const resourceFlow = await getResourceFlow(playerId);
  const {
    player,
    resources,
    storage,
    foodRequiredPerMinute,
    foodSuppliedPerMinute,
    foodNetFlowPerMinute,
  } = resourceFlow;

  const recipeInputs = await getRecipeInputs();

  // Buildings
  const buildings = await getPlayerBuildings(
    playerId,
    resources,
    storage,
    recipeInputs,
  );

  const assignedWorkers = buildings.reduce(
    (sum, building) => sum + building.workers_assigned,
    0,
  );

  // Player info
  const populationCapacity = await getPopulationCapacity(playerId);

  const population = Number(player.population);
  const workers = Number(player.workers);
  const historicalMaxPopulation = Number(player.historical_max_population);

  const availableWorkers = Math.max(workers - assignedWorkers, 0);

  const recipeData = await getRecipes(recipeInputs);

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
