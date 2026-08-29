import express from "express";
import { getPlayerStats } from "../services/playerStatsService.js";
import {
  getBugReports,
  getActiveBugs,
  getCompletedBugs,
  getSuggestions,
  updateBugReport,
  updateSuggestion,
} from "../services/feedbackService.js";
import { getAllPlayers } from "../services/playerService.js";

const router = express.Router();

async function renderDevPage(req, res, page) {
  try {
    const players = await getAllPlayers();
    const inspectedPlayerId = req.query.player || req.playerId;

    let stats = null;
    let bugs = [];
    let activeBugs = [];
    let completedBugs = [];
    let suggestions = [];

    if (page === "settlement") {
      stats = await getPlayerStats(inspectedPlayerId);
    }

    if (page === "bugs") {
      bugs = await getBugReports();
      activeBugs = getActiveBugs(bugs);
      completedBugs = getCompletedBugs(bugs);
    }

    if (page === "suggestions") {
      suggestions = await getSuggestions();
    }

    res.render("dev", {
      bugs,
      activeBugs,
      completedBugs,
      suggestions,
      players,
      stats,
      inspectedPlayerId,
      page,
    });
  } catch (err) {
    console.error("Dev page error:", err);
    res.status(500).send("Dev page error");
  }
}

router.get("/", (req, res) => {
  renderDevPage(req, res, "settlement");
});

router.get("/bugs", (req, res) => {
  renderDevPage(req, res, "bugs");
});

router.get("/suggestions", (req, res) => {
  renderDevPage(req, res, "suggestions");
});

router.post("/bugs/:id", async (req, res) => {
  try {
    const { status, priority } = req.body;

    await updateBugReport(req.params.id, status, priority);

    return res.redirect("/dev/bugs");
  } catch (err) {
    console.error("Bug update error:", err);
    return res.status(500).send("Bug update error");
  }
});

router.post("/suggestions/:id", async (req, res) => {
  try {
    const { status } = req.body;

    await updateSuggestion(req.params.id, status);

    return res.redirect("/dev/suggestions");
  } catch (err) {
    console.error("Suggestion update error:", err);
    return res.status(500).send("Suggestion update error");
  }
});

export default router;
