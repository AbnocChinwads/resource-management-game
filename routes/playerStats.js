import express from "express";
import { getPlayerTasks } from "../services/taskService.js";
import { getPlayerStats } from "../services/playerStatsService.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const stats = await getPlayerStats(req.playerId);
    const tasks = await getPlayerTasks(req.playerId);

    res.json({
      ...stats,
      tasks,
    });

  } catch (err) {
    console.error("Error fetching player stats:", err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
