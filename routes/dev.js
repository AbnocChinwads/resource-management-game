import express from "express";
import { getPlayerStats } from "../services/playerStatsService.js";
import { getBugReports, getSuggestions } from "../services/feedbackService.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const bugs = await getBugReports();
    const suggestions = await getSuggestions();
    const stats = await getPlayerStats(req.playerId);

    res.render("dev", {
        bugs,
        suggestions,
        stats,
    });
  } catch (err) {
    console.error("Dev page error:", err);
    res.status(500).send("Dev page error");
  }
});

export default router;
