import express from "express";
import db from "../db.js";
const router = express.Router()

// Complete a task
router.post("/complete-task", async (req, res) => {
  const playerId = req.playerId;
  const taskId = req.body.taskId;

  try {
    await db.query("BEGIN");

    const result = await db.query(
      `UPDATE player_tasks pt
       SET completed = TRUE
       FROM recipes r
       WHERE pt.id = $1 AND pt.player_id = $2 AND pt.completed = FALSE AND pt.recipe_id = r.id
         AND NOW() >= pt.started_at + r.craft_time_seconds * INTERVAL '1 second'
       RETURNING r.output_resource_id, r.output_amount, r.output_building_id`,
      [taskId, playerId],
    );

    if (result.rows.length === 0) {
      await db.query("ROLLBACK");
      return res.redirect("/?error=CouldNotComplete");
    }

    const { output_resource_id, output_amount, output_building_id } =
      result.rows[0];

    if (output_resource_id) {
      await db.query(
        `INSERT INTO player_resources (player_id, resource_type_id, amount)
         VALUES ($1, $2, $3)
         ON CONFLICT (player_id, resource_type_id)
         DO UPDATE SET amount = player_resources.amount + EXCLUDED.amount`,
        [playerId, output_resource_id, output_amount],
      );
    }

    if (output_building_id) {
      await db.query(
        `INSERT INTO player_buildings (player_id, building_id, health, workers, built_at)
         VALUES ($1, $2, 100, 0, NOW())`,
        [playerId, output_building_id],
      );
    }

    await db.query("COMMIT");
  } catch (err) {
    await db.query("ROLLBACK");
    console.error(err);
  }

  res.redirect("/");
});

export default router;
