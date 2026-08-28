import express from "express";
import {
  createBugReport,
  createSuggestion,
} from "../services/feedbackService.js";
import { requireAuth } from "../middleware/auth.js";
import { getPlayerStats } from "../services/playerStatsService.js";

const router = express.Router();

router.get("/", requireAuth, async (req, res) => {
  res.render("feedback");
});

router.post("/bug", requireAuth, async (req, res) => {
  try {
    const { title, description } = req.body;

    let metadata = {
      userAgent: req.get("User-Agent"),
    };

    if (req.playerId) {
      try {
        const playerStats = await getPlayerStats(req.playerId);

        metadata.gameState = {
          population: playerStats.population,
          workers: playerStats.workers,
          historicalMaxPopulation: playerStats.historicalMaxPopulation,
          populationFloor: playerStats.populationFloor,
          populationCapacity: playerStats.populationCapacity,
          assignedWorkers: playerStats.assignedWorkers,
          availableWorkers: playerStats.availableWorkers,
          food: playerStats.food,
          foodRequiredPerMinute: playerStats.foodRequiredPerMinute,
          foodSuppliedPerMinute: playerStats.foodSuppliedPerMinute,
          foodNetFlowPerMinute: playerStats.foodNetFlowPerMinute,
          foodPotentialBalancePerMinute:
            playerStats.foodPotentialBalancePerMinute,
          populationGrowthSeconds: playerStats.populationGrowthSeconds,
          starvationConsequenceSeconds:
            playerStats.starvationConsequenceSeconds,
          foodSurplusStartedAt: playerStats.foodSurplusStartedAt,
          starvationStartedAt: playerStats.starvationStartedAt,
          resources: playerStats.resources,
          buildings: playerStats.buildings,
          storage: playerStats.storage,
        };
      } catch (snapshotErr) {
        console.error("Bug report game state snapshot error:", snapshotErr);
      }
    }

    console.log("Bug report metadata:", metadata);

    await createBugReport(req.playerId, title, description, req.originalUrl, metadata,);

    return res.json({
      message: "Bug report submitted",
    });
  } catch (err) {
    console.error("Bug report error:", err);

    return res.status(500).json({
      error: "Server error",
    });
  }
});

router.post("/suggestion", requireAuth, async (req, res) => {
  try {
    const { title, description } = req.body;

    await createSuggestion(req.playerId, title, description, req.originalUrl, {
      userAgent: req.headers["user-agent"],
    });

    return res.json({
      message: "Suggestion submitted",
    });
  } catch (err) {
    console.error("Suggestion error:", err);

    return res.status(500).json({
      error: "Server error",
    });
  }
});

export default router;
