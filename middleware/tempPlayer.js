import express from "express";
const router = express.Router()

// Temp dev player
router.use((req, res, next) => {
  req.playerId = 1;
  next();
});

export default router;
