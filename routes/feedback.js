import express from "express";
import {
  createBugReport,
  createSuggestion,
} from "../services/feedbackService.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

router.post("/bug", requireAuth, async (req, res) => {
  try {
    const { title, description } = req.body;

    await createBugReport(req.playerId, title, description, req.originalUrl, {
      userAgent: req.headers["user-agent"],
    });

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
