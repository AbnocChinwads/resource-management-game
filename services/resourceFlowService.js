import {
  getPlayerResourceTypes,
  getPlayerResources,
} from "./resourceService.js";
import { getPlayerStorage } from "./storageService.js";
import {
  calculateProductionRate,
  calculateConsumptionRate,
  getProductionBuildings,
  getWorkingProductionBuildings,
} from "./productionService.js";
import { getPopulation } from "./populationService.js";

function getResourceProduction(workingBuildings) {
  const productionMap = new Map();

  for (const building of workingBuildings) {
    const amount = calculateProductionRate(building);

    const existing = productionMap.get(building.output_resource_id);

    if (existing) {
      existing.production_per_minute += amount;
    } else {
      productionMap.set(building.output_resource_id, {
        resource_type_id: building.output_resource_id,
        production_per_minute: amount,
      });
    }
  }

  return [...productionMap.values()];
}

function getFoodProductionCapacity(buildings, resourceTypes) {
  let foodProductionCapacity = 0;

  for (const building of buildings) {
    const resource = resourceTypes.find(
      (r) => r.resource_type_id === building.output_resource_id,
    );

    if (!resource || Number(resource.nutrition_value) <= 0) {
      continue;
    }

    const production = calculateProductionRate(building);

    foodProductionCapacity += production * Number(resource.nutrition_value);
  }

  return foodProductionCapacity;
}

function getRecipeConsumption(workingBuildings) {
  const consumptionMap = new Map();

  for (const building of workingBuildings) {
    for (const input of building.inputs) {
      const amount = calculateConsumptionRate(
        input,
        building.workers_assigned,
        building.craft_time_seconds,
      );

      const existing = consumptionMap.get(input.resource_type_id);

      if (existing) {
        existing.consumed_per_minute += amount;
      } else {
        consumptionMap.set(input.resource_type_id, {
          resource_type_id: input.resource_type_id,
          consumed_per_minute: amount,
        });
      }
    }
  }

  return [...consumptionMap.values()];
}

function getResourceConsumption(workingBuildings) {
  const recipeConsumption = getRecipeConsumption(workingBuildings);
  const consumptionMap = new Map();

  for (const resource of recipeConsumption) {
    const existing = consumptionMap.get(resource.resource_type_id);

    if (existing) {
      existing.consumed_per_minute += Number(resource.consumed_per_minute);
    } else {
      consumptionMap.set(resource.resource_type_id, {
        resource_type_id: resource.resource_type_id,
        name: resource.name,
        consumed_per_minute: Number(resource.consumed_per_minute),
      });
    }
  }

  return [...consumptionMap.values()];
}

function getFoodConsumption(population, foodTickRateSeconds) {
  return (Number(population) / Number(foodTickRateSeconds)) * 60;
}

export async function getResourceFlow(playerId) {
  const [resourceTypes, playerResources, playerStorage, buildings, player] =
    await Promise.all([
      getPlayerResourceTypes(playerId),
      getPlayerResources(playerId),
      getPlayerStorage(playerId),
      getProductionBuildings(playerId),
      getPopulation(playerId),
    ]);

  const resources = resourceTypes.map((resource) => ({
    resource_type_id: resource.resource_type_id,
    name: resource.name,
    amount: 0,
    nutrition_value: resource.nutrition_value,
    storageCategory: resource.storage_category,
    producedPerMinute: 0,
    consumedPerMinute: 0,
    netPerMinute: 0,
  }));

  // Add current stockpiles
  for (const stored of playerResources) {
    const resource = resources.find(
      (r) => r.resource_type_id === stored.resource_type_id,
    );

    if (resource) {
      resource.amount = Number(stored.amount);
    }
  }

  // Calculate working buildings
  const workingBuildings = getWorkingProductionBuildings(
    buildings,
    resources,
    playerStorage,
  );

  // Calculate production and consumption
  const production = getResourceProduction(workingBuildings);

  const consumption = getResourceConsumption(workingBuildings);

  // Calculate food production capacity
  const foodProductionCapacityPerMinute = getFoodProductionCapacity(
    buildings,
    resourceTypes,
  );

  // Calculate food requirement
  const foodRequiredPerMinute = getFoodConsumption(
    player.population,
    player.food_tick_rate_seconds,
  );

  // Add production
  for (const produced of production) {
    const resource = resources.find(
      (r) => r.resource_type_id === produced.resource_type_id,
    );

    if (resource) {
      resource.producedPerMinute = Number(
        Number(produced.production_per_minute).toFixed(1),
      );
    }
  }

  // Add consumption
  for (const consumed of consumption) {
    const resource = resources.find(
      (r) => r.resource_type_id === consumed.resource_type_id,
    );

    if (resource) {
      resource.consumedPerMinute = Number(
        Number(consumed.consumed_per_minute).toFixed(1),
      );
    }
  }

  // Calculate net flow
  for (const resource of resources) {
    resource.netPerMinute = Number(
      (resource.producedPerMinute - resource.consumedPerMinute).toFixed(1),
    );
  }

  // Calculate food flow
  const foodSuppliedPerMinute = resources.reduce((total, resource) => {
    if (Number(resource.nutrition_value) <= 0) {
      return total;
    }

    return (
      total +
      Number(resource.producedPerMinute) * Number(resource.nutrition_value)
    );
  }, 0);

  const foodNetFlowPerMinute = foodSuppliedPerMinute - foodRequiredPerMinute;

  const foodPotentialBalancePerMinute =
    foodProductionCapacityPerMinute - foodRequiredPerMinute;

  return {
    player,
    resources,
    storage: playerStorage,
    foodRequiredPerMinute: Number(foodRequiredPerMinute.toFixed(1)),
    foodSuppliedPerMinute: Number(foodSuppliedPerMinute.toFixed(1)),
    foodNetFlowPerMinute: Number(foodNetFlowPerMinute.toFixed(1)),
    foodProductionCapacityPerMinute: Number(
      foodProductionCapacityPerMinute.toFixed(1),
    ),
    foodPotentialBalancePerMinute: Number(
      foodPotentialBalancePerMinute.toFixed(1),
    ),
  };
}
