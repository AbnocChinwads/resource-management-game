import express from "express";
import db from "../db.js";

const router = express.Router();

/**
 * PLAYER RESOLVER MIDDLEWARE
 * - Handles dev fallback
 * - Handles session-based login
 */
router.use(async (req, res, next) => {
  try {
    // 1. Logged-in user via session
    if (req.session && req.session.playerId) {
      req.playerId = req.session.playerId;
      return next();
    }

    // 2. Dev fallback
    if (process.env.NODE_ENV !== "production") {
      req.playerId = 1;
      return next();
    }

    // 3. No session - create guest player
    const result = await db.query(
      "INSERT INTO players (name) VALUES ($1) RETURNING id",
      ["Guest"],
    );

    req.session.playerId = result.rows[0].id;
    req.playerId = result.rows[0].id;

    next();
  } catch (err) {
    console.error("Auth resolver error:", err);
    res.status(500).json({ error: "Auth failed" });
  }
});

/**
 * LOGIN ROUTE
 * Simple username-based login
 */
router.post("/login", async (req, res) => {
  try {
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({ error: "Username required" });
    }

    // Check if player exists
    const existing = await db.query("SELECT id FROM players WHERE name = $1", [
      username,
    ]);

    let playerId;

    if (existing.rows.length > 0) {
      playerId = existing.rows[0].id;
    } else {
      // Create new player
      const created = await db.query(
        "INSERT INTO players (name) VALUES ($1) RETURNING id",
        [username],
      );
      playerId = created.rows[0].id;
    }

    // Store in session
    req.session.playerId = playerId;

    res.json({ success: true, playerId });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Login failed" });
  }
});

/**
 * LOGOUT ROUTE
 */
router.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: "Logout failed" });
    }

    res.json({ success: true });
  });
});

export default router;
