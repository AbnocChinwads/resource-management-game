export function requireAuth(req, res, next) {
  if (!req.session || !req.session.playerId) {
    return res.redirect("/login");
  }

  // make it available everywhere
  req.playerId = req.session.playerId;

  next();
}
