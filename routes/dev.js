import express from "express";
import { getPlayerStats } from "../services/playerStatsService.js";
import { getBugReports, getSuggestions } from "../services/feedbackService.js";
import { getAllPlayers } from "../services/playerService.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const bugs = await getBugReports();
    const suggestions = await getSuggestions();
    const players = await getAllPlayers();

    const inspectedPlayerId = req.query.player || req.playerId;

    const stats = await getPlayerStats(inspectedPlayerId);

    res.render("dev", {
      bugs,
      suggestions,
      players,
      stats,
      inspectedPlayerId,
    });
  } catch (err) {
    console.error("Dev page error:", err);
    res.status(500).send("Dev page error");
  }
});

export default router;
