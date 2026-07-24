import express from "express";
import db from "../db.js";
import { auth } from "../lib/auth.js";

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

router.post("/account/password", async (req, res) => {
    const {
        currentPassword,
        newPassword,
    } = req.body;

    try {
        await auth.api.changePassword({
            body: {
                currentPassword,
                newPassword,
                revokeOtherSessions: false,
            },
            headers: req.headers,
        });

        res.redirect("/account");

    } catch (err) {
        console.error("Password change failed:", err);

        res.status(400).send("Password change failed");
    }
});

router.post("/account/email", async (req, res) => {
    const { newEmail } = req.body;

    try {
        await auth.api.changeEmail({
            body: {
                newEmail,
                callbackURL: "/account",
            },
            headers: req.headers,
        });

        res.redirect("/account");

    } catch (err) {
        console.error("Email change failed:", err);

        res.status(400).send("Email change failed");
    }
});

export default router;
