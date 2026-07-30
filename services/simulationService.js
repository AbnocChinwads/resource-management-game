import { processResourceTick } from "./resourceSimulationService.js";
import { processFoodTick } from "./foodService.js";

export async function processSimulationTick(playerId) {
    await processResourceTick(playerId);
    await processFoodTick(playerId);
}
