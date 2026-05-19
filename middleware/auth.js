export function resolvePlayer(req, res, next) {
  if (req.session && req.session.playerId) {
    req.playerId = req.session.playerId;
  }
  next();
}

export function requireAuth(req, res, next) {
  if (!req.session || !req.session.playerId) {
    // If it's an API request → JSON
    if (req.originalUrl.startsWith("/api") || req.xhr) {
      return res.status(401).json({ error: "not authorised" });
    }

    // Otherwise → redirect
    return res.redirect("/login");
  }

  req.playerId = req.session.playerId;
  next();
}
