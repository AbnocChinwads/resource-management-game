import express from "express";
// import db from "./db.js";
import homeRoute from "./routes/home.js";
import playerStatsRoute from "./routes/playerStats.js";
import updateWorkersRoute from "./routes/updateWorkers.js";
import startRoute from "./routes/startTask.js";
import completeRoute from "./routes/completeTask.js";

const app = express();
const port = process.env.APP_PORT || 3000;

// parse URL-encoded form data
app.use(express.urlencoded({ extended: true }));

// parse JSON (needed for fetch requests)
app.use(express.json());

app.use(express.static("public"));

// Routes
app.use("/", homeRoute);
app.use("/api/player-stats", playerStatsRoute)
app.use("/update-workers", updateWorkersRoute);
app.use("/start-task", startRoute);
app.use("/complete-task", completeRoute);

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
