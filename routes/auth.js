import db from "../db.js";
import express from "express";
import { auth } from "../lib/auth.js";

const router = express.Router();

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

/**
 * LOGIN
 */

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await auth.api.signInEmail({
      body: {
        email,
        password,
      },
    });

    res.json(result);
  } catch (err) {
    console.error("Login error:", err);

    res.status(401).json({
      success: false,
      error: "Login failed",
    });
  }
});

/**
 * LOGOUT
 */

router.post("/logout", async (req, res) => {
  await auth.api.signOut({
    headers: req.headers,
  });

  res.json({
    success: true,
  });
});

export default router;
