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

export default router;
