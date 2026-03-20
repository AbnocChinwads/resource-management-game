export function resolvePlayer(req, res, next) {
  if (req.session && req.session.playerId) {
    req.playerId = req.session.playerId;
  }
  next();
}

export function requireAuth(req, res, next) {
  if (!req.session || !req.session.playerId) {
    return res.status(401).json({ error: "not authorised" });
  }

  next();
}
