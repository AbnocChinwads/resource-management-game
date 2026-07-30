import express from "express";
import db from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import { getPlayerTasks } from "../services/taskService.js";
import { getPlayerBuildings } from "../services/buildingService.js";
const router = express.Router();

router.get("/", requireAuth, async (req, res) => {
  const playerId = req.playerId;

  try {
    const tasks = await getPlayerTasks(playerId);

    const resourcesRes = await db.query(
      `SELECT pr.*, rt.name
       FROM player_resources pr
       JOIN resource_types rt ON pr.resource_type_id = rt.id
       WHERE pr.player_id = $1
       ORDER BY pr.resource_type_id ASC`,
      [playerId],
    );

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

    res.render("index.ejs", {
      tasks,
      resources: resourcesRes.rows,
      recipes: recipesRes.rows,
      recipeInputs: recipeInputsRes.rows,
      buildings,
    });
  } catch (err) {
    console.error("Error loading homepage:", err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
