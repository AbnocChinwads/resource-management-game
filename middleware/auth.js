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
        [session.user.id]
      );

      if (result.rows.length > 0) {
        req.playerId = result.rows[0].id;
      }

      req.user = session.user;
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

    next();
  } catch (err) {
    console.error("Auth check error:", err);
    next(err);
  }
}