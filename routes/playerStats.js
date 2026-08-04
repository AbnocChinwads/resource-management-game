import express from "express";
import { getPlayerTasks } from "../services/taskService.js";
import { getPlayerStats } from "../services/playerStatsService.js";
import { getResourceFlow } from "../services/resourceFlowService.js";
import { getPlayerBuildings } from "../services/buildingService.js";
import { getPlayerStorage } from "../services/storageService.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const stats = await getPlayerStats(req.playerId);
    const tasks = await getPlayerTasks(req.playerId);
    const resources = await getResourceFlow(req.playerId);
    const buildings = await getPlayerBuildings(req.playerId);
    const storage = await getPlayerStorage(req.playerId);

    res.json({
      ...stats,
      tasks,
      resources,
      buildings,
      storage,
    });

  } catch (err) {
    console.error("Error fetching player stats:", err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
