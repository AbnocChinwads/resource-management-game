import express from "express";
import db from "../db.js";

const router = express.Router();

/**
 * AUTH MIDDLEWARE
 * Resolves playerId from session (or sets none)
 */
export function resolvePlayer(req, res, next) {
  if (req.session && req.session.playerId) {
    req.playerId = req.session.playerId;
  }
  next();
}

/**
 * APPLY middleware globally for anything using this router
 */
router.use(resolvePlayer);

/**
 * LOGIN PAGE
 */
router.get("/login", (req, res) => {
  if (req.session && req.session.playerId) {
    return res.json({ success: true, alreadyLoggedIn: true });
  }

  // Render login page
  res.render("login");
});

/**
 * LOGIN
 */
router.post("/login", async (req, res) => {
  try {
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({
        success: false,
        error: "Username required",
      });
    }

    let result = await db.query("SELECT id FROM players WHERE name = $1", [
      username,
    ]);

    let playerId;

    if (result.rows.length > 0) {
      playerId = result.rows[0].id;
    } else {
      const created = await db.query(
        "INSERT INTO players (name) VALUES ($1) RETURNING id",
        [username],
      );
      playerId = created.rows[0].id;
    }

    req.session.playerId = playerId;

    return res.json({
      success: true,
      playerId,
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({
      success: false,
      error: "Login failed",
    });
  }
});

/**
 * LOGOUT
 */
router.post("/logout", (req, res) => {
  if (!req.session) {
    return res.json({ success: true });
  }

  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({
        success: false,
        error: "Logout failed",
      });
    }

    // clear session cookie
    res.clearCookie("connect.sid");

    res.json({
      success: true,
    });
  });
});

export default router;
