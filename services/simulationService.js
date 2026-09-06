import { processResourceTick } from "./resourceSimulationService.js";
import { processBuildingDegradationTick } from "./buildingSimulationService.js";
import { processFoodTick } from "./foodService.js";
import { getResourceFlow } from "./resourceFlowService.js";

export async function processSimulationTick(playerId) {
  const workingBuildings = await processResourceTick(playerId);

  await processBuildingDegradationTick(playerId, workingBuildings);

  const resourceFlow = await getResourceFlow(playerId);

  await processFoodTick(playerId, resourceFlow.foodPotentialBalancePerMinute);
}
