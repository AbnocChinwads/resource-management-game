import db from "../db.js";
import express from "express";
import { auth } from "../lib/auth.js";
import { getAuthError } from "../lib/authErrors.js";
import { sendWelcomeEmail } from "../services/emailService.js";

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

  let result;

  try {
    const { email, password, username } = req.body;

    result = await auth.api.signUpEmail({
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
      [result.user.id, username],
    );

    await client.query("COMMIT");

    try {
      await sendWelcomeEmail(email, username);
    } catch (err) {
      console.error("Welcome email failed:", err);
    }

    res.json(result);
  } catch (err) {
    await client.query("ROLLBACK");

    if (result?.user?.id) {
      // delete auth user if database user does not exist
      try {
        await auth.api.removeUser({
          body: {
            userId: result.user.id,
          },
        });
      } catch (cleanupErr) {
        console.error("Failed to cleanup user:", cleanupErr);
      }
    }

    console.error("Registration error:", err);

    const authError = getAuthError(err);

    return res.status(authError.status).json(authError.body);
  } finally {
    client.release();
  }
});

export default router;
