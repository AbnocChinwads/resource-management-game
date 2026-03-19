import express from "express";
import db from "../db.js";
const router = express.Router();

router.post("/update-workers", async (req, res) => {
  const playerId = req.playerId;
  const { buildingId, delta } = req.body;

  try {
    await db.query("BEGIN");

    const buildingRes = await db.query(
      `SELECT workers_assigned, max_workers FROM player_buildings
       WHERE id = $1 AND player_id = $2 FOR UPDATE`,
      [buildingId, playerId]
    );

    if (!buildingRes.rows.length) {
      await db.query("ROLLBACK");
      return res.json({ success: false, error: "InvalidBuilding" });
    }

    const { workers_assigned, max_workers } = buildingRes.rows[0];

    const playerRes = await db.query(
      `SELECT population FROM players WHERE id = $1 FOR UPDATE`,
      [playerId]
    );

    const population = playerRes.rows[0].population;

    const usedWorkersRes = await db.query(
      `SELECT SUM(workers_assigned) AS total FROM player_buildings WHERE player_id = $1`,
      [playerId]
    );

    const totalAssigned = usedWorkersRes.rows[0].total || 0;
    const availableWorkers = population - totalAssigned;

    let newWorkers = workers_assigned + Number(delta);

    if (newWorkers < 0) newWorkers = 0;
    if (newWorkers > max_workers) newWorkers = max_workers;

    if (delta > 0 && availableWorkers <= 0) {
      newWorkers = workers_assigned; // no workers available
    }

    await db.query(
      `UPDATE player_buildings
       SET workers_assigned = $1
       WHERE id = $2 AND player_id = $3`,
      [newWorkers, buildingId, playerId]
    );

    await db.query("COMMIT");

    // return JSON
    res.json({
      success: true,
      workers_assigned: newWorkers,
      availableWorkers: population - (totalAssigned - workers_assigned + newWorkers)
    });

  } catch (err) {
    await db.query("ROLLBACK");
    console.error("Error updating workers:", err);
    res.json({ success: false, error: "Server error" });
  }
});

export default router;
