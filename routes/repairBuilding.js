import express from "express";
import { repairBuilding } from "../services/buildingService.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const playerId = req.playerId;
  const { buildingId } = req.body;

  try {
    const result = await repairBuilding(playerId, buildingId);

    res.json(result);
  } catch (err) {
    console.error("Error repairing building:", err);
    res.json({
      success: false,
      error: "Server error",
    });
  }
});

export default router;
