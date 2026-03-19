import express from "express";
import db from "../db.js";

const router = express.Router();

/**
 * AUTH MIDDLEWARE
 * Only sets req.playerId if session exists
 */
router.use((req, res, next) => {
  if (req.session && req.session.playerId) {
    req.playerId = req.session.playerId;
  }
  next();
});

/**
 * LOGIN PAGE
 */
router.get("/login", (req, res) => {
  // already logged in → go home
  if (req.session.playerId) {
    return res.redirect("/");
  }

  res.render("login");
});

/**
 * LOGIN HANDLER
 */
router.post("/login", async (req, res) => {
  try {
    const { username } = req.body;

    if (!username) {
      return res.redirect("/login");
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

    res.redirect("/");
  } catch (err) {
    console.error("Login error:", err);
    res.redirect("/login");
  }
});

/**
 * LOGOUT
 */
router.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/login");
  });
});

export default router;
