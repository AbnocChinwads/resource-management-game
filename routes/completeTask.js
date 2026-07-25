import express from "express";
import { completeTask } from "../services/completeTaskService.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    await completeTask(req.playerId, req.body.taskId);

    res.json({ success: true });
  } catch (err) {
    console.error(err);

    res.json({
      success: false,
      error: err.message,
    });
  }
});

export default router;
