import db from "../db.js";
import { reconcileWorkers } from "./workerService.js";

export async function processFoodTick(playerId) {
  await db.query("BEGIN");

  try {
    // Fetch player info
    const playerRes = await db.query(
      `SELECT id, population, workers, food_tick_rate_seconds, last_food_tick, starvation_started_at
       FROM players
       WHERE id = $1`,
      [playerId],
    );

    const player = playerRes.rows[0];

    if (!player) {
      await db.query("ROLLBACK");
      throw new Error("Player not found");
    }

    const now = new Date();

    const lastTick = player.last_food_tick
      ? new Date(player.last_food_tick)
      : now;

    const tickRate = player.food_tick_rate_seconds || 1;

    const secondsPassed = Math.max(Math.floor((now - lastTick) / 1000), 0);

    const ticks = Math.floor(secondsPassed / tickRate);

    let population = player.population;
    let workers = player.workers;

    // Get all edible resources
    const foodRes = await db.query(
      `SELECT 
        pr.resource_type_id,
        pr.amount,
        rt.nutrition_value
       FROM player_resources pr
       JOIN resource_types rt
         ON pr.resource_type_id = rt.id
       WHERE pr.player_id = $1
         AND rt.nutrition_value > 0
       ORDER BY rt.nutrition_value DESC`,
      [playerId],
    );

    const foods = foodRes.rows;

    const nutritionBefore = foods.reduce(
      (sum, food) => sum + food.amount * food.nutrition_value,
      0,
    );

    // Nothing to consume yet
    if (ticks <= 0) {
      await db.query("COMMIT");

      return {
        food: nutritionBefore,
        population,
        workers,
      };
    }

    // Calculate nutrition required
    let totalNutritionNeeded = population * ticks;

    for (const food of foods) {
      if (totalNutritionNeeded <= 0) {
        break;
      }

      const availableNutrition = food.amount * food.nutrition_value;

      if (availableNutrition <= totalNutritionNeeded) {
        totalNutritionNeeded -= availableNutrition;
        food.amount = 0;
      } else {
        const unitsConsumed = Math.ceil(
          totalNutritionNeeded / food.nutrition_value,
        );

        food.amount -= unitsConsumed;
        totalNutritionNeeded = 0;
      }
    }

    let starvationStartedAt = player.starvation_started_at;

    if (totalNutritionNeeded > 0) {
      if (!starvationStartedAt) {
        starvationStartedAt = now;
      }
    } else {
      starvationStartedAt = null;
    }

    await db.query(
      `UPDATE players
       SET population = $1,
           workers = $2,
           last_food_tick = NOW(),
           starvation_started_at = $3
       WHERE id = $4`,
      [population, workers, starvationStartedAt, playerId],
    );

    await reconcileWorkers(playerId, workers);

    const nutritionAfter = foods.reduce(
      (sum, food) => sum + food.amount * food.nutrition_value,
      0,
    );

    await db.query("COMMIT");

    return {
      food: nutritionAfter,
      population,
      workers,
    };
  } catch (err) {
    await db.query("ROLLBACK");
    throw err;
  }
}

// Population food demand
export function getFoodConsumptionRate(population, tickRate) {
  return (population / tickRate) * 60;
}

// Total nutrition consumption from resource flow
export function getFoodNutritionConsumption(resources) {
  return resources.reduce((total, resource) => {
    if (resource.nutrition_value <= 0) {
      return total;
    }

    return total + resource.consumedPerMinute * resource.nutrition_value;
  }, 0);
}

// Existing function - leave for now
export function getFoodConsumptionByResource(population, tickRate, foods) {
  let remainingNutrition = getFoodConsumptionRate(population, tickRate);

  return foods.map((food) => {
    if (remainingNutrition <= 0) {
      return {
        resource_type_id: food.resource_type_id,
        consumedPerMinute: 0,
      };
    }

    const unitsConsumed = remainingNutrition / food.nutrition_value;

    remainingNutrition = 0;

    return {
      resource_type_id: food.resource_type_id,
      consumedPerMinute: unitsConsumed,
    };
  });
}
