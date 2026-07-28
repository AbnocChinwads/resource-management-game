import express from "express";
import { getPlayerTasks } from "../services/taskService.js";
import db from "../db.js";
import { getPlayerBuildings } from "../services/buildingService.js";

const router = express.Router();

router.get("/active-tasks", async (req, res) => {
  const playerId = req.playerId;

  try {
    const tasks = await getPlayerTasks(playerId);

    const resourcesRes = await db.query(
      `SELECT pr.*, rt.name
             FROM player_resources pr
             JOIN resource_types rt 
             ON pr.resource_type_id = rt.id
             WHERE pr.player_id = $1`,
      [playerId],
    );

    const recipeInputsRes = await db.query(
      `SELECT *
             FROM recipe_inputs`,
    );

    res.render("partials/active-tasks", {
      tasks,
      resources: resourcesRes.rows,
      recipeInputs: recipeInputsRes.rows,
    });
  } catch (err) {
    console.error("Active tasks partial error:", err);
    res.status(500).send("Error loading active tasks");
  }
});

router.get("/recipes", async (req, res) => {
  try {
    const recipesRes = await db.query(`SELECT * FROM recipes ORDER BY id ASC`);

    const recipeInputsRes = await db.query(
      `SELECT *
             FROM recipe_inputs
             ORDER BY recipe_id, resource_type_id`,
    );

    const resourcesRes = await db.query(
      `SELECT pr.*, rt.name
             FROM player_resources pr
             JOIN resource_types rt
             ON pr.resource_type_id = rt.id
             WHERE pr.player_id = $1`,
      [req.playerId],
    );

    res.render("partials/recipes", {
      recipes: recipesRes.rows,
      recipeInputs: recipeInputsRes.rows,
      resources: resourcesRes.rows,
    });
  } catch (err) {
    console.error("Recipes partial error:", err);
    res.status(500).send("Error loading recipes");
  }
});

router.get("/buildings", async (req, res) => {
    const playerId = req.playerId;
  try {
    const buildings = await getPlayerBuildings(playerId);

    res.render("partials/buildings", {
      buildings,
    });
  } catch (err) {
    console.error("Buildings partial error:", err);
    res.status(500).send("Error loading buildings");
  }
});

export default router;
