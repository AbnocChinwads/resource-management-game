import express from "express";
import { getPlayerStats } from "../services/playerStatsService.js";
import { getBugReports, getSuggestions, updateBugReport, updateSuggestion } from "../services/feedbackService.js";
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

router.post("/bugs/:id", async (req, res) => {
  try {
    const { status, priority } = req.body;

    await updateBugReport(req.params.id, status, priority);

    return res.redirect("/dev");
  } catch (err) {
    console.error("Bug update error:", err);
    return res.status(500).send("Bug update error");
  }
});

router.post("/suggestions/:id", async (req, res) => {
  try {
    const { status } = req.body;

    await updateSuggestion(req.params.id, status);

    return res.redirect("/dev");
  } catch (err) {
    console.error("Suggestion update error:", err);
    return res.status(500).send("Suggestion update error");
  }
});


export default router;
