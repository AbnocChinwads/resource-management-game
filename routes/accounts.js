import express from "express";
import db from "../db.js";

const router = express.Router();

router.get("/account", async (req, res) => {
    const result = await db.query(
        `SELECT name
         FROM players
         WHERE id = $1`,
        [req.playerId]
    )

    res.render("account", {
        user: req.user,
        playerId: req.playerId,
        player: result.rows[0],
    });
});

router.post("/account/name", async (req, res) => {
    const { playerName } = req.body;

    await db.query(
        `
        UPDATE players
        SET name = $1
        WHERE id = $2
        `,
        [
            playerName,
            req.playerId,
        ]
    );

    res.redirect("/account");
});

export default router;
