import db from "../db.js";
import { processFoodTick } from "./foodService.js";
import { completeFinishedTasks } from "./completeTaskService.js";

export async function processSimulationTick(playerId) {
    await processFoodTick(playerId);
    await completeFinishedTasks(playerId);
}
