import express from "express";
import db from "../db.js";
const router = express.Router();

// Start a task
router.post("/", async (req, res) => {
  const playerId = req.playerId;
  const recipeId = req.body.recipeId;

  try {
    await db.query("BEGIN");

    const recipeRes = await db.query(
      "SELECT * FROM recipes WHERE id = $1",
      [recipeId]
    );
    const recipe = recipeRes.rows[0];

    // Check inputs
    const resourceRes = await db.query(
      "SELECT resource_type_id, amount FROM recipe_inputs WHERE recipe_id = $1",
      [recipeId]
    );

    for (const resource of resourceRes.rows) {
      const playerRes = await db.query(
        "SELECT amount FROM player_resources WHERE player_id = $1 AND resource_type_id = $2 FOR UPDATE",
        [playerId, resource.resource_type_id]
      );
      const playerAmount = playerRes.rows[0]?.amount || 0;
      if (playerAmount < resource.amount) {
        await db.query("ROLLBACK");
        return res.redirect("/?error=NotEnoughResources");
      }
    }

    // Deduct resources
    for (const resource of resourceRes.rows) {
      await db.query(
        "UPDATE player_resources SET amount = amount - $1 WHERE player_id = $2 AND resource_type_id = $3",
        [resource.amount, playerId, resource.resource_type_id]
      );
    }

    // Compute task duration based on assigned workers (min 1)
    const buildingRes = await db.query(
      `SELECT pb.workers_assigned
       FROM buildings b
       JOIN player_buildings pb
         ON pb.building_id = b.id
       WHERE b.production_recipe_id = $1 AND pb.player_id = $2`,
      [recipeId, playerId]
    );
    const assignedWorkers = buildingRes.rows[0]?.workers_assigned || 0;
    const durationSeconds = Math.ceil(recipe.craft_time_seconds / Math.max(assignedWorkers, 1));

    await db.query(
      `INSERT INTO player_tasks (player_id, recipe_id, started_at, completed, duration_seconds)
       VALUES ($1, $2, NOW(), FALSE, $3)`,
      [playerId, recipeId, durationSeconds]
    );

    await db.query("COMMIT");
  } catch (err) {
    await db.query("ROLLBACK");
    console.error(err);
  }

  res.redirect("/");
});

export default router;
