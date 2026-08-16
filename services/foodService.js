import db from "../db.js";
import { reconcileWorkers } from "./workerService.js";
import { increasePopulation, reducePopulation } from "./populationService.js";
import {
  POPULATION_GROWTH_TICKS,
  STARVATION_CONSEQUENCE_TICKS,
} from "../config/simulation.js";

export async function processFoodTick(playerId, foodPotentialBalancePerMinute) {
  await db.query("BEGIN");

  try {
    const playerRes = await db.query(
      `
      SELECT
        id,
        population,
        workers,
        food_tick_rate_seconds,
        last_food_tick,
        starvation_started_at,
        food_surplus_started_at
      FROM players
      WHERE id = $1
      `,
      [playerId],
    );

    const player = playerRes.rows[0];

    if (!player) {
      throw new Error("Player not found");
    }

    const now = new Date();

    const lastTick = player.last_food_tick
      ? new Date(player.last_food_tick)
      : now;

    const tickRate = Number(player.food_tick_rate_seconds) || 1;

    const secondsPassed = Math.max(Math.floor((now - lastTick) / 1000), 0);

    const ticks = Math.floor(secondsPassed / tickRate);

    let population = Number(player.population);
    let workers = Number(player.workers);

    let starvationStartedAt = player.starvation_started_at;

    let foodSurplusStartedAt = player.food_surplus_started_at;

    // Get actual food currently stored
    const foodRes = await db.query(
      `
      SELECT
        pr.resource_type_id,
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

    const foods = foodRes.rows;

    const nutritionBefore = foods.reduce(
      (sum, food) => sum + Number(food.amount) * Number(food.nutrition_value),
      0,
    );

    if (ticks <= 0) {
      await db.query("COMMIT");

      return {
        food: nutritionBefore,
        population,
        workers,
      };
    }

    // Consume nutrition for all elapsed food ticks
    let totalNutritionNeeded = population * ticks;

    for (const food of foods) {
      if (totalNutritionNeeded <= 0) {
        break;
      }

      const availableNutrition =
        Number(food.amount) * Number(food.nutrition_value);

      // Consume the entire resource
      if (availableNutrition <= totalNutritionNeeded) {
        totalNutritionNeeded -= availableNutrition;

        await db.query(
          `
          UPDATE player_resources
          SET amount = 0
          WHERE player_id = $1
            AND resource_type_id = $2
          `,
          [playerId, food.resource_type_id],
        );

        food.amount = 0;
      } else {
        // Consume enough units to satisfy the remaining nutritional requirement.
        const unitsConsumed = Math.ceil(
          totalNutritionNeeded / Number(food.nutrition_value),
        );

        await db.query(
          `
          UPDATE player_resources
          SET amount = amount - $1
          WHERE player_id = $2
            AND resource_type_id = $3
          `,
          [unitsConsumed, playerId, food.resource_type_id],
        );

        food.amount -= unitsConsumed;

        totalNutritionNeeded = 0;
      }
    }

    // Calculate actual remaining food
    const nutritionAfter = foods.reduce(
      (sum, food) => sum + Number(food.amount) * Number(food.nutrition_value),
      0,
    );

    /* --------------------------------------------------------------//
    // Determine starvation                                          //
    //                                                               //
    // Starvation is based ONLY on food stockpile reaching zero.     //
    //                                                               //
    // A food balance of 0 or below does NOT itself mean starvation. //
    //-------------------------------------------------------------- */

    if (nutritionAfter <= 0) {
      if (!starvationStartedAt) {
        starvationStartedAt = now;
      }

      foodSurplusStartedAt = null;
    } else {
      starvationStartedAt = null;

      if (foodPotentialBalancePerMinute > 0) {
        if (!foodSurplusStartedAt) {
          foodSurplusStartedAt = now;
        }
      } else {
        foodSurplusStartedAt = null;
      }
    }

    //Grow pop
    if (foodSurplusStartedAt) {
      const surplusSeconds = (now - new Date(foodSurplusStartedAt)) / 1000;

      const growthCycles = Math.floor(
        surplusSeconds / (tickRate * POPULATION_GROWTH_TICKS),
      );

      if (growthCycles > 0) {
        const populationIncrease = await increasePopulation(
          playerId,
          growthCycles,
        );

        population += populationIncrease;
        workers = population;

        foodSurplusStartedAt = now;
      }
    }

    // Starvation consequence
    if (starvationStartedAt) {
      const starvationSeconds = (now - new Date(starvationStartedAt)) / 1000;

      const starvationCycles = Math.floor(
        starvationSeconds / (tickRate * STARVATION_CONSEQUENCE_TICKS),
      );

      if (starvationCycles > 0) {
        const populationReduction = await reducePopulation(playerId);

        population -= populationReduction;
        workers = population;

        starvationStartedAt = now;
      }
    }

    // Save food state
    await db.query(
      `
      UPDATE players
      SET
        population = $1,
        workers = $2,
        last_food_tick = NOW(),
        starvation_started_at = $3,
        food_surplus_started_at = $4
      WHERE id = $5
      `,
      [
        population,
        workers,
        starvationStartedAt,
        foodSurplusStartedAt,
        playerId,
      ],
    );

    await reconcileWorkers(playerId, workers);

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
  return (Number(population) / Number(tickRate)) * 60;
}
