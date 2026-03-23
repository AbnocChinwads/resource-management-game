import express from "express";
import db from "../db.js";
const router = express.Router();

router.get("/", async (req, res) => {
  const playerId = req.playerId;

  try {
    // Resources
    const resourcesRes = await db.query(
      `SELECT pr.*, rt.name
       FROM player_resources pr
       JOIN resource_types rt ON pr.resource_type_id = rt.id
       WHERE pr.player_id = $1
       ORDER BY pr.resource_type_id ASC`,
      [playerId],
    );

    // Buildings
    const buildingsRes = await db.query(
      `SELECT pb.id, pb.workers_assigned, b.production_recipe_id
      FROM player_buildings pb
      JOIN buildings b ON pb.building_id = b.id
      WHERE pb.player_id = $1
      AND b.production_recipe_id IS NOT NULL
      ORDER BY pb.id ASC`,
      [playerId],
    );

    const totalWorkers = buildingsRes.rows.reduce(
      (sum, b) => sum + b.workers_assigned,
      0,
    );
    const playerRes = await db.query(
      `SELECT population FROM players WHERE id = $1`,
      [playerId],
    );
    const population = playerRes.rows[0].population;

    // Calculate available workers
    const availableWorkers = population - totalWorkers;

    // Total food
    const foodRes = await db.query(
      `SELECT SUM(pr.amount * rt.nutrition_value) AS total_food
       FROM player_resources pr
       JOIN resource_types rt ON pr.resource_type_id = rt.id
       WHERE pr.player_id = $1`,
      [playerId],
    );
    const food = foodRes.rows[0].total_food || 0;

    // Workers do something
    for (const building of buildingsRes.rows) {
      if (building.workers_assigned <= 0) continue;
      if (!building.production_recipe_id) continue;

      // Count active tasks for this building
      const taskCountRes = await db.query(
        `SELECT COUNT(*) 
        FROM player_tasks
        WHERE player_id = $1
        AND player_building_id = $2
        AND completed = FALSE`,
        [playerId, building.id],
      );

      const activeTasks = parseInt(taskCountRes.rows[0].count);

      // Calculate missing tasks (cap at 10 to avoid runaway)
      const missing = Math.min(building.workers_assigned - activeTasks, 10);

      for (let i = 0; i < missing; i++) {
        await db.query(
          `INSERT INTO player_tasks 
          (player_id, recipe_id, player_building_id, started_at, completed)
          VALUES ($1, $2, $3, NOW(), FALSE)`,
          [playerId, building.production_recipe_id, building.id],
        );
      }
    }

    res.json({
      population,
      workers: totalWorkers,
      availableWorkers,
      food,
      resources: resourcesRes.rows,
      buildings: buildingsRes.rows,
    });
  } catch (err) {
    console.error("Error fetching player stats:", err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
