import express from "express";
import { getPlayerTasks } from "../services/taskService.js";
import db from "../db.js";

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
            [playerId]
        );

        const recipeInputsRes = await db.query(
            `SELECT *
             FROM recipe_inputs`
        );

        res.render("partials/active-tasks", {
            tasks,
            resources: resourcesRes.rows,
            recipeInputs: recipeInputsRes.rows
        });

    } catch (err) {
        console.error("Active tasks partial error:", err);
        res.status(500).send("Error loading active tasks");
    }
});

router.get("/recipes", async (req, res) => {
    try {
        const recipesRes = await db.query(
            `SELECT * FROM recipes ORDER BY id ASC`
        );

        const recipeInputsRes = await db.query(
            `SELECT *
             FROM recipe_inputs
             ORDER BY recipe_id, resource_type_id`
        );

        const resourcesRes = await db.query(
            `SELECT pr.*, rt.name
             FROM player_resources pr
             JOIN resource_types rt
             ON pr.resource_type_id = rt.id
             WHERE pr.player_id = $1`,
            [req.playerId]
        );

        res.render("partials/recipes", {
            recipes: recipesRes.rows,
            recipeInputs: recipeInputsRes.rows,
            resources: resourcesRes.rows
        });

    } catch (err) {
        console.error("Recipes partial error:", err);
        res.status(500).send("Error loading recipes");
    }
});

router.get("/buildings", async (req, res) => {
    try {
        const buildingsRes = await db.query(
            `
            SELECT pb.*, b.name, b.max_workers, b.max_health,
            ROW_NUMBER() OVER (
                PARTITION BY pb.building_id
                ORDER BY pb.id ASC
            ) AS building_number
            FROM player_buildings pb
            JOIN buildings b 
            ON pb.building_id = b.id
            WHERE pb.player_id = $1
            ORDER BY pb.id ASC
            `,
            [req.playerId]
        );

        res.render("partials/buildings", {
            buildings: buildingsRes.rows
        });

    } catch (err) {
        console.error("Buildings partial error:", err);
        res.status(500).send("Error loading buildings");
    }
});

export default router;
