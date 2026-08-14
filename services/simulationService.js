import { processResourceTick } from "./resourceSimulationService.js";
import { processFoodTick } from "./foodService.js";
import { getResourceFlow } from "./resourceFlowService.js";

export async function processSimulationTick(playerId) {
  await processResourceTick(playerId);

  const resourceFlow = await getResourceFlow(playerId);

  await processFoodTick(playerId, resourceFlow.foodPotentialBalancePerMinute);
}
