import express from "express";
import { getPlayerStats } from "../services/playerStatsService.js";

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const stats = await getPlayerStats(req.playerId);

        res.render("dev", {
            stats
        });
    } catch (err) {
        console.error("Dev page error:", err);
        res.status(500).send("Dev page error");
    }
});

export default router;
