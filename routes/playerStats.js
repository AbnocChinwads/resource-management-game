import express from "express";
import db from "../db.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const playerId = req.playerId;

  try {
    const playerRes = await db.query(
      `SELECT population FROM players WHERE id = $1`,
      [playerId]
    );

    const buildingsRes = await db.query(
      `SELECT workers_assigned FROM player_buildings WHERE player_id = $1`,
      [playerId]
    );

    const totalWorkers = buildingsRes.rows.reduce(
      (sum, b) => sum + b.workers_assigned,
      0
    );

    res.json({
      population: playerRes.rows[0].population,
      workers: totalWorkers,
      food: res.locals.food // comes from foodTick middleware
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

export default router;
