import { fetchGameData } from "../api/gameData.js";
import { updateResources } from "./resources.js";
import { updateStorage } from "./storage.js";

async function updateStats() {
  try {
    const data = await fetchGameData();

    updateResources(data.resources);
    updateStorage(data.storage);

    document.getElementById("population-count").textContent = data.population;

    document.getElementById("worker-count").textContent = data.workers;
  } catch (err) {
    console.error("Stats update error:", err);
  }
}

setInterval(updateStats, 3000);
updateStats();
