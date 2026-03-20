import express from "express";
import session from "express-session";
import path from "path";

import { requireAuth } from "./middleware/auth.js";
import { resolvePlayer } from "./middleware/auth.js";
import authRoutes from "./routes/auth.js";

import homeRoute from "./routes/home.js";
import playerStatsRoute from "./routes/playerStats.js";
import updateWorkersRoute from "./routes/updateWorkers.js";
import startRoute from "./routes/startTask.js";
import completeRoute from "./routes/completeTask.js";

const app = express();
const port = process.env.APP_PORT || 3000;

// set view engine
app.set("view engine", "ejs");
app.set("views", path.join(process.cwd(), "views"));

// SESSION (required for auth)
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie : {
      secure: false,
      httpOnly: true,
    }
  }),
);

// parse request bodies
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// serve static files
app.use(express.static("public"));

/**
 * AUTH MIDDLEWARE
 * MUST run before routes that use req.playerId
 */
app.use(resolvePlayer);

// Routes
app.use("/", authRoutes);
app.use(requireAuth);
app.use("/", homeRoute);
app.use("/api/player-stats", playerStatsRoute);
app.use("/update-workers", updateWorkersRoute);
app.use("/start-task", startRoute);
app.use("/complete-task", completeRoute);

app.listen(port, "127.0.0.1", () => {
  console.log(`Server running on port ${port}`);
});
