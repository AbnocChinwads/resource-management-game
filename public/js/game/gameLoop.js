import { fetchGameData } from "/js/api/gameData.js";
import { initialiseGameActions } from "./actions.js";
import { checkDiscovery } from "./discovery.js";
import { checkAnnouncements } from "./announcements.js";
import { updatePlayerDisplay } from "./playerDisplay.js";
import { updateRecipes } from "./recipes.js";
import { updateResources, renderResources } from "./resources.js";
import { updateStorage } from "./storage.js";
import { updateBuildings } from "./buildings.js";
import { updateTasks } from "./tasks.js";
import { startProgressUpdates } from "./progressBars.js";
import { updatePlayerStatus } from "./playerStatus.js";

async function updateStats() {
  try {
    const data = await fetchGameData();

    const discoveryChanged = checkDiscovery(data);

    const updatedData = discoveryChanged ? await fetchGameData() : data;

    if (
      discoveryChanged ||
      document.querySelector("#resource-table-body").children.length === 0
    ) {
      renderResources(updatedData.resources);
    }

    updatePlayerDisplay(updatedData);
    updatePlayerStatus(updatedData);
    updateResources(updatedData.resources);
    updateStorage(updatedData.storage);
    updateBuildings(updatedData.buildings);
    updateRecipes(updatedData);
    updateTasks(updatedData.tasks);
  } catch (err) {
    console.error("Stats update error:", err);
  }
}

async function initialiseGame() {
  startProgressUpdates();

  await checkAnnouncements();

  initialiseGameActions(updateStats);

  await updateStats();

  setInterval(updateStats, 3000);
}

initialiseGame();
