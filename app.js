import express from "express";
import session from "express-session";
import path from "path";
import fs from "fs";

import db from "./db.js";

import { requireAuth } from "./middleware/auth.js";
import { resolvePlayer } from "./middleware/auth.js";
import authRoutes from "./routes/auth.js";

import homeRoute from "./routes/home.js";
import playerStatsRoute from "./routes/playerStats.js";
import updateWorkersRoute from "./routes/updateWorkers.js";
import startRoute from "./routes/startTask.js";
import completeRoute from "./routes/completeTask.js";

const app = express();

let isReady = false;

app.set("view engine", "ejs");
app.set("views", path.join(process.cwd(), "views"));

app.use(
  session({
    secret: fs
      .readFileSync("/run/secrets/resource_session_secret", "utf8")
      .trim(),
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      httpOnly: true,
    },
  })
);

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

// Routes
app.use("/", authRoutes);
app.use(requireAuth);
app.use("/", homeRoute);
app.use("/api/player-stats", playerStatsRoute);
app.use("/update-workers", updateWorkersRoute);
app.use("/start-task", startRoute);
app.use("/complete-task", completeRoute);

async function start() {
  try {
    console.log("Starting resource-management-game...");

    // verify DB is reachable at boot
    await db.query("SELECT 1");

    isReady = true;

    console.log("Service READY");

    app.listen(3000, () => {
      console.log("Server listening on port 3000");
    });
  } catch (err) {
    console.error("Startup failure:", err);
    process.exit(1);
  }
}

start();
