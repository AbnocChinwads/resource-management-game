import express from "express";
import { auth } from "../lib/auth.js";

const router = express.Router();

router.all("/{*any}", async (req, res) => {
  const request = new Request(
    `${req.protocol}://${req.get("host")}${req.originalUrl}`,
    {
      method: req.method,
      headers: req.headers,
      body: ["GET", "HEAD"].includes(req.method)
        ? undefined
        : JSON.stringify(req.body),
    }
  );

  const response = await auth.handler(request);

  res.status(response.status);

  response.headers.forEach((value, key) => {
    res.setHeader(key, value);
  });

  const text = await response.text();

  res.send(text);
});

export default router;
