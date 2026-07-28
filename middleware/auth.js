import { auth } from "../lib/auth.js";
import db from "../db.js";

export async function resolvePlayer(req, res, next) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (session) {
      const result = await db.query(
        `
        SELECT id
        FROM players
        WHERE user_id = $1
        `,
        [session.user.id],
      );

      if (result.rows.length > 0) {
        req.playerId = result.rows[0].id;
      } else {
        console.warn("User exists but has no player profile:", session.user.id);
      }

      req.user = session.user;
      req.isAdmin = req.user?.email === process.env.ADMIN_EMAIL;
    }

    next();
  } catch (err) {
    console.error("Session resolution error:", err);
    next(err);
  }
}

export async function requireAuth(req, res, next) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session) {
      if (req.originalUrl.startsWith("/api") || req.xhr) {
        return res.status(401).json({
          error: "not authorised",
        });
      }

      return res.redirect("/login");
    }

    req.user = session.user;
    req.isAdmin = req.user?.email === process.env.ADMIN_EMAIL;

    const result = await db.query(
      `
      SELECT id
      FROM players
      WHERE user_id = $1
      `,
      [session.user.id],
    );

    if (result.rows.length === 0) {
      console.error(
        "Authenticated user has no player profile:", {
          userId: session.user.id,
          email: session.user.email,
        }
      );

      if (req.originalUrl.startsWith("/api") || req.xhr) {
        return res.status(500).json({
          error: "Player profile missing",
        });
      }

      return res
        .status(500)
        .send("Your player profile is missing. Please contact support.");
    }

    req.playerId = result.rows[0].id;

    next();
  } catch (err) {
    console.error("Auth check error:", err);
    next(err);
  }
}
