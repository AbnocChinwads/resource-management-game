import express from "express";
import tempPlayer from "./middleware/tempPlayer.js";
import foodTick from "./middleware/foodTick.js";
import homeRoute from "./routes/home.js";
import playerStatsRoute from "./routes/playerStats.js";
import updateWorkersRoute from "./routes/updateWorkers.js";
import startRoute from "./routes/startTask.js";
import completeRoute from "./routes/completeTask.js";

const app = express();
const port = process.env.APP_PORT;
const NODE_ENV = process.env.NODE_ENV || 'development';

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

if (process.env.NODE_ENV === "development") {
  app.use(tempPlayer);
}
app.use(foodTick);
app.use("/", homeRoute);
app.use("/api/player-stats", playerStatsRoute);
app.use("/", updateWorkersRoute);
app.use("/", startRoute);
app.use("/", completeRoute);

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});

console.log(NODE_ENV);
