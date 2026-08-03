import express from "express";
import { getPlayerTasks } from "../services/taskService.js";
import db from "../db.js";
import { getPlayerBuildings } from "../services/buildingService.js";

const router = express.Router();

router.get("/manual-tasks", async (req, res) => {
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

    res.render("partials/manual-tasks", {
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

router.get("/population-buildings", async (req, res) => {
    const playerId = req.playerId;

    try {
        const buildings = await getPlayerBuildings(playerId);

        res.render("partials/population-buildings", {
            buildings: buildings.filter(b => b.type === "housing")
        });
    } catch (err) {
        console.error("Population buildings partial error:", err);
        res.status(500).send("Error loading population buildings");
    }
});


router.get("/production-buildings", async (req, res) => {
    const playerId = req.playerId;

    try {
        const buildings = await getPlayerBuildings(playerId);

        res.render("partials/production-buildings", {
            buildings: buildings.filter(b => b.type === "production")
        });
    } catch (err) {
        console.error("Production buildings partial error:", err);
        res.status(500).send("Error loading production buildings");
    }
});

export default router;
