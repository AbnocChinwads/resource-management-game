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
        AND NOW() >= pt.started_at + pt.duration_seconds * INTERVAL '1 second'
      RETURNING r.output_resource_id, r.output_amount, r.output_building_id
      `,
      [taskId, playerId],
    );

    if (result.rows.length === 0) {
      await db.query("ROLLBACK");
      return res.redirect("/?error=CouldNotComplete");
    }

    const { output_resource_id, output_amount, output_building_id } =
      result.rows[0];

    // =========================
    // RESOURCE OUTPUT
    // =========================
    if (output_resource_id) {
      await db.query(
        `
        INSERT INTO player_resources (player_id, resource_type_id, amount)
        VALUES ($1, $2, $3)
        ON CONFLICT (player_id, resource_type_id)
        DO UPDATE SET amount = player_resources.amount + EXCLUDED.amount
        `,
        [playerId, output_resource_id, output_amount],
      );
    }

    // =========================
    // BUILDING OUTPUT
    // =========================
    if (output_building_id) {
      // Insert building (uses DB defaults)
      const insertRes = await db.query(
        `
        INSERT INTO player_buildings (player_id, building_id)
        VALUES ($1, $2)
        RETURNING id
        `,
        [playerId, output_building_id],
      );

      const newBuildingId = insertRes.rows[0].id;

      // Get building type
      const buildingRes = await db.query(
        `SELECT type, population_gain FROM buildings WHERE id = $1`,
        [output_building_id],
      );

      const { type, population_gain } = buildingRes.rows[0];

      // =========================
      // HOUSING BUILDINGS
      // =========================
      if (type === "housing") {
        const popGain = population_gain || 2;

        await db.query(
          `UPDATE players
           SET population = population + $1
           WHERE id = $2`,
          [popGain, playerId],
        );
      }

      // =========================
      // PRODUCTION BUILDINGS
      // =========================
      if (type === "production") {
        await db.query(
          `UPDATE player_buildings
           SET workers_assigned = 1
           WHERE id = $1`,
          [newBuildingId],
        );
      }
    }

    await db.query("COMMIT");
  } catch (err) {
    await db.query("ROLLBACK");
    console.error("Error completing task:", err);
  }

  res.redirect("/");
});

export default router;
