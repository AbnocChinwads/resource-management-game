import db from "../db.js";
import {
  getPlayerResourceTypes,
  getPlayerResources,
} from "./resourceService.js";
import { getPlayerStorage } from "./storageService.js";
import {
  calculateProductionRate,
  calculateConsumptionRate,
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
  const [recipeConsumption, foodConsumption] = await Promise.all([
    getRecipeConsumption(playerId),
    getFoodConsumption(playerId),
  ]);

  const consumptionMap = new Map();

  for (const resource of [...recipeConsumption, ...foodConsumption]) {
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
  // Get population and food tick rate
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

  // Calculate nutrition required per minute
  const foodNeededPerMinute =
    (player.population / player.food_tick_rate_seconds) * 60;

  // Get available edible resources
  const foodResult = await db.query(
    `
    SELECT
      pr.resource_type_id,
      rt.name,
      pr.amount,
      rt.nutrition_value
    FROM player_resources pr
    JOIN resource_types rt
      ON pr.resource_type_id = rt.id
    WHERE pr.player_id = $1
      AND rt.nutrition_value > 0
    ORDER BY rt.nutrition_value DESC
    `,
    [playerId],
  );

  let remainingNutrition = foodNeededPerMinute;

  const consumption = [];

  for (const food of foodResult.rows) {
    if (remainingNutrition <= 0) {
      break;
    }

    const nutritionAvailable = food.amount * food.nutrition_value;

    const nutritionUsed = Math.min(nutritionAvailable, remainingNutrition);

    const unitsConsumed = nutritionUsed / food.nutrition_value;

    consumption.push({
      resource_type_id: food.resource_type_id,
      name: food.name,
      consumed_per_minute: Number(unitsConsumed.toFixed(1)),
    });

    remainingNutrition -= nutritionUsed;
  }

  return consumption;
}

export async function getResourceFlow(playerId) {
  const [
    resourceTypes,
    playerResources,
    playerStorage,
    production,
    consumption,
  ] = await Promise.all([
    getPlayerResourceTypes(playerId),
    getPlayerResources(playerId),
    getPlayerStorage(playerId),
    getResourceProduction(playerId),
    getResourceConsumption(playerId),
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

  return {
    resources,
    storage: playerStorage,
  };
}
