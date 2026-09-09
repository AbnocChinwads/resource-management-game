import express from "express";
import db from "../db.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const playerId = req.playerId;
  const { buildingId, autoRepair } = req.body;

  if (typeof autoRepair !== "boolean") {
    return res.json({
      success: false,
      error: "InvalidMaintenanceState",
    });
  }

  try {
    await db.query("BEGIN");

    const buildingRes = await db.query(
      `SELECT id
        FROM player_buildings
        WHERE id = $1
        AND player_id = $2
        FOR UPDATE`,
      [buildingId, playerId],
    );

    if (!buildingRes.rows.length) {
      await db.query("ROLLBACK");
      return res.json({
        success: false,
        error: "InvalidBuilding",
      });
    }

    const maintenanceBuildingRes = await db.query(
      `
        SELECT pb.id
        FROM player_buildings pb
        JOIN buildings b
        ON b.id = pb.building_id
        WHERE pb.player_id = $1
        AND b.type = 'maintenance'
        AND pb.health > 0
        LIMIT 1`,
      [playerId],
    );

    if (!maintenanceBuildingRes.rows.length) {
      await db.query("ROLLBACK");

      return res.json({
        success: false,
        error: "NoFunctionalWorkshop",
      });
    }

    await db.query(
      `UPDATE player_buildings
        SET auto_repair = $1
        WHERE id = $2 AND player_id = $3`,
      [autoRepair, buildingId, playerId],
    );

    await db.query("COMMIT");

    // return JSON
    res.json({
      success: true,
      autoRepair,
    });
  } catch (err) {
    await db.query("ROLLBACK");
    console.error("Error updating autorepair:", err);
    res.json({ success: false, error: "Server error" });
  }
});

export default router;
