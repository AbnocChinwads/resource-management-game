import db from "../db.js";
import { reconcileWorkers } from "./workerService.js";

export async function processFoodTick(playerId) {

    await db.query("BEGIN");

    try {
    // Fetch player info
    const playerRes = await db.query(
      `SELECT id, population, workers, food_tick_rate_seconds, last_food_tick
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

    const secondsPassed = Math.floor((now - lastTick) / 1000);
    const ticks = Math.floor(secondsPassed / tickRate);

    let population = player.population;
    let workers = player.workers;

    // Get all edible resources
    const foodRes = await db.query(
      `SELECT pr.resource_type_id, pr.amount, rt.nutrition_value
       FROM player_resources pr
       JOIN resource_types rt ON pr.resource_type_id = rt.id
       WHERE pr.player_id = $1 AND rt.nutrition_value > 0
       ORDER BY rt.nutrition_value DESC`,
      [playerId],
    );

    const foods = foodRes.rows;

    // Calculate total nutrition for display before consumption
    const nutritionBefore = foods.reduce(
      (sum, f) => sum + f.amount * f.nutrition_value,
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

    // Calculate total nutrition needed
    let totalNutritionNeeded = population * ticks;

    for (let food of foods) {
      if (totalNutritionNeeded <= 0) break;

      const foodNutrition = food.amount * food.nutrition_value;

      if (foodNutrition <= totalNutritionNeeded) {
        totalNutritionNeeded -= foodNutrition;
        food.amount = 0;
      } else {
        const foodNeeded = Math.ceil(
          totalNutritionNeeded / food.nutrition_value,
        );
        food.amount -= foodNeeded;
        totalNutritionNeeded = 0;
      }
    }

    // Population reduction if deficit
    if (totalNutritionNeeded > 0) {
      const starvation = Math.ceil(totalNutritionNeeded / ticks);
      population = Math.max(population - starvation, 0);
      workers = Math.min(workers, population);

      await reconcileWorkers(playerId, workers);
    }

    // Update food amounts in DB
    for (let food of foods) {
      await db.query(
        `UPDATE player_resources
         SET amount = $1
         WHERE player_id = $2 AND resource_type_id = $3`,
        [food.amount, playerId, food.resource_type_id],
      );
    }

    // Update player population & last tick
    await db.query(
      `UPDATE players
       SET population = $1,
       workers = $2,
       last_food_tick = NOW()
       WHERE id = $3`,
      [population, workers, playerId],
    );

    const nutritionAfter = foods.reduce(
        (sum, f) => sum + f.amount * f.nutrition_value,
        0
    )

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
