export function resolvePlayer(req, res, next) {
  if (req.session && req.session.playerId) {
    req.playerId = req.session.playerId;
  }
  next();
}
