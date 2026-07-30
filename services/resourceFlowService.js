import db from "../db.js";

async function getAllResourceTypes() {
  const result = await db.query(
    `
    SELECT
      id AS resource_type_id,
      name,
      nutrition_value
    FROM resource_types
    ORDER BY id ASC
    `,
  );

  return result.rows;
}

async function getPlayerResources(playerId) {
  const result = await db.query(
    `
    SELECT
      resource_type_id,
      amount
    FROM player_resources
    WHERE player_id = $1
    `,
    [playerId],
  );

  return result.rows;
}

async function getResourceProduction(playerId) {
  const result = await db.query(
    `
    SELECT
    r.output_resource_id AS resource_type_id,
    SUM((r.output_amount * pb.workers_assigned * 60)/ r.craft_time_seconds) AS production_per_minute
    FROM player_buildings pb
    JOIN buildings b
    ON b.id = pb.building_id
    JOIN recipes r
    ON r.id = b.production_recipe_id
    WHERE pb.player_id = $1
    AND pb.workers_assigned > 0
    GROUP BY r.output_resource_id
    `, [playerId],
  );

  return result.rows;
}

async function getRecipeConsumption(playerId) {
  const result = await db.query(
    `
    SELECT
    ri.resource_type_id, rt.name,
    SUM((ri.amount * pb.workers_assigned * 60)/ r.craft_time_seconds) AS consumed_per_minute
    FROM player_buildings pb
    JOIN buildings b
    ON b.id = pb.building_id
    JOIN recipes r
    ON r.id = b.production_recipe_id
    JOIN recipe_inputs ri
    ON ri.recipe_id = r.id
    JOIN resource_types rt
    ON rt.id = ri.resource_type_id
    WHERE pb.player_id = $1
    AND pb.workers_assigned > 0
    GROUP BY
    ri.resource_type_id,
    rt.name
    `,
    [playerId],
  );

  return result.rows;
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
  const [resourceTypes, playerResources, production, consumption] =
    await Promise.all([
      getAllResourceTypes(),
      getPlayerResources(playerId),
      getResourceProduction(playerId),
      getResourceConsumption(playerId),
    ]);

  const resources = resourceTypes.map((resource) => ({
    resource_type_id: resource.resource_type_id,
    name: resource.name,
    amount: 0,
    nutrition_value: resource.nutrition_value,
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

  return resources;
}
