import { SIMULATION_TICK_SECONDS } from "../config/simulation.js";
import { processSimulationTick } from "./simulationService.js";
import { getActivePlayers } from "./playerService.js";

let simulationRunning = false;

async function runSimulationTick() {
  if (simulationRunning) {
    return;
  }

  simulationRunning = true;

  try {
    const activePlayers = await getActivePlayers();

    for (const player of activePlayers) {
      await processSimulationTick(player.id);
    }
  } catch (err) {
    console.error("Simulation tick failed:", err);
  } finally {
    simulationRunning = false;
  }
}

setInterval(runSimulationTick, SIMULATION_TICK_SECONDS * 1000);
