import { getPlayerBuildings } from "./buildingService.js";
import { getResourceFlow } from "./resourceFlowService.js";
import { getRecipeInputs, getRecipes } from "./recipeService.js";
import { getPopulationCapacity } from "./populationService.js";
import {
  POPULATION_GROWTH_TICKS,
  STARVATION_CONSEQUENCE_TICKS,
} from "../config/simulation.js";

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
    foodPotentialBalancePerMinute,
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
  const populationFloor = Math.ceil(historicalMaxPopulation * 0.1);

  const availableWorkers = Math.max(workers - assignedWorkers, 0);

  const recipeData = await getRecipes(recipeInputs);

  // Total stored nutrition
  const food = resources.reduce(
    (sum, resource) => sum + resource.amount * resource.nutrition_value,
    0,
  );

  const foodTickRateSeconds = Number(player.food_tick_rate_seconds);

  const populationGrowthSeconds = foodTickRateSeconds * POPULATION_GROWTH_TICKS;

  const starvationConsequenceSeconds =
    foodTickRateSeconds * STARVATION_CONSEQUENCE_TICKS;

  return {
    population,
    workers,
    historicalMaxPopulation,
    populationFloor,
    populationCapacity,
    assignedWorkers,
    availableWorkers,
    food,
    foodRequiredPerMinute,
    foodSuppliedPerMinute,
    foodNetFlowPerMinute,
    foodPotentialBalancePerMinute,
    populationGrowthSeconds,
    starvationConsequenceSeconds,
    foodSurplusStartedAt: player.food_surplus_started_at,
    starvationStartedAt: player.starvation_started_at,
    resources,
    buildings,
    storage,
    recipes: recipeData.recipes,
    recipeInputs: recipeData.recipeInputs,
  };
}
