import express from "express";
import db from "../db.js";

const router = express.Router();

const VALID_TOOL_POLICIES = new Set(["none", "stone", "iron"]);

router.post("/", async (req, res) => {
  const playerId = req.playerId;
  const { buildingId, toolPolicy } = req.body;

  if (!VALID_TOOL_POLICIES.has(toolPolicy)) {
    return res.json({
      success: false,
      error: "InvalidToolPolicy",
    });
  }

  try {
    await db.query("BEGIN");

    const buildingRes = await db.query(
      `
      SELECT
        pb.id,
        b.type
      FROM player_buildings pb
      JOIN buildings b
        ON b.id = pb.building_id
      WHERE pb.id = $1
        AND pb.player_id = $2
      FOR UPDATE OF pb
      `,
      [buildingId, playerId],
    );

    if (!buildingRes.rows.length) {
      await db.query("ROLLBACK");

      return res.json({
        success: false,
        error: "InvalidBuilding",
      });
    }

    if (buildingRes.rows[0].type !== "production") {
      await db.query("ROLLBACK");

      return res.json({
        success: false,
        error: "InvalidBuildingType",
      });
    }

    await db.query(
      `
      UPDATE player_buildings
      SET tool_policy = $1
      WHERE id = $2
        AND player_id = $3
      `,
      [toolPolicy, buildingId, playerId],
    );

    await db.query("COMMIT");

    res.json({
      success: true,
      toolPolicy,
    });
  } catch (err) {
    await db.query("ROLLBACK");

    console.error("Error updating tool policy:", err);

    res.json({
      success: false,
      error: "Server error",
    });
  }
});

export default router;
