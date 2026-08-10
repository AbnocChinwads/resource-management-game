import express from "express";
import { completeTask } from "../services/completeTaskService.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    await completeTask(req.playerId, req.body.taskId);

    res.json({ success: true });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message,
    });
  }
});

export default router;
