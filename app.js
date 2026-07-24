import "dotenv/config";

import express from "express";
import path from "path";
import fs from "fs";

import db from "./db.js";

import { requireAuth } from "./middleware/auth.js";
import { resolvePlayer } from "./middleware/auth.js";
import authRoutes from "./routes/auth.js";
import betterAuthRoutes from "./routes/betterAuth.js";

import homeRoute from "./routes/home.js";
import accountRoute from "./routes/accounts.js";
import playerStatsRoute from "./routes/playerStats.js";
import updateWorkersRoute from "./routes/updateWorkers.js";
import startRoute from "./routes/startTask.js";
import completeRoute from "./routes/completeTask.js";

const app = express();

let isReady = false;

app.set("view engine", "ejs");
app.set("views", path.join(process.cwd(), "views"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

app.get("/health", (req, res) => {
  res.status(200).json({ ok: true });
});

app.get("/ready", async (req, res) => {
  if (!isReady) {
    return res.status(503).json({ ready: false });
  }

  try {
    await db.query("SELECT 1");
    return res.status(200).json({ ready: true });
  } catch (err) {
    return res.status(503).json({ ready: false, db: "down" });
  }
});

app.use(resolvePlayer);

/* ROUTES */

app.use("/api/auth", betterAuthRoutes);
app.use("/", authRoutes);

// protected routes

app.use(requireAuth);
app.use("/", homeRoute);
app.use("/", accountRoute);
app.use("/api/player-stats", playerStatsRoute);
app.use("/update-workers", updateWorkersRoute);
app.use("/start-task", startRoute);
app.use("/complete-task", completeRoute);

/* END OF ROUTES */

async function start() {
  try {
    console.log("Starting service...");

    console.log("Connecting database...");
    // verify DB is reachable at boot
    await db.query("SELECT 1");

    console.log("Running startup tasks...");

    console.log("Service ready.");

    app.listen(3000, () => {
      isReady = true;
      console.log("Server listening on port 3000");
      console.log("Service ready.");
    });
  } catch (err) {
    console.error("Startup failure:", err);
    process.exit(1);
  }
}

start();
