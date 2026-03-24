import express from "express";
import db from "../db.js";
import { maintainBuildingTasks } from "../services/taskService.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const playerId = req.playerId;
  const taskId = req.body.taskId;

  try {
    await db.query("BEGIN");

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
      [taskId, playerId],
    );

    if (result.rows.length === 0) {
      await db.query("ROLLBACK");
      return res.json({ success: false, error: "Could Not Complete" });
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
      const insertRes = await db.query(
        `INSERT INTO player_buildings (player_id, building_id)
         VALUES ($1, $2) RETURNING id`,
        [playerId, output_building_id],
      );
      const newBuildingId = insertRes.rows[0].id;

      // Fetch building type & population gain
      const buildingRes = await db.query(
        `SELECT type, population_gain FROM buildings WHERE id = $1`,
        [output_building_id],
      );
      const { type, population_gain } = buildingRes.rows[0];

      if (type === "housing") {
        await db.query(
          `UPDATE players SET population = population + $1 WHERE id = $2`,
          [population_gain || 2, playerId],
        );
      } else if (type === "production") {
        await db.query(
          `UPDATE player_buildings SET workers_assigned = 1 WHERE id = $1`,
          [newBuildingId],
        );
      }
    }

    await db.query("COMMIT");

    await maintainBuildingTasks(playerId);
    return res.json({ success: true });
  } catch (err) {
    await db.query("ROLLBACK");
    console.error("Error completing task:", err);
    return res.status(500).json({ success: false, error: "Server error" });
  }
});

export default router;
