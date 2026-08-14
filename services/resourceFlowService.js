import db from "../db.js";
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

async function getResourceProduction(playerId) {
  const buildings = await getWorkingProductionBuildings(playerId);

  const productionMap = new Map();

  for (const building of buildings) {
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

async function getFoodProductionCapacity(playerId) {
  const buildings = await getProductionBuildings(playerId);

  const resourceTypes = await getPlayerResourceTypes(playerId);

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

async function getRecipeConsumption(playerId) {
  const buildings = await getWorkingProductionBuildings(playerId);

  const consumptionMap = new Map();

  for (const building of buildings) {
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

async function getResourceConsumption(playerId) {
  const recipeConsumption = await getRecipeConsumption(playerId);
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

async function getFoodConsumption(playerId) {
  const playerResult = await db.query(
    `
    SELECT population, food_tick_rate_seconds
    FROM players
    WHERE id = $1
    `,
    [playerId],
  );

  const player = playerResult.rows[0];

  if (!player) {
    throw new Error("Player not found");
  }

  const foodRequiredPerMinute =
    (Number(player.population) / Number(player.food_tick_rate_seconds)) * 60;

  return foodRequiredPerMinute;
}

export async function getResourceFlow(playerId) {
  const [
    resourceTypes,
    playerResources,
    playerStorage,
    production,
    consumption,
    foodRequiredPerMinute,
    foodProductionCapacityPerMinute,
  ] = await Promise.all([
    getPlayerResourceTypes(playerId),
    getPlayerResources(playerId),
    getPlayerStorage(playerId),
    getResourceProduction(playerId),
    getResourceConsumption(playerId),
    getFoodConsumption(playerId),
    getFoodProductionCapacity(playerId),
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

  // Add storage caps

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
