import express from "express";
import { requireAuth } from "../middleware/auth.js";
import { getPlayerStats } from "../services/playerStatsService.js";
import { getPlayerTasks } from "../services/taskService.js";

const router = express.Router();

router.get("/", requireAuth, async (req, res) => {
  const playerId = req.playerId;

  try {
    const tasks = await getPlayerTasks(playerId);

    const playerStats = await getPlayerStats(playerId);

    res.render("index.ejs", {
      tasks,
      resources: playerStats.resources,
      recipes: playerStats.recipes,
      recipeInputs: playerStats.recipeInputs,
      buildings: playerStats.buildings,
      storage: playerStats.storage,
    });
  } catch (err) {
    console.error("Error loading homepage:", err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
