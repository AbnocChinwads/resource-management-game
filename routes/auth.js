import db from "../db.js";
import express from "express";
import { auth } from "../lib/auth.js";

const router = express.Router();

/**
 * REGISTER PAGE
 */

router.get("/register", (req, res) => {
  res.render("register");
});

/**
 * LOGIN PAGE
 */

router.get("/login", (req, res) => {
  res.render("login");
});

/**
 * REGISTER
 */

router.post("/register", async (req, res) => {
  const client = await db.connect();

  try {
    const { email, password, username } = req.body;

    const result = await auth.api.signUpEmail({
      body: {
        email,
        password,
        name: username,
      },
    });

    await client.query("BEGIN");

    await client.query(
      `
      INSERT INTO players (
        user_id,
        name
      )
      VALUES ($1, $2)
      `,
      [
        result.user.id,
        username,
      ]
    );

    await client.query("COMMIT");

    res.json(result);

  } catch (err) {
    await client.query("ROLLBACK");

    console.error("Registration error:", err);

    res.status(400).json({
      success: false,
      error: "Registration failed",
    });
  } finally {
    client.release();
  }
});

export default router;
