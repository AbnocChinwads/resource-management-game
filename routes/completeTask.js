import express from "express";
import db from "../db.js";

const router = express.Router();

router.post("/complete-task", async (req, res) => {
  const playerId = req.playerId;
  const taskId = req.body.taskId;

  try {
    await db.query("BEGIN");

    // Complete the task and get output
    const result = await db.query(
      `
      UPDATE player_tasks pt
      SET completed = TRUE
      FROM recipes r
      WHERE pt.id = $1
        AND pt.player_id = $2
        AND pt.completed = FALSE
        AND pt.recipe_id = r.id
        AND NOW() >= pt.started_at + r.craft_time_seconds * INTERVAL '1 second'
      RETURNING r.output_resource_id, r.output_amount, r.output_building_id
      `,
      [taskId, playerId]
    );

    if (result.rows.length === 0) {
      await db.query("ROLLBACK");
      return res.redirect("/?error=CouldNotComplete");
    }

    const { output_resource_id, output_amount, output_building_id } = result.rows[0];

    // Add resource output
    if (output_resource_id) {
      await db.query(
        `
        INSERT INTO player_resources (player_id, resource_type_id, amount)
        VALUES ($1, $2, $3)
        ON CONFLICT (player_id, resource_type_id)
        DO UPDATE SET amount = player_resources.amount + EXCLUDED.amount
        `,
        [playerId, output_resource_id, output_amount]
      );
    }

    // Add building output
    if (output_building_id) {
      await db.query(
        `
        INSERT INTO player_buildings (player_id, building_id, health, workers_assigned, built_at)
        VALUES ($1, $2, 100, 0, NOW())
        `,
        [playerId, output_building_id]
      );

      // Auto-add some population and assign initial workers
      const initialPopulation = 2; // adjust as needed
      const initialWorkers = 1;

      // Update player population
      await db.query(
        `UPDATE players
         SET population = population + $1
         WHERE id = $2`,
        [initialPopulation, playerId]
      );

      // Assign initial workers to the new building
      await db.query(
        `UPDATE player_buildings
         SET workers_assigned = $1
         WHERE player_id = $2 AND building_id = $3`,
        [initialWorkers, playerId, output_building_id]
      );
    }

    await db.query("COMMIT");
  } catch (err) {
    await db.query("ROLLBACK");
    console.error("Error completing task:", err);
  }

  res.redirect("/");
});

export default router;
