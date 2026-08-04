import db from "../db.js";
import express from "express";
import { requireAuth } from "../middleware/auth.js";
import { getPlayerTasks } from "../services/taskService.js";
import { getPlayerBuildings } from "../services/buildingService.js";
import { getResourceFlow } from "../services/resourceFlowService.js";

const router = express.Router();

router.get("/", requireAuth, async (req, res) => {
  const playerId = req.playerId;

  try {
    const tasks = await getPlayerTasks(playerId);

    const recipesRes = await db.query(`SELECT * FROM recipes ORDER BY id ASC`);

    const recipeInputsRes = await db.query(
      `SELECT * FROM recipe_inputs ORDER BY recipe_id, resource_type_id`,
    );

    const buildings = await getPlayerBuildings(playerId);

    const playerRes = await db.query(
      `SELECT population, workers FROM players WHERE id = $1;`,
      [playerId],
    );

    const population = playerRes.rows[0].population;
    const workers = playerRes.rows[0].workers;

    const totalWorkers = buildings.reduce(
      (sum, b) => sum + b.workers_assigned,
      0,
    );

    const assignedWorkers = totalWorkers;
    const availableWorkers = workers - assignedWorkers;

    const resourceFlow = await getResourceFlow(playerId);

    const resources = resourceFlow.resources;
    const storage = resourceFlow.storage;

    res.render("index.ejs", {
      tasks,
      resources,
      recipes: recipesRes.rows,
      recipeInputs: recipeInputsRes.rows,
      buildings,
      storage,
    });
  } catch (err) {
    console.error("Error loading homepage:", err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
