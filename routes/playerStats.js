import express from "express";
import db from "../db.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const playerId = req.playerId;

  try {
    // Fetch population
    const playerRes = await db.query(
      `SELECT population FROM players WHERE id = $1`,
      [playerId]
    );
    const population = playerRes.rows[0]?.population || 0;

    // Total workers
    const buildingsRes = await db.query(
      `SELECT id, workers_assigned FROM player_buildings WHERE player_id = $1`,
      [playerId]
    );
    const totalWorkers = buildingsRes.rows.reduce(
      (sum, b) => sum + b.workers_assigned,
      0
    );

    // Total food (nutrition)
    const foodRes = await db.query(
      `SELECT SUM(pr.amount * rt.nutrition_value) AS total_nutrition
       FROM player_resources pr
       JOIN resource_types rt ON pr.resource_type_id = rt.id
       WHERE pr.player_id = $1 AND rt.nutrition_value > 0`,
      [playerId]
    );
    const food = Number(foodRes.rows[0]?.total_nutrition) || 0;

    res.json({
      population,
      workers: totalWorkers,
      food,
      buildings: buildingsRes.rows
    });
  } catch (err) {
    console.error("Error fetching player stats:", err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
