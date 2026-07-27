export function requireAdmin(req, res, next) {
  if (!req.user || req.user.email !== process.env.ADMIN_EMAIL) {
    return res.status(403).send("Forbidden");
  }

  next();
}
