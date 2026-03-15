import express from "express";
import db from "../db.js";
const router = express.Router()

// Nutrition & population middleware
router.use(async (req, res, next) => {
  const playerId = req.playerId;
  if (!playerId) return next();

  try {
    // Fetch player info
    const playerRes = await db.query(
      `SELECT id, population, workers, food_tick_rate_seconds, last_food_tick
       FROM players
       WHERE id = $1`,
      [playerId],
    );
    const player = playerRes.rows[0];
    if (!player) return next();

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
    let totalNutrition = foods.reduce(
      (sum, f) => sum + f.amount * f.nutrition_value,
      0,
    );
    res.locals.food = totalNutrition;
    res.locals.population = population;
    res.locals.workers = workers;

    if (ticks <= 0) return next(); // Nothing to consume yet

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
       SET population = $1, last_food_tick = NOW()
       WHERE id = $2`,
      [population, playerId],
    );

    // Update locals after consumption
    res.locals.population = population;
    res.locals.workers = workers;

    next();
  } catch (err) {
    console.error("Nutrition middleware error:", err);
    next(err);
  }
});

export default router;
